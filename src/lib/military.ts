import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/* Public data layer for Egypt Through Time — Military History.
 * Every query names its columns explicitly; internal_notes is never requested.
 * Row visibility (active + reviewed) is enforced by the database policies. */

export type MilEra = {
  id: string;
  slug: string;
  number: number;
  name_ar: string;
  name_en: string;
  start_label_ar: string | null;
  start_label_en: string | null;
  end_label_ar: string | null;
  end_label_en: string | null;
  sort_order: number;
  rulers_ar: string | null;
  rulers_en: string | null;
  key_leadership_ar: string | null;
  key_leadership_en: string | null;
  intro_ar: string | null;
  intro_en: string | null;
  egypt_era_id: string | null;
};

export const RECORD_TYPES = [
  "battle", "war", "campaign", "siege", "naval", "air", "operation", "defensive_action", "conflict_phase", "other_record",
] as const;
export type RecordType = (typeof RECORD_TYPES)[number];
export const OUTCOMES = [
  "egyptian_victory", "defeat", "inconclusive", "disputed", "strategic_withdrawal", "not_assessed",
] as const;
export type Outcome = (typeof OUTCOMES)[number];
export type ReviewStatus = "needs_check" | "editorial_reviewed" | "verified";

export type MilRecord = {
  id: string;
  register_no: number;
  slug: string;
  era_id: string;
  record_type: RecordType;
  title_ar: string | null;
  title_en: string;
  alt_names: string | null;
  date_label_ar: string | null;
  date_label_en: string | null;
  year_from: number | null;
  year_to: number | null;
  place_ar: string | null;
  place_en: string | null;
  lat: number | null;
  lng: number | null;
  egyptian_leadership_ar: string | null;
  egyptian_leadership_en: string | null;
  opposing_side_ar: string | null;
  opposing_side_en: string | null;
  outcome: Outcome;
  note_ar: string | null;
  note_en: string | null;
  significance_ar: string | null;
  significance_en: string | null;
  review_status: ReviewStatus;
  last_verified_at: string | null;
  is_featured: boolean;
  created_at: string;
};

export type MilFigure = {
  id: string;
  slug: string;
  name_ar: string | null;
  name_en: string;
  role_ar: string | null;
  role_en: string | null;
  era_id: string | null;
  years_label_ar: string | null;
  years_label_en: string | null;
  bio_ar: string | null;
  bio_en: string | null;
};

export type MilSource = {
  id: string;
  kind: "primary" | "scholarly" | "institutional";
  title: string;
  author: string | null;
  publisher: string | null;
  year: string | null;
  url: string | null;
};

export type MilMedia = {
  id: string;
  kind: "image" | "video" | "map" | "document";
  url: string;
  title_ar: string | null;
  title_en: string | null;
  caption_ar: string | null;
  caption_en: string | null;
  institution: string | null;
  accession_id: string | null;
  rights_statement: string;
  origin_type: "original_artifact" | "archival_photo" | "historical_artwork" | "map" | "editorial_reconstruction";
};

const ERA_COLS =
  "id, slug, number, name_ar, name_en, start_label_ar, start_label_en, end_label_ar, end_label_en, sort_order, rulers_ar, rulers_en, key_leadership_ar, key_leadership_en, intro_ar, intro_en, egypt_era_id";
const RECORD_COLS =
  "id, register_no, slug, era_id, record_type, title_ar, title_en, alt_names, date_label_ar, date_label_en, year_from, year_to, place_ar, place_en, lat, lng, egyptian_leadership_ar, egyptian_leadership_en, opposing_side_ar, opposing_side_en, outcome, note_ar, note_en, significance_ar, significance_en, review_status, last_verified_at, is_featured, created_at";
const FIGURE_COLS =
  "id, slug, name_ar, name_en, role_ar, role_en, era_id, years_label_ar, years_label_en, bio_ar, bio_en";
const SOURCE_COLS = "id, kind, title, author, publisher, year, url";
const MEDIA_COLS =
  "id, kind, url, title_ar, title_en, caption_ar, caption_en, institution, accession_id, rights_statement, origin_type";

