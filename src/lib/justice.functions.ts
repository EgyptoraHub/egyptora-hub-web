import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { JUSTICE_GUIDE_COLUMNS } from "./justice-validation";
export const getJusticeGuides = createServerFn({method:"GET"}).handler(async () => {
 const key = process.env["SUPABASE_PUBLISHABLE_KEY"]; const url = process.env["SUPABASE_URL"];
 if (!key || !url) throw new Error("Justice guide information is temporarily unavailable.");
 const db = createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h = new Headers(init?.headers);if(key.startsWith("sb_")&&h.get("Authorization")===`Bearer ${key}`)h.delete("Authorization");h.set("apikey",key);return fetch(input,{...init,headers:h});}}});
 const {data,error} = await db.from("justice_service_guides").select(JUSTICE_GUIDE_COLUMNS).order("sort_order").order("title_en");
 if(error) throw new Error("Justice guide information is temporarily unavailable."); return data ?? [];
});
export const justiceGuidesQuery = queryOptions({queryKey:["justice-service-guides"],queryFn:()=>getJusticeGuides(),staleTime:60_000});
