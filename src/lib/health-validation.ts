import { z } from "zod";

export const HEALTH_TYPES = ["hospital", "clinic", "health_unit", "lab", "imaging", "pharmacy", "blood_center", "rehab", "mental_health", "home_care"] as const;
export const HEALTH_STATUS = ["new", "in_review", "resolved", "dismissed"] as const;
export const HEALTH_TABLES = ["health_facilities", "health_specialties", "health_reports", "health_inquiries"] as const;
export type HealthTable = typeof HEALTH_TABLES[number];
const text = (max = 5000) => z.string().trim().max(max);
const optionalText = (max = 5000) => text(max).nullish();
const url = z.string().trim().max(2048).url().refine((v) => /^https?:\/\//i.test(v), "Use an http or https URL.").nullish();
const date = z.string().refine((v) => Number.isFinite(Date.parse(v)), "Invalid verification date.").refine((v) => Date.parse(v) <= Date.now(), "Verification date cannot be in the future.").nullish();
const names = { name_en: text(200).min(1), name_ar: text(200).min(1) };
export const healthSlug = z.string().max(200).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use a lowercase hyphenated slug.");

const facilities = z.object({
  ...names, facility_type: z.enum(HEALTH_TYPES), ownership: z.enum(["government", "private", "university"]),
  governorate_id: optionalText(100), city_en: optionalText(200), city_ar: optionalText(200), address_en: optionalText(1000), address_ar: optionalText(1000),
  lat: z.number().min(-90).max(90).nullish(), lng: z.number().min(-180).max(180).nullish(), phone: optionalText(50),
  hours_en: optionalText(500), hours_ar: optionalText(500), official_website: url.refine((v) => !v || v.startsWith("https://"), "Official website must use https."),
  services: z.array(text(200)).max(100).optional(), description_en: optionalText(), description_ar: optionalText(),
  license_status: optionalText(200), license_source_url: url, accreditation_status: optionalText(200), accreditation_source_url: url,
  source_url: url, last_verified_at: date, is_active: z.boolean().optional(), external_ids: z.record(z.unknown()).optional(), image_key: optionalText(200),
});
const specialties = z.object({ ...names, summary_en: optionalText(), summary_ar: optionalText(), when_to_visit_en: optionalText(), when_to_visit_ar: optionalText(), icon: optionalText(100), sort_order: z.number().int().optional(), is_active: z.boolean().optional(), source_url: url, last_verified_at: date });
export const healthReportSchema = z.object({ facility_id: z.string().uuid().nullish(), kind: z.enum(["wrong_info", "closed", "link_broken", "other"]), message: text(1000).min(1), contact_email: z.string().trim().email().max(255).nullish(), status: z.enum(HEALTH_STATUS).optional() });
export const healthInquirySchema = z.object({ type: z.enum(["medical_travel", "partner", "research"]), full_name: text(100).min(1), email: z.string().trim().email().max(255), country: text(100).min(1), preferred_language: z.enum(["en", "ar", "fr", "de", "es", "it", "ru", "zh", "hi"]), message: text(1500).min(1), consent: z.literal(true), status: z.enum(HEALTH_STATUS).optional() });

export function healthActivationError(row: Record<string, unknown>): string | null {
  if (row.is_active && (!row.source_url || !row.last_verified_at)) return "Activation requires a source URL and verification date.";
  if (row.license_status && (!row.license_source_url || !row.last_verified_at)) return "License status requires its own source URL and verification date.";
  if (row.accreditation_status && (!row.accreditation_source_url || !row.last_verified_at)) return "Accreditation status requires its own source URL and verification date.";
  return null;
}

/** Shared client/server validation; database triggers protect direct writes too. */
export function validateHealthValues(table: HealthTable, row: Record<string, unknown>, partial = false): string | null {
  const schema = table === "health_facilities" ? facilities : table === "health_specialties" ? specialties : table === "health_reports" ? healthReportSchema : healthInquirySchema;
  const parsed = (partial ? schema.partial() : schema).safeParse(row);
  if (!parsed.success) return parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  return table === "health_facilities" ? healthActivationError(row) : null;
}