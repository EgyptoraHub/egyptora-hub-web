/**
 * Research programmes — public reads and validation.
 * Visitors see only active, reviewed rows (database policy); this module mirrors the
 * `validate_research_program` trigger so dry-runs reject the same rows the database would.
 */
export const RESEARCH_PROGRAM_COLUMNS =
  "id,slug,name,name_ar,university,university_ar,field,degree,degree_ar,governorate_slug,languages,summary,summary_ar,description,images,tags,governance_status,source_name,source_name_ar,source_url,last_verified_at" as const;

export const RESEARCH_REVIEW_STATUSES = ["needs_check", "editorial_reviewed", "verified"] as const;

export type ResearchProgramValues = {
  source_url?: string | null;
  last_verified_at?: string | null;
  review_status?: string | null;
  is_active?: boolean | null;
};

const isPdf = (u: string) => /\.pdf([?#]|$)/i.test(u);
const blank = (v: unknown) => v == null || String(v).trim() === "";

/** Returns a list of problems; empty means the row would be accepted. */
export function validateResearchProgram(v: ResearchProgramValues, today = new Date().toISOString().slice(0, 10)): string[] {
  const errors: string[] = [];
  const status = v.review_status ?? "needs_check";
  if (!(RESEARCH_REVIEW_STATUSES as readonly string[]).includes(status)) errors.push("review_status: not allowed");
  if (!blank(v.source_url)) {
    const u = String(v.source_url).trim();
    if (!/^https?:\/\//i.test(u) || isPdf(u)) errors.push("source_url: must be an HTTP website, not a PDF");
  }
  if (!blank(v.last_verified_at) && String(v.last_verified_at) > today) errors.push("last_verified_at: cannot be in the future");
  if (v.is_active) {
    if (blank(v.source_url) || blank(v.last_verified_at)) errors.push("activation requires a source URL and verification date");
    if (status !== "editorial_reviewed" && status !== "verified") errors.push("activation requires a reviewed status");
  }
  return errors;
}

/** Same rule as the visitor policy. */
export function researchProgramVisible(r: { is_active?: boolean | null; review_status?: string | null }): boolean {
  return !!r.is_active && (r.review_status === "editorial_reviewed" || r.review_status === "verified");
}

/** Arabic value when the language is Arabic and it exists, otherwise English. */
export function researchText(lang: string, en: string | null | undefined, ar: string | null | undefined): string | null {
  if (lang === "ar" && ar && ar.trim()) return ar;
  return en ?? null;
}
