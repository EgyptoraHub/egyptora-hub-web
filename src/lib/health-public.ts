import { z } from "zod";
import { healthInquirySchema, healthReportSchema } from "./health-validation";

export const publicHealthInquirySchema = healthInquirySchema.omit({ status: true }).strict();
export const publicHealthReportSchema = healthReportSchema.omit({ status: true }).extend({ consent: z.literal(true) }).strict();
export const healthNavigation = [
  ["Find Care", "/health/find-care"], ["Specialties", "/health/specialties"],
  ["Home Care", "/health/services/home-care"], ["Rehabilitation", "/health/services/rehabilitation"],
  ["Mental Health", "/health/services/mental-health"], ["Mother & Child", "/health/services/mother-child"],
  ["Chronic Care", "/health/services/chronic-care"], ["Blood Donation", "/health/blood-donation"],
  ["Medical Travel", "/health/medical-travel"], ["Insurance", "/health/insurance"],
  ["Official Websites", "/health/official-websites"], ["Health Apps", "/health/apps"],
  ["Projects & Research", "/health/projects-research"], ["Support", "/health/support"],
] as const;
export const facilityTypeLabels: Record<string, string> = { hospital: "Hospital", clinic: "Clinic", health_unit: "Health unit", lab: "Laboratory", imaging: "Imaging centre", pharmacy: "Pharmacy", blood_center: "Blood donation centre", rehab: "Rehabilitation", mental_health: "Mental Health", home_care: "Home Care" };
export const ownershipLabels: Record<string, string> = { government: "Government", private: "Private", university: "University" };
export const servicePages: Record<string, { title: string; body: string; facilityType?: string; specialtySlugs?: string[] }> = {
  "home-care": { title: "Home Care", body: "Home care information covers services provided at home. Confirm the scope, availability and provider credentials directly with the facility.", facilityType: "home_care" },
  rehabilitation: { title: "Rehabilitation", body: "Rehabilitation services support recovery and daily function. A qualified provider determines the appropriate assessment and programme.", facilityType: "rehab" },
  "mental-health": { title: "Mental Health", body: "Mental health services provide professional assessment and support. Contact the listed facility directly for its available services.", facilityType: "mental_health", specialtySlugs: ["mental-health", "psychiatry"] },
  "mother-child": { title: "Mother & Child", body: "Find facilities associated with maternal and child specialties. Confirm available services directly with the provider.", specialtySlugs: ["obstetrics-gynecology", "pediatrics"] },
  "chronic-care": { title: "Chronic Care", body: "Chronic care involves ongoing coordination with qualified healthcare professionals. The directory provides contact information, not a treatment plan.", specialtySlugs: ["internal-medicine", "endocrinology", "cardiology", "nephrology"] },
};
/**
 * Term matching for the health resource pages (insurance, official websites, apps).
 * Rows are shown ONLY when a health term matches name/category/description in EN or AR —
 * there is deliberately no fallback to unrelated directory rows.
 */
const HEALTH_TERMS_EN = ["health", "medical", "hospital", "clinic", "insurance", "drug", "pharma", "blood", "ambulance"];
const HEALTH_TERMS_AR = ["صحة", "صحي", "صحية", "طب", "طبي", "طبية", "مستشفى", "مستشفيات", "تأمين", "دواء", "أدوية", "دم", "تبرع", "إسعاف", "علاج"];
const INSURANCE_TERMS_EN = ["insurance"];
const INSURANCE_TERMS_AR = ["تأمين"];

/** Light Arabic normalisation for comparison only: strip tashkeel/tatweel, unify alef forms, ى→ي, ة→ه. */
function normalizeArabic(value: string): string {
  return value
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

/** Known English spelling variants of governorate names (both directions). */
const CITY_NAME_VARIANTS: Record<string, string[]> = {
  asyut: ["assiut"],
  assiut: ["asyut"],
};

/**
 * Display "Governorate, City" for a health facility, but show the governorate only once
 * when the city is the same place: identical after normalisation (case/trim, Arabic
 * tashkeel/tatweel removed, أإآ→ا, ى→ي, ة→ه) or a known spelling variant (Asyut/Assiut).
 */
export function formatHealthLocation(governorate: string, city: string | null | undefined): string {
  const gov = governorate.trim();
  const c = (city ?? "").trim();
  if (!gov) return c;
  if (!c) return gov;
  const norm = (s: string) => normalizeArabic(s).trim().toLowerCase().replace(/\s+/g, " ");
  const ng = norm(gov);
  const nc = norm(c);
  if (ng === nc || (CITY_NAME_VARIANTS[ng] ?? []).includes(nc)) return gov;
  return `${gov}, ${c}`;
}

/** Strip the definite article and the prefixes و/ب/ل (and combinations) from the front of an Arabic token. */
function stripArabicPrefixes(token: string): string {
  let t = token;
  let changed = true;
  while (changed) {
    changed = false;
    for (const prefix of ["ال", "و", "ب", "ل"]) {
      if (t.length > prefix.length + 1 && t.startsWith(prefix)) {
        t = t.slice(prefix.length);
        changed = true;
      }
    }
  }
  return t;
}

/**
 * Whole-word matcher for the health resource pages. Arabic terms match whole tokens only
 * (after normalisation and prefix stripping), so "دم" never matches inside "الخدمات" and
 * "طب" never matches "الطبيعة"/"مطبعة". English terms match on word boundaries with
 * suffix forms of the same stem ("hospitals", "pharmacy"/"pharmaceutical" via "pharma").
 */
export function healthResourceMatcher(kind: "health" | "insurance"): (...fields: Array<string | null | undefined>) => boolean {
  const enTerms = kind === "insurance" ? INSURANCE_TERMS_EN : HEALTH_TERMS_EN;
  const arTerms = new Set((kind === "insurance" ? INSURANCE_TERMS_AR : HEALTH_TERMS_AR).map(normalizeArabic));
  const enRe = new RegExp(`\\b(?:${enTerms.join("|")})[a-z]*\\b`, "i");
  return (...fields) => {
    const text = fields.filter((f): f is string => Boolean(f)).join(" ");
    if (enRe.test(text)) return true;
    for (const raw of text.split(/[^ء-ي]+/)) {
      if (!raw) continue;
      if (arTerms.has(stripArabicPrefixes(normalizeArabic(raw)))) return true;
    }
    return false;
  };
}
export function hasHealthEvidence(status: string | null, source: string | null, date: string | null, claim?: "licensed" | "accredited") { const normalized = status?.trim().toLowerCase(); return Boolean(normalized && (!claim || normalized === claim) && safeHealthUrl(source) && date && Number.isFinite(Date.parse(date))); }
export function safeHealthUrl(value: string | null | undefined): string | null { if (!value) return null; try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : null; } catch { return null; } }
export type HealthSearch = { q: string; specialty: string; governorate: string; city: string; type: string; ownership: string; page: number };
export function validateHealthSearch(search: Record<string, unknown>): HealthSearch { const str = (key: string) => typeof search[key] === "string" ? search[key] : ""; return { q: str("q"), specialty: str("specialty"), governorate: str("governorate"), city: str("city"), type: str("type"), ownership: str("ownership"), page: Number(search["page"]) || 1 }; }
