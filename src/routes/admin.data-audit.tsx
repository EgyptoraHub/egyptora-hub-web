import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import { getDataAudit, type AuditRow, type DataAudit } from "@/lib/data-audit.functions";

export const Route = createFileRoute("/admin/data-audit")({
  head: () => ({
    meta: [
      { title: "Data audit — Admin | Egyptora Hub" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DataAuditPage,
});

const CSV_HEADER = "table,record id,name,field,value,problem";

function toCsv(rows: AuditRow[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/\n/g, " ")}"`;
  return [CSV_HEADER, ...rows.map((r) => [r.table, r.id, r.name, r.field, r.value, r.problem].map(esc).join(","))].join("\n");
}

function download(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Section({
  title,
  description,
  rows,
  filename,
}: {
  title: string;
  description: string;
  rows: AuditRow[];
  filename: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => download(filename, toCsv(rows))}
          disabled={rows.length === 0}
          className="ms-auto inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold/10 px-3.5 py-1.5 text-sm text-gold transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="size-3.5" />
          Download CSV ({rows.length})
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-gold" /> Nothing found — this section is clean.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pe-3 text-start font-medium">Table</th>
                <th className="py-2 pe-3 text-start font-medium">Name</th>
                <th className="py-2 pe-3 text-start font-medium">Field</th>
                <th className="py-2 pe-3 text-start font-medium">Value</th>
                <th className="py-2 text-start font-medium">Problem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.id}-${r.field}-${i}`} className="border-b border-border/50 align-top">
                  <td className="py-2 pe-3 font-mono text-xs text-muted-foreground">{r.table}</td>
                  <td className="max-w-[220px] py-2 pe-3 text-foreground" dir="auto">{r.name}</td>
                  <td className="py-2 pe-3 font-mono text-xs text-muted-foreground">{r.field}</td>
                  <td className="max-w-[260px] break-all py-2 pe-3 font-mono text-xs text-muted-foreground" dir="ltr">{r.value}</td>
                  <td className="py-2 text-foreground">{r.problem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DataAuditPage() {
  const run = useServerFn(getDataAudit);
  const [data, setData] = useState<DataAudit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await run({ data: {} as never });
        if (active) setData(result);
      } catch {
        if (active) setData({ authorized: false, a: [], b: [], c: [], storeLinks: { play: 0, appStore: 0 }, mediaLinks: [] });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [run]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-16 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Running the audit…
      </div>
    );
  }

  if (!data?.authorized) {
    return <div className="mx-auto max-w-6xl px-5 py-16 text-muted-foreground">Admins only.</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Data audit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only report. Nothing here changes data — download a CSV and send it for review.
        </p>
      </div>

      <Section
        title="A · Source links"
        description="Public source links that are PDFs or not Egyptian websites. App store links are listed separately below."
        rows={data.a}
        filename="audit-a-source-links.csv"
      />
      <p className="text-sm text-muted-foreground">
        Store links (not violations): {data.storeLinks.play} Google Play, {data.storeLinks.appStore} App Store.
        Media &amp; licence links (informational):{" "}
        {data.mediaLinks.map((m) => `${m.table}.${m.field}: ${m.total}`).join(" · ")}
      </p>

      <Section
        title="B · Public-data hygiene"
        description="Public rows missing a source link, a verification date, or a required name field."
        rows={data.b}
        filename="audit-b-public-hygiene.csv"
      />

      <Section
        title="C · Probable duplicates"
        description="Government Directory and culture rows sharing the same name or link. Review before merging — nothing is changed here."
        rows={data.c}
        filename="audit-c-duplicates.csv"
      />
    </div>
  );
}
