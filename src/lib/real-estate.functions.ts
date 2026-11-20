/**
 * RealEstate Hub — public reads. Publishable key + explicit public columns; the
 * database visitor rules return only active, reviewed rows. Phase 2 flags are never read.
 */
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { REAL_ESTATE_PLATFORM_COLUMNS } from "./real-estate-validation";
import { REAL_ESTATE_GUIDE_ACTIVITY } from "./real-estate-public";

const UNAVAILABLE = "RealEstate information is temporarily unavailable.";
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error(UNAVAILABLE);
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } });
}

export const getRealEstatePlatforms = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("real_estate_platforms").select(REAL_ESTATE_PLATFORM_COLUMNS).order("sort_order").order("name_en");
  if (error) throw new Error(UNAVAILABLE);
  return data ?? [];
});
export const realEstatePlatformsQuery = queryOptions({ queryKey: ["real-estate-platforms"], queryFn: () => getRealEstatePlatforms(), staleTime: 60_000 });
export type RealEstatePlatform = Awaited<ReturnType<typeof getRealEstatePlatforms>>[number];

/** Which hub cards have public data behind them (cards without data are not shown). */
export const getRealEstateHubAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [platforms, guides] = await Promise.all([
    db.from("real_estate_platforms").select("id", { count: "exact", head: true }),
    db.from("procedure_guides").select("id", { count: "exact", head: true }).eq("activity", REAL_ESTATE_GUIDE_ACTIVITY),
  ]);
  if (platforms.error || guides.error) throw new Error(UNAVAILABLE);
  return { platforms: (platforms.count ?? 0) > 0, guides: (guides.count ?? 0) > 0 };
});
export const realEstateHubQuery = queryOptions({ queryKey: ["real-estate-hub"], queryFn: () => getRealEstateHubAvailability(), staleTime: 60_000 });
