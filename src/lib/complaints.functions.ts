/**
 * Complaints & Government Services Guide — public reads.
 * Every read uses the publishable key with explicit public columns (never
 * internal_notes); the database visibility rules return only active,
 * editorially reviewed rows. Phase 2 feature flags are never read here.
 */
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { UNIFIED_CHANNEL_SLUG } from "./complaints-public";

const SECTOR_COLUMNS = "id,slug,name_en,name_ar,family,scope_en,scope_ar,notice_type,sort_order" as const;
const CHANNEL_COLUMNS = "id,slug,sector_slug,authority_name_en,authority_name_ar,channel_type,channel_value,label_en,label_ar,hours_en,hours_ar,handles_en,handles_ar,source_name,source_name_ar,source_url,last_verified_at,sort_order" as const;

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Complaints guide information is temporarily unavailable.");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } });
}

export const getComplaintSectors = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("complaint_sectors").select(SECTOR_COLUMNS).order("sort_order").order("name_en");
  if (error) throw new Error("Complaints guide information is temporarily unavailable.");
  return data ?? [];
});
export const complaintSectorsQuery = queryOptions({ queryKey: ["complaint-sectors"], queryFn: () => getComplaintSectors(), staleTime: 60_000 });
export type ComplaintSector = Awaited<ReturnType<typeof getComplaintSectors>>[number];

export const getComplaintSectorDetail = createServerFn({ method: "GET" }).inputValidator((slug: string) => slug).handler(async ({ data: slug }) => {
  const db = publicClient();
  const [sector, channels] = await Promise.all([
    db.from("complaint_sectors").select(SECTOR_COLUMNS).eq("slug", slug).maybeSingle(),
    db.from("complaint_channels").select(CHANNEL_COLUMNS).eq("sector_slug", slug).order("sort_order").order("authority_name_en"),
  ]);
  if (sector.error || channels.error) throw new Error("Complaints guide information is temporarily unavailable.");
  return { sector: sector.data ?? null, channels: channels.data ?? [] };
});
export const complaintSectorQuery = (slug: string) => queryOptions({ queryKey: ["complaint-sector", slug], queryFn: () => getComplaintSectorDetail({ data: slug }), staleTime: 60_000 });
export type ComplaintChannel = Awaited<ReturnType<typeof getComplaintSectorDetail>>["channels"][number];

/** The unified government complaints channel — only while its record is active and reviewed. */
export const getUnifiedComplaintsChannel = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("complaint_channels").select(CHANNEL_COLUMNS).eq("slug", UNIFIED_CHANNEL_SLUG).maybeSingle();
  if (error) throw new Error("Complaints guide information is temporarily unavailable.");
  return data ?? null;
});
export const unifiedChannelQuery = queryOptions({ queryKey: ["complaint-unified-channel"], queryFn: () => getUnifiedComplaintsChannel(), staleTime: 60_000 });
