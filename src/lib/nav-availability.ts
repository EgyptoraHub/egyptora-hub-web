/**
 * Decides at runtime whether data-driven menu items have at least one PUBLIC record.
 * Uses the visitor client, so database visibility rules decide. Cached for 5 minutes;
 * any failure keeps the item as "Coming soon" (never a link to a missing page).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NavGate = "protected_areas" | "industrial_zones" | "free_zones";
type Avail = Partial<Record<NavGate, boolean>>;

const TTL = 5 * 60 * 1000;
let cache: { at: number; p: Promise<Avail> } | null = null;

async function has(q: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await q;
  return !error && (count ?? 0) > 0;
}

function fetchAvail(): Promise<Avail> {
  if (cache && Date.now() - cache.at < TTL) return cache.p;
  const head = { count: "exact" as const, head: true };
  const p = Promise.all([
    has(supabase.from("protected_areas").select("id", head)),
    has(supabase.from("economic_zones").select("id", head).eq("zone_type", "industrial_zone")),
    has(supabase.from("economic_zones").select("id", head).neq("zone_type", "industrial_zone")),
  ])
    .then(([protected_areas, industrial_zones, free_zones]) => ({ protected_areas, industrial_zones, free_zones }))
    .catch(() => ({}));
  cache = { at: Date.now(), p };
  return p;
}

/** Starts as "nothing available" (server render + first paint), then fills in on the client. */
export function useNavAvailability(): Avail {
  const [avail, setAvail] = useState<Avail>({});
  useEffect(() => {
    let alive = true;
    void fetchAvail().then((a) => alive && setAvail(a));
    return () => { alive = false; };
  }, []);
  return avail;
}
