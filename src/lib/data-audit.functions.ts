/**
 * Stage 2 (Prompt 36) — read-only data audit for admins.
 * Returns three sections (A: source links, B: public-data hygiene, C: duplicates)
 * plus informational counts. Never writes anything.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sourceUrlWarning } from "@/lib/protected-areas";

export type AuditRow = {
  table: string;
  id: string;
  name: string;
  field: string;
  value: string;
  problem: string;
};

export type DataAudit = {
  authorized: boolean;
  a: AuditRow[];
  b: AuditRow[];
  c: AuditRow[];
  storeLinks: { play: number; appStore: number };
  mediaLinks: { table: string; field: string; total: number }[];
};

const REVIEWED = ["editorial_reviewed", "verified"] as const;

async function isAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    check_user_id: context.userId,
    check_role: "admin",
  });
  return !error && data === true;
}

/** Tables/fields holding public source-style links, with the name column for display. */
const LINK_SOURCES: { table: string; field: string; nameCol: string; nameCol2?: string }[] = [
  { table: "culture_items", field: "source_url", nameCol: "name_en", nameCol2: "name_ar" },
  { table: "economic_zones", field: "source_url", nameCol: "name_en", nameCol2: "name_ar" },
  { table: "zone_facts", field: "source_url", nameCol: "source_name" },
  { table: "protected_areas", field: "source_url", nameCol: "name_en", nameCol2: "name_ar" },
  { table: "government_entities", field: "official_url", nameCol: "entity_name_en", nameCol2: "entity_name_ar" },
  { table: "government_entities", field: "phone_source_url", nameCol: "entity_name_en", nameCol2: "entity_name_ar" },
  { table: "emergency_numbers", field: "source_url", nameCol: "name_en", nameCol2: "name_ar" },
  // egypt_apps.website_url and store links are the developer's own links, not sources — never flagged.
  { table: "military_records", field: "source_url", nameCol: "title_en", nameCol2: "title_ar" },
  { table: "military_sources", field: "url", nameCol: "title" },
];

/** Media/licence links are reported as counts only (they are not "source" links). */
const MEDIA_LINKS: { table: string; field: string }[] = [
  { table: "culture_media", field: "url" },
  { table: "culture_media", field: "license_url" },
  { table: "military_media", field: "url" },
  { table: "military_media", field: "license_url" },
  { table: "traveller_stories", field: "video_url" },
  { table: "traveller_stories", field: "license_url" },
];

type PublicDef = {
  table: string;
  nameCol: string;
  nameCol2?: string;
  /** extra select columns needed for the checks */
  cols: string[];
  sourceFields: string[];
  hasVerified: boolean;
  hasReview: boolean;
  requiredPairs?: [string, string][]; // [ar, en] required name fields
};

const PUBLIC_TABLES: PublicDef[] = [
  { table: "culture_items", nameCol: "name_en", nameCol2: "name_ar", cols: ["source_url", "last_verified_at"], sourceFields: ["source_url"], hasVerified: true, hasReview: true, requiredPairs: [["name_ar", "name_en"]] },
  { table: "economic_zones", nameCol: "name_en", nameCol2: "name_ar", cols: ["source_url", "last_verified_at"], sourceFields: ["source_url"], hasVerified: true, hasReview: true, requiredPairs: [["name_ar", "name_en"]] },
  { table: "protected_areas", nameCol: "name_en", nameCol2: "name_ar", cols: ["source_url"], sourceFields: ["source_url"], hasVerified: false, hasReview: true, requiredPairs: [["name_ar", "name_en"]] },
  { table: "government_entities", nameCol: "entity_name_en", nameCol2: "entity_name_ar", cols: ["official_url", "phone_source_url", "last_verified_at"], sourceFields: ["official_url", "phone_source_url"], hasVerified: true, hasReview: false, requiredPairs: [["entity_name_ar", "entity_name_en"]] },
  { table: "emergency_numbers", nameCol: "name_en", nameCol2: "name_ar", cols: ["source_url", "last_verified_at"], sourceFields: ["source_url"], hasVerified: true, hasReview: false, requiredPairs: [["name_ar", "name_en"]] },
  { table: "military_records", nameCol: "title_en", nameCol2: "title_ar", cols: ["source_url", "last_verified_at"], sourceFields: ["source_url"], hasVerified: true, hasReview: true, requiredPairs: [["title_ar", "title_en"]] },
];

