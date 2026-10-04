import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CONTENT_TABLES, getTableConfig, type FieldConfig } from "@/lib/admin-content.config";

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
  rows: ContentRowSummary[];
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

    let query = supabaseAdmin.from(cfg.table as any).select(cols, { count: "exact" });
    // Only allow-listed filters, equality only.
    const filterOptions: Record<string, { value: string; label: string }[]> = {};
    for (const f of cfg.filters ?? []) {
      if (f.fromTable) {
        const { data: opts } = await supabaseAdmin.from(f.fromTable).select("id, name_en").order("sort_order");
        filterOptions[f.name] = ((opts ?? []) as { id: string; name_en: string }[]).map((o) => ({ value: o.id, label: o.name_en }));
      } else {
        filterOptions[f.name] = f.options.map((o) => ({ value: o, label: o }));
      }
      const v = data.filters?.[f.name];
      if (v && filterOptions[f.name]!.some((o) => o.value === v)) query = query.eq(f.name, v === "true" ? true : v === "false" ? false : v);
    }
    const { data: rows, count } = await query
      .order(cfg.displayColumn, { ascending: true })
      .range(from, from + CONTENT_PAGE_SIZE - 1);

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

      return { authorized: true, row, governorates, eras, categories };
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
