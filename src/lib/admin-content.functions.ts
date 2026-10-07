import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CONTENT_TABLES, UUID_FK_TABLES, getTableConfig, type FieldConfig, type UuidFkTable } from "@/lib/admin-content.config";

export type ContentTableSummary = { table: string; label: string; group: string; count: number };

export type ContentRowSummary = {
  pk: string;
  slug: string | null;
  name: string | null;
  extra: Record<string, any>;
};

export type ContentListPage = {
  table: string;
  filterOptions: Record<string, { value: string; label: string }[]>;
  bulkOptions?: Record<string, { value: string; label: string }[]>;
  rows: ContentRowSummary[];
  /** per-value counts for cfg.countBy (computed) */
  counts?: Record<string, number> | undefined;
  total: number;
  page: number;
  pageSize: number;
};

export type Denied = { authorized: false };
export type Ok<T> = { authorized: true } & T;

export const CONTENT_PAGE_SIZE = 25;

async function isAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    check_user_id: context.userId,
    check_role: "admin",
  });
  return !error && data === true;
}

const prettyField = (name: string) =>
  name
    .replace(/_(slug|key|id)$/, "")
    .replace(/_/g, " ")
    .trim();

/**
 * Turn a database error into plain language for the admin.
 * Raw driver/Postgres text is never surfaced.
 */
export function friendlyDbError(raw: unknown): string {
  const message = typeof raw === "string" ? raw : ((raw as any)?.message ?? "");

  const notNull = message.match(/null value in column "([^"]+)"/i);
  if (notNull) return `Please fill in "${prettyField(notNull[1]!)}" — it can't be left empty.`;

  if (/violates foreign key constraint/i.test(message)) {
    const col = message.match(/Key \(([^)]+)\)=/i);
    return col
      ? `The "${prettyField(col[1]!)}" you chose doesn't exist. Please pick one from the list.`
      : "One of the linked entries you chose doesn't exist. Please pick a value from the list.";
  }

  if (/duplicate key value|violates unique constraint/i.test(message)) {
    const col = message.match(/Key \(([^)]+)\)=\(([^)]*)\)/i);
    return col
      ? `"${col[2]}" is already used by another entry — please choose a different ${prettyField(col[1]!)}.`
      : "An entry with these details already exists. Please use different values.";
  }

  if (/violates check constraint/i.test(message)) {
    return "One of the values isn't allowed here. Please review the fields and try again.";
  }

  if (/invalid input syntax|invalid input value/i.test(message)) {
    return "One of the values is in the wrong format. Please review the fields and try again.";
  }

  return "That couldn't be saved. Please review the fields and try again.";
}

/** Coerce one submitted value to the shape the column expects. Unknown fields are dropped upstream. */
function coerce(field: FieldConfig, raw: unknown): unknown {
  if (raw === undefined) return undefined;
  switch (field.type) {
    case "number":
    case "integer": {
      if (raw === "" || raw === null) return null;
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new Error(`${field.name}: not a number`);
      if (field.min != null && n < field.min) throw new Error(`${field.label ?? field.name}: must be at least ${field.min}`);
      if (field.max != null && n > field.max) throw new Error(`${field.label ?? field.name}: must be at most ${field.max}`);
      return field.type === "integer" ? Math.trunc(n) : n;
    }
    case "boolean":
      return raw === true || raw === "true";
    case "date":
      return raw === "" || raw === null ? null : String(raw);
    case "tags":
    case "images": {
      if (raw === null) return null;
      if (!Array.isArray(raw)) throw new Error(`${field.name}: expected a list`);
      return raw.map((v) => String(v)).filter((v) => v.trim() !== "");
    }
    case "json": {
      if (raw === null || raw === "" || raw === undefined) return null;
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          throw new Error(`${field.name}: not valid JSON`);
        }
      }
      return raw;
    }
    default: {
      if (raw === null) return null;
      const s = String(raw);
      return s === "" ? null : s;
    }
  }
}

/** Admin-only: the 16 configured tables with live row counts. */
export const listContentTables = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Denied | Ok<{ tables: ContentTableSummary[] }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const tables = await Promise.all(
      CONTENT_TABLES.map(async (cfg) => {
        const { count } = await supabaseAdmin
          .from(cfg.table as any)
          .select("*", { count: "exact", head: true });
        return { table: cfg.table, label: cfg.label, group: cfg.group ?? "Site content", count: count ?? 0 };
      }),
    );
    return { authorized: true, tables };
  });

