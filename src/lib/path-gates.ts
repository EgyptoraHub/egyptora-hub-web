import type { NavGate } from "@/lib/nav-availability";

type Avail = Partial<Record<NavGate, boolean>>;

/**
 * Pages whose content is hidden demo data (Prompt 59). A link to one of these paths
 * is gated by the matching table: while it has no public row the link/card is hidden
 * (or the menu item shows "Coming soon").
 */
export const PATH_GATES: Record<string, NavGate> = {
  "/properties": "properties",
  "/offers": "offers",
  "/investment-opportunities": "investment_opportunities",
  "/providers": "providers",
};

/** Gate for an internal link ("/offers", "/offers/x", "/investment-opportunities?sector=ict"). */
export function gateForPath(to: string | undefined): NavGate | undefined {
  if (!to || !to.startsWith("/")) return undefined;
  const path = to.split(/[?#]/)[0] ?? "";
  const root = "/" + (path.split("/")[1] ?? "");
  return PATH_GATES[root];
}

/** True when `to` points at a gated page that currently has no public record. */
export function linkGatedOff(to: string | undefined, avail: Avail): boolean {
  const g = gateForPath(to);
  return !!g && !avail[g];
}
