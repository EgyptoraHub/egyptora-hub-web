import type { SHIPPING_CATEGORIES } from "./shipping-validation";
export const SHIPPING_NOTICE = "This section is informational only. Egyptora does not quote, book, transport, store, track or insure cargo, does not clear shipments through customs, and does not hold documents or payments. Official decisions remain with the competent authority. Always confirm with the official source.";
export const SHIPPING_INTRO = "Official websites and platforms for shipping, ports, customs and transport in Egypt.";
export const SHIPPING_CATEGORY_LABELS: Record<(typeof SHIPPING_CATEGORIES)[number], string> = {
 customs: "Customs", trade_platform: "Trade platform", ministry: "Ministry", port: "Port", rail: "Rail", maritime: "Maritime", post: "Post", air: "Air", road: "Road", other: "Other",
};
export type ShippingSearch = { q: string; category: string };
export function validateShippingSearch(search: Record<string, unknown>): ShippingSearch {
 return { q: typeof search["q"] === "string" ? search["q"] : "", category: typeof search["category"] === "string" ? search["category"] : "" };
}
