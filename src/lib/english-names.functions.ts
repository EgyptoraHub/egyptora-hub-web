/**
 * Prompt 36 Stage 3 — admin-only export/import of English NAMES for three tables.
 * Import only ever writes the English name column (+ an internal note), matched by id; max 1000 rows.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const NAME_TABLES = {
  military_records: { ar: "title_ar", en: "title_en" },
  economic_zones: { ar: "name_ar", en: "name_en" },
  protected_areas: { ar: "name_ar", en: "name_en" },
} as const;
export type NameTable = keyof typeof NAME_TABLES;

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { check_user_id: context.userId, check_role: "admin" });
  if (error || data !== true) throw new Error("Admins only");
}

const isTable = (t: unknown): t is NameTable => typeof t === "string" && t in NAME_TABLES;

export const exportEnglishNames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: string }) => {
    if (!isTable(d?.table)) throw new Error("Unknown table");
    return d as { table: NameTable };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const c = NAME_TABLES[data.table];
    const rows: { id: string; ar: string; en: string; mt: boolean }[] = [];
    for (let from = 0; ; from += 1000) {
      const { data: page, error } = await supabaseAdmin
        .from(data.table as any)
        .select(`id, ${c.ar}, ${c.en}, internal_notes`)
        .order("id")
        .range(from, from + 999);
      if (error) throw new Error(error.message);
      for (const r of (page ?? []) as any[])
        rows.push({ id: r.id, ar: r[c.ar] ?? "", en: r[c.en] ?? "", mt: String(r.internal_notes ?? "").includes("[MT-EN]") });
      if (!page || page.length < 1000) break;
    }
    return rows;
  });

type ImportRow = { id: string; en: string };
export type NameImportResult = {
  dryRun: boolean;
  updated: number;
  unchanged: number;
  rejected: { line: number; id: string; reason: string }[];
  preview: { id: string; ar: string; from: string; to: string }[];
};

export const importEnglishNames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { table: string; rows: ImportRow[]; dryRun: boolean }) => {
    if (!isTable(d?.table)) throw new Error("Unknown table");
    if (!Array.isArray(d.rows) || d.rows.length > 1000) throw new Error("Between 1 and 1000 rows");
    return { table: d.table as NameTable, dryRun: d.dryRun !== false, rows: d.rows.map((r) => ({ id: String(r?.id ?? "").trim(), en: String(r?.en ?? "").trim() })) };
  })
  .handler(async ({ data, context }): Promise<NameImportResult> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { writeAudit } = await import("@/lib/audit.server");
    const c = NAME_TABLES[data.table];
    const uuid = /^[0-9a-f-]{36}$/i;
    const res: NameImportResult = { dryRun: data.dryRun, updated: 0, unchanged: 0, rejected: [], preview: [] };
    const valid = data.rows.map((r, i) => ({ ...r, line: i + 2 })).filter((r) => {
      if (!uuid.test(r.id)) res.rejected.push({ line: r.line, id: r.id, reason: "invalid id" });
      else if (!r.en || r.en.length > 300) res.rejected.push({ line: r.line, id: r.id, reason: "English name empty or longer than 300 characters" });
      else return true;
      return false;
    });
    const { data: existing, error } = await supabaseAdmin
      .from(data.table as any)
      .select(`id, ${c.ar}, ${c.en}, internal_notes`)
      .in("id", valid.map((r) => r.id));
    if (error) throw new Error(error.message);
    const byId = new Map(((existing ?? []) as any[]).map((r) => [r.id, r]));
    for (const r of valid) {
      const row = byId.get(r.id);
      if (!row) { res.rejected.push({ line: r.line, id: r.id, reason: "no record with this id" }); continue; }
      if ((row[c.en] ?? "") === r.en) { res.unchanged++; continue; }
      res.preview.push({ id: r.id, ar: row[c.ar] ?? "", from: row[c.en] ?? "", to: r.en });
      if (!data.dryRun) {
        const notes = [String(row.internal_notes ?? "").trim(), "[EN-CSV] English name updated from reviewed CSV"].filter(Boolean).join("\n");
        const { error: e } = await supabaseAdmin.from(data.table as any).update({ [c.en]: r.en, internal_notes: notes } as any).eq("id", r.id);
        if (e) { res.rejected.push({ line: r.line, id: r.id, reason: e.message }); continue; }
      }
      res.updated++;
    }
    if (!data.dryRun && res.updated > 0) {
      await writeAudit({ action: "names_en.csv_import", entityType: data.table, actorUserId: context.userId, metadata: { updated: res.updated } } as any);
    }
    return res;
  });
