import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { importMilitaryCsv, type CsvRowResult, type CsvSummary } from "@/lib/admin-content.functions";
import { useI18n } from "@/i18n";

/** Admin CSV import for military records: preview first, then commit. Rows always land hidden as needs_check. */
export function MilitaryCsvImport({ onDone, onDenied }: { onDone: () => void; onDenied: () => void }) {
  const { t } = useI18n();
  const run = useServerFn(importMilitaryCsv);
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<CsvRowResult[] | null>(null);
  const [summary, setSummary] = useState<CsvSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOk, setPreviewOk] = useState(false);
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="mt-3 grid gap-3 rounded-2xl border border-border bg-card/50 p-4 text-sm">
      <p className="text-xs text-muted-foreground">
        {t("Columns: register_no, era_slug, record_type, title_ar, title_en, internal_notes (first four required). New register numbers are added hidden as needs_check with no English title. Existing register numbers are only merged: the Arabic title is filled if empty and internal notes are appended — nothing else changes. Rejected rows are skipped. Maximum 1000 rows.")}
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) { setCsv(await f.text()); setRows(null); setPreviewOk(false); }
        }}
      />
      <textarea
        value={csv}
        onChange={(e) => { setCsv(e.target.value); setRows(null); setPreviewOk(false); }}
        rows={6}
        dir="auto"
        placeholder="register_no,era_slug,record_type,title_en"
        className="rounded-xl border border-border bg-background p-3 font-mono text-xs"
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy || !csv.trim()} onClick={() => void go(true)} className="rounded-full border border-gold/40 px-4 py-1.5 text-gold disabled:opacity-40">
          {t("Preview (dry run)")}
        </button>
        <button type="button" disabled={busy || !previewOk} onClick={() => void go(false)} className="rounded-full bg-gold px-4 py-1.5 font-semibold text-background disabled:opacity-40">
          {t("Import now")}
        </button>
      </div>
      {error ? <p className="text-destructive">{error}</p> : null}
      {summary ? (
        <div className="flex flex-wrap gap-2 text-xs">
          {(["new", "merge", "unchanged", "rejected"] as const).map((k) => (
            <span key={k} className={k === "rejected" && summary[k] > 0 ? "rounded-full border border-destructive/50 px-3 py-1 text-destructive" : "rounded-full border border-border px-3 py-1 text-foreground"}>
              {t(k === "new" ? "New" : k === "merge" ? "Merged" : k === "unchanged" ? "Unchanged" : "Rejected")}: <strong>{summary[k]}</strong>
            </span>
          ))}
        </div>
      ) : null}
      {rows && rows.some((r) => r.action !== "unchanged") ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground"><tr><th className="p-2">{t("Line")}</th><th className="p-2">register_no</th><th className="p-2">title_ar</th><th className="p-2">{t("Result")}</th></tr></thead>
            <tbody>
              {[...rows.filter((r) => r.action === "rejected"), ...rows.filter((r) => r.action === "merge"), ...rows.filter((r) => r.action === "new").slice(0, 20)].map((r) => (
                <tr key={r.line} className="border-t border-border">
                  <td className="p-2">{r.line}</td>
                  <td className="p-2">{r.register_no ?? "—"}</td>
                  <td className="p-2" dir="auto">{r.title || "—"}</td>
                  <td className={r.action === "rejected" ? "p-2 text-destructive" : "p-2 text-foreground"}>{r.action === "rejected" ? r.error : r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
