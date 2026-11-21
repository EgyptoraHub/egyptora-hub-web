import { z } from "zod";

/**
 * Shipping Hub — Phase 1 is informational only (official platforms, links and guides).
 * Validation mirrors the database trigger `validate_shipping_platform`, so the admin
 * editor and CSV import reject the same rows the database would. Self-contained (zod
 * only) so it can be imported by the complaints machinery without an import cycle.
 */
export const SHIPPING_TABLES = ["shipping_platforms"] as const;
export type ShippingTable = (typeof SHIPPING_TABLES)[number];

export const SHIPPING_CATEGORIES = ["customs", "trade_platform", "ministry", "port", "rail", "maritime", "post", "air", "road", "other"] as const;

/** Public columns only — never internal_notes. */
export const SHIPPING_PLATFORM_COLUMNS =
  "id,slug,name_en,name_ar,operator_name_en,operator_name_ar,category,audience_en,audience_ar,services_summary_en,services_summary_ar,languages,published_fee_text,published_fee_text_ar,fee_source_url,official_url,source_name,source_name_ar,source_url,last_verified_at,sort_order" as const;

/** Shipping Phase 2 infrastructure only: no cargo operations exist. */
export const SHIPPING_PHASE2_FLAGS = ["shipping_quote_requests", "shipping_booking", "shipping_provider_verification", "shipping_shipment_tracking", "shipping_document_custody", "shipping_customs_assisted_submission", "shipping_payments_settlement", "shipping_cash_on_delivery", "shipping_capacity_marketplace", "shipping_warehouse_booking", "shipping_ecommerce_fulfilment", "shipping_cold_chain_monitoring", "shipping_cargo_rescue", "shipping_spare_parts_network", "shipping_returnable_packaging", "shipping_rural_collection_loading_slots", "shipping_carrier_business_software", "shipping_landed_cost_simulator", "shipping_investment_gap_map", "shipping_claims_resolution", "shipping_mobile_apps"] as const;

const text = (max = 5000) => z.string().trim().max(max);
const optional = (max = 5000) => text(max).nullish();
const httpUrl = z.string().max(2048).url().refine((v) => /^https?:\/\//i.test(v), "Use an HTTP website.");
const source = httpUrl.refine((v) => !/\.pdf(?:[?#]|$)/i.test(v), "PDF sources are not allowed.").nullish();
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, "Invalid date.")
  .refine((v) => v <= new Date().toISOString().slice(0, 10), "Date cannot be in the future.")
  .nullish();

const platformSchema = z.object({
  name_en: text(300).min(1),
  name_ar: optional(300),
  operator_name_en: optional(300),
  operator_name_ar: optional(300),
  category: z.enum(SHIPPING_CATEGORIES),
  audience_en: optional(1000),
  audience_ar: optional(1000),
  services_summary_en: optional(),
  services_summary_ar: optional(),
  languages: z.string().trim().max(50).regex(/^(ar|en|ar,en)$/, "Use language codes like ar or ar,en.").nullish(),
  published_fee_text: optional(500),
  published_fee_text_ar: optional(500),
  fee_source_url: source,
  official_url: z.string().max(2048).url().refine((v) => /^https:\/\//i.test(v), "Official URL must be HTTPS.").nullish(),
  source_name: optional(300),
  source_name_ar: optional(300),
  source_url: source,
  last_verified_at: date,
  review_status: z.enum(["needs_check", "editorial_reviewed", "verified"]).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().nullish(),
  internal_notes: optional(),
});

const filled = (v: unknown) => String(v ?? "").trim().length > 0;

export function validateShippingValues(row: Record<string, unknown>, partial = false): string | null {
  const parsed = (partial ? platformSchema.partial() : platformSchema).safeParse(row);
  if (!parsed.success) return parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  if (row["is_active"] === true) {
    if (!filled(row["source_url"]) || !row["last_verified_at"]) return "Activation requires a source URL and verification date.";
    if (!["editorial_reviewed", "verified"].includes(String(row["review_status"]))) return "Activation requires a reviewed status.";
    if (!/^https:\/\//i.test(String(row["official_url"] ?? ""))) return "Activation requires an HTTPS official URL.";
  }
  if ((filled(row["published_fee_text"]) || filled(row["published_fee_text_ar"])) && !filled(row["fee_source_url"])) return "A published fee requires a fee source URL.";
  return null;
}

/** Public visibility rule — identical to the database policy. */
export function shippingVisible(row: Record<string, unknown>): boolean {
  return row["is_active"] === true && ["editorial_reviewed", "verified"].includes(String(row["review_status"]));
}