/** Admin-only: paginated row list for one configured table. */
export const listContentRows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: string; page?: number; filters?: Record<string, string> }) => {
    if (!getTableConfig(input?.table)) throw new Error("Unknown table");
    return input;
  })
  .handler(async ({ data, context }): Promise<Denied | Ok<{ data: ContentListPage }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const cfg = getTableConfig(data.table)!;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const page = Math.max(1, Math.floor(data.page ?? 1));
    const from = (page - 1) * CONTENT_PAGE_SIZE;
    const extraCols = cfg.listColumns ?? [];
    const cols = Array.from(new Set([cfg.pk, cfg.slugColumn, cfg.displayColumn, ...extraCols].filter(Boolean))).join(", ");
    const bulkOptions: Record<string, { value: string; label: string }[]> = {};
    for (const b of cfg.bulk ?? []) {
      if (b.fromTable) {
        const { data: opts } = await supabaseAdmin.from(b.fromTable as any).select("id, number, name_en").order("sort_order");
        bulkOptions[b.name] = ((opts ?? []) as any[]).map((o) => ({ value: o.id, label: `${o.number}. ${o.name_en}` }));
      } else bulkOptions[b.name] = b.options.map((o) => ({ value: o, label: o }));
    }

    let query = supabaseAdmin.from(cfg.table as any).select(cols, { count: "exact" });
    // Only allow-listed filters, equality only.
    const filterOptions: Record<string, { value: string; label: string }[]> = {};
    for (const f of cfg.filters ?? []) {
      if (f.fromTable) {
        const { data: opts } = await supabaseAdmin.from(f.fromTable as any).select("id, name_en").order("sort_order");
        filterOptions[f.name] = ((opts ?? []) as unknown as { id: string; name_en: string }[]).map((o) => ({ value: o.id, label: o.name_en }));
      } else {
        filterOptions[f.name] = f.options.map((o) => ({ value: o, label: o }));
      }
      const v = data.filters?.[f.name];
      if (!v || !filterOptions[f.name]!.some((o) => o.value === v)) continue;
      if (f.virtual === "has_flag") {
        query = query.not("internal_notes", "is", null).neq("internal_notes", "");
      } else if (f.virtual === "dup_title") {
        const { data: titles } = await supabaseAdmin.from(cfg.table as any).select("title_ar");
        const seen = new Map<string, number>();
        for (const r of (titles ?? []) as any[]) if (r.title_ar) seen.set(r.title_ar, (seen.get(r.title_ar) ?? 0) + 1);
        const dups = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
        query = query.in("title_ar", dups.length ? dups : ["\u0000"]);
      } else {
        query = query.eq(f.name, v === "true" ? true : v === "false" ? false : v);
      }
    }
    const { data: rows, count } = await query
      .order(cfg.orderColumn ?? cfg.displayColumn, { ascending: true, nullsFirst: false })
      .range(from, from + CONTENT_PAGE_SIZE - 1);

    let counts: Record<string, number> | undefined;
    if (cfg.countBy) {
      const { data: all } = await supabaseAdmin.from(cfg.table as any).select(cfg.countBy);
      counts = {};
      for (const r of (all ?? []) as any[]) {
        const k = String(r[cfg.countBy]);
        counts[k] = (counts[k] ?? 0) + 1;
      }
    }

    const mapped: ContentRowSummary[] = ((rows ?? []) as any[]).map((r) => ({
      pk: String(r[cfg.pk]),
      slug: cfg.slugColumn ? (r[cfg.slugColumn] ?? null) : null,
      name: r[cfg.displayColumn] ?? null,
      extra: Object.fromEntries(extraCols.map((c) => [c, r[c] ?? null])),
    }));

    return {
      authorized: true,
      data: {
        table: cfg.table,
        filterOptions,
        bulkOptions,
        counts,
        rows: mapped,
        total: count ?? 0,
        page,
        pageSize: CONTENT_PAGE_SIZE,
      },
    };
  });

