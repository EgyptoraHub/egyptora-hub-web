import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { importProtectedCsv, type CultureCsvRow, type CsvSummary } from "@/lib/admin-content.functions";
import { useI18n } from "@/i18n";

const COLS = "name_ar, name_en, governorate_slug, declared_year, area_km2, summary_ar, summary_en, source_url, source_note, internal_notes";

/** Admin CSV import for protected areas: dry run first, then commit. New rows always land hidden as needs_check. */
export function ProtectedCsvImport({ onDone, onDenied }: { onDone: () => void; onDenied: () => void }) {
  const { t } = useI18n();
  const run = useServerFn(importProtectedCsv);
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<CultureCsvRow[] | null>(null);
  const [summary, setSummary] = useState<CsvSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOk, setPreviewOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const warnings = rows?.filter((r) => r.warning).length ?? 0;

  const go = async (dryRun: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const r = await run({ data: { csv, dryRun } });
      if (!r.authorized) return onDenied();
      setRows(r.rows);
      setSummary(r.summary);
      setError(r.error ?? null);
      setPreviewOk(r.ok && dryRun && r.summary.new + r.summary.merge > 0);
      if (!dryRun && r.ok) {
        toast.success(`${t("Imported")}: ${r.committed}`);
        setPreviewOk(false);
        onDone();
      }
    } catch {
      setError(t("Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const reset = (v: string) => { setCsv(v); setRows(null); setPreviewOk(false); };

  return (
    <div className="mt-3 grid gap-3 rounded-2xl border border-border bg-card/50 p-4 text-sm">
      <p className="text-xs text-muted-foreground">
        {t("Columns")}: {COLS}. {t("name_ar is required and is the match key. Any review_status column is ignored. Source links that are PDFs or not Egyptian websites (.eg, manshurat.org) get a warning.")} {t("New rows are added hidden as needs_check. Existing rows only get empty fields filled and internal notes appended — review status and visibility never change. Rejected rows are skipped. Maximum 1000 rows.")}
      </p>
      <input type="file" accept=".csv,text/csv" onChange={async (e) => { const f = e.target.files?.[0]; if (f) reset(await f.text()); }} />
      <textarea value={csv} onChange={(e) => reset(e.target.value)} rows={6} dir="auto" placeholder={COLS.replace(/, /g, ",")} className="rounded-xl border border-border bg-background p-3 font-mono text-xs" />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || !csv.trim()} onClick={() => void go(true)} className="rounded-full border border-gold/40 px-4 py-1.5 text-gold-text disabled:opacity-40">{t("Preview (dry run)")}</button>
        <button type="button" disabled={busy || !previewOk} onClick={() => void go(false)} className="rounded-full bg-gold px-4 py-1.5 font-semibold text-gold-foreground disabled:opacity-40">{t("Import now")}</button>
      </div>
      {error ? <p className="text-destructive">{error}</p> : null}
      {summary ? (
        <div className="flex flex-wrap gap-2 text-xs">
          {(["new", "merge", "unchanged", "rejected"] as const).map((k) => (
            <span key={k} className={k === "rejected" && summary[k] > 0 ? "rounded-full border border-destructive/50 px-3 py-1 text-destructive" : "rounded-full border border-border px-3 py-1 text-foreground"}>
              {t(k === "new" ? "New" : k === "merge" ? "Updated" : k === "unchanged" ? "Unchanged" : "Rejected")}: <strong>{summary[k]}</strong>
            </span>
          ))}
          {warnings > 0 ? <span className="rounded-full border border-gold/50 px-3 py-1 text-gold-text">{t("Source warnings")}: <strong>{warnings}</strong></span> : null}
        </div>
      ) : null}
      {rows && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground"><tr><th className="p-2">{t("Line")}</th><th className="p-2">slug</th><th className="p-2">name_ar</th><th className="p-2">{t("Result")}</th></tr></thead>
            <tbody>
              {rows.slice(0, 100).map((r) => (
                <tr key={r.line} className="border-t border-border">
                  <td className="p-2">{r.line}</td>
                  <td className="p-2">{r.key || "—"}</td>
                  <td className="p-2" dir="auto">{r.title || "—"}</td>
                  <td className="p-2">
                    <span className={r.action === "rejected" ? "text-destructive" : "text-foreground"}>{r.action === "rejected" ? r.error : r.action === "merge" ? "updated" : r.action}</span>
                    {r.warning ? <span className="block text-gold-text">{r.warning}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
