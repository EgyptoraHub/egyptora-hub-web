import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { importMilitaryCsv, type CsvRowResult } from "@/lib/admin-content.functions";
import { useI18n } from "@/i18n";

/** Admin CSV import for military records: preview first, then commit. Rows always land hidden as needs_check. */
export function MilitaryCsvImport({ onDone, onDenied }: { onDone: () => void; onDenied: () => void }) {
  const { t } = useI18n();
  const run = useServerFn(importMilitaryCsv);
  const [csv, setCsv] = useState("");
  const [rows, setRows] = useState<CsvRowResult[] | null>(null);
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
      setError(r.error ?? null);
      setPreviewOk(r.ok && dryRun);
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
        {t("Required columns: register_no, era_slug, record_type, title_en. Optional: title_ar, alt_names, date_label_en/ar, year_from, year_to, place_en/ar, lat, lng, egyptian_leadership_en/ar, opposing_side_en/ar, outcome, note_en/ar, significance_en/ar, source_url. Existing register numbers are updated. Every imported row is saved hidden as needs_check. Maximum 500 rows.")}
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
      {rows ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground"><tr><th className="p-2">{t("Line")}</th><th className="p-2">register_no</th><th className="p-2">title_en</th><th className="p-2">{t("Result")}</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.line} className="border-t border-border">
                  <td className="p-2">{r.line}</td>
                  <td className="p-2">{r.register_no ?? "—"}</td>
                  <td className="p-2" dir="auto">{r.title_en || "—"}</td>
                  <td className={r.action === "error" ? "p-2 text-destructive" : "p-2 text-foreground"}>{r.action === "error" ? r.error : r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
