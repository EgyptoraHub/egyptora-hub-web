import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { MilError, MilLoading, MilShell } from "@/components/military/MilitaryUI";
import { CultureNotice } from "@/components/culture/CultureUI";
import { innerWrap, cardGrid, PhotoCard } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { itemCount, loadSectionCounts, SECTIONS } from "@/lib/culture";
import { MARKETPLACE_CARDS } from "@/data/marketplace-index";

const title = "Live Like an Egyptian — Cuisine, Traditional Fashion & Jewelry | Egyptora Hub";
const description = "Egyptian cuisine, traditional dress and jewellery from across the governorates — editorial guides linked to the encyclopedia and verified makers.";

export const Route = createFileRoute("/live-like-an-egyptian")({
  loader: () => loadSectionCounts(),
  head: () => simpleHead("/live-like-an-egyptian", title, description, SITE.url),
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  component: Hub,
});


function Hub() {
  const counts = Route.useLoaderData();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState(SECTIONS[0]!.url);

  return (
    <MilShell
      crumbs={[{ label: t("Live Like an Egyptian") }]}
      title={<>{t("Live Like an Egyptian")} <span lang="ar" dir="rtl" className="block text-lg font-normal opacity-85 lg:text-2xl">عِش كأنك مصري</span></>}
      subtitle={t("Food, dress and adornment across Egypt's regions — the everyday culture behind the monuments.")}
    >
      <main className={cn(innerWrap, "grid gap-10 py-8")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/live-like-an-egyptian/$section", params: { section: target }, search: q.trim() ? { q: q.trim() } : {} });
          }}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3"
        >
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as typeof target)}
            aria-label={t("Section")}
            className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm"
          >
            {SECTIONS.map((s) => <option key={s.url} value={s.url}>{lang === "ar" ? s.titleAr : t(s.titleEn)}</option>)}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            dir="auto"
            placeholder={t("Search by name, region, ingredient or material")}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm"
          />
          <button type="submit" className="min-h-11 rounded-full bg-navy px-5 text-sm font-semibold text-primary-foreground">{t("Search")}</button>
        </form>

        <section className="grid gap-4">
          <h2 className="font-display text-xl font-bold text-navy">{t("Explore the collections")}</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {SECTIONS.map((s) => {
              const n = counts[s.db] ?? 0;
              return (
                <li key={s.url} className="flex">
                  <Link
                    to="/live-like-an-egyptian/$section"
                    params={{ section: s.url }}
                    className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-gold-line"
                  >
                    <img src={s.encyclopedia.img} alt="" loading="lazy" className="h-36 w-full object-cover" />
                    <div className="grid gap-1 p-4">
                      <p className="text-base font-semibold text-navy">{t(s.titleEn)}</p>
                      <p lang="ar" dir="rtl" className="text-sm text-text-body">{s.titleAr}</p>
                      <p className="text-xs text-text-body">{t(s.descEn)}</p>
                      {n > 0 && <p className="text-xs font-semibold text-navy">{itemCount(n, lang)}</p>}
                      <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy">
                        {t("Explore")} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="grid gap-4">
          <h2 className="font-display text-xl font-bold text-navy">{t("From the Visual Encyclopedia")}</h2>
          <div className={cardGrid}>
            {SECTIONS.map((s) => (
              <PhotoCard key={s.url} c={{ title: s.encyclopedia.label, desc: "Read the encyclopedia chapter", img: s.encyclopedia.img, to: `/encyclopedia#${s.encyclopedia.anchor}` }} />
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="font-display text-xl font-bold text-navy">{t("Made in Egypt Marketplace")}</h2>
          <div className={cardGrid}>
            {MARKETPLACE_CARDS.map((c) => <PhotoCard key={c.to} c={c} />)}
          </div>
        </section>

        <CultureNotice />
      </main>
    </MilShell>
  );
}
