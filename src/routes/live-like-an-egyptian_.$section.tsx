import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SITE } from "@/config/site";
import { Chip, MilError, MilLoading, MilShell } from "@/components/military/MilitaryUI";
import { ByGovernorate, CultureCard, CultureNotFound, CultureNotice, cultureCrumbs } from "@/components/culture/CultureUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { categoryLabel, itemCount, loadSection, matchesQuery, sectionByUrl, sectionSearchSchema, type SectionSearch } from "@/lib/culture";

const PAGE = 24;

export const Route = createFileRoute("/live-like-an-egyptian_/$section")({
  validateSearch: (s) => sectionSearchSchema.parse(s),
  loader: async ({ params }) => {
    const cfg = sectionByUrl(params.section);
    if (!cfg) throw notFound();
    return { cfg: { url: cfg.url }, ...(await loadSection(cfg)) };
  },
  head: ({ params }) => {
    const cfg = sectionByUrl(params.section);
    if (!cfg) return { meta: [{ title: "Not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    const title = `${cfg.titleEn} — Live Like an Egyptian | Egyptora Hub`;
    const description = `${cfg.descEn} Editorial guide by governorate.`;
    const url = `${SITE.url}/live-like-an-egyptian/${cfg.url}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  notFoundComponent: () => <CultureNotFound />,
  component: SectionPage,
});

function SectionPage() {
  const { items, governorates } = Route.useLoaderData();
  const { section } = Route.useParams();
  const cfg = sectionByUrl(section)!;
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const set = (next: Partial<SectionSearch>) =>
    void navigate({
      to: ".",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- "." reducer
      search: ((p: SectionSearch) => ({ ...p, page: undefined, ...next })) as any,
      replace: true,
    });

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

  const govById = useMemo(() => new Map(governorates.map((g) => [g.id, g])), [governorates]);
  const govName = (id: string | null) => {
    const g = id ? govById.get(id) : undefined;
    return g ? (lang === "ar" ? g.name_ar : t(g.name)) : undefined;
  };
  const presentCats = cfg.categories.filter((c) => items.some((i) => i.category === c));
  const extraCats = Array.from(new Set(items.map((i) => i.category).filter((c): c is string => !!c && !cfg.categories.includes(c))));
  const cats = [...presentCats, ...extraCats];
  const presentGovs = governorates.filter((g) => items.some((i) => i.governorate_id === g.id));
  const govFilterId = search.gov ? governorates.find((g) => g.slug === search.gov)?.id : undefined;

  const filtered = items.filter(
    (i) => (!search.cat || i.category === search.cat) && (!search.gov || i.governorate_id === govFilterId) && matchesQuery(i, search.q),
  );
  const featured = !search.q && !search.cat && !search.gov ? items.filter((i) => i.is_featured).slice(0, 3) : [];
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const page = Math.min(search.page ?? 1, pages);
  const shown = filtered.slice((page - 1) * PAGE, page * PAGE);

  const fallbackLinks = (
    <span className="flex flex-wrap gap-x-4 gap-y-2">
      <Link to="/encyclopedia" hash={cfg.encyclopedia.anchor} className="font-semibold text-navy underline">
        {t("See the encyclopedia chapter")} ›
      </Link>
      {cfg.marketplace && (
        <Link to={cfg.marketplace.to} className="font-semibold text-navy underline">
          {t(cfg.marketplace.label)} ›
        </Link>
      )}
    </span>
  );

  return (
    <MilShell
      crumbs={cultureCrumbs(t, [{ label: lang === "ar" ? cfg.titleAr : t(cfg.titleEn) }])}
      title={<>{t(cfg.titleEn)} <span lang="ar" dir="rtl" className="ms-3 inline-block text-lg font-normal opacity-85 lg:text-2xl">{cfg.titleAr}</span></>}
      subtitle={t(cfg.descEn)}
      search={{ value: q, onChange: setQ, placeholder: t("Search by name, region, ingredient or material") }}
    >
      <main className={cn(innerWrap, "grid gap-8 py-8")}>
        {items.length > 0 && (
          <div className="grid gap-4">
            {cats.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Chip active={!search.cat} onClick={() => set({ cat: undefined })}>{t("All")}</Chip>
                {cats.map((c) => (
                  <Chip key={c} active={search.cat === c} onClick={() => set({ cat: search.cat === c ? undefined : c })}>
                    {t(categoryLabel(c))}
                  </Chip>
                ))}
              </div>
            )}
            {presentGovs.length > 0 && (
              <label className="grid max-w-xs gap-1 text-xs font-semibold text-navy">
                {t("Governorate")}
                <select
                  value={search.gov ?? ""}
                  onChange={(e) => set({ gov: e.target.value || undefined })}
                  className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground"
                >
                  <option value="">{t("All")}</option>
                  {presentGovs.map((g) => <option key={g.id} value={g.slug}>{lang === "ar" ? g.name_ar : t(g.name)}</option>)}
                </select>
              </label>
            )}
          </div>
        )}

        {featured.length > 0 && (
          <section className="grid gap-3">
            <h2 className="font-display text-lg font-bold text-navy">{t("Featured")}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((r) => <CultureCard key={r.id} r={r} govName={govName(r.governorate_id)} />)}
            </ul>
          </section>
        )}

        {items.length === 0 ? (
          <div className="grid gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-text-body">
            <p>{t("This collection is being compiled. In the meantime see the encyclopedia chapter ›")}</p>
            {fallbackLinks}
          </div>
        ) : (
          <section className="grid gap-3">
            <p className="text-sm font-semibold text-navy" aria-live="polite">{itemCount(filtered.length, lang)}</p>
            {shown.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card p-6 text-sm text-text-body">
                {t("Nothing matches these filters. Try removing a filter or searching another name.")}
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((r) => <CultureCard key={r.id} r={r} govName={govName(r.governorate_id)} />)}
              </ul>
            )}
            {pages > 1 && (
              <div className="flex items-center gap-3">
                <button type="button" disabled={page <= 1} onClick={() => set({ page: page > 2 ? page - 1 : undefined })} className="min-h-11 rounded-full border border-border px-4 text-sm text-navy disabled:opacity-40">
                  {t("Previous")}
                </button>
                <span className="text-sm text-text-body">{t("Page")} {page} / {pages}</span>
                <button type="button" disabled={page >= pages} onClick={() => set({ page: page + 1 })} className="min-h-11 rounded-full border border-border px-4 text-sm text-navy disabled:opacity-40">
                  {t("Next")}
                </button>
              </div>
            )}
            <p className="text-sm">{fallbackLinks}</p>
          </section>
        )}

        <CultureNotice />
        <ByGovernorate cfg={cfg} governorates={governorates} />
      </main>
    </MilShell>
  );
}
