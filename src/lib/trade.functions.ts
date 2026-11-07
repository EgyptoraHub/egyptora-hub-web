/**
 * Trade, Industry & Agriculture — public reads and the inquiry form.
 * Every read uses the publishable key with explicit public columns (never
 * internal_notes); the database visibility rules return only active,
 * editorially reviewed rows. Phase 2 feature flags are never read here.
 */
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { tradeInquirySchema } from "./trade-validation";

const SECTOR_COLUMNS = "id,slug,sector_group,name_en,name_ar,scope_en,scope_ar,matching_info_en,matching_info_ar,sort_order,source_name,source_name_ar,source_url,last_verified_at" as const;
const COUNTRY_COLUMNS = "id,slug,iso2,name_en,name_ar,region,entity_type,summary_en,summary_ar,official_trade_site_url,source_name,source_name_ar,source_url,last_verified_at" as const;
const COMMODITY_COLUMNS = "id,country_slug,commodity_en,commodity_ar,record_kind,hs_code,hs_revision,reference_year,unit,quantity,flow,notes_en,notes_ar,source_name,source_name_ar,source_url,last_verified_at" as const;
const GUIDE_COLUMNS = "id,slug,title_en,title_ar,activity,authority_name_en,authority_name_ar,official_service_url,summary_en,summary_ar,published_fee_text,published_processing_time_text,fee_source_url,time_source_url,source_name,source_name_ar,source_url,last_verified_at" as const;
const STEP_COLUMNS = "id,guide_slug,step_no,title_en,title_ar,description_en,description_ar,official_url,source_name,source_name_ar,source_url,last_verified_at" as const;
const DOCUMENT_COLUMNS = "id,guide_slug,document_name_en,document_name_ar,issuing_source_en,issuing_source_ar,official_url,last_reviewed_at,source_name,source_name_ar,source_url,last_verified_at" as const;

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Trade information is temporarily unavailable.");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } } });
}

export const getTradeSectors = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("trade_sectors").select(SECTOR_COLUMNS).order("sort_order").order("name_en");
  if (error) throw new Error("Trade information is temporarily unavailable.");
  return data ?? [];
});
export const tradeSectorsQuery = queryOptions({ queryKey: ["trade-sectors"], queryFn: () => getTradeSectors(), staleTime: 60_000 });
export type TradeSector = Awaited<ReturnType<typeof getTradeSectors>>[number];

export const getTradeCountries = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("trade_country_profiles").select(COUNTRY_COLUMNS).order("name_en");
  if (error) throw new Error("Trade information is temporarily unavailable.");
  return data ?? [];
});
export const tradeCountriesQuery = queryOptions({ queryKey: ["trade-countries"], queryFn: () => getTradeCountries(), staleTime: 60_000 });
export type TradeCountry = Awaited<ReturnType<typeof getTradeCountries>>[number];

export const getTradeCountryDetail = createServerFn({ method: "GET" }).inputValidator((slug: string) => slug).handler(async ({ data: slug }) => {
  const db = publicClient();
  const [profile, commodities] = await Promise.all([
    db.from("trade_country_profiles").select(COUNTRY_COLUMNS).eq("slug", slug).maybeSingle(),
    db.from("trade_country_commodities").select(COMMODITY_COLUMNS).eq("country_slug", slug).order("reference_year", { ascending: false }).order("commodity_en"),
  ]);
  if (profile.error || commodities.error) throw new Error("Trade information is temporarily unavailable.");
  return { profile: profile.data ?? null, commodities: commodities.data ?? [] };
});
export const tradeCountryQuery = (slug: string) => queryOptions({ queryKey: ["trade-country", slug], queryFn: () => getTradeCountryDetail({ data: slug }), staleTime: 60_000 });
export type TradeCommodity = Awaited<ReturnType<typeof getTradeCountryDetail>>["commodities"][number];

export const getProcedureGuides = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("procedure_guides").select(GUIDE_COLUMNS).order("title_en");
  if (error) throw new Error("Trade information is temporarily unavailable.");
  return data ?? [];
});
export const procedureGuidesQuery = queryOptions({ queryKey: ["procedure-guides"], queryFn: () => getProcedureGuides(), staleTime: 60_000 });
export type ProcedureGuide = Awaited<ReturnType<typeof getProcedureGuides>>[number];

export const getProcedureGuideDetail = createServerFn({ method: "GET" }).inputValidator((slug: string) => slug).handler(async ({ data: slug }) => {
  const db = publicClient();
  const [guide, steps, documents] = await Promise.all([
    db.from("procedure_guides").select(GUIDE_COLUMNS).eq("slug", slug).maybeSingle(),
    db.from("procedure_steps").select(STEP_COLUMNS).eq("guide_slug", slug).order("step_no"),
    db.from("procedure_documents").select(DOCUMENT_COLUMNS).eq("guide_slug", slug).order("document_name_en"),
  ]);
  if (guide.error || steps.error || documents.error) throw new Error("Trade information is temporarily unavailable.");
  return { guide: guide.data ?? null, steps: steps.data ?? [], documents: documents.data ?? [] };
});
export const procedureGuideQuery = (slug: string) => queryOptions({ queryKey: ["procedure-guide", slug], queryFn: () => getProcedureGuideDetail({ data: slug }), staleTime: 60_000 });

/** Public counts for the trade inquiry gate: the form exists only while any trade section has public records. */
export const getTradePublicCounts = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const head = { count: "exact" as const, head: true };
  const [sectors, countries, guides] = await Promise.all([
    db.from("trade_sectors").select("id", head),
    db.from("trade_country_profiles").select("id", head),
    db.from("procedure_guides").select("id", head),
  ]);
  if (sectors.error || countries.error || guides.error) throw new Error("Trade information is temporarily unavailable.");
  return { sectors: sectors.count ?? 0, countries: countries.count ?? 0, guides: guides.count ?? 0 };
});
export const tradeCountsQuery = queryOptions({ queryKey: ["trade-counts"], queryFn: () => getTradePublicCounts(), staleTime: 60_000 });

export const submitTradeInquiry = createServerFn({ method: "POST" }).inputValidator(tradeInquirySchema).handler(async ({ data }) => {
  const { error } = await publicClient().from("trade_inquiries").insert({ ...data, organization: data.organization ?? null });
  if (error) return { ok: false as const };
  return { ok: true as const };
});
