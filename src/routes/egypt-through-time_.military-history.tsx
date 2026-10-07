import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import {
  Chip, EraStrip, MilError, MilLoading, MilShell, RecordCard, RegisterNotice, SubNav, militaryCrumbs, useBi,
} from "@/components/military/MilitaryUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { PUBLIC_TYPES, TYPE_LABEL, byRegister, loadMilitary, matchesQuery, recordCount } from "@/lib/military";

const title = "Egypt's Military History — Editorial Register | Egyptora Hub";
const description =
  "Battles, campaigns and operations in Egypt's history, organised by era. An editorial register under academic review.";

export const Route = createFileRoute("/egypt-through-time_/military-history")({
  loader: () => loadMilitary(),
  head: () => simpleHead("/egypt-through-time/military-history", title, description, SITE.url),
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  component: Landing,
});

function Landing() {
  const { eras, records, figures, sources } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const bi = useBi();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of records) m.set(r.era_id, (m.get(r.era_id) ?? 0) + 1);
    return m;
  }, [records]);
  const eraById = useMemo(() => new Map(eras.map((e) => [e.id, e])), [eras]);
  const hits = q.trim() ? records.filter((r) => matchesQuery(r, q)) : [];
  const featured = records.filter((r) => r.is_featured);
  const latest = [...records].sort((a, b) => b.created_at.localeCompare(a.created_at) || byRegister(a, b)).slice(0, 4);
  const types = PUBLIC_TYPES.filter((ty) => records.some((r) => r.record_type === ty));

  return (
    <MilShell
      crumbs={militaryCrumbs(t)}
      title={t("Egypt's Military History")}
      subtitle={`${recordCount(records.length, lang)} ${t("in the EGYPTORA register")}`}
      search={{ value: q, onChange: setQ, placeholder: t("Search by title, place, leadership or opposing side") }}
    >
      <SubNav />
      <main className={cn(innerWrap, "grid grid-cols-[minmax(0,1fr)] gap-10 py-8")}>
        {q.trim() && (
          <section aria-labelledby="hits">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="hits" className="font-display text-xl font-bold text-navy">{t("Search results")}</h2>
              <Link to="/egypt-through-time/military-history/records" search={{ q }} className="text-sm font-semibold text-navy underline">
                {t("Open in the full list")}
              </Link>
            </div>
            <p className="mt-1 text-sm text-text-body">{recordCount(hits.length, lang)}</p>
            {hits.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm text-text-body">{t("No records match your search.")}</p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {hits.slice(0, 9).map((r) => <RecordCard key={r.id} r={r} era={eraById.get(r.era_id)} />)}
              </ul>
            )}
          </section>
        )}

        <RegisterNotice />

        <section aria-labelledby="eras">
          <h2 id="eras" className="font-display text-xl font-bold text-navy">{t("Eras")}</h2>
          <div className="mt-4"><EraStrip eras={eras} counts={counts} /></div>
        </section>

        {featured.length > 0 && (
          <section aria-labelledby="featured">
            <h2 id="featured" className="font-display text-xl font-bold text-navy">{t("Featured records")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((r) => <RecordCard key={r.id} r={r} era={eraById.get(r.era_id)} />)}
            </ul>
          </section>
        )}

        {types.length > 0 && (
          <section aria-labelledby="types">
            <h2 id="types" className="font-display text-xl font-bold text-navy">{t("Browse by record type")}</h2>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {types.map((ty) => (
                <Chip key={ty} active={false} onClick={() => void navigate({ to: "/egypt-through-time/military-history/records", search: { type: ty } })}>
                  {t(TYPE_LABEL[ty])} · {records.filter((r) => r.record_type === ty).length.toLocaleString(lang === "ar" ? "ar-EG" : "en")}
                </Chip>
              ))}
            </div>
          </section>
        )}

        {latest.length > 0 && (
          <section aria-labelledby="latest">
            <h2 id="latest" className="font-display text-xl font-bold text-navy">{t("Latest added")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((r) => <RecordCard key={r.id} r={r} era={eraById.get(r.era_id)} />)}
            </ul>
          </section>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {figures.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold text-navy">{t("Historical figures")}</h2>
              <p className="mt-1 text-sm text-text-body">{figures.slice(0, 5).map((f) => bi(f, "name")).join(" · ")}</p>
              <Link to="/egypt-through-time/military-history/figures" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline">
                {t("All figures")}
              </Link>
            </section>
          )}
          {sources.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold text-navy">{t("Library & references")}</h2>
              <p className="mt-1 text-sm text-text-body">{sources.slice(0, 3).map((s) => s.title).join(" · ")}</p>
              <Link to="/egypt-through-time/military-history/library" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-navy underline">
                {t("Open the library")}
              </Link>
            </section>
          )}
          <section className="rounded-2xl border border-border bg-bg-alt p-6 md:col-span-2">
            <h2 className="font-display text-lg font-bold text-navy">{t("About this register")}</h2>
            <p className="mt-2 text-sm text-text-body">
              {t("This register is an editorial skeleton organised by era. Item-level academic verification is a later phase: records are published as “Under academic review” until checked against sources. Outcomes are only stated where they are not disputed; where historians differ, that disagreement is shown. Counts on this page are calculated from the published records only.")}
            </p>
          </section>
        </div>
      </main>
    </MilShell>
  );
}
