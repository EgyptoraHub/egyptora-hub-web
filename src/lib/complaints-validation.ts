import { z } from "zod";

/**
 * Complaints & Government Services Guide — validation mirrors the database
 * trigger `validate_complaint_channel` so the admin editor and CSV import
 * reject the same rows the database would. Phase 1 is informational only:
 * there is NO complaint intake, case table, evidence upload or tracking.
 */
export const COMPLAINTS_TABLES = ["complaint_sectors", "complaint_channels"] as const;
export type ComplaintsTable = (typeof COMPLAINTS_TABLES)[number];

/** Phase 2 infrastructure flags — all disabled; nothing in the app may read them to enable behavior. */
export const COMPLAINTS_PHASE2_FLAGS = [
  "complaints_intake",
  "complaints_tracking",
  "complaints_integrity_channel",
  "complaints_agency_console",
  "complaints_evidence_upload",
  "complaints_ai_triage",
  "complaints_public_metrics",
  "complaints_mobile_app",
] as const;

export const complaintSlug = z.string().max(200).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const COMPLAINT_FAMILIES = [
  "local_urban",
  "utilities_infrastructure",
  "transport_traffic",
  "health_social",
  "education_work",
  "trade_finance",
  "environment_agriculture",
  "culture_tourism_civic",
  "integrity_justice",
  "safety_identity_other",
] as const;
export const COMPLAINT_NOTICE_TYPES = ["none", "sensitive", "emergency"] as const;
export const COMPLAINT_CHANNEL_TYPES = ["hotline", "website", "app", "whatsapp"] as const;

const text = (max = 5000) => z.string().trim().max(max);
const optional = (max = 5000) => text(max).nullish();
const url = z.string().max(2048).url().refine((v) => /^https?:\/\//i.test(v), "Use an HTTP website.").nullish();
const source = url.refine((v) => !v || !/\.pdf(?:[?#]|$)/i.test(v), "PDF sources are not allowed.");
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, "Invalid date.")
  .refine((v) => v <= new Date().toISOString().slice(0, 10), "Date cannot be in the future.")
  .nullish();
const common = {
  source_name: optional(300),
  source_name_ar: optional(300),
  source_url: source,
  last_verified_at: date,
  review_status: z.enum(["needs_check", "editorial_reviewed", "verified"]).optional(),
  is_active: z.boolean().optional(),
  internal_notes: optional(),
};

const schemas = {
  // Sectors are our own editorial taxonomy: no source URL is required to activate them.
  complaint_sectors: z.object({
    name_en: text(200).min(1),
    name_ar: text(200).min(1),
    family: z.enum(COMPLAINT_FAMILIES),
    scope_en: optional(),
    scope_ar: optional(),
    notice_type: z.enum(COMPLAINT_NOTICE_TYPES).optional(),
    sort_order: z.number().int().nullish(),
    review_status: z.enum(["needs_check", "editorial_reviewed", "verified"]).optional(),
    is_active: z.boolean().optional(),
    internal_notes: optional(),
  }),
  complaint_channels: z.object({
    ...common,
    sector_slug: complaintSlug,
    authority_name_en: text(300).min(1),
    authority_name_ar: optional(300),
    channel_type: z.enum(COMPLAINT_CHANNEL_TYPES),
    channel_value: text(300).min(1),
    label_en: optional(300),
    label_ar: optional(300),
    hours_en: optional(1000),
    hours_ar: optional(1000),
    handles_en: optional(1000),
    handles_ar: optional(1000),
    sort_order: z.number().int().nullish(),
  }),
};

/** Public visibility rule — identical to the database policy. */
export function complaintsVisible(row: Record<string, unknown>): boolean {
  return row["is_active"] === true && ["editorial_reviewed", "verified"].includes(String(row["review_status"]));
}

/** Hotline values: digits, +, spaces and dashes only, 3–20 chars (mirrors the database trigger). */
export const HOTLINE_RE = /^[+0-9][0-9 +\-]{2,19}$/;

export function validateComplaintValues(table: ComplaintsTable, row: Record<string, unknown>, partial = false): string | null {
  const parsed = (partial ? schemas[table].partial() : schemas[table]).safeParse(row);
  if (!parsed.success) return parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  if (table !== "complaint_channels") return null;
  if (row["is_active"] === true && (!String(row["source_url"] ?? "").trim() || !row["last_verified_at"])) {
    return "Activation requires a source URL and verification date.";
  }
  const value = String(row["channel_value"] ?? "").trim();
  if (/^(javascript|data):/i.test(value)) return "Unsafe channel value.";
  if (row["channel_type"] === "hotline" && !HOTLINE_RE.test(value)) return "Hotline must be a phone number (digits, +, spaces, dashes; 3-20 chars).";
  if (["website", "app", "whatsapp"].includes(String(row["channel_type"])) && !/^https:\/\//i.test(value)) {
    return "Channel value must be an HTTPS URL.";
  }
  const hasPublishedText = ["hours_en", "hours_ar", "handles_en", "handles_ar"].some((k) => String(row[k] ?? "").trim());
  if (hasPublishedText && !String(row["source_url"] ?? "").trim()) return "Published hours or scope text requires the row source.";
  return null;
}

export const COMPLAINTS_MATCH_KEYS: Record<ComplaintsTable, string[]> = {
  complaint_sectors: ["slug"],
  complaint_channels: ["slug"],
};
export function complaintsMatchKey(table: ComplaintsTable, row: Record<string, unknown>) {
  return JSON.stringify(COMPLAINTS_MATCH_KEYS[table].map((k) => String(row[k] ?? "").trim()));
}

/** New rows are always forced needs_check + inactive; updates never touch visibility columns. */
export function complaintsImportState(payload: Record<string, unknown>, existing: boolean) {
  const { is_active: _active, review_status: _review, ...safe } = payload;
  return existing ? safe : { ...safe, is_active: false, review_status: "needs_check" };
}

export function complaintsForeignKeyError(table: ComplaintsTable, row: Record<string, unknown>, sectors: Set<string>): string | null {
  if (table === "complaint_channels" && !sectors.has(String(row["sector_slug"]))) return "Unknown sector_slug.";
  return null;
}
