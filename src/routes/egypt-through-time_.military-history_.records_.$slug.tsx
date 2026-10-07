import { ClientOnly, createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { SITE } from "@/config/site";
import {
  MilError, MilLoading, MilNotFound, MilShell, RecordCard, RegisterNotice, ReportButton, ReviewBadge, SubNav, TypeBadge,
  militaryCrumbs, useBi,
} from "@/components/military/MilitaryUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { loadMilitary, loadRecordExtras, outcomeLabel, regNo, type MilMedia } from "@/lib/military";

const MilitaryMap = lazy(() => import("@/components/military/MilitaryMap"));

export const Route = createFileRoute("/egypt-through-time_/military-history_/records_/$slug")({
  loader: async ({ params }) => {
    const data = await loadMilitary();
    const record = data.records.find((r) => r.slug === params.slug);
    if (!record) throw notFound();
    const extras = await loadRecordExtras(record.id);
    return { ...data, record, extras };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Record not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    const r = loaderData.record;
    const title = `${r.title_en} (#${regNo(r.register_no)}) — Egypt's Military History | Egyptora Hub`;
    const description = (r.note_en ?? `${r.title_en}, ${r.date_label_en ?? ""}.`).slice(0, 158);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE.url}/egypt-through-time/military-history/records/${params.slug}` },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  notFoundComponent: () => <MilNotFound />,
  component: Detail,
});

const ORIGIN_LABEL: Record<MilMedia["origin_type"], string> = {
  original_artifact: "Original artifact",
  archival_photo: "Archival photograph",
  historical_artwork: "Historical artwork",
  map: "Map",
  editorial_reconstruction: "Modern editorial reconstruction",
};

function Detail() {
  const { record: r, eras, records, extras } = Route.useLoaderData();
  const { t } = useI18n();
  const bi = useBi();
  const era = eras.find((e) => e.id === r.era_id);
  const out = outcomeLabel(r.outcome);
  const sameEra = records.filter((x) => x.era_id === r.era_id && x.id !== r.id).slice(0, 6);
  const byFigure = records.filter((x) => extras.relatedByFigure.includes(x.id) && !sameEra.some((s) => s.id === x.id)).slice(0, 6);
  const hasCoords = r.lat != null && r.lng != null;

  const facts: [string, string][] = (
    [
      [t("Date"), bi(r, "date_label")],
      [t("Era"), era ? bi(era, "name") : ""],
      [t("Place"), bi(r, "place")],
      [t("Egyptian leadership"), bi(r, "egyptian_leadership")],
      [t("Opposing side / context"), bi(r, "opposing_side")],
      [t("Outcome"), out ? t(out) : ""],
      [t("Also known as"), r.alt_names ?? ""],
    ] as [string, string][]
  ).filter(([, v]) => v.trim() !== "");

  return (
    <MilShell
      crumbs={militaryCrumbs(t, [
        ...(era ? [{ label: bi(era, "name"), to: "/egypt-through-time/military-history/records", search: { era: era.slug } }] : []),
        { label: bi(r, "title") },
      ])}
      title={bi(r, "title")}
    >
      <SubNav />
      <main className={cn(innerWrap, "grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]")}>
        <article className="grid content-start gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-navy px-2 py-0.5 font-mono text-xs font-semibold text-primary-foreground" dir="ltr">
              {t("Register no.")} {regNo(r.register_no)}
            </span>
            <TypeBadge type={r.record_type} />
            <ReviewBadge status={r.review_status} verifiedAt={r.last_verified_at} />
          </div>

          <dl className="grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-[200px_minmax(0,1fr)]">
            {facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="border-b border-border bg-bg-alt px-4 py-3 text-xs font-semibold text-navy">{k}</dt>
                <dd className="border-b border-border px-4 py-3 text-sm text-foreground" dir="auto">{v}</dd>
              </div>
            ))}
          </dl>

          {bi(r, "note") && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Historical note")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-body" dir="auto">{bi(r, "note")}</p>
            </section>
          )}
          {bi(r, "significance") && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Significance")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-body" dir="auto">{bi(r, "significance")}</p>
            </section>
          )}

          {hasCoords && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Location")}</h2>
              <div className="mt-3">
                <ClientOnly fallback={<div className="h-[280px] rounded-2xl bg-muted" />}>
                  <Suspense fallback={<div className="h-[280px] rounded-2xl bg-muted" />}>
                    <MilitaryMap
                      height={280}
                      points={[{ id: r.id, lat: r.lat!, lng: r.lng!, label: bi(r, "title"), type: r.record_type, href: "#" }]}
                    />
                  </Suspense>
                </ClientOnly>
              </div>
            </section>
          )}

          {extras.media.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Images, maps and documents")}</h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {extras.media.map((m) => (
                  <li key={m.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                    {m.kind === "image" || m.kind === "map" ? (
                      <img src={m.url} alt={bi(m, "title") || bi(m, "caption")} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="block p-4 text-sm font-semibold text-navy underline">
                        {bi(m, "title") || m.url}
                      </a>
                    )}
                    <div className="grid gap-1 p-3 text-xs text-text-body">
                      {m.origin_type === "editorial_reconstruction" && (
                        <span className="w-fit rounded-full border border-gold-line bg-gold-soft px-2 py-0.5 font-semibold text-navy">
                          {t("Modern editorial reconstruction")}
                        </span>
                      )}
                      {bi(m, "caption") && <p dir="auto">{bi(m, "caption")}</p>}
                      <p dir="auto">
                        {[m.institution, m.accession_id, m.rights_statement, t(ORIGIN_LABEL[m.origin_type])].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {extras.figures.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Historical figures")}</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {extras.figures.map((f) => (
                  <li key={f.id}>
                    <Link
                      to="/egypt-through-time/military-history/figures/$slug"
                      params={{ slug: f.slug }}
                      className="flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-navy hover:border-gold-line"
                    >
                      {bi(f, "name")}{f.role_label ? ` — ${f.role_label}` : ""}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-display text-lg font-bold text-navy">{t("Sources")}</h2>
            {extras.sources.length === 0 ? (
              <p className="mt-2 text-sm text-text-body">{t("Sources for this record are being compiled as part of the academic review.")}</p>
            ) : (
              <ul className="mt-2 grid gap-2 text-sm text-text-body">
                {extras.sources.map((s) => (
                  <li key={s.id} dir="auto">
                    {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline">{s.title}</a> : <span className="font-semibold text-navy">{s.title}</span>}
                    {[s.author, s.publisher, s.year].filter(Boolean).length > 0 && ` — ${[s.author, s.publisher, s.year].filter(Boolean).join(", ")}`}
                    {s.citation_detail && ` (${s.citation_detail})`}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {(sameEra.length > 0 || byFigure.length > 0) && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Related records")}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {[...sameEra, ...byFigure].map((x) => <RecordCard key={x.id} r={x} era={eras.find((e) => e.id === x.era_id)} />)}
              </ul>
            </section>
          )}
        </article>

        <aside className="grid content-start gap-4">
          <RegisterNotice />
          <ReportButton recordId={r.id} label={`#${regNo(r.register_no)} ${bi(r, "title")}`} />
          {era?.egypt_era_id && (
            <Link to="/encyclopedia" className="min-h-11 rounded-full border border-border px-4 py-3 text-center text-sm font-semibold text-navy">
              {t("Read about this era in the encyclopedia")}
            </Link>
          )}
        </aside>
      </main>
    </MilShell>
  );
}
