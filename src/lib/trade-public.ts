/**
 * Trade, Industry & Agriculture — public page helpers.
 * Pure display rules only; all data comes from the database through the
 * visitor visibility rules (active + editorially reviewed). Nothing is
 * invented here: unknown values are hidden, never guessed.
 */

export const SECTOR_GROUPS = ["industry", "agriculture", "trade_services"] as const;
export type SectorGroup = (typeof SECTOR_GROUPS)[number];
export const SECTOR_GROUP_LABELS: Record<SectorGroup, string> = {
  industry: "Industry",
  agriculture: "Agriculture",
  trade_services: "Trade services",
};

export const RECORD_KIND_LABELS: Record<string, string> = {
  raw_material: "Raw material",
  manufactured: "Manufactured good",
  agricultural: "Agricultural product",
  service: "Service",
  technology: "Technology",
};
export const FLOW_LABELS: Record<string, string> = {
  export_from_country: "Export from country",
  import_to_country: "Import to country",
};
export const INQUIRY_TOPICS = ["sourcing", "export", "localization", "procedure", "other"] as const;
export const INQUIRY_TOPIC_LABELS: Record<(typeof INQUIRY_TOPICS)[number], string> = {
  sourcing: "Sourcing",
  export: "Export",
  localization: "Localization",
  procedure: "Procedures",
  other: "Other",
};

/** A nav item / hub chip becomes a real link only while the section has at least one public record. */
export function tradeGateOpen(publicCount: number | null | undefined): boolean {
  return (publicCount ?? 0) > 0;
}

/** "Last verified" text — null when the date is missing or invalid, so the label is hidden instead of guessed. */
export function sourceDateText(date: string | null | undefined): string | null {
  const value = (date ?? "").trim();
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return value;
}

/** Published fee / processing-time blocks render ONLY with both the text and its own source link. */
export function showPublishedBlock(text: string | null | undefined, sourceUrl: string | null | undefined): boolean {
  return Boolean(text?.trim() && sourceUrl?.trim());
}

/** Commodities split into raw materials vs manufactured goods / services for the country profile table. */
export function isRawMaterialKind(recordKind: string): boolean {
  return recordKind === "raw_material" || recordKind === "agricultural";
}

export type SectorSearch = { group: string };
export function validateSectorSearch(search: Record<string, unknown>): SectorSearch {
  return { group: typeof search["group"] === "string" ? search["group"] : "" };
}
export type CountrySearch = { q: string; region: string };
export function validateCountrySearch(search: Record<string, unknown>): CountrySearch {
  return {
    q: typeof search["q"] === "string" ? search["q"] : "",
    region: typeof search["region"] === "string" ? search["region"] : "",
  };
}
export type GuideSearch = { activity: string };
export function validateGuideSearch(search: Record<string, unknown>): GuideSearch {
  return { activity: typeof search["activity"] === "string" ? search["activity"] : "" };
}
