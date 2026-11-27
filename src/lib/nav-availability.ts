/**
 * Decides at runtime whether data-driven menu items have at least one PUBLIC record.
 * Uses the visitor client, so database visibility rules decide. Cached for 5 minutes;
 * any failure keeps the item as "Coming soon" (never a link to a missing page).
 */
import { useLoaderData } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type NavGate = "energy_materials" | "community" | "justice" | "shipping_platforms" | "protected_areas" | "industrial_zones" | "free_zones" | "trade_sectors" | "trade_country_profiles" | "procedure_guides" | "complaint_sectors" | "properties" | "offers" | "investment_opportunities" | "providers";
type Avail = Partial<Record<NavGate, boolean>>;

const TTL = 5 * 60 * 1000;
// Cache resolved values only: on the server a pending promise must never be shared across requests.
let cache: { at: number; v: Avail } | null = null;
let inflight: Promise<Avail> | null = null;
const isBrowser = typeof window !== "undefined";

async function has(q: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await q;
  return !error && (count ?? 0) > 0;
}

export function fetchNavAvailability(): Promise<Avail> {
  if (cache && Date.now() - cache.at < TTL) return Promise.resolve(cache.v);
  if (isBrowser && inflight) return inflight;
  const head = { count: "exact" as const, head: true };
  const p = Promise.all([
    has(supabase.from("protected_areas").select("id", head)),
    has(supabase.from("economic_zones").select("id", head).eq("zone_type", "industrial_zone")),
    has(supabase.from("economic_zones").select("id", head).neq("zone_type", "industrial_zone")),
    has(supabase.from("trade_sectors").select("id", head)),
    has(supabase.from("trade_country_profiles").select("id", head)),
    has(supabase.from("procedure_guides").select("id", head)),
    has(supabase.from("complaint_sectors").select("id", head)),
    has(supabase.from("properties").select("id", head)),
    has(supabase.from("offers").select("id", head)),
    has(supabase.from("investment_opportunities").select("id", head)),
    has(supabase.from("providers").select("id", head)),
    has(supabase.from("shipping_platforms").select("id", head)),
  ])
    .then(([protected_areas, industrial_zones, free_zones, trade_sectors, trade_country_profiles, procedure_guides, complaint_sectors, properties, offers, investment_opportunities, providers, shipping_platforms]) => ({ energy_materials: true, community: true, justice: true, protected_areas, industrial_zones, free_zones, trade_sectors, trade_country_profiles, procedure_guides, complaint_sectors, properties, offers, investment_opportunities, providers, shipping_platforms }))
    .catch(() => ({}) as Avail)
    .then((v) => { if (Object.keys(v).length) cache = { at: Date.now(), v }; inflight = null; return v; });
  if (isBrowser) inflight = p;
  return p;
}

// Energy has original editorial content and a required empty directory state: availability is not tied to directory row counts.
/** Availability comes from the root loader, so the first (server) render already has the right state. */
export function useNavAvailability(): Avail {
  return ((useLoaderData({ from: "__root__" }) as { nav?: Avail } | undefined)?.nav) ?? {};
}

/** A chip marked `hideIfGatedOff` renders nothing while its data gate has no public record (no "Coming soon" slot). */
export function chipHiddenByGate(
  c: { gate?: NavGate | undefined; hideIfGatedOff?: boolean | undefined },
  avail: Avail,
): boolean {
  return !!(c.gate && c.hideIfGatedOff && !avail[c.gate]);
}

export { PATH_GATES, gateForPath, linkGatedOff } from "@/lib/path-gates";
import { linkGatedOff } from "@/lib/path-gates";

/** Returns a filter that drops items whose `to` is a gated page with no public record (used to hide whole sections when every card is gated). */
export function useOpenLinks() {
  const avail = useNavAvailability();
  return <T extends { to?: string | undefined }>(items: T[]): T[] => items.filter((i) => !linkGatedOff(i.to, avail));
}
