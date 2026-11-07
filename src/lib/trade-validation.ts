import { z } from "zod";
export const TRADE_CONTENT_TABLES = ["trade_sectors", "trade_country_profiles", "trade_country_commodities", "procedure_guides", "procedure_steps", "procedure_documents"] as const;
export type TradeContentTable = typeof TRADE_CONTENT_TABLES[number];
export const TRADE_TABLES = [...TRADE_CONTENT_TABLES, "trade_inquiries"] as const;
export type TradeTable = typeof TRADE_TABLES[number];
export const TRADE_PHASE2_FLAGS = ["trade_supplier_directory", "trade_rfq", "trade_offer_comparison", "trade_data_room", "trade_e_signing", "trade_ai_matching", "trade_observatory"] as const;
export const tradeSlug = z.string().max(200).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const text = (max = 5000) => z.string().trim().max(max);
const optional = (max = 5000) => text(max).nullish();
const url = z.string().max(2048).url().refine(v => /^https?:\/\//i.test(v), "Use an HTTP website.").nullish();
const source = url.refine(v => !v || !/\.pdf(?:[?#]|$)/i.test(v), "PDF sources are not allowed.");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, "Invalid date.").refine(v => v <= new Date().toISOString().slice(0,10), "Date cannot be in the future.").nullish();
const common = { source_name: optional(300), source_name_ar: optional(300), source_url: source, last_verified_at: date, review_status: z.enum(["needs_check", "editorial_reviewed", "verified"]).optional(), is_active: z.boolean().optional(), internal_notes: optional() };
const names = { name_en: text(200).min(1), name_ar: text(200).min(1) };
const titles = { title_en: text(300).min(1), title_ar: text(300).min(1) };
const schemas = {
 trade_sectors: z.object({ ...common, ...names, sector_group: z.enum(["industry", "agriculture", "trade_services"]), scope_en: optional(), scope_ar: optional(), matching_info_en: optional(), matching_info_ar: optional(), sort_order: z.number().int().nullish() }),
 trade_country_profiles: z.object({ ...common, ...names, iso2: z.string().regex(/^[A-Z]{2}$/).nullish(), iso3: z.string().regex(/^[A-Z]{3}$/).nullish(), region: optional(200), entity_type: z.enum(["un_member", "observer_state", "egypt", "other"]), summary_en: optional(), summary_ar: optional(), official_trade_site_url: url }),
 trade_country_commodities: z.object({ ...common, country_slug: tradeSlug, commodity_en: text(300).min(1), commodity_ar: text(300).min(1), record_kind: z.enum(["raw_material", "manufactured", "agricultural", "service", "technology"]), hs_code: optional(30), hs_revision: optional(100), reference_year: z.number().int(), unit: optional(100), quantity: z.number().finite().nullish(), flow: z.enum(["export_from_country", "import_to_country"]), notes_en: optional(), notes_ar: optional(), source_name: text(300).min(1), source_url: source.refine(v => !!v, "Source URL required.") }),
 procedure_guides: z.object({ ...common, ...titles, activity: optional(200), authority_name_en: optional(300), authority_name_ar: optional(300), official_service_url: url, summary_en: optional(), summary_ar: optional(), published_fee_text: optional(1000), published_fee_text_ar: optional(1000), published_processing_time_text: optional(1000), published_processing_time_text_ar: optional(1000), fee_source_url: source, time_source_url: source }),
 procedure_steps: z.object({ ...common, ...titles, guide_slug: tradeSlug, step_no: z.number().int().min(1), description_en: optional(), description_ar: optional(), official_url: url }),
 procedure_documents: z.object({ ...common, guide_slug: tradeSlug, document_name_en: text(300).min(1), document_name_ar: text(300).min(1), issuing_source_en: optional(300), issuing_source_ar: optional(300), official_url: url, last_reviewed_at: date }),
};
export const tradeInquirySchema = z.object({ name: text(100).min(1), email: text(255).email(), country: text(100).min(1), organization: optional(200), inquiry_topic: z.enum(["sourcing", "export", "localization", "procedure", "other"]), message: text(1500).min(1), consent: z.literal(true), consent_at: z.string().datetime({ offset: true }).refine(v => Date.parse(v) <= Date.now(), "Consent timestamp cannot be in the future.") }).strict();
export function tradeVisible(row: Record<string, unknown>): boolean { return row["is_active"] === true && ["editorial_reviewed", "verified"].includes(String(row["review_status"])); }
export function tradeActivationError(row: Record<string, unknown>): string | null { return row["is_active"] === true && (!String(row["source_url"] ?? "").trim() || !row["last_verified_at"]) ? "Activation requires a source URL and verification date." : null; }
export function validateTradeValues(table: TradeTable, row: Record<string, unknown>, partial = false): string | null {
 if (table === "trade_inquiries") { const parsed = z.object({ status: z.enum(["new", "in_review", "resolved", "dismissed"]), internal_notes: optional() }).partial().safeParse(row); return parsed.success ? null : "Invalid inquiry status or notes."; }
 const parsed = (partial ? schemas[table].partial() : schemas[table]).safeParse(row);
 if (!parsed.success) return parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
 const activation = tradeActivationError(row); if (activation) return activation;
 if (table === "procedure_guides" && (row["published_fee_text"] || row["published_fee_text_ar"]) && !row["fee_source_url"]) return "Published fee requires its own source.";
 if (table === "procedure_guides" && (row["published_processing_time_text"] || row["published_processing_time_text_ar"]) && !row["time_source_url"]) return "Published processing time requires its own source.";
 return null;
}
export const TRADE_MATCH_KEYS: Record<TradeContentTable, string[]> = { trade_sectors: ["slug"], trade_country_profiles: ["slug"], trade_country_commodities: ["country_slug", "commodity_en", "reference_year", "flow"], procedure_guides: ["slug"], procedure_steps: ["guide_slug", "step_no"], procedure_documents: ["guide_slug", "document_name_en"] };
export function tradeMatchKey(table: TradeContentTable, row: Record<string, unknown>) { return JSON.stringify(TRADE_MATCH_KEYS[table].map(k => String(row[k] ?? "").trim())); }
export function tradeImportState(payload: Record<string, unknown>, existing: boolean) { const { is_active: _active, review_status: _review, ...safe } = payload; return existing ? safe : { ...safe, is_active: false, review_status: "needs_check" }; }
export function tradeForeignKeyError(table: TradeContentTable, row: Record<string, unknown>, countries: Set<string>, guides: Set<string>): string | null {
 if (table === "trade_country_commodities" && !countries.has(String(row["country_slug"]))) return "Unknown country_slug.";
 if ((table === "procedure_steps" || table === "procedure_documents") && !guides.has(String(row["guide_slug"]))) return "Unknown guide_slug.";
 return null;
}
