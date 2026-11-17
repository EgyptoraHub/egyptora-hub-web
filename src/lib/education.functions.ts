/**
 * Education Hub — public reads. Publishable key + explicit public columns; the
 * database visitor rules return only active, reviewed rows. Phase 2 flags are never read.
 */
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { EDUCATION_PLATFORM_COLUMNS } from "./education-validation";
import { EDUCATION_GUIDE_ACTIVITY } from "./education-public";

const UNAVAILABLE = "Education information is temporarily unavailable.";
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error(UNAVAILABLE);
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } });
}

export const getEducationPlatforms = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("education_platforms").select(EDUCATION_PLATFORM_COLUMNS).order("sort_order").order("name_en");
  if (error) throw new Error(UNAVAILABLE);
  return data ?? [];
});
export const educationPlatformsQuery = queryOptions({ queryKey: ["education-platforms"], queryFn: () => getEducationPlatforms(), staleTime: 60_000 });
export type EducationPlatform = Awaited<ReturnType<typeof getEducationPlatforms>>[number];

/** Which hub cards have public data behind them (cards without data are not shown). */
export const getEducationHubAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [platforms, guides] = await Promise.all([
    db.from("education_platforms").select("id", { count: "exact", head: true }),
    db.from("procedure_guides").select("id", { count: "exact", head: true }).eq("activity", EDUCATION_GUIDE_ACTIVITY),
  ]);
  if (platforms.error || guides.error) throw new Error(UNAVAILABLE);
  return { platforms: (platforms.count ?? 0) > 0, guides: (guides.count ?? 0) > 0 };
});
export const educationHubQuery = queryOptions({ queryKey: ["education-hub"], queryFn: () => getEducationHubAvailability(), staleTime: 60_000 });