export const getDataAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DataAudit> => {
    if (!(await isAdmin(context))) {
      return { authorized: false, a: [], b: [], c: [], storeLinks: { play: 0, appStore: 0 }, mediaLinks: [] };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const a: AuditRow[] = [];
    for (const src of LINK_SOURCES) {
      const cols = ["id", src.field, src.nameCol, ...(src.nameCol2 ? [src.nameCol2] : [])].join(", ");
      const { data } = await supabaseAdmin
        .from(src.table as any)
        .select(cols)
        .not(src.field, "is", null)
        .neq(src.field, "");
      for (const row of (data ?? []) as any[]) {
        const url = String(row[src.field] ?? "");
        const warn = sourceUrlWarning(url);
        if (!warn) continue;
        a.push({
          table: src.table,
          id: String(row.id),
          name: String(row[src.nameCol] ?? (src.nameCol2 ? row[src.nameCol2] : "") ?? ""),
          field: src.field,
          value: url,
          problem: warn.replace(/^warning: source_url is /, ""),
        });
      }
    }

    const b: AuditRow[] = [];
    for (const def of PUBLIC_TABLES) {
      const selectCols = ["id", def.nameCol, ...(def.nameCol2 ? [def.nameCol2] : []), "is_active", ...(def.hasReview ? ["review_status"] : []), ...def.cols].join(", ");
      let q = supabaseAdmin.from(def.table as any).select(selectCols).eq("is_active", true);
      if (def.hasReview) q = q.in("review_status", REVIEWED as unknown as string[]);
      const { data } = await q;
      for (const row of (data ?? []) as any[]) {
        const name = String(row[def.nameCol] ?? (def.nameCol2 ? row[def.nameCol2] : "") ?? "");
        const push = (field: string, value: string, problem: string) =>
          b.push({ table: def.table, id: String(row.id), name, field, value, problem });
        const hasSource = def.sourceFields.some((f) => String(row[f] ?? "").trim() !== "");
        if (!hasSource) push(def.sourceFields.join("/"), "", "public row has no source link");
        if (def.hasVerified && !row.last_verified_at) push("last_verified_at", "", "public row was never marked verified");
        if (def.hasReview && row.review_status === "needs_check") push("review_status", "needs_check", "public row still needs_check");
        for (const [ar, en] of def.requiredPairs ?? []) {
          if (!String(row[ar] ?? "").trim()) push(ar, "", "required Arabic field is empty");
          if (!String(row[en] ?? "").trim()) push(en, "", "required English field is empty");
        }
      }
    }

    const c: AuditRow[] = [];
    const dup = async (table: string, field: string, nameCol: string, nameCol2?: string) => {
      const cols = ["id", field, nameCol, ...(nameCol2 ? [nameCol2] : [])].join(", ");
      const { data } = await supabaseAdmin.from(table as any).select(cols).not(field, "is", null).neq(field, "");
      const groups = new Map<string, any[]>();
      for (const row of (data ?? []) as any[]) {
        const key = String(row[field] ?? "").trim().toLowerCase();
        if (!key) continue;
        const arr = groups.get(key) ?? [];
        arr.push(row);
        groups.set(key, arr);
      }
      for (const [key, rows] of groups) {
        if (rows.length < 2) continue;
        for (const row of rows) {
          c.push({
            table,
            id: String(row.id),
            name: String(row[nameCol] ?? (nameCol2 ? row[nameCol2] : "") ?? ""),
            field,
            value: key,
            problem: `probable duplicate — ${rows.length} rows share this ${field}`,
          });
        }
      }
    };
    await dup("government_entities", "entity_name_en", "entity_name_en", "entity_name_ar");
    await dup("government_entities", "official_url", "entity_name_en", "entity_name_ar");
    await dup("culture_items", "name_en", "name_en", "name_ar");

    const { data: apps } = await supabaseAdmin
      .from("egypt_apps" as any)
      .select("google_play_url, app_store_url");
    const storeLinks = {
      play: ((apps ?? []) as any[]).filter((r) => String(r.google_play_url ?? "").trim() !== "").length,
      appStore: ((apps ?? []) as any[]).filter((r) => r.app_store_url && String(r.app_store_url).trim() !== "").length,
    };

    const mediaLinks: { table: string; field: string; total: number }[] = [];
    for (const m of MEDIA_LINKS) {
      const { count } = await supabaseAdmin
        .from(m.table as any)
        .select("id", { count: "exact", head: true })
        .not(m.field, "is", null)
        .neq(m.field, "");
      mediaLinks.push({ table: m.table, field: m.field, total: count ?? 0 });
    }

    return { authorized: true, a, b, c, storeLinks, mediaLinks };
  });
