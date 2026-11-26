import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { COMMUNITY_GUIDE_COLUMNS, communityInterestSchema, communityHoneypotFilled } from "./community-validation";
export const getCommunityGuides = createServerFn({method:"GET"}).handler(async () => {
 const key = process.env["SUPABASE_PUBLISHABLE_KEY"]; const url = process.env["SUPABASE_URL"];
 if (!key || !url) throw new Error("Community information is temporarily unavailable.");
 const db = createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h = new Headers(init?.headers);if(key.startsWith("sb_")&&h.get("Authorization")===`Bearer ${key}`)h.delete("Authorization");h.set("apikey",key);return fetch(input,{...init,headers:h});}}});
 const {data,error} = await db.from("community_authority_guides").select(COMMUNITY_GUIDE_COLUMNS).order("sort_order").order("topic_en");
 if(error) throw new Error("Community information is temporarily unavailable."); return data ?? [];
});
export const communityGuidesQuery = queryOptions({queryKey:["community-authority-guides"],queryFn:()=>getCommunityGuides(),staleTime:60_000});
export const submitCommunityInterest = createServerFn({method:"POST"}).inputValidator(communityInterestSchema).handler(async ({data})=>{
 if (communityHoneypotFilled(data.website)) return {ok:false as const};
 const {website: _trap, ...values} = data;
 const {supabaseAdmin} = await import("@/integrations/supabase/client.server");
 const {error} = await supabaseAdmin.from("community_partner_interest").insert(values);
 return {ok: !error};
});
