import { z } from "zod";
export const ENERGY_TABLES = ["energy_official_bodies"] as const;
export const ENERGY_DISCIPLINES = ["civil", "mechanical", "electrical", "instrumentation_control", "telecommunications", "circular"] as const;
export const ENERGY_ROLES = ["buyer/operator", "engineering or construction contractor", "supplier or manufacturer", "recycler or waste handler", "logistics provider", "other"] as const;
export const ENERGY_RATE_LIMIT = { submissions: 30, windowSeconds: 60 } as const;
export const ENERGY_PHASE2_FLAGS = ["energy_company_registration", "energy_kyb_verification", "energy_supplier_directory", "energy_supplier_qualification", "energy_inventory", "energy_mto_upload", "energy_mto_ai_analysis", "energy_material_matching", "energy_rfq", "energy_offer_comparison", "energy_price_intelligence", "energy_logistics", "energy_inspection", "energy_surplus_listings", "energy_scrap_classification", "energy_auctions", "energy_recycler_network", "energy_subscriptions", "energy_reports", "energy_mobile_app"] as const;
export const ENERGY_BODY_COLUMNS = "id,slug,name_en,name_ar,body_type,summary_en,summary_ar,official_url,source_name,source_name_ar,source_url,verified_on,languages,sort_order" as const;
const text = (max: number) => z.string().trim().min(1).max(max);
export const energyInterestSchema = z.object({ company_name: text(200), country: text(100), company_role: z.enum(ENERGY_ROLES), disciplines: z.array(z.enum(ENERGY_DISCIPLINES)).min(1).max(6).refine(v => new Set(v).size === v.length), contact_name: text(100), contact_email: text(255).email(), message: text(1000), consent_given: z.literal(true), website: z.string().max(200).default("") }).strict();
const source = z.string().max(2048).url().refine(v => /^https?:\/\//i.test(v) && !/\.pdf(?:[?#]|$)/i.test(v), "Source must be an HTTP website, not a PDF.").nullish();
const bodySchema = z.object({ name_en: text(300), name_ar: text(300), body_type: text(200), summary_en: z.string().max(5000).nullish(), summary_ar: z.string().max(5000).nullish(), official_url: z.string().max(2048).url().refine(v => /^https:\/\//i.test(v), "Official URL must be HTTPS.").nullish(), source_name: z.string().max(300).nullish(), source_name_ar: z.string().max(300).nullish(), source_url: source, verified_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v && v <= new Date().toISOString().slice(0,10), "Invalid or future date.").nullish(), languages: z.enum(["ar","en","ar,en"]).nullish(), review_status: z.enum(["needs_check","editorial_reviewed","verified"]).optional(), is_active: z.boolean().optional(), sort_order: z.number().int().nullish(), internal_notes: z.string().max(5000).nullish() });
export function validateEnergyValues(row: Record<string, unknown>, partial = false): string | null {
 const parsed = (partial ? bodySchema.partial() : bodySchema).safeParse(row);
 if (!parsed.success) return parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
 if (row["is_active"] === true && (!String(row["source_url"] ?? "").trim() || !row["verified_on"] || !["editorial_reviewed","verified"].includes(String(row["review_status"])) || !/^https:\/\//i.test(String(row["official_url"] ?? "")))) return "Activation requires source URL, verification date, reviewed status and HTTPS official URL.";
 return null;
}
export function energyVisible(row: Record<string, unknown>) { return row["is_active"] === true && ["editorial_reviewed","verified"].includes(String(row["review_status"])); }
export function energyHoneypotFilled(website: string) { return website.trim().length > 0; }
