/**
 * Eco & Nature — protected areas. Public read helpers with explicit columns
 * (internal_notes is never granted to visitors). The database visibility rule
 * (is_active + reviewed) decides which rows exist here. No names or counts live in code.
 */
import { supabase } from "@/integrations/supabase/client";
import { shortHash } from "@/lib/economic-zones";

export const PROTECTED_PATH = "/experiences/eco-nature";

export const PROTECTED_PUBLIC_COLS =
  "id, slug, name_ar, name_en, governorate_slug, declared_year, area_km2, summary_ar, summary_en, source_url, source_note, sort_order";

export type ProtectedArea = {
  id: string; slug: string; name_ar: string; name_en: string | null; governorate_slug: string | null;
  declared_year: number | null; area_km2: number | null; summary_ar: string | null; summary_en: string | null;
  source_url: string | null; source_note: string | null; sort_order: number;
};

export const protectedTitle = (p: Pick<ProtectedArea, "name_ar" | "name_en">, lang: string) =>
  lang === "ar" ? p.name_ar : p.name_en?.trim() || p.name_ar;

/** Slug from the name: ASCII from name_en when present, plus a short hash of name_ar for uniqueness. */
export function protectedSlug(nameAr: string, nameEn?: string | null): string {
  const base = (nameEn ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return `${base || "protected-area"}-${shortHash(nameAr.trim())}`;
}

/** Owner policy: public sources must be Egyptian web pages (.eg or manshurat.org), never PDFs. Returns a warning or null. */
export function sourceUrlWarning(url: string | null | undefined): string | null {
  if (!url) return null;
  let host = "";
  let path = "";
  try { const u = new URL(url); host = u.hostname.toLowerCase(); path = u.pathname.toLowerCase(); } catch { return "source_url is not a valid link"; }
  const warn: string[] = [];
  if (path.endsWith(".pdf")) warn.push("PDF link");
  if (!(host.endsWith(".eg") || host === "manshurat.org" || host.endsWith(".manshurat.org"))) warn.push("not an Egyptian website");
  return warn.length ? `warning: source_url is ${warn.join(" and ")}` : null;
}

export async function loadProtectedAreas() {
  const [p, g] = await Promise.all([
    supabase.from("protected_areas").select(PROTECTED_PUBLIC_COLS).order("sort_order").order("name_ar"),
    supabase.from("governorates").select("slug, name, name_ar").order("name"),
  ]);
  if (p.error) throw p.error;
  return {
    areas: (p.data ?? []) as ProtectedArea[],
    governorates: ((g.data ?? []) as { slug: string; name: string; name_ar: string }[]).map((x) => ({ slug: x.slug, name_en: x.name, name_ar: x.name_ar })),
  };
}
