import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { List, Map as MapIcon, MapPin } from "lucide-react";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import {
  ActiveChips, MilError, MilLoading, MilShell, RecordCard, RecordFilters, RegisterNotice, SubNav, militaryCrumbs, useBi, useRecordsNav,
} from "@/components/military/MilitaryUI";
import { TYPE_COLOR } from "@/components/military/mapColors";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { BASE, RECORD_TYPES, TYPE_LABEL, applyRecordFilters, loadMilitary, recordCount, recordsSearchSchema } from "@/lib/military";

const MilitaryMap = lazy(() => import("@/components/military/MilitaryMap"));

const title = "Map of Egypt's Military History | Egyptora Hub";
const description = "Interactive map of published military history records that have verified coordinates.";

export const Route = createFileRoute("/egypt-through-time_/military-history_/map")({
  validateSearch: (s) => recordsSearchSchema.parse(s),
  loader: () => loadMilitary(),
  head: () => simpleHead("/egypt-through-time/military-history/map", title, description, SITE.url),
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  component: MapPage,
});

function MapPage() {
  const { eras, records } = Route.useLoaderData();
  const search = Route.useSearch();
  const set = useRecordsNav();
  const { t, lang } = useI18n();
  const bi = useBi();
  const [view, setView] = useState<"map" | "list">("map");
  const filtered = applyRecordFilters(records, eras, search);
  const located = filtered.filter((r) => r.lat != null && r.lng != null);
  const anyCoords = records.some((r) => r.lat != null && r.lng != null);
  const points = useMemo(
    () => located.map((r) => ({ id: r.id, lat: r.lat!, lng: r.lng!, label: bi(r, "title"), type: r.record_type, href: `${BASE}/records/${r.slug}` })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [located.map((r) => r.id).join(","), lang],
  );
  const legendTypes = RECORD_TYPES.filter((ty) => located.some((r) => r.record_type === ty));

  return (
    <MilShell crumbs={militaryCrumbs(t, [{ label: t("Map") }])} title={t("Map of events")}>
      <SubNav />
      <main className={cn(innerWrap, "grid grid-cols-[minmax(0,1fr)] gap-8 py-8 lg:grid-cols-[280px_minmax(0,1fr)]")}>
        <aside className="grid content-start gap-4">
          <RecordFilters eras={eras} records={records} search={search} set={set} showCentury />
        </aside>
        <div className="grid content-start gap-4">
          <ActiveChips eras={eras} search={search} set={set} />
          {!anyCoords ? (
            <div className="grid justify-items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
              <MapPin className="size-10 text-navy" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold text-navy">{t("Coordinates are being added")}</h2>
              <p className="max-w-md text-sm text-text-body">
                {t("Locations are only shown once they have been checked. No record has map coordinates yet; pins will appear here as they are added.")}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-navy" aria-live="polite">
                  {recordCount(located.length, lang)} {t("on the map")}
                </p>
                <div className="flex gap-1 lg:hidden" role="group" aria-label={t("View")}>
                  {(["map", "list"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={view === v}
                      onClick={() => setView(v)}
                      className={cn("flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium", view === v ? "border-navy bg-navy text-primary-foreground" : "border-border text-navy")}
                    >
                      {v === "map" ? <MapIcon className="size-4" aria-hidden="true" /> : <List className="size-4" aria-hidden="true" />}
                      {v === "map" ? t("Map") : t("List")}
                    </button>
                  ))}
                </div>
              </div>
              <div className={cn(view === "list" && "hidden lg:block")}>
                <ClientOnly fallback={<div className="h-[480px] rounded-2xl bg-muted" />}>
                  <Suspense fallback={<div className="h-[480px] rounded-2xl bg-muted" />}>
                    <MilitaryMap points={points} />
                  </Suspense>
                </ClientOnly>
                {legendTypes.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-3 text-xs text-navy" aria-label={t("Legend")}>
                    {legendTypes.map((ty) => (
                      <li key={ty} className="flex items-center gap-1.5">
                        <span className="size-3 rounded-full" style={{ background: TYPE_COLOR[ty] }} aria-hidden="true" />
                        {t(TYPE_LABEL[ty])}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ul className={cn("grid gap-3 sm:grid-cols-2", view === "map" && "hidden lg:grid")}>
                {located.map((r) => <RecordCard key={r.id} r={r} era={eras.find((e) => e.id === r.era_id)} />)}
              </ul>
            </>
          )}
          <RegisterNotice />
        </div>
      </main>
    </MilShell>
  );
}
