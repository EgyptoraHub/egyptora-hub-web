import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TRADE_CONTENT_TABLES } from "./trade-validation";
import { previewTradeCsv, type TradeImportRow } from "./trade-import";
export type TradeImportResult = { authorized: boolean; ok: boolean; rows: TradeImportRow[]; committed: number; error?: string };
export const importTradeCsv = createServerFn({method:"POST"}).middleware([requireSupabaseAuth])
 .inputValidator((input:unknown)=>z.object({table:z.enum(TRADE_CONTENT_TABLES),csv:z.string().max(3_000_000),dryRun:z.boolean().default(true)}).parse(input))
 .handler(async({data,context}):Promise<TradeImportResult>=>{
  const {data:admin,error:roleError}=await context.supabase.rpc("has_role",{check_user_id:context.userId,check_role:"admin"});
  if(roleError||admin!==true)return {authorized:false,ok:false,rows:[],committed:0};
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");let committed=0;let rows:TradeImportRow[]=[];
  try {
   const [existing,countries,guides]=await Promise.all([supabaseAdmin.from(data.table).select("*"),supabaseAdmin.from("trade_country_profiles").select("slug"),supabaseAdmin.from("procedure_guides").select("slug")]);
   if(existing.error||countries.error||guides.error)throw new Error("Could not check existing entries.");
   const preview=previewTradeCsv(data.table,data.csv,existing.data??[],new Set((countries.data??[]).map(r=>r.slug)),new Set((guides.data??[]).map(r=>r.slug)));rows=preview.rows;
   if(!data.dryRun){const {writeAudit}=await import("@/lib/audit.server");
    for(const plan of preview.plans){const q=plan.id?supabaseAdmin.from(data.table).update(plan.payload as never).eq("id",plan.id):supabaseAdmin.from(data.table).insert(plan.payload as never);
     const {data:saved,error}=await q.select("id").single();if(error||!saved)throw new Error("Import stopped. Re-run preview before retrying.");
     committed++;await writeAudit({actorUserId:context.userId,action:"import.csv",entityType:data.table,entityId:saved.id,metadata:{operation:plan.id?"update":"create"}});
    }
   }
   return {authorized:true,ok:true,rows,committed};
  }catch(error){return {authorized:true,ok:false,rows,committed,error:error instanceof Error?error.message:"Import failed."};}
 });
