/**
 * Industrial Zones & Free Zones — public read helpers.
 * Explicit public columns only (internal_notes / source_note are never granted to visitors);
 * the database visibility rule (is_active + reviewed) decides which rows exist here.
 * No zone names, counts, laws or fees live in code — everything shown comes from the database.
 */
import { supabase } from "@/integrations/supabase/client";

/** Known zone types. Validated in code (not a DB enum) so more can be added without a migration. */
export const ZONE_TYPES = ["public_free_zone", "sczone_industrial_zone", "industrial_zone"] as const;
export type ZoneType = (typeof ZONE_TYPES)[number];

export type ZonePage = "industrial" | "free";

/** Which zone types and fact topics belong to each public page. */
export const ZONE_PAGES: Record<ZonePage, { path: string; types: string[]; topics: string[] }> = {
  industrial: { path: "/do-business/industrial-zones", types: ["industrial_zone"], topics: ["industrial_zones", "general"] },
  free: { path: "/do-business/free-zones", types: ["public_free_zone", "sczone_industrial_zone"], topics: ["free_zones", "sczone", "general"] },
};
export const FACT_TOPICS = ["general", "industrial_zones", "free_zones", "sczone"];

export const ZONE_TYPE_LABEL: Record<string, { en: string; ar: string }> = {
  public_free_zone: { en: "Public free zone", ar: "منطقة حرة عامة" },
  sczone_industrial_zone: { en: "SCZone industrial zone", ar: "منطقة صناعية بالمنطقة الاقتصادية لقناة السويس" },
  industrial_zone: { en: "Industrial zone", ar: "منطقة صناعية" },
};

export const ZONE_PUBLIC_COLS =
  "id, slug, zone_type, name_ar, name_en, governorate_slug, listed_under, managing_body_ar, managing_body_en, summary_ar, summary_en, source_url, last_verified_at";
export const FACT_PUBLIC_COLS = "id, topic, text_ar, text_en, source_name, source_url, source_date";

export type EconomicZone = {
  id: string; slug: string; zone_type: string; name_ar: string; name_en: string | null; governorate_slug: string | null;
  listed_under: string | null; managing_body_ar: string | null; managing_body_en: string | null;
  summary_ar: string | null; summary_en: string | null; source_url: string | null; last_verified_at: string | null;
};
export type ZoneFact = {
  id: string; topic: string; text_ar: string | null; text_en: string | null;
  source_name: string | null; source_url: string | null; source_date: string | null;
};

/** English title falls back to the official Arabic name — never empty, never machine-translated. */
export const zoneTitle = (z: Pick<EconomicZone, "name_ar" | "name_en">, lang: string) =>
  lang === "ar" ? z.name_ar : z.name_en?.trim() || z.name_ar;

/** Deterministic short hash (FNV-1a, 6 hex chars) used in slugs because name_en may be empty. */
export function shortHash(s: string): string {
  let h = 0x811c9dc5;
  for (const ch of s.normalize("NFC")) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 6);
}
export const zoneSlug = (governorateSlug: string | null | undefined, zoneType: string, nameAr: string) =>
  `${governorateSlug || "egypt"}-${zoneType.replace(/_/g, "-")}-${shortHash(nameAr.trim())}`;

/** Loads public rows for one page. Throws only on network/database errors. */
export async function loadZonePage(page: ZonePage) {
  const cfg = ZONE_PAGES[page];
  const [z, f, g] = await Promise.all([
    supabase.from("economic_zones").select(ZONE_PUBLIC_COLS).in("zone_type", cfg.types).order("name_ar"),
    supabase.from("zone_facts").select(FACT_PUBLIC_COLS).in("topic", cfg.topics).order("created_at"),
    supabase.from("governorates").select("slug, name_en, name_ar").order("name_en"),
  ]);
  if (z.error) throw z.error;
  return {
    zones: (z.data ?? []) as EconomicZone[],
    facts: (f.data ?? []) as ZoneFact[],
    governorates: ((g.data ?? []) as { slug: string; name_en: string; name_ar: string }[]),
  };
}