export type MilitaryData = { eras: MilEra[]; records: MilRecord[]; figures: MilFigure[]; sources: MilSource[] };

export async function loadMilitary(): Promise<MilitaryData> {
  const [eras, records, figures, sources] = await Promise.all([
    supabase.from("military_eras").select(ERA_COLS).order("sort_order"),
    supabase.from("military_records").select(RECORD_COLS).order("register_no"),
    supabase.from("military_figures").select(FIGURE_COLS).order("name_en"),
    supabase.from("military_sources").select(SOURCE_COLS).order("title"),
  ]);
  if (eras.error || records.error) throw new Error("Could not load the military history register");
  const recs = ((records.data ?? []) as unknown as MilRecord[]).map((r) => ({
    ...r,
    lat: r.lat == null ? null : Number(r.lat),
    lng: r.lng == null ? null : Number(r.lng),
  }));
  return {
    eras: (eras.data ?? []) as unknown as MilEra[],
    records: recs,
    figures: (figures.data ?? []) as unknown as MilFigure[],
    sources: (sources.data ?? []) as unknown as MilSource[],
  };
}

export type RecordExtras = {
  figures: (MilFigure & { role_label: string | null })[];
  sources: (MilSource & { citation_detail: string | null })[];
  media: MilMedia[];
  relatedByFigure: string[];
};

export async function loadRecordExtras(recordId: string): Promise<RecordExtras> {
  const [links, srcLinks, media] = await Promise.all([
    supabase.from("military_record_figures").select("figure_id, role_label").eq("record_id", recordId),
    supabase.from("military_record_sources").select("source_id, citation_detail").eq("record_id", recordId),
    supabase.from("military_media").select(MEDIA_COLS).eq("record_id", recordId),
  ]);
  const figIds = (links.data ?? []).map((l) => l.figure_id);
  const srcIds = (srcLinks.data ?? []).map((l) => l.source_id);
  const [figs, srcs, siblings] = await Promise.all([
    figIds.length ? supabase.from("military_figures").select(FIGURE_COLS).in("id", figIds) : Promise.resolve({ data: [] }),
    srcIds.length ? supabase.from("military_sources").select(SOURCE_COLS).in("id", srcIds) : Promise.resolve({ data: [] }),
    figIds.length
      ? supabase.from("military_record_figures").select("record_id").in("figure_id", figIds)
      : Promise.resolve({ data: [] }),
  ]);
  const roleBy = new Map((links.data ?? []).map((l) => [l.figure_id, l.role_label]));
  const citeBy = new Map((srcLinks.data ?? []).map((l) => [l.source_id, l.citation_detail]));
  return {
    figures: ((figs.data ?? []) as MilFigure[]).map((f) => ({ ...f, role_label: roleBy.get(f.id) ?? null })),
    sources: ((srcs.data ?? []) as MilSource[]).map((s) => ({ ...s, citation_detail: citeBy.get(s.id) ?? null })),
    media: ((media.data ?? []) as MilMedia[]).filter(publicMediaOk),
    relatedByFigure: Array.from(new Set(((siblings.data ?? []) as { record_id: string }[]).map((s) => s.record_id))).filter(
      (id) => id !== recordId,
    ),
  };
}

export async function loadFigureRecords(figureId: string): Promise<string[]> {
  const { data } = await supabase.from("military_record_figures").select("record_id").eq("figure_id", figureId);
  return (data ?? []).map((d) => d.record_id);
}

/** Media renders only with institution, rights statement and origin type present. */
export const publicMediaOk = (m: MilMedia) =>
  !!m.institution?.trim() && !!m.rights_statement?.trim() && !!m.origin_type;

/* ---------------- helpers ---------------- */

export const BASE = "/egypt-through-time/military-history";

