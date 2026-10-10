/**
 * Read-only content search used to ground the AI Concierge in real site data.
 *
 * SECURITY: this helper touches ONLY the public catalogue tables listed below.
 * It never reads trips, bookings, user_roles, profiles or any auth/personal
 * data, and it only ever performs SELECTs.
 */

/** Tables that can appear in the itinerary block (have detail pages). */
export const ITINERARY_TABLES = [
  "governorates",
  "destinations",
  "heritage_sites",
  "museums",
  "events",
  "properties",
  "offers",
] as const;

export const CONCIERGE_TABLES = [
  ...ITINERARY_TABLES,
  "government_entities",
  "investment_opportunities",
  "providers",
  "products",
  "emergency_numbers",
  "egypt_apps",
  "military_records",
  "culture_items",
  "economic_zones",
] as const;

export type ConciergeTable = (typeof CONCIERGE_TABLES)[number];

export type ConciergeMatch = {
  id: string;
  name: string;
  slug: string;
  type: ConciergeTable;
  summary: string;
  /** Public link: official URL for government entities, site path otherwise. */
  link?: string;
  category?: string;
};

const MAX_SUMMARY = 160;
const SITE = "https://egyptora-hub.com";

const STOP = new Set(["the","and","for","how","what","where","who","can","egypt","egyptian","with","from","into","about","renew","get","buy","find"]);

/** Builds a PostgREST OR filter matching any meaningful word in any column. */
function orFilter(term: string, cols: string[]): string {
  const words = term.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  const list = (words.length ? words.slice(0, 5) : [term]).map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));
  return list.flatMap((w) => cols.map((c) => `${c}.ilike.%${w}%`)).join(",");
}

function oneLine(value: unknown): string {
  if (typeof value !== "string") return "";
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > MAX_SUMMARY ? `${clean.slice(0, MAX_SUMMARY - 1)}…` : clean;
}

const DETAIL_PATH: Partial<Record<ConciergeTable, string>> = {
  governorates: "/governorates",
  heritage_sites: "/heritage-sites",
  museums: "/museums",
  events: "/events",
  properties: "/properties",
  offers: "/offers",
  investment_opportunities: "/investment-opportunities",
  providers: "/providers",
  products: "/products",
};

async function searchGovernment(term: string, limit: number): Promise<ConciergeMatch[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("government_entities")
    .select("id, entity_name_en, entity_name_ar, description_en, category_en, official_url")
    .or(orFilter(term, ["entity_name_en", "entity_name_ar", "description_en", "category_en"]))
    .order("sort_order")
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((e) => ({
    id: String(e.id),
    name: e.entity_name_en,
    slug: String(e.id),
    type: "government_entities" as const,
    summary: oneLine(e.description_en),
    category: e.category_en,
    link: e.official_url || `${SITE}/government-directory`,
  }));
}

/**
 * Public-only searches for sections added in Prompts 24–27. These run with the PUBLISHABLE key, so the
 * database's visitor rules decide visibility (hidden, needs_check or inactive rows and internal notes are
 * never readable), and each query also filters on the public visibility columns explicitly.
 */
function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    }),
  );
}

const CULTURE_URL: Record<string, string> = { cuisine: "cuisine", fashion: "fashion", jewelry_accessories: "jewelry-accessories" };
const VISIBLE = ["editorial_reviewed", "verified"];

