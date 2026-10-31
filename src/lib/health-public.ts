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
export function hasHealthEvidence(status: string | null, source: string | null, date: string | null, claim?: "licensed" | "accredited") { const normalized = status?.trim().toLowerCase(); return Boolean(normalized && (!claim || normalized === claim) && safeHealthUrl(source) && date && Number.isFinite(Date.parse(date))); }
export function safeHealthUrl(value: string | null | undefined): string | null { if (!value) return null; try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : null; } catch { return null; } }
export type HealthSearch = { q: string; specialty: string; governorate: string; city: string; type: string; ownership: string; page: number };
export function validateHealthSearch(search: Record<string, unknown>): HealthSearch { const str = (key: string) => typeof search[key] === "string" ? search[key] : ""; return { q: str("q"), specialty: str("specialty"), governorate: str("governorate"), city: str("city"), type: str("type"), ownership: str("ownership"), page: Number(search["page"]) || 1 }; }
