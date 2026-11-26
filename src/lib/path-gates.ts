import type { NavGate } from "@/lib/nav-availability";

type Avail = Partial<Record<NavGate, boolean>>;

/**
 * Pages whose content is hidden demo data (Prompt 59). A link to one of these paths
 * is gated by the matching table: while it has no public row the link/card is hidden
 * (or the menu item shows "Coming soon").
 */
export const PATH_GATES: Record<string, NavGate> = {
  "/energy-materials": "energy_materials",
  "/community": "community",
  "/do-business/shipping-logistics": "shipping_platforms",
  "/properties": "properties",
  "/offers": "offers",
  "/investment-opportunities": "investment_opportunities",
  "/providers": "providers",
};

/** Gate for an internal link ("/offers", "/offers/x", "/investment-opportunities?sector=ict"). */
export function gateForPath(to: string | undefined): NavGate | undefined {
  if (!to || !to.startsWith("/")) return undefined;
  const path = to.split(/[?#]/)[0] ?? "";
  const match = Object.keys(PATH_GATES).sort((a, b) => b.length - a.length).find(base => path === base || path.startsWith(base + "/"));
  return match ? PATH_GATES[match] : undefined;
}

/** True when `to` points at a gated page that currently has no public record. */
export function linkGatedOff(to: string | undefined, avail: Avail): boolean {
  const g = gateForPath(to);
  return !!g && !avail[g];
}

/** Search entries must have both a visible destination and a visible source page. */
export function filterSearchEntries<T extends { to: string; page: string }>(entries: T[], avail: Avail): T[] {
  return entries.filter(e => !linkGatedOff(e.to, avail) && !linkGatedOff(e.page, avail));
}

/** Concierge itinerary card types are table names; a card is hidden while its section page is gated. */
export function itineraryItemGatedOff(type: string, avail: Avail): boolean {
  return linkGatedOff(type === "shipping_platforms" ? "/do-business/shipping-logistics/platforms" : "/" + type.replace(/_/g, "-"), avail);
}
