/**
 * Shipping Hub — public reads. Publishable key + explicit public columns; the
 * database visitor rules return only active, reviewed rows. Phase 2 flags are never read.
 */
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SHIPPING_PLATFORM_COLUMNS } from "./shipping-validation";

const UNAVAILABLE = "Shipping information is temporarily unavailable.";
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error(UNAVAILABLE);
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } });
}

export const getShippingPlatforms = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("shipping_platforms").select(SHIPPING_PLATFORM_COLUMNS).order("sort_order").order("name_en");
  if (error) throw new Error(UNAVAILABLE);
  return data ?? [];
});
export const shippingPlatformsQuery = queryOptions({ queryKey: ["shipping-platforms"], queryFn: () => getShippingPlatforms(), staleTime: 60_000 });
export type ShippingPlatform = Awaited<ReturnType<typeof getShippingPlatforms>>[number];

