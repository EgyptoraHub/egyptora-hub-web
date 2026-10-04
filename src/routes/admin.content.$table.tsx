import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  deleteContentRow,
  getContentRow,
  listContentRows,
  saveContentRow,
  type ContentListPage,
} from "@/lib/admin-content.functions";
import {
  getTableConfig,
  slugify,
  type FieldConfig,
  type TableConfig,
} from "@/lib/admin-content.config";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/content/$table")({
  ssr: false,
  component: AdminContentTable,
  head: () => ({
    meta: [
      { title: `Content admin — ${SITE.name}` },
      { name: "description", content: "Internal content management." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Content admin — ${SITE.name}` },
      { property: "og:description", content: "Internal content management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-card/60 px-3 py-2 text-sm text-foreground";

const humanize = (name: string) =>
  name.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/* ----------------------------- field editors ----------------------------- */

function ListEditor({
  values,
  onChange,
  placeholder,
  allowReorder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  allowReorder?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft("");
  };
  const move = (index: number, delta: number) => {
    const next = [...values];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  };
  return (
    <div>
      <div className="mt-1 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-card/60 px-3 py-2 text-sm text-foreground"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-xl border border-gold/40 px-3 py-2 text-xs text-gold"
        >
          +
        </button>
      </div>
      <div className={allowReorder ? "mt-2 grid gap-1" : "mt-2 flex flex-wrap gap-1.5"}>
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-foreground"
          >
            <span className="break-all">{value}</span>
            {allowReorder ? (
              <>
                <button type="button" onClick={() => move(index, -1)} className="text-muted-foreground">
                  ↑
                </button>
                <button type="button" onClick={() => move(index, 1)} className="text-muted-foreground">
                  ↓
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="text-destructive"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
  governorates,
  eras,
  categories = [],
}: {
  field: FieldConfig;
  value: any;
  onChange: (next: any) => void;
  governorates: string[];
  eras: string[];
  categories?: { value: string; label: string }[];
}) {
  const { t } = useI18n();
  const label = t(field.label ?? humanize(field.name));

  const wrap = (children: React.ReactNode) => (
    <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
      {label}
      <div className="normal-case tracking-normal">{children}</div>
    </label>
  );

  if (field.readOnly) {
    return wrap(
      <p className="mt-1 whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
        {value == null || value === "" ? "—" : String(value)}
      </p>,
    );
  }

  switch (field.type) {
    case "textarea":
      return wrap(
        <textarea
          rows={4}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />,
      );
    case "json":
      return wrap(
        <textarea
          rows={5}
          value={typeof value === "string" ? value : value ? JSON.stringify(value, null, 2) : ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} font-mono text-xs`}
          placeholder="{}"
        />,
      );
    case "boolean":
      return (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          {label}
        </label>
      );
    case "number":
    case "integer":
      return wrap(
        <input
          type="number"
          step={field.type === "integer" ? 1 : "any"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />,
      );
    case "date":
      return wrap(
        <input
          type="date"
          value={value ? String(value).slice(0, 10) : ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />,
      );
    case "tags":
      return wrap(
        <ListEditor
          values={Array.isArray(value) ? value : []}
          onChange={onChange}
          placeholder={t("Type a value and press Enter")}
        />,
      );
    case "images":
      return wrap(
        <ListEditor
          values={Array.isArray(value) ? value : []}
          onChange={onChange}
          placeholder={t("Paste an image URL")}
          allowReorder
        />,
      );
    case "select":
      return wrap(
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">—</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>,
      );
    case "fk": {
      if (field.fk === "emergency_categories") {
        return wrap(
          <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>,
        );
      }
      const options = field.fk === "eras" ? eras : governorates;
      return wrap(
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">—</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>,
      );
    }
    default:
      return wrap(
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />,
      );
  }
}

/* --------------------------------- form --------------------------------- */

function ContentForm({
  cfg,
  pk,
  onDone,
  onDenied,
}: {
  cfg: TableConfig;
  pk: string | null;
  onDone: (saved?: boolean) => void;
  onDenied: () => void;
}) {
  const { t } = useI18n();
  const fetchRow = useServerFn(getContentRow);
  const save = useServerFn(saveContentRow);

  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, any>>({});
  const [idValue, setIdValue] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [eras, setEras] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isCreate = !pk;

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await fetchRow({ data: { table: cfg.table, pk } });
      if (!active) return;
      if (!result.authorized) {
        onDenied();
        return;
      }
      setGovernorates(result.governorates);
      setEras(result.eras);
      setCategories(result.categories);
      if (result.row) {
        const row = result.row;
        const next: Record<string, any> = {};
        for (const field of cfg.fields) {
          next[field.name] =
            field.type === "json" && row[field.name]
              ? JSON.stringify(row[field.name], null, 2)
              : row[field.name];
        }
        setValues(next);
        setIdValue(String(row[cfg.pk] ?? ""));
        setSlugValue(cfg.slugColumn ? String(row[cfg.slugColumn] ?? "") : "");
      }
      setLoading(false);
    })().catch(() => {
      if (active) {
        setError(t("Something went wrong. Please try again."));
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [cfg, pk, fetchRow, onDenied, t]);

  const setValue = (name: string, next: any) => {
    setValues((prev) => ({ ...prev, [name]: next }));
    if (isCreate && name === "name" && !idTouched) {
      const suggestion = slugify(String(next ?? ""));
      setIdValue(suggestion);
      setSlugValue(suggestion);
    }
  };

  const submit = async () => {
    setError(null);
    const jsonField = cfg.fields.find((f) => f.type === "json");
    if (jsonField && values[jsonField.name]) {
      try {
        JSON.parse(String(values[jsonField.name]));
      } catch {
        setError(`${humanize(jsonField.name)}: ${t("this is not valid JSON.")}`);
        return;
      }
    }
    if (isCreate && !cfg.autoPk && !idValue.trim()) {
      setError(t("An identifier is required."));
      return;
    }
    setBusy(true);
    try {
      const result = await save({
        data: {
          table: cfg.table,
          mode: isCreate ? "create" : "update",
          pk: isCreate ? (cfg.autoPk ? "auto" : idValue.trim()) : pk!,
          slug: slugValue.trim() || idValue.trim(),
          values,
        },
      });
      if (!result.authorized) {
        onDenied();
        return;
      }
      if (!result.ok) {
        setError(result.error ?? t("Something went wrong. Please try again."));
        return;
      }
      onDone(true);
    } catch {
      setError(t("Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="mt-8 text-sm text-muted-foreground">{t("Loading…")}</p>;

  const content = cfg.fields.filter((f) => !f.governance);
  const governance = cfg.fields.filter((f) => f.governance);

  return (
    <div className="mt-8">
      <h2 className="font-display text-2xl text-foreground">
        {isCreate ? t("Add new entry") : t("Edit entry")}
      </h2>

      <div className="mt-5 grid gap-4 rounded-2xl border border-border bg-card/40 p-5 sm:grid-cols-2">
        {isCreate && cfg.autoPk ? null : (
        <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
          {t("Identifier")}
          <input
            value={idValue}
            disabled={!isCreate}
            onChange={(e) => {
              setIdTouched(true);
              setIdValue(e.target.value);
            }}
            className={`${inputClass} normal-case tracking-normal disabled:opacity-60`}
          />
        </label>
        )}
        {cfg.slugColumn ? (
          <label className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {t("Slug")}
            <input
              value={slugValue}
              disabled={!isCreate}
              onChange={(e) => setSlugValue(e.target.value)}
              className={`${inputClass} normal-case tracking-normal disabled:opacity-60`}
            />
          </label>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 rounded-2xl border border-border bg-card/40 p-5 sm:grid-cols-2">
        {content.map((field) => (
          <div key={field.name} className={field.type === "textarea" || field.type === "json" ? "sm:col-span-2" : ""}>
            <FieldEditor
              field={field}
              value={values[field.name]}
              onChange={(next) => setValue(field.name, next)}
              governorates={governorates}
              eras={eras}
              categories={categories}
            />
          </div>
        ))}
      </div>

      {governance.length > 0 ? (
      <div className="mt-5 rounded-2xl border border-border bg-card/20 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">
          {t("Governance")}
        </h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {governance.map((field) => (
            <FieldEditor
              key={field.name}
              field={field}
              value={values[field.name]}
              onChange={(next) => setValue(field.name, next)}
              governorates={governorates}
              eras={eras}
            />
          ))}
        </div>
      </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => onDone(false)}
          className="rounded-full border border-border px-4 py-2 text-sm text-foreground"
        >
          {t("Cancel")}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-background disabled:opacity-50"
        >
          {busy ? t("Saving…") : t("Save")}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- page --------------------------------- */

function AdminContentTable() {
  const { table } = useParams({ from: "/admin/content/$table" });
  const { t } = useI18n();
  const cfg = useMemo(() => getTableConfig(table), [table]);

  const load = useServerFn(listContentRows);
  const remove = useServerFn(deleteContentRow);

  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [data, setData] = useState<ContentListPage | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<{ pk: string | null } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ pk: string; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    if (!cfg) return;
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setState("denied");
      return;
    }
    const result = await load({ data: { table: cfg.table, page, filters } });
    if (!result.authorized) {
      setState("denied");
      return;
    }
    setData(result.data);
    setState("ready");
  }, [cfg, load, page, filters]);

  useEffect(() => {
    let active = true;
    fetchPage().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [fetchPage]);

  if (!cfg) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <p className="text-sm text-muted-foreground">{t("Unknown content set.")}</p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <p className="text-sm text-muted-foreground">{t("Checking your access…")}</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/60 p-8 text-center">
          <h1 className="font-display text-3xl text-foreground">{t("Not authorized")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("You do not have permission to view this page.")}
          </p>
        </div>
      </div>
    );
  }

  const applyDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await remove({ data: { table: cfg.table, pk: confirmDelete.pk } });
      if (!result.authorized) {
        setState("denied");
        return;
      }
      if (!result.ok) {
        setNotice(result.error ?? t("Something went wrong. Please try again."));
        toast.error(result.error ?? t("Something went wrong. Please try again."));
        return;
      }
      setNotice(t("Entry deleted."));
      toast.success(t("Entry deleted."));
      setConfirmDelete(null);
      await fetchPage();
    } catch {
      setNotice(t("Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 25)));

  return (
    <div className="min-h-screen bg-background px-5 py-14">
      <div className="mx-auto w-full max-w-6xl">
        <Link to="/admin/content" className="text-xs text-muted-foreground hover:text-gold">
          ← {t("All content sets")}
        </Link>
        <h1 className="mt-3 font-display text-3xl text-foreground">{t(cfg.label)}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data?.total ?? 0} {t("entries")}
        </p>

        {notice ? <p className="mt-4 text-sm text-gold">{notice}</p> : null}

        {editing ? (
          <ContentForm
            cfg={cfg}
            pk={editing.pk}
            onDone={(saved) => {
              setEditing(null);
              if (saved) {
                setNotice(t("Saved."));
                toast.success(t("Saved — your changes are live."));
              }
              void fetchPage();
            }}
            onDenied={() => setState("denied")}
          />
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-end gap-3">
              {cfg.noCreate ? null : (
                <button
                  type="button"
                  onClick={() => setEditing({ pk: null })}
                  className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-background"
                >
                  {t("Add new")}
                </button>
              )}
              {(cfg.filters ?? []).map((f) => (
                <label key={f.name} className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {t(f.label)}
                  <select
                    aria-label={f.label}
                    value={filters[f.name] ?? ""}
                    onChange={(e) => {
                      setPage(1);
                      setFilters((prev) => ({ ...prev, [f.name]: e.target.value }));
                    }}
                    className={`${inputClass} normal-case tracking-normal`}
                  >
                    <option value="">{t("All")}</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-card/60 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">{t("Identifier")}</th>
                    {cfg.slugColumn ? <th className="px-4 py-3">{t("Slug")}</th> : null}
                    <th className="px-4 py-3">{t("Name")}</th>
                    {(cfg.listColumns ?? []).map((c) => (
                      <th key={c} className="px-4 py-3">{t(humanize(c))}</th>
                    ))}
                    <th className="px-4 py-3">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.rows ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4 + (cfg.listColumns?.length ?? 0)} className="px-4 py-10 text-center text-muted-foreground">
                        {t("No entries yet.")}
                      </td>
                    </tr>
                  ) : null}
                  {(data?.rows ?? []).map((row) => (
                    <tr key={row.pk} className="border-t border-border">
                      <td className="px-4 py-3 break-all text-muted-foreground">{row.pk}</td>
                      {cfg.slugColumn ? (
                        <td className="px-4 py-3 break-all text-muted-foreground">{row.slug ?? "—"}</td>
                      ) : null}
                      <td className="px-4 py-3 whitespace-pre-wrap break-words text-foreground">{row.name ?? "—"}</td>
                      {(cfg.listColumns ?? []).map((c) => (
                        <td key={c} className="px-4 py-3 break-all text-muted-foreground">
                          {row.extra?.[c] == null ? "—" : String(row.extra[c])}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing({ pk: row.pk })}
                            className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold"
                          >
                            {t("Edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete({ pk: row.pk, name: row.name ?? row.pk })}
                            className="rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive"
                          >
                            {t("Delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-border px-4 py-1.5 text-xs text-foreground disabled:opacity-40"
              >
                {t("Previous")}
              </button>
              <p className="text-xs text-muted-foreground">
                {t("Page")} {page} / {totalPages}
              </p>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-border px-4 py-1.5 text-xs text-foreground disabled:opacity-40"
              >
                {t("Next")}
              </button>
            </div>
          </>
        )}
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-5">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-xl text-foreground">{t("Confirm deletion")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("This will permanently remove")} “{confirmDelete.name}”.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-border px-4 py-2 text-sm text-foreground"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={applyDelete}
                className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
              >
                {busy ? t("Deleting…") : t("Delete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
