import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { publicHealthInquirySchema, publicHealthReportSchema } from "./health-public";

const FACILITY_COLUMNS = "id,slug,name_en,name_ar,facility_type,ownership,governorate_id,city_en,city_ar,address_en,address_ar,lat,lng,phone,hours_en,hours_ar,official_website,services,description_en,description_ar,license_status,license_source_url,accreditation_status,accreditation_source_url,source_url,last_verified_at,is_active,image_key" as const;
const SPECIALTY_COLUMNS = "id,slug,name_en,name_ar,summary_en,summary_ar,when_to_visit_en,when_to_visit_ar,sort_order,source_url,last_verified_at" as const;
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Healthcare information is temporarily unavailable.");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } });
}
export const getPublicHealth = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [facilities, specialties, links, governorates] = await Promise.all([
    db.from("health_facilities").select(FACILITY_COLUMNS).eq("is_active", true).order("name_en"),
    db.from("health_specialties").select(SPECIALTY_COLUMNS).eq("is_active", true).order("sort_order"),
    db.from("health_facility_specialties").select("facility_id,specialty_id"),
    db.from("governorates").select("id,name"),
  ]);
  if ([facilities, specialties, links, governorates].some((r) => r.error)) throw new Error("Healthcare information is temporarily unavailable.");
  return { facilities: facilities.data ?? [], specialties: specialties.data ?? [], links: links.data ?? [], governorates: governorates.data ?? [] };
});
export const healthQuery = queryOptions({ queryKey: ["public-health"], queryFn: () => getPublicHealth(), staleTime: 60_000 });
export type HealthData = Awaited<ReturnType<typeof getPublicHealth>>;
export type HealthFacility = HealthData["facilities"][number];
export type HealthSpecialty = HealthData["specialties"][number];

export const getHealthResources = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [government, categories, apps, events] = await Promise.all([
    db.from("government_entities").select("id,entity_name_en,entity_name_ar,description_en,category_en,category_ar,official_url").eq("is_active", true).order("sort_order"),
    db.from("app_categories").select("id,slug,name_en,name_ar").eq("is_active", true),
    db.from("egypt_apps").select("id,category_id,name_en,name_ar,description_en,description_ar,google_play_url,app_store_url,website_url").eq("is_active", true).order("sort_order"),
    db.from("events").select("id,name,category,tags,start_date").gte("start_date", new Date().toISOString()).order("start_date"),
  ]);
  if ([government, categories, apps, events].some((r) => r.error)) throw new Error("Healthcare resources are temporarily unavailable.");
  const healthCategory = /health|medical|صحة|صح[ية]|طب/i;
  const govRows = government.data ?? []; const catRows = categories.data ?? [];
  const govHasCategory = govRows.some((r) => healthCategory.test(`${r.category_en} ${r.category_ar}`));
  const healthCats = new Set(catRows.filter((r) => healthCategory.test(`${r.slug} ${r.name_en} ${r.name_ar}`)).map((r) => r.id));
  return { government: govHasCategory ? govRows.filter((r) => healthCategory.test(`${r.category_en} ${r.category_ar}`)) : govRows, governmentFallback: !govHasCategory,
    apps: healthCats.size ? (apps.data ?? []).filter((r) => healthCats.has(r.category_id)) : apps.data ?? [], appsFallback: healthCats.size === 0,
    events: (events.data ?? []).filter((r) => /health|blood|donation|صحة|دم|تبرع/i.test(`${r.category ?? ""} ${(r.tags ?? []).join(" ")}`)) };
});
export const healthResourcesQuery = queryOptions({ queryKey: ["health-resources"], queryFn: () => getHealthResources(), staleTime: 60_000 });
export const submitHealthInquiry = createServerFn({ method: "POST" }).inputValidator(publicHealthInquirySchema).handler(async ({ data }) => {
  const { error } = await publicClient().from("health_inquiries").insert(data);
  if (error) return { ok: false as const }; return { ok: true as const };
});
export const submitHealthReport = createServerFn({ method: "POST" }).inputValidator(publicHealthReportSchema).handler(async ({ data }) => {
  const { consent: _consent, ...report } = data;
  const { error } = await publicClient().from("health_reports").insert({ kind: report.kind, message: report.message, facility_id: report.facility_id ?? null, contact_email: report.contact_email ?? null });
  if (error) return { ok: false as const }; return { ok: true as const };
});
