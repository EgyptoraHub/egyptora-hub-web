import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { ENERGY_BODY_COLUMNS, energyInterestSchema, energyHoneypotFilled } from "./energy-validation";
export const getEnergyBodies = createServerFn({method:"GET"}).handler(async () => {
 const key = process.env["SUPABASE_PUBLISHABLE_KEY"]; const url = process.env["SUPABASE_URL"];
 if (!key || !url) throw new Error("Energy information is temporarily unavailable.");
 const db = createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h = new Headers(init?.headers);if(key.startsWith("sb_")&&h.get("Authorization")===`Bearer ${key}`)h.delete("Authorization");h.set("apikey",key);return fetch(input,{...init,headers:h});}}});
 const {data,error} = await db.from("energy_official_bodies").select(ENERGY_BODY_COLUMNS).order("sort_order").order("name_en");
 if(error) throw new Error("Energy information is temporarily unavailable."); return data ?? [];
});
export const energyBodiesQuery = queryOptions({queryKey:["energy-official-bodies"],queryFn:()=>getEnergyBodies(),staleTime:60_000});
export const submitEnergyInterest = createServerFn({method:"POST"}).inputValidator(energyInterestSchema).handler(async ({data})=>{
 if (energyHoneypotFilled(data.website)) return {ok:false as const};
 const {website: _trap, ...values} = data;
 const {supabaseAdmin} = await import("@/integrations/supabase/client.server");
 const {error} = await supabaseAdmin.from("energy_partner_interest").insert(values);
 return {ok: !error};
});
