/** Education Hub — pure display rules shared by pages, sitemap and tests. */
import type { EDUCATION_CATEGORIES } from "./education-validation";

/** procedure_guides.activity value that feeds the "Certificates & equivalency guides" card. */
export const EDUCATION_GUIDE_ACTIVITY = "Education & certificates";

export const EDUCATION_CATEGORY_LABELS: Record<(typeof EDUCATION_CATEGORIES)[number], string> = {
  government: "Government",
  azhar: "Al-Azhar",
  university: "University",
  research: "Research",
  private: "Private",
  other: "Other",
};

export type EducationSearch = { q: string; category: string };
export function validateEducationSearch(search: Record<string, unknown>): EducationSearch {
  return {
    q: typeof search["q"] === "string" ? search["q"] : "",
    category: typeof search["category"] === "string" ? search["category"] : "",
  };
}

/** Hub cards: research programmes always; the others only when public records exist. */
export function educationHubCards(a: { platforms: boolean; guides: boolean }) {
  return [
    { key: "research", show: true },
    { key: "platforms", show: a.platforms },
    { key: "guides", show: a.guides },
  ].filter((c) => c.show).map((c) => c.key);
}

/** Fee is shown only when published text has its own fee source. */
export function showPlatformFee(row: { published_fee_text?: string | null; published_fee_text_ar?: string | null; fee_source_url?: string | null }) {
  return !!(row.published_fee_text?.trim() || row.published_fee_text_ar?.trim()) && !!row.fee_source_url?.trim();
}

/** Accreditation line: never implied — "accredited" only with its own source, otherwise "not stated". */
export function accreditationLabel(row: { accreditation_status?: string | null; accreditation_source_url?: string | null }) {
  return row.accreditation_status === "accredited" && row.accreditation_source_url?.trim()
    ? "Accreditation status: accredited (see accreditation source)"
    : "Accreditation status: not stated by the source";
}
