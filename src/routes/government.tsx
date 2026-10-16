import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { AdminChecking, AdminDenied, adminHead } from "@/components/admin/AdminStates";
import {
  getGovernmentDashboard,
  GOVERNANCE_STATUSES,
  GOVERNANCE_TABLE_LABEL,
  type GovernanceRow,
  type GovernanceSummaryRow,
  type GovernanceTable,
} from "@/lib/government.functions";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/government")({
  ssr: false,
  head: () =>
    adminHead(`Government dashboard — ${SITE.name}`, "Read-only governance oversight dashboard."),
  component: GovernmentPage,
});

const STATUS_LABEL: Record<string, string> = {
  PUBLIC_CONTENT: "Public content",
  PENDING_GOVERNMENT_LINK: "Pending government link",
  LIVE: "Live",
};

function GovernmentPage() {
  const { t } = useI18n();
  const load = useServerFn(getGovernmentDashboard);
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [summary, setSummary] = useState<GovernanceSummaryRow[]>([]);
  const [rows, setRows] = useState<GovernanceRow[]>([]);
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_GOVERNMENT_LINK");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setState("denied");
        return;
      }
      const result = await load({ data: {} as never });
      if (!active) return;
      if (!result.authorized) {
        setState("denied");
        return;
      }
      setSummary(result.summary);
      setRows(result.pending);
      setState("ready");
    })().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [load]);

  const totals = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const row of summary) {
      for (const [status, count] of Object.entries(row.counts)) {
        acc[status] = (acc[status] ?? 0) + count;
      }
    }
    return acc;
  }, [summary]);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (tableFilter === "all" || r.table === tableFilter) &&
          (statusFilter === "all" || r.status === statusFilter),
      ),
    [rows, tableFilter, statusFilter],
  );

  if (state === "loading") return <AdminChecking />;
  if (state === "denied") return <AdminDenied />;

  return (
    <div className="min-h-screen bg-background px-5 py-14">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-2xs font-semibold eyebrow text-gold-text">
          {SITE.name} · {t("Government dashboard")}
        </p>
        <h1 className="mt-3 font-display text-3xl text-foreground">{t("Governance overview")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Read-only view of published content and entries awaiting an official link.")}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {GOVERNANCE_STATUSES.map((status) => (
            <div key={status} className="rounded-2xl border border-border bg-card/40 px-5 py-4">
              <p className="text-xs text-muted-foreground">{t(STATUS_LABEL[status] ?? status)}</p>
              <p className="mt-1 font-display text-2xl text-foreground">{totals[status] ?? 0}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-display text-xl text-foreground">{t("By content set")}</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">{t("Content set")}</th>
                {GOVERNANCE_STATUSES.map((status) => (
                  <th key={status} className="px-4 py-3 text-end">
                    {t(STATUS_LABEL[status] ?? status)}
                  </th>
                ))}
                <th className="px-4 py-3 text-end">{t("Total")}</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => (
                <tr key={row.table} className="border-t border-border/60">
                  <td className="px-4 py-3 text-foreground">
                    {t(GOVERNANCE_TABLE_LABEL[row.table as GovernanceTable] ?? row.table)}
                  </td>
                  {GOVERNANCE_STATUSES.map((status) => (
                    <td key={status} className="px-4 py-3 text-end text-muted-foreground">
                      {row.counts[status] ?? 0}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-end text-foreground">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 font-display text-xl text-foreground">
          {t("Entries pending a government link")}
        </h2>

        <div className="mt-3 flex flex-wrap gap-3">
          <label className="text-xs text-muted-foreground">
            <span className="me-2">{t("Content set")}</span>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">{t("All")}</option>
              {summary.map((row) => (
                <option key={row.table} value={row.table}>
                  {t(GOVERNANCE_TABLE_LABEL[row.table as GovernanceTable] ?? row.table)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            <span className="me-2">{t("Status")}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">{t("All")}</option>
              <option value="PENDING_GOVERNMENT_LINK">{t("Pending government link")}</option>
            </select>
          </label>
        </div>

        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card/40 px-5 py-6 text-sm text-muted-foreground">
              {t("Nothing is awaiting an official link right now.")}
            </p>
          ) : (
            filtered.map((row) => (
              <div
                key={`${row.table}:${row.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/40 px-5 py-4"
              >
                <div>
                  <p className="text-sm text-foreground">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(GOVERNANCE_TABLE_LABEL[row.table as GovernanceTable] ?? row.table)}
                  </p>
                </div>
                {row.href ? (
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-gold-text"
                  >
                    <ExternalLink className="size-3.5" />
                    {t("View public page")}
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">{t("No public page")}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
