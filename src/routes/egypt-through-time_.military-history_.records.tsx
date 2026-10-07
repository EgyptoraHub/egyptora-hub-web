import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import {
  ActiveChips, MilError, MilLoading, MilShell, RecordCard, RecordFilters, RegisterNotice, SubNav, militaryCrumbs, useRecordsNav,
} from "@/components/military/MilitaryUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { applyRecordFilters, loadMilitary, recordCount, recordsSearchSchema } from "@/lib/military";

const PAGE = 24;
const title = "Military History Records — Search & Filter | Egyptora Hub";
const description = "Search and filter the EGYPTORA military history register by era, record type and century.";

export const Route = createFileRoute("/egypt-through-time_/military-history_/records")({
  validateSearch: (s) => recordsSearchSchema.parse(s),
  loader: () => loadMilitary(),
  head: () => simpleHead("/egypt-through-time/military-history/records", title, description, SITE.url),
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  component: Records,
});

function Records() {
  const { eras, records } = Route.useLoaderData();
  const search = Route.useSearch();
  const set = useRecordsNav();
  const { t, lang } = useI18n();
  const [q, setQ] = useState(search.q ?? "");
  useEffect(() => setQ(search.q ?? ""), [search.q]);
  useEffect(() => {
    const id = setTimeout(() => {
      const v = q.trim() || undefined;
      if (v !== (search.q || undefined)) set({ q: v });
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const eraById = useMemo(() => new Map(eras.map((e) => [e.id, e])), [eras]);
  const filtered = applyRecordFilters(records, eras, search);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const page = Math.min(search.page ?? 1, pages);
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE);

  return (
    <MilShell
      crumbs={militaryCrumbs(t, [{ label: t("Records") }])}
      title={t("Records")}
      subtitle={`${recordCount(records.length, lang)} ${t("in the EGYPTORA register")}`}
      search={{ value: q, onChange: setQ, placeholder: t("Search by title, place, leadership or opposing side") }}
    >
      <SubNav />
      <main className={cn(innerWrap, "grid gap-8 py-8 lg:grid-cols-[280px_minmax(0,1fr)]")}>
        <aside className="grid content-start gap-4">
          <RecordFilters eras={eras} records={records} search={search} set={set} />
        </aside>
        <div className="grid content-start gap-4">
          <ActiveChips eras={eras} search={search} set={set} />
          <p className="text-sm font-semibold text-navy" aria-live="polite">{recordCount(filtered.length, lang)}</p>
          {shown.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-6 text-sm text-text-body">
              {t("No records match these filters. Try removing a filter or searching another name.")}
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((r) => <RecordCard key={r.id} r={r} era={eraById.get(r.era_id)} />)}
            </ul>
          )}
          {pages > 1 && (
            <div className="flex items-center gap-3">
              <Link
                to="."
                search={(p: typeof search) => ({ ...p, page: page > 2 ? page - 1 : undefined })}
                disabled={page <= 1}
                className="min-h-11 rounded-full border border-border px-4 py-2.5 text-sm text-navy aria-disabled:opacity-40"
              >
                {t("Previous")}
              </Link>
              <span className="text-sm text-text-body">{t("Page")} {page} / {pages}</span>
              <Link
                to="."
                search={(p: typeof search) => ({ ...p, page: page + 1 })}
                disabled={page >= pages}
                className="min-h-11 rounded-full border border-border px-4 py-2.5 text-sm text-navy aria-disabled:opacity-40"
              >
                {t("Next")}
              </Link>
            </div>
          )}
          <RegisterNotice />
        </div>
      </main>
    </MilShell>
  );
}
