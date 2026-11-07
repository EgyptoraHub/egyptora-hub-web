/**
 * Complaints & Government Services Guide — public page helpers.
 * Pure display rules only; all data comes from the database through the
 * visitor visibility rules (active + editorially reviewed). Phase 1 is
 * informational only: Egyptora never receives, stores or tracks complaints.
 */
import type { COMPLAINT_FAMILIES, COMPLAINT_CHANNEL_TYPES } from "./complaints-validation";

export const COMPLAINT_FAMILY_LABELS: Record<(typeof COMPLAINT_FAMILIES)[number], string> = {
  local_urban: "Local & urban",
  utilities_infrastructure: "Utilities & infrastructure",
  transport_traffic: "Transport & traffic",
  health_social: "Health & social",
  education_work: "Education & work",
  trade_finance: "Trade & finance",
  environment_agriculture: "Environment & agriculture",
  culture_tourism_civic: "Culture, tourism & civic",
  integrity_justice: "Integrity & justice",
  safety_identity_other: "Safety, identity & other",
};

export const CHANNEL_TYPE_LABELS: Record<(typeof COMPLAINT_CHANNEL_TYPES)[number], string> = {
  hotline: "Hotline",
  website: "Website",
  app: "App",
  whatsapp: "WhatsApp",
};

/** This sector is never a normal card — it appears only as the "Not sure who to contact?" guide card. */
export const UNKNOWN_AUTHORITY_SECTOR = "other-unknown-authority";
/** The unified government complaints channel block renders only while this channel record is active. */
export const UNIFIED_CHANNEL_SLUG = "official-unified-complaints-system";

/** Static bilingual "What to prepare" checklist (translation keys; Arabic lives in the dictionary). */
export const WHAT_TO_PREPARE = [
  "Date and time of what happened",
  "Place: governorate, city and street",
  "Name of the facility or service",
  "Receipt, invoice, contract or reference numbers",
  "Photos or documents you already have",
  "Previous complaint numbers, if any",
  "Only the contact details you are comfortable giving to the official channel",
] as const;

export type ComplaintsSearch = { q: string; family: string };
export function validateComplaintsSearch(search: Record<string, unknown>): ComplaintsSearch {
  return {
    q: typeof search["q"] === "string" ? search["q"] : "",
    family: typeof search["family"] === "string" ? search["family"] : "",
  };
}

/** Bilingual published text: Arabic pages prefer the _ar value and fall back to the default; other languages always use the default. */
export function complaintTextFor(lang: string, textEn: string | null | undefined, textAr: string | null | undefined): string | null {
  const en = (textEn ?? "").trim();
  const ar = (textAr ?? "").trim();
  if (lang === "ar") return ar || en || null;
  return en || null;
}