/** Accent/diacritic-insensitive matching; Arabic alef, ya and ta-marbuta variants unified. */
export function normalize(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[-–—_'’.,:;()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesQuery(r: MilRecord, q: string | undefined): boolean {
  const needle = normalize(q);
  if (!needle) return true;
  const hay = normalize(
    [
      r.title_en, r.title_ar, r.alt_names, r.place_en, r.place_ar, r.egyptian_leadership_en, r.egyptian_leadership_ar,
      r.opposing_side_en, r.opposing_side_ar, String(r.register_no).padStart(3, "0"),
    ].join(" | "),
  );
  return needle.split(" ").every((w) => hay.includes(w));
}

export const centuryOf = (y: number) => (y > 0 ? Math.ceil(y / 100) : -Math.ceil(-y / 100));

export function inCenturyRange(r: MilRecord, from?: number, to?: number): boolean {
  if (from == null && to == null) return true;
  if (r.year_from == null) return true; // undated rows are never silently dropped
  const a = centuryOf(r.year_from);
  const b = centuryOf(r.year_to ?? r.year_from);
  return b >= (from ?? -100) && a <= (to ?? 100);
}

export const regNo = (n: number) => String(n).padStart(3, "0");

export const TYPE_LABEL: Record<RecordType, string> = {
  battle: "Battle",
  war: "War",
  campaign: "Campaign",
  siege: "Siege",
  naval: "Naval engagement",
  air: "Air operation",
  operation: "Operation",
  defensive_action: "Defensive action",
  conflict_phase: "Conflict phase",
  other_record: "Other record",
};

/** Outcome line text; null means "show nothing". */
export function outcomeLabel(o: Outcome): string | null {
  switch (o) {
    case "egyptian_victory":
      return "Egyptian victory";
    case "defeat":
      return "Defeat";
    case "strategic_withdrawal":
      return "Strategic withdrawal";
    case "disputed":
    case "inconclusive":
      return "Outcome disputed in scholarship";
    default:
      return null;
  }
}

export function centuryLabel(c: number, lang: string): string {
  if (lang === "ar") return c < 0 ? `القرن ${-c} ق.م` : `القرن ${c} م`;
  const n = Math.abs(c);
  const suf = n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suf} c. ${c < 0 ? "BCE" : "CE"}`;
}

/** "1 record" / "2 records"; Arabic zero/one/two/few/many forms. Other languages use the English rule. */
export function recordCount(n: number, lang: string): string {
  if (lang === "ar") {
    const r = new Intl.PluralRules("ar").select(n);
    const num = n.toLocaleString("ar-EG");
    if (r === "zero") return `${num} سجل`;
    if (r === "one") return "سجل واحد";
    if (r === "two") return "سجلان";
    if (r === "few") return `${num} سجلات`;
    return `${num} سجلًا`;
  }
  return `${n} ${n === 1 ? "record" : "records"}`;
}

export const recordsSearchSchema = z.object({
  q: z.string().optional(),
  era: z.string().optional(),
  type: z.enum(RECORD_TYPES).optional(),
  outcome: z.enum(OUTCOMES).optional(),
  review: z.enum(["editorial_reviewed", "verified"]).optional(),
  cfrom: z.coerce.number().int().optional(),
  cto: z.coerce.number().int().optional(),
  sort: z.enum(["chrono", "new"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
});
export type RecordsSearch = z.infer<typeof recordsSearchSchema>;

export function applyRecordFilters(records: MilRecord[], eras: MilEra[], s: RecordsSearch): MilRecord[] {
  const eraId = s.era ? eras.find((e) => e.slug === s.era)?.id : undefined;
  const out = records.filter(
    (r) =>
      (!s.era || r.era_id === eraId) &&
      (!s.type || r.record_type === s.type) &&
      (!s.outcome || r.outcome === s.outcome) &&
      (!s.review || r.review_status === s.review) &&
      inCenturyRange(r, s.cfrom, s.cto) &&
      matchesQuery(r, s.q),
  );
  return s.sort === "new"
    ? out.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.register_no - a.register_no)
    : out.sort((a, b) => a.register_no - b.register_no);
}