/** Admin-only: one full row, plus the option lists the form needs. */
export const getContentRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: string; pk?: string | null }) => {
    if (!getTableConfig(input?.table)) throw new Error("Unknown table");
    return input;
  })
  .handler(
    async ({
      data,
      context,
    }): Promise<
      Denied | Ok<{
        row: Record<string, any> | null;
        governorates: string[];
        eras: string[];
        categories: { value: string; label: string }[];
        fkOptions: Partial<Record<UuidFkTable, { value: string; label: string }[]>>;
      }>
    > => {
      if (!(await isAdmin(context))) return { authorized: false };
      const cfg = getTableConfig(data.table)!;
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      let row: Record<string, any> | null = null;
      if (data.pk) {
        const { data: found } = await supabaseAdmin
          .from(cfg.table as any)
          .select("*")
          .eq(cfg.pk, data.pk)
          .maybeSingle();
        row = (found as Record<string, any> | null) ?? null;
      }

      const needsGov = cfg.fields.some((f) => f.fk === "governorates");
      const needsEra = cfg.fields.some((f) => f.fk === "eras");

      const governorates = needsGov
        ? (((await supabaseAdmin.from("governorates").select("slug").order("slug")).data ?? []) as {
            slug: string;
          }[]).map((g) => g.slug)
        : [];
      const eras = needsEra
        ? (((await supabaseAdmin.from("eras").select("key").order("key")).data ?? []) as {
            key: string;
          }[]).map((e) => e.key)
        : [];

      const catFk = cfg.fields.find((f) => f.fk === "emergency_categories" || f.fk === "app_categories")?.fk as
        | "emergency_categories"
        | "app_categories"
        | undefined;
      const categories = catFk
        ? (((await supabaseAdmin.from(catFk).select("id, name_en").order("sort_order")).data ??
            []) as { id: string; name_en: string }[]).map((c) => ({ value: c.id, label: c.name_en }))
        : [];

      const fkOptions: Partial<Record<UuidFkTable, { value: string; label: string }[]>> = {};
      const LABEL: Record<UuidFkTable, { cols: string; order: string; label: (r: any) => string }> = {
        emergency_categories: { cols: "id, name_en", order: "sort_order", label: (r) => r.name_en },
        app_categories: { cols: "id, name_en", order: "sort_order", label: (r) => r.name_en },
        military_eras: { cols: "id, number, name_en", order: "sort_order", label: (r) => `${r.number}. ${r.name_en}` },
        military_records: { cols: "id, register_no, title_en", order: "register_no", label: (r) => `#${String(r.register_no).padStart(3, "0")} ${r.title_en}` },
        military_figures: { cols: "id, name_en", order: "name_en", label: (r) => r.name_en },
        military_sources: { cols: "id, title", order: "title", label: (r) => r.title },
      };
      for (const fkTable of new Set(cfg.fields.map((f) => f.fk).filter((x): x is UuidFkTable => UUID_FK_TABLES.includes(x as UuidFkTable)))) {
        const l = LABEL[fkTable];
        const { data: opts } = await supabaseAdmin.from(fkTable as any).select(l.cols).order(l.order);
        fkOptions[fkTable] = ((opts ?? []) as any[]).map((o) => ({ value: o.id, label: l.label(o) }));
      }

      return { authorized: true, row, governorates, eras, categories, fkOptions };
    },
  );

/** Admin-only: create or update one row in a configured table. */
export const saveContentRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      table: string;
      mode: "create" | "update";
      pk: string;
      slug?: string;
      values: Record<string, any>;
    }) => {
      if (!getTableConfig(input?.table)) throw new Error("Unknown table");
      if (input.mode !== "create" && input.mode !== "update") throw new Error("Invalid mode");
      if (!input.pk || !String(input.pk).trim()) throw new Error("Missing identifier");
      return input;
    },
  )
  .handler(
    async ({ data, context }): Promise<Denied | Ok<{ ok: boolean; error?: string; pk?: string }>> => {
      if (!(await isAdmin(context))) return { authorized: false };
      const cfg = getTableConfig(data.table)!;
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const payload: Record<string, any> = {};
      try {
        for (const field of cfg.fields) {
          if (field.readOnly) continue;
          const value = coerce(field, data.values?.[field.name]);
          if (value !== undefined) payload[field.name] = value;
        }
      } catch (err) {
        return { authorized: true, ok: false, error: (err as Error).message };
      }

      if (!cfg.noUpdatedAt) payload["updated_at"] = new Date().toISOString();

      if (data.mode === "create") {
        if (cfg.noCreate) return { authorized: true, ok: false, error: "New entries cannot be added here." };
        const pk = cfg.autoPk ? crypto.randomUUID() : String(data.pk).trim();
        const { data: existing } = await supabaseAdmin
          .from(cfg.table as any)
          .select(cfg.pk)
          .eq(cfg.pk, pk)
          .maybeSingle();
        if (existing) {
          return { authorized: true, ok: false, error: `An entry with the id "${pk}" already exists.` };
        }
        payload[cfg.pk] = pk;
        if (cfg.slugColumn) payload[cfg.slugColumn] = String(data.slug || pk).trim();

        const { error } = await supabaseAdmin.from(cfg.table as any).insert(payload as any);
        if (error) return { authorized: true, ok: false, error: friendlyDbError(error) };
        return { authorized: true, ok: true, pk };
      }

      const { error } = await supabaseAdmin
        .from(cfg.table as any)
        .update(payload as any)
        .eq(cfg.pk, data.pk);
      if (error) return { authorized: true, ok: false, error: friendlyDbError(error) };
      return { authorized: true, ok: true, pk: data.pk };
    },
  );

