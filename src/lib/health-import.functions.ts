import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getTableConfig, coerceFieldValue } from "@/lib/admin-content.config";
import { HEALTH_TABLES, healthSlug, validateHealthValues } from "@/lib/health-validation";

export type HealthImportResult = { authorized: boolean; ok: boolean; rows: { line: number; action: string; error?: string }[]; error?: string };
function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; }
    else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ""; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some((v) => v.trim())) rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (quoted) throw new Error("Unclosed CSV quote.");
  row.push(cell); if (row.some((v) => v.trim())) rows.push(row); return rows;
}

/** Catalogue upserts stay inactive on creation. Reports/inquiries accept status updates by ID only. */
export const importHealthCsv = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ table: z.enum(HEALTH_TABLES), csv: z.string().max(3_000_000), dryRun: z.boolean().default(true) }).parse(input))
  .handler(async ({ data, context }): Promise<HealthImportResult> => {
    const { data: admin } = await context.supabase.rpc("has_role", { check_user_id: context.userId, check_role: "admin" });
    if (!admin) return { authorized: false, ok: false, rows: [] };
    const cfg = getTableConfig(data.table);
    if (!cfg) return { authorized: true, ok: false, rows: [], error: "Unknown table." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows: HealthImportResult["rows"] = [];
    try {
      const [header, ...lines] = parseCsv(data.csv.replace(/^\uFEFF/, ""));
      const key = cfg.slugColumn ? "slug" : "id";
      if (!header || !header.includes(key) || lines.length > 1000) throw new Error(`CSV needs ${key} and at most 1000 rows.`);
      const allowed = new Set([key, ...cfg.fields.filter((f) => !f.readOnly).map((f) => f.name)]);
      if (new Set(header).size !== header.length || header.some((h) => !allowed.has(h))) throw new Error("CSV contains duplicate or unsupported columns.");
      const plans: { keyValue: string; payload: Record<string, unknown>; existing: boolean }[] = [];
      const seen = new Set<string>();
      for (const [index, cells] of lines.entries()) {
        try {
          if (cells.length !== header.length) throw new Error("Column count does not match the header.");
          const raw = Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""]));
          const keyValue = key === "slug" ? healthSlug.parse(raw[key]) : z.string().uuid().parse(raw[key]);
          if (seen.has(keyValue)) throw new Error("Duplicate identifier in CSV."); seen.add(keyValue);
          const payload: Record<string, unknown> = {};
          for (const field of cfg.fields.filter((f) => !f.readOnly)) {
            if (!(field.name in raw)) continue;
            let value: unknown = raw[field.name];
            if (field.type === "boolean" && !["true", "false"].includes(String(value))) throw new Error(`${field.name}: use true or false.`);
            if (field.type === "tags") value = String(value).split("|").filter(Boolean);
            payload[field.name] = coerceFieldValue(field, value);
          }
          const { data: existing, error } = await supabaseAdmin.from(data.table).select("*").eq(key, keyValue).maybeSingle();
          if (error) throw new Error("Could not read entry.");
          if (!existing && cfg.noCreate) throw new Error("Reports/inquiries can only update existing IDs.");
          if (!existing && cfg.slugColumn && payload.is_active === true) throw new Error("New catalogue entries must be imported inactive.");
          if (!existing && cfg.slugColumn) payload.is_active = false;
          const problem = validateHealthValues(data.table, { ...(existing as Record<string, unknown> | null), ...payload });
          if (problem) throw new Error(problem);
          plans.push({ keyValue, payload, existing: !!existing });
          rows.push({ line: index + 2, action: existing ? "update" : "new" });
        } catch (err) { rows.push({ line: index + 2, action: "rejected", error: err instanceof Error ? err.message : "Invalid row." }); }
      }
      if (rows.some((r) => r.action === "rejected")) return { authorized: true, ok: false, rows };
      if (!data.dryRun) {
        for (const plan of plans) {
          const q = plan.existing ? supabaseAdmin.from(data.table).update(plan.payload).eq(key, plan.keyValue) : supabaseAdmin.from(data.table).insert({ ...plan.payload, [key]: plan.keyValue } as never);
          const { error } = await q;
          if (error) throw new Error("Import stopped: an entry could not be saved. Re-run preview before retrying.");
        }
        const { writeAudit } = await import("@/lib/audit.server");
        await writeAudit({ actorUserId: context.userId, action: "import.csv", entityType: data.table, metadata: { count: plans.length } });
      }
      return { authorized: true, ok: true, rows };
    } catch (err) { return { authorized: true, ok: false, rows, error: err instanceof Error ? err.message : "Import failed." }; }
  });