import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SITE } from "@/config/site";
import { MilError, MilLoading, MilShell, useBi } from "@/components/military/MilitaryUI";
import {
  CultureBadge, CultureCard, CultureName, CultureNotFound, CultureNotice, CultureReportButton, cultureCrumbs,
} from "@/components/culture/CultureUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { categoryLabel, itemNameEn, loadItem, sectionByUrl, videoEmbed, type CultureMedia } from "@/lib/culture";

export const Route = createFileRoute("/live-like-an-egyptian_/$section_/$slug")({
  loader: async ({ params }) => {
    const cfg = sectionByUrl(params.section);
    if (!cfg) throw notFound();
    const data = await loadItem(cfg, params.slug);
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Unavailable | Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    const r = loaderData.item;
    const cfg = sectionByUrl(params.section)!;
    const name = itemNameEn(r);
    const title = `${name} — ${cfg.titleEn} | Egyptora Hub`;
    const description = (r.summary_en || r.summary_ar || `${name}: ${cfg.descEn}`).slice(0, 158);
    const url = `${SITE.url}/live-like-an-egyptian/${params.section}/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  notFoundComponent: () => <CultureNotFound />,
  component: Detail,
});

const ORIGIN_LABEL: Record<CultureMedia["origin_type"], string> = {
  photo: "Photograph",
  archival: "Archival image",
  illustration: "Illustration",
  editorial_reconstruction: "Modern editorial reconstruction",
};

function Detail() {
  const { item: r, media, related, governorates } = Route.useLoaderData();
  const { section } = Route.useParams();
  const cfg = sectionByUrl(section)!;
  const { t, lang } = useI18n();
  const bi = useBi();
  const gov = governorates.find((g) => g.id === r.governorate_id);
  const govLabel = gov ? (lang === "ar" ? gov.name_ar : t(gov.name)) : "";
  const embed = videoEmbed(r.video_url);
  const material = bi(r, cfg.materialField);

  const facts: { k: string; v: string; gov?: boolean }[] = [
    { k: t("Category"), v: r.category ? t(categoryLabel(r.category)) : "" },
    { k: t("Region"), v: bi(r, "region") },
    { k: t("Governorate"), v: govLabel, gov: true },
    { k: t("Occasion"), v: bi(r, "occasion") },
    { k: t(cfg.materialField === "ingredients" ? "Ingredients" : "Materials"), v: material },
  ].filter((f) => f.v.trim() !== "");

  const marketTo = r.marketplace_collection === "wear-egypt" ? "/marketplace/wear-egypt" : r.marketplace_collection === "handmade-crafts" ? "/marketplace/handmade-crafts" : null;

  return (
    <MilShell
      crumbs={cultureCrumbs(t, [
        { label: lang === "ar" ? cfg.titleAr : t(cfg.titleEn), to: "/live-like-an-egyptian/$section", params: { section: cfg.url } },
        { label: (lang === "ar" ? r.name_ar || r.name_en : r.name_en || r.name_ar) ?? "" },
      ])}
      title={
        <span className="inline-flex flex-col gap-1">
          <CultureName r={r} labelClassName="text-primary-foreground/85" />
          {lang !== "ar" && r.name_en && r.name_ar && <span lang="ar" dir="rtl" className="text-lg font-normal opacity-85">{r.name_ar}</span>}
        </span>
      }
    >
      <main className={cn(innerWrap, "grid grid-cols-[minmax(0,1fr)] gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]")}>
        <article className="grid content-start gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <CultureBadge status={r.review_status} verifiedAt={r.last_verified_at} />
          </div>

          {facts.length > 0 && (
            <dl className="grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-[200px_minmax(0,1fr)]">
              {facts.map((f) => (
                <div key={f.k} className="contents">
                  <dt className="border-b border-border bg-bg-alt px-4 py-3 text-xs font-semibold text-navy">{f.k}</dt>
                  <dd className="border-b border-border px-4 py-3 text-sm text-foreground" dir="auto">
                    {f.gov && gov ? (
                      <Link to="/governorates/$id" params={{ id: gov.slug }} className="font-semibold text-navy underline">{f.v}</Link>
                    ) : f.v}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {[["summary", "Summary"], ["story", "The story"], ["origin_note", "Origins"]].map(([key, label]) =>
            bi(r, key!) ? (
              <section key={key}>
                <h2 className="font-display text-lg font-bold text-navy">{t(label!)}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-body" dir="auto">{bi(r, key!)}</p>
              </section>
            ) : null,
          )}

          {media.filter((m) => m.kind === "image").length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Images")}</h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {media.filter((m) => m.kind === "image").map((m) => (
                  <li key={m.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <img src={m.url} alt={bi(m, "caption")} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <div className="grid gap-1 p-3 text-xs text-text-body">
                      {bi(m, "caption") && <p dir="auto">{bi(m, "caption")}</p>}
                      <p dir="auto">{[m.institution, m.rights_statement, t(ORIGIN_LABEL[m.origin_type])].filter(Boolean).join(" · ")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {embed && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Video")}</h2>
              <div className="mt-3 aspect-video overflow-hidden rounded-2xl border border-border">
                <iframe src={embed} title={itemNameEn(r)} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="size-full" />
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-navy">{t("Related")}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {related.map((x) => <CultureCard key={x.id} r={x} />)}
              </ul>
            </section>
          )}
        </article>

        <aside className="grid content-start gap-4">
          {marketTo && (
            <div className="grid gap-2 rounded-2xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold text-navy">{t("Where to find it")}</h2>
              <Link to={marketTo} className="text-sm font-semibold text-navy underline">
                {t(marketTo === "/marketplace/wear-egypt" ? "Wear Egypt marketplace" : "Handmade Crafts marketplace")} ›
              </Link>
            </div>
          )}
          <CultureNotice />
          <CultureReportButton itemId={r.id} label={bi(r, "name")} />
          <Link to="/encyclopedia" hash={cfg.encyclopedia.anchor} className="min-h-11 rounded-full border border-border px-4 py-3 text-center text-sm font-semibold text-navy">
            {t("See the encyclopedia chapter")}
          </Link>
        </aside>
      </main>
    </MilShell>
  );
}
