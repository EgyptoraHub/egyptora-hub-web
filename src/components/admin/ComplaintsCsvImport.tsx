import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { importComplaintsCsv, type ComplaintsImportResult } from "@/lib/complaints-import.functions";
import type { ComplaintsTable } from "@/lib/complaints-validation";
import { useI18n } from "@/i18n";
export function ComplaintsCsvImport({table,onDone,onDenied}:{table:ComplaintsTable;onDone:()=>void;onDenied:()=>void}) {
 const {t}=useI18n();const run=useServerFn(importComplaintsCsv);const [csv,setCsv]=useState("");const [preview,setPreview]=useState("");const [busy,setBusy]=useState(false);const [result,setResult]=useState<ComplaintsImportResult|null>(null);
 const reset=(value:string)=>{setCsv(value);setPreview("");setResult(null);};
 const go=async(dryRun:boolean)=>{setBusy(true);try{const r=await run({data:{table,csv,dryRun}});setResult(r);if(!r.authorized)return onDenied();setPreview(dryRun&&r.ok?csv:"");if(!dryRun&&r.ok)onDone();}catch{setPreview("");setResult({authorized:true,ok:false,rows:[],committed:0,error:"Import failed."});}finally{setBusy(false);}};
 return <div className="mt-4 grid gap-3"><input type="file" accept=".csv,text/csv" aria-label={t("Import CSV")} onChange={async e=>{const file=e.target.files?.[0];if(file)reset(await file.text());}}/><textarea dir="auto" aria-label={t("Paste CSV")} rows={6} maxLength={3_000_000} value={csv} onChange={e=>reset(e.target.value)} className="w-full rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground"/><div className="flex gap-3"><Button variant="outline" disabled={busy||!csv.trim()} onClick={()=>void go(true)}>{t("Preview (dry run)")}</Button><Button variant="gold" disabled={busy||!preview||preview!==csv} onClick={()=>void go(false)}>{t("Import now")}</Button></div>{result?<div role="status" className="text-sm text-foreground"><p>{result.error?t(result.error):""}</p><p>{t("Imported")}: {result.committed}</p>{result.rows.map(r=><p key={r.line}>{r.line}: {t(r.action)}{r.error?` — ${t(r.error)}`:""}</p>)}</div>:null}</div>;
}