async function searchPublicSection(table: ConciergeTable, term: string, limit: number): Promise<ConciergeMatch[] | null> {
  if (!["emergency_numbers", "egypt_apps", "military_records", "culture_items", "economic_zones"].includes(table)) return null;
  const db = (await publicClient()) as any;
  if (table === "economic_zones") {
    // Public rows only (RLS + column grants); a page link exists only when that page has rows, so it never 404s.
    const { data, error } = await db
      .from("economic_zones")
      .select("id, slug, zone_type, name_en, name_ar, summary_en, managing_body_en")
      .or(orFilter(term, ["name_en", "name_ar", "summary_en", "managing_body_en"]))
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: String(r.id), name: r.name_en || r.name_ar, slug: String(r.slug), type: table,
      summary: oneLine([r.managing_body_en, r.summary_en].filter(Boolean).join(" · ")),
      link: `${SITE}/do-business/${r.zone_type === "industrial_zone" ? "industrial-zones" : "free-zones"}`,
    }));
  }
  if (table === "emergency_numbers") {
    const { data, error } = await db
      .from("emergency_numbers")
      .select("id, name_en, name_ar, number, public_note_en")
      .or(orFilter(term, ["name_en", "name_ar", "number"]))
      .eq("is_active", true)
      .eq("status", "verified")
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: String(r.id), name: `${r.name_en || r.name_ar} — ${r.number}`, slug: String(r.id), type: table,
      summary: oneLine(r.public_note_en), link: `${SITE}/emergency-numbers`,
    }));
  }
  if (table === "egypt_apps") {
    const { data, error } = await db
      .from("egypt_apps")
      .select("id, name_en, name_ar, publisher, description_en, website_url")
      .or(orFilter(term, ["name_en", "name_ar", "publisher", "description_en"]))
      .eq("is_active", true)
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: String(r.id), name: r.name_en || r.name_ar, slug: String(r.id), type: table,
      summary: oneLine(r.description_en), category: r.publisher && !/unconfirmed|\?/i.test(r.publisher) ? r.publisher : undefined, link: `${SITE}/egypt-apps`,
    }));
  }
  if (table === "military_records") {
    const { data, error } = await db
      .from("military_records")
      .select("id, slug, title_en, title_ar, date_label_en, place_en, significance_en")
      .or(orFilter(term, ["title_en", "title_ar", "place_en"]))
      .eq("is_active", true)
      .in("review_status", VISIBLE)
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: String(r.id), name: r.title_en || r.title_ar, slug: String(r.slug), type: table,
      summary: oneLine([r.date_label_en, r.place_en, r.significance_en].filter(Boolean).join(" · ")),
      link: `${SITE}/egypt-through-time/military-history/records/${r.slug}`,
    }));
  }
  const { data, error } = await db
    .from("culture_items")
    .select("id, slug, section, name_en, name_ar, summary_en")
    .or(orFilter(term, ["name_en", "name_ar", "summary_en"]))
    .eq("is_active", true)
    .in("review_status", VISIBLE)
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: String(r.id), name: r.name_en || r.name_ar, slug: String(r.slug), type: table,
    summary: oneLine(r.summary_en), link: `${SITE}/live-like-an-egyptian/${CULTURE_URL[r.section] ?? "cuisine"}/${r.slug}`,
  }));
}

export async function searchSiteContent(
  query: string,
  category?: ConciergeTable,
  limit = 6,
): Promise<ConciergeMatch[]> {
  const term = query.replace(/[%,()]/g, " ").trim();
  if (!term) return [];

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const tables = category ? [category] : [...CONCIERGE_TABLES];
  const perTable = category ? limit : 2;

  const results = await Promise.all(
    tables.map(async (table) => {
      try {
        if (table === "government_entities") return await searchGovernment(term, perTable);
        const pub = await searchPublicSection(table, term, perTable);
        if (pub) return pub;
        let q = (supabaseAdmin.from(table) as any)
          .select("id, name, slug, summary")
          .or(orFilter(term, ["name", "summary"]));
        if (table === "properties" || table === "investment_opportunities") {
          q = q.eq("moderation_state", "PUBLISHED");
        }
        const { data, error } = await q.limit(perTable);
        if (error) throw error;
        return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
          const id = String(row["id"] ?? "");
          const base = DETAIL_PATH[table];
          return {
            id,
            name: String(row["name"] ?? ""),
            slug: String(row["slug"] ?? ""),
            type: table,
            summary: oneLine(row["summary"]),
            ...(base ? { link: `${SITE}${base}/${id}` } : {}),
          } as ConciergeMatch;
        });
      } catch (err) {
        console.error(`[concierge-search] ${table} lookup failed:`, err);
        return [] as ConciergeMatch[];
      }
    }),
  );

  return results.flat().filter((m) => m.name && m.slug).slice(0, Math.max(limit * 2, 16));
}