/** Admin-only: delete one row from a configured table. */
export const deleteContentRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: string; pk: string }) => {
    if (!getTableConfig(input?.table)) throw new Error("Unknown table");
    if (!input?.pk) throw new Error("Missing identifier");
    return input;
  })
  .handler(async ({ data, context }): Promise<Denied | Ok<{ ok: boolean; error?: string }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const cfg = getTableConfig(data.table)!;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from(cfg.table as any)
      .delete()
      .eq(cfg.pk, data.pk);
    if (error) return { authorized: true, ok: false, error: friendlyDbError(error) };
    return { authorized: true, ok: true };
  });

/** Admin-only: set one allow-listed column on many rows at once. */
export const bulkUpdateRows = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: string; pks: string[]; column: string; value: string }) => {
    const cfg = getTableConfig(input?.table);
    if (!cfg) throw new Error("Unknown table");
    const b = cfg.bulk?.find((x) => x.name === input.column);
    if (!b || (!b.fromTable && !b.options.includes(input.value))) throw new Error("Not allowed");
    if (b.fromTable && !/^[0-9a-f-]{36}$/i.test(input.value)) throw new Error("Not allowed");
    if (!Array.isArray(input.pks) || input.pks.length === 0 || input.pks.length > 500) throw new Error("Select 1–500 rows");
    return input;
  })
  .handler(async ({ data, context }): Promise<Denied | Ok<{ ok: boolean; updated: number; error?: string }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const cfg = getTableConfig(data.table)!;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const b = cfg.bulk!.find((x) => x.name === data.column)!;
    if (b.fromTable) {
      const { data: hit } = await supabaseAdmin.from(b.fromTable as any).select("id").eq("id", data.value).maybeSingle();
      if (!hit) return { authorized: true, ok: false, updated: 0, error: "That option no longer exists." };
    }
    const value = data.value === "true" ? true : data.value === "false" ? false : data.value;
    const { error, count } = await supabaseAdmin
      .from(cfg.table as any)
      .update({ [data.column]: value } as any, { count: "exact" })
      .in(cfg.pk, data.pks.map(String));
    if (error) return { authorized: true, ok: false, updated: 0, error: friendlyDbError(error) };
    return { authorized: true, ok: true, updated: count ?? 0 };
  });

/* ---------------- CSV import for military_records ---------------- */

const MIL_TYPES = [
  "battle", "war", "campaign", "siege", "naval", "air", "operation", "defensive_action", "conflict_phase", "other_record",
  "invasion", "revolt_resistance", "amphibious_landing", "raid", "needs_classification",
];

export type CsvRowResult = {
  line: number;
  register_no: number | null;
  title: string;
  action: "new" | "merge" | "unchanged" | "rejected";
  error?: string;
};
export type CsvSummary = { new: number; merge: number; unchanged: number; rejected: number };

/** Minimal RFC-4180 parser: quoted fields, escaped quotes, CRLF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

/**
 * Admin-only register import. New register numbers are inserted hidden (needs_check, inactive, slug rec-N,
 * no English title). Existing register numbers are merged non-destructively: title_ar filled only if empty,
 * CSV internal_notes appended once. Nothing else on an existing row is touched, so re-imports are no-ops.
 */
