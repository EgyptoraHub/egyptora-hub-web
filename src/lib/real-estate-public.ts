/** RealEstate Hub — pure display rules shared by pages, sitemap and tests. */
import type { REAL_ESTATE_CATEGORIES } from "./real-estate-validation";

/** procedure_guides.activity value that feeds the "Certificates & equivalency guides" card. */
export const REAL_ESTATE_GUIDE_ACTIVITY = "Property & housing";

export const REAL_ESTATE_CATEGORY_LABELS: Record<(typeof REAL_ESTATE_CATEGORIES)[number], string> = {
  government: "Government",
  housing: "Housing",
  registry: "Registry",
  finance: "Finance",
  private: "Private",
  other: "Other",
};

export type RealEstateSearch = { q: string; category: string };
export function validateRealEstateSearch(search: Record<string, unknown>): RealEstateSearch {
  return {
    q: typeof search["q"] === "string" ? search["q"] : "",
    category: typeof search["category"] === "string" ? search["category"] : "",
  };
}

