import { z } from "zod";

/**
 * Education Hub — Phase 1 is informational only (official platforms, links and guides).
 * Validation mirrors the database trigger `validate_education_platform`, so the admin
 * editor and CSV import reject the same rows the database would. Self-contained (zod
 * only) so it can be imported by the complaints machinery without an import cycle.
 */
export const EDUCATION_TABLES = ["education_platforms"] as const;
export type EducationTable = (typeof EDUCATION_TABLES)[number];

export const EDUCATION_CATEGORIES = ["government", "azhar", "university", "research", "private", "other"] as const;
export const ACCREDITATION_STATUSES = ["not_stated", "accredited"] as const;

/** Public columns only — never internal_notes. */
export const EDUCATION_PLATFORM_COLUMNS =
  "id,slug,name_en,name_ar,operator_name_en,operator_name_ar,category,audience_en,audience_ar,services_summary_en,services_summary_ar,languages,published_fee_text,published_fee_text_ar,fee_source_url,official_url,accreditation_status,accreditation_source_url,source_name,source_name_ar,source_url,last_verified_at,sort_order" as const;

/**
 * Phase 2 infrastructure flags — all stored disabled. No tables, columns or code paths
 * exist for students, parents, minors, applications, results, credentials, CVs,
 * employers, scholarship applicants or case data.
 */
export const EDUCATION_PHASE2_FLAGS = [
  "education_admissions_applications",
  "education_transfers",
  "education_student_records",
  "education_parent_access",
  "education_credential_wallet",
  "education_certificate_verification",
  "education_jobs_matching",
  "education_employer_verification",
  "education_scholarship_applications",
  "education_labs_booking",
  "education_research_submissions",
  "education_investment_applications",
  "education_case_management",
  "education_governorate_dashboards",
  "education_mobile_app",
] as const;

const text = (max = 5000) => z.string().trim().max(max);
const optional = (max = 5000) => text(max).nullish();
const httpUrl = z.string().max(2048).url().refine((v) => /^https?:\/\//i.test(v), "Use an HTTP website.");
const source = httpUrl.refine((v) => !/\.pdf(?:[?#]|$)/i.test(v), "PDF sources are not allowed.").nullish();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, "Invalid date.")
  .refine((v) => v <= new Date().toISOString().slice(0, 10), "Date cannot be in the future.")
  .nullish();

const platformSchema = z.object({
  name_en: text(300).min(1),
  name_ar: optional(300),
  operator_name_en: optional(300),
  operator_name_ar: optional(300),
  category: z.enum(EDUCATION_CATEGORIES),
  audience_en: optional(1000),
  audience_ar: optional(1000),
  services_summary_en: optional(),
  services_summary_ar: optional(),
  languages: z.string().trim().max(50).regex(/^[a-z]{2}(,[a-z]{2})*$/, "Use language codes like ar or ar,en.").nullish(),
  published_fee_text: optional(500),
  published_fee_text_ar: optional(500),
  fee_source_url: source,
  official_url: z.string().max(2048).url().refine((v) => /^https:\/\//i.test(v), "Official URL must be HTTPS.").nullish(),
  accreditation_status: z.enum(ACCREDITATION_STATUSES).optional(),
  accreditation_source_url: source,
  source_name: optional(300),
  source_name_ar: optional(300),
  source_url: source,
  last_verified_at: date,
  review_status: z.enum(["needs_check", "editorial_reviewed", "verified"]).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().nullish(),
  internal_notes: optional(),
});

const filled = (v: unknown) => String(v ?? "").trim().length > 0;

export function validateEducationValues(row: Record<string, unknown>, partial = false): string | null {
  const parsed = (partial ? platformSchema.partial() : platformSchema).safeParse(row);
  if (!parsed.success) return parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  if (row["is_active"] === true) {
    if (!filled(row["source_url"]) || !row["last_verified_at"]) return "Activation requires a source URL and verification date.";
    if (!["editorial_reviewed", "verified"].includes(String(row["review_status"]))) return "Activation requires a reviewed status.";
    if (!/^https:\/\//i.test(String(row["official_url"] ?? ""))) return "Activation requires an HTTPS official URL.";
  }
  if ((filled(row["published_fee_text"]) || filled(row["published_fee_text_ar"])) && !filled(row["fee_source_url"])) return "A published fee requires a fee source URL.";
  if (row["accreditation_status"] === "accredited" && !filled(row["accreditation_source_url"])) return "Accredited status requires an accreditation source URL.";
  return null;
}

/** Public visibility rule — identical to the database policy. */
export function educationVisible(row: Record<string, unknown>): boolean {
  return row["is_active"] === true && ["editorial_reviewed", "verified"].includes(String(row["review_status"]));
}