export const importMilitaryCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { csv: string; dryRun: boolean }) => {
    if (typeof input?.csv !== "string" || input.csv.length > 3_000_000) throw new Error("CSV too large");
    return { csv: input.csv, dryRun: input.dryRun !== false };
  })
  .handler(
    async ({ data, context }): Promise<
      Denied | Ok<{ ok: boolean; error?: string | undefined; rows: CsvRowResult[]; summary: CsvSummary; committed: number }>
    > => {
      if (!(await isAdmin(context))) return { authorized: false };
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const empty: CsvSummary = { new: 0, merge: 0, unchanged: 0, rejected: 0 };
      const table = parseCsv(data.csv.replace(/^\uFEFF/, ""));
      if (table.length < 2)
        return { authorized: true, ok: false, error: "The file needs a header row and at least one data row.", rows: [], summary: empty, committed: 0 };
      const header = table[0]!.map((h) => h.trim().toLowerCase());
      for (const req of ["register_no", "era_slug", "record_type", "title_ar"]) {
        if (!header.includes(req))
          return { authorized: true, ok: false, error: `Missing required column "${req}".`, rows: [], summary: empty, committed: 0 };
      }
      const body = table.slice(1);
      if (body.length > 1000)
        return { authorized: true, ok: false, error: "Maximum 1000 rows per import.", rows: [], summary: empty, committed: 0 };

      const { data: eras } = await supabaseAdmin.from("military_eras").select("id, slug");
      const eraBySlug = new Map(((eras ?? []) as { id: string; slug: string }[]).map((e) => [e.slug, e.id]));
      const { data: existing } = await supabaseAdmin
        .from("military_records")
        .select("id, register_no, title_ar, internal_notes")
        .not("register_no", "is", null);
      const byNo = new Map(
        ((existing ?? []) as { id: string; register_no: number; title_ar: string | null; internal_notes: string | null }[]).map((e) => [
          e.register_no,
          e,
        ]),
      );

      const counts = new Map<number, number>();
      for (const cells of body) {
        const n = Number((cells[header.indexOf("register_no")] ?? "").trim());
        counts.set(n, (counts.get(n) ?? 0) + 1);
      }

      const results: CsvRowResult[] = [];
      const inserts: Record<string, unknown>[] = [];
      const merges: { id: string; patch: Record<string, unknown> }[] = [];
      body.forEach((cells, i) => {
        const get = (k: string) => (header.includes(k) ? (cells[header.indexOf(k)] ?? "").trim() : "");
        const line = i + 2;
        const no = Number(get("register_no"));
        const title = get("title_ar");
        const reject = (error: string) =>
          void results.push({ line, register_no: Number.isFinite(no) ? no : null, title, action: "rejected", error });
        if (!Number.isInteger(no) || no < 1) return reject("register_no must be a positive whole number");
        if ((counts.get(no) ?? 0) > 1) return reject("duplicate register_no inside the file");
        const eraId = eraBySlug.get(get("era_slug"));
        if (!eraId) return reject(`unknown era_slug "${get("era_slug")}"`);
        const type = get("record_type");
        if (!MIL_TYPES.includes(type)) return reject(`unknown record_type "${type}"`);
        if (!title) return reject("empty title_ar");
        const notes = get("internal_notes");

        const ex = byNo.get(no);
        if (!ex) {
          inserts.push({
            register_no: no, slug: `rec-${no}`, era_id: eraId, record_type: type, title_ar: title, title_en: null,
            outcome: "not_assessed", review_status: "needs_check", is_active: false, internal_notes: notes || null,
          });
          return void results.push({ line, register_no: no, title, action: "new" });
        }
        const patch: Record<string, unknown> = {};
        if (!ex.title_ar?.trim()) patch["title_ar"] = title;
        if (notes && !(ex.internal_notes ?? "").includes(notes)) {
          patch["internal_notes"] = ex.internal_notes?.trim() ? `${ex.internal_notes.trim()}\n${notes}` : notes;
        }
        if (Object.keys(patch).length === 0) return void results.push({ line, register_no: no, title, action: "unchanged" });
        merges.push({ id: ex.id, patch });
        return void results.push({ line, register_no: no, title, action: "merge" });
      });

      const summary: CsvSummary = { ...empty };
      for (const r of results) summary[r.action]++;
      if (data.dryRun) return { authorized: true, ok: true, rows: results, summary, committed: 0 };

      for (let k = 0; k < inserts.length; k += 200) {
        const { error } = await supabaseAdmin.from("military_records").insert(inserts.slice(k, k + 200) as any);
        if (error) return { authorized: true, ok: false, error: friendlyDbError(error), rows: results, summary, committed: k };
      }
      for (const m of merges) {
        const { error } = await supabaseAdmin.from("military_records").update(m.patch as any).eq("id", m.id);
        if (error) return { authorized: true, ok: false, error: friendlyDbError(error), rows: results, summary, committed: inserts.length };
      }
      return { authorized: true, ok: true, rows: results, summary, committed: inserts.length + merges.length };
    },
  );
