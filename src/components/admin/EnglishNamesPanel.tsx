import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, Upload } from "lucide-react";
import { exportEnglishNames, importEnglishNames, NAME_TABLES, type NameImportResult, type NameTable } from "@/lib/english-names.functions";

const LABEL: Record<NameTable, string> = {
  military_records: "Military records",
  economic_zones: "Economic zones",
  protected_areas: "Protected areas",
};

const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/\n/g, " ")}"`;

/** Minimal CSV parser (quoted fields, commas, newlines inside quotes). */
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (q) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(cell); out.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); out.push(row); }
  return out.filter((r) => r.some((c) => c.trim()));
}

export function EnglishNamesPanel() {
  const doExport = useServerFn(exportEnglishNames);
  const doImport = useServerFn(importEnglishNames);
  const [table, setTable] = useState<NameTable>("military_records");
  const [rows, setRows] = useState<{ id: string; en: string }[] | null>(null);
  const [result, setResult] = useState<NameImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = async (t: NameTable) => {
    setBusy(true); setError(null);
    try {
      const data = await doExport({ data: { table: t } });
      const csv = ["id,arabic_name,english_name,machine_translated", ...data.map((r) => [r.id, r.ar, r.en, r.mt ? "yes" : ""].map(esc).join(","))].join("\n");
      const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = `english-names-${t}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  const onFile = async (file: File) => {
    setResult(null); setError(null);
    const grid = parseCsv(await file.text());
    const head = (grid[0] ?? []).map((h) => h.trim().toLowerCase());
    const iId = head.indexOf("id"), iEn = head.indexOf("english_name");
    if (iId < 0 || iEn < 0) { setRows(null); setError("The CSV needs the columns id and english_name."); return; }
    setRows(grid.slice(1).map((r) => ({ id: r[iId] ?? "", en: r[iEn] ?? "" })));
  };

  const run = async (dryRun: boolean) => {
    if (!rows) return;
    setBusy(true); setError(null);
    try { setResult(await doImport({ data: { table, rows, dryRun } })); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">English names (review)</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Download id / Arabic name / English name for review. Upload the corrected CSV to update only the English name (preview first, max 1000 rows).
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(NAME_TABLES) as NameTable[]).map((t) => (
          <button key={t} type="button" disabled={busy} onClick={() => download(t)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-gold/60 bg-gold/10 px-3.5 text-sm text-gold hover:bg-gold/20 disabled:opacity-40">
            <Download className="size-3.5" /> {LABEL[t]} CSV
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <select value={table} onChange={(e) => { setTable(e.target.value as NameTable); setResult(null); }}
          className="min-h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground">
          {(Object.keys(NAME_TABLES) as NameTable[]).map((t) => <option key={t} value={t}>{LABEL[t]}</option>)}
        </select>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3.5 text-sm text-foreground">
          <Upload className="size-3.5" /> Choose CSV
          <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
        {rows ? <span className="text-sm text-muted-foreground">{rows.length} rows loaded</span> : null}
        <button type="button" disabled={!rows || busy} onClick={() => run(true)} className="min-h-11 rounded-full border border-border px-3.5 text-sm text-foreground disabled:opacity-40">Preview</button>
        <button type="button" disabled={!rows || busy || !result?.dryRun || result.updated === 0} onClick={() => run(false)} className="min-h-11 rounded-full bg-gold px-3.5 text-sm text-primary-foreground disabled:opacity-40">Apply</button>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      {result ? (
        <div className="mt-3 text-sm text-foreground">
          <p>{result.dryRun ? "Preview" : "Applied"}: {result.updated} to update · {result.unchanged} unchanged · {result.rejected.length} rejected</p>
          {result.rejected.length ? <ul className="mt-2 list-disc ps-5 text-muted-foreground">{result.rejected.slice(0, 50).map((r) => <li key={`${r.line}-${r.id}`}>Line {r.line}: {r.reason}</li>)}</ul> : null}
          {result.preview.length ? (
            <ul className="mt-2 max-h-64 overflow-auto text-muted-foreground">
              {result.preview.slice(0, 200).map((p) => <li key={p.id}><span dir="auto">{p.ar}</span>: “{p.from}” → “{p.to}”</li>)}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
