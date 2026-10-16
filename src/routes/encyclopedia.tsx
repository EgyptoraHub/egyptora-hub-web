import type { ReactNode } from "react";
import { AiBadge } from "@/components/site/AiBadge";
import { altForSrc, generatedBySrc, isPlaceholderImage } from "@/lib/generated-images";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Crown } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, GoldButton, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import { encChapters, type EncChapter } from "@/data/encyclopedia";
import { SITE, mailto } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRows } from "@/lib/localized-content";

type Era = {
  key: string;
  name: string;
  from_period: string | null;
  to_period: string | null;
  summary: string | null;
  governance_status: GovernanceStatus;
};

type Ruler = {
  id: string;
  name: string;
  dynasty: string | null;
  era: string | null;
  reign: string | null;
  governance_status: GovernanceStatus;
};

const title = "Visual Encyclopedia of Egypt — dress, food, flags, epics & science | Egyptora Hub";
const description =
  "A visual encyclopedia of Egypt: traditional dress in all 27 governorates, the Egyptian table, flags and state symbols, epic battles, ancient provinces, crafts, the genetic map and Egyptian cinema.";

export const Route = createFileRoute("/encyclopedia")({
  loader: async () => {
    // Wrapped in try/catch on purpose: a *thrown* exception from the client (a network
    // failure, a cold Supabase connection) is not caught by only checking `error`, and
    // would crash the whole route to the generic "This page didn't load" error boundary
    // instead of just rendering with an empty list.
    let eras: Era[] = [];
    let rulers: Ruler[] = [];
    try {
      const [erasRes, rulersRes] = await Promise.all([
        supabase
          .from("eras")
          .select("key, name, from_period, to_period, summary, governance_status")
          .order("from_period"),
        supabase
          .from("rulers")
          .select("id, name, dynasty, era, reign, governance_status")
          .order("name"),
      ]);

      if (erasRes.error) {
        console.error("[encyclopedia] failed to load eras:", erasRes.error.message);
      } else {
        eras = (erasRes.data ?? []) as Era[];
      }

      if (rulersRes.error) {
        console.error("[encyclopedia] failed to load rulers:", rulersRes.error.message);
      } else {
        rulers = (rulersRes.data ?? []) as Ruler[];
      }
    } catch (err) {
      console.error("[encyclopedia] unexpected error loading eras/rulers:", err);
    }
    return { eras, rulers };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/encyclopedia` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-banner.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/encyclopedia` }],
  }),
  component: EncyclopediaPage,
});

const heroChapter = encChapters[0]!;

function EncyclopediaPage() {
  const { t, lang } = useI18n();
  const { eras: erasSource, rulers: rulersSource } = Route.useLoaderData();
  const eras = useLocalizedRows("eras", erasSource, "key");
  const rulers = useLocalizedRows("rulers", rulersSource);
  const rulersByEra = new Map<string, Ruler[]>();
  for (const ruler of rulers) {
    if (!ruler.era) continue;
    const list = rulersByEra.get(ruler.era) ?? [];
    list.push(ruler);
    rulersByEra.set(ruler.era, list);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-gold-line">
          <img
            src={heroChapter.cover}
            alt={altForSrc(heroChapter.cover, lang, t("Traditional Egyptian dress of all 27 governorates"))}
            width={1600}
            height={900}
            className="h-[42vh] min-h-[300px] w-full object-cover opacity-70"
          />
          <AiBadge src={heroChapter.cover} className="bottom-auto top-2" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--background) 8%, color-mix(in oklab, var(--background) 80%, transparent) 50%, color-mix(in oklab, var(--background) 45%, transparent) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-[1360px] px-5 pb-8 lg:px-10 lg:pb-12">
              <p className="mb-2 text-2xs font-semibold eyebrow text-gold-text">
                {t("Visual encyclopedia")}
              </p>
              <h1 className="max-w-3xl font-display text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
                {t("Egypt through the ages — people, dress, food, symbols and science")}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/85 lg:text-base">
                {t(
                  "Eight illustrated chapters that turn a national archive into something you can browse, plan a trip around and invest in. Every plate is documented, every era is placed, and every chapter connects to a live part of the platform.",
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {encChapters.map((c) => (
                  <a
                    key={c.id}
                    href={`#${c.id}`}
                    className="rounded-full border border-gold-line bg-card/70 px-3 py-1.5 text-xs text-foreground/85 backdrop-blur transition-colors hover:bg-gold-soft"
                  >
                    {t(c.eyebrow)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {encChapters.map((chapter, i) => {
          const isEpics = chapter.id === "epics";
          const liveStats =
            isEpics && eras.length > 0
              ? chapter.stats.map((s) =>
                  s.label === "Eras of rulers documented" ? { ...s, value: String(eras.length) } : s,
                )
              : chapter.stats;

          return (
            <Chapter
              key={chapter.id}
              chapter={{ ...chapter, stats: liveStats }}
              index={i}
              liveSection={
                isEpics ? <EraRulerSection eras={eras} rulersByEra={rulersByEra} /> : undefined
              }
            />
          );
        })}

        <Section className="pb-20 pt-4">
          <div className="rounded-3xl border border-gold-line bg-card p-8 text-center lg:p-12">
            <h2 className="font-display text-2xl text-foreground lg:text-3xl">
              {t("Bring a chapter to life with us")}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t(
                "Museums, producers, studios and investors can license, extend or sponsor any chapter of the visual encyclopedia.",
              )}
            </p>
            <div className="mt-6 flex justify-center">
              <GoldButton href={mailto("Visual Encyclopedia partnership")}>
                {t("Talk to the heritage desk")}
              </GoldButton>
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Chapter({
  chapter,
  index,
  liveSection,
}: {
  chapter: EncChapter;
  index: number;
  liveSection?: ReactNode;
}) {
  const { t, lang } = useI18n();

  return (
    <Section
      id={chapter.id}
      className={cn("py-12 lg:py-16", index % 2 === 1 && "bg-surface-2/40")}
    >
      <SectionHeader
        eyebrow={t(chapter.eyebrow)}
        title={t(chapter.title)}
        description={t(chapter.tagline)}
        action={<SourceBadge status={chapter.api.startsWith("REAL") ? "VERIFIED" : "PLANNED"} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <p className="text-sm leading-relaxed text-foreground/85 lg:text-base">{t(chapter.story)}</p>
        <div className="grid content-start gap-3">
          {chapter.stats.map((s) => (
            <div
              key={s.label}
              className="flex items-baseline justify-between gap-4 rounded-2xl border border-gold-line bg-card px-4 py-3"
            >
              <span className="font-display text-xl text-gold-text">{t(s.value)}</span>
              <span className="text-end text-xs text-muted-foreground">{t(s.label)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {chapter.plates.map((plate) => (
          <figure
            key={plate.caption}
            className={cn(
              "group overflow-hidden rounded-2xl border border-border/70 bg-card",
              plate.wide && "md:col-span-2",
            )}
          >
            <div className="relative">
            <img
              src={plate.image}
              alt={altForSrc(plate.image, lang, t(plate.alt))}
              loading="lazy"
              width={1200}
              height={600}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <AiBadge src={plate.image} force={!!generatedBySrc(plate.image)} />
            </div>
            {generatedBySrc(plate.image) && (
              <figcaption className="border-t border-border/60 px-4 pt-2 text-2xs italic text-muted-foreground">
                {isPlaceholderImage(plate.image)
                  ? (lang === "ar" ? "صورة بديلة: " : "Placeholder image: ")
                  : (lang === "ar" ? "صورة توضيحية: " : "Illustrative image: ")}
                {altForSrc(plate.image, lang, "")}
              </figcaption>
            )}
            <div className="px-4 py-3">
              <div className="text-sm font-semibold text-foreground">{t(plate.caption)}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(plate.note)}</p>
            </div>
          </figure>
        ))}
      </div>

      {liveSection}

      <div className="mt-4 flex items-center gap-2 text-2xs eyebrow text-muted-foreground">
        <ArrowRight className="h-3.5 w-3.5 text-gold-text rtl:rotate-180" aria-hidden />
        {chapter.api}
      </div>
    </Section>
  );
}

function EraRulerSection({
  eras,
  rulersByEra,
}: {
  eras: Era[];
  rulersByEra: Map<string, Ruler[]>;
}) {
  const { t, lang } = useI18n();

  if (eras.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-4 flex items-center gap-2 text-2xs font-semibold eyebrow text-gold-text">
        <Crown className="size-3.5" aria-hidden />
        {t("Eras and rulers, live from the archive")}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {eras.map((era) => (
          <article
            key={era.key}
            className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
          >
            <GovernanceBanner status={era.governance_status} className="mb-3" />
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-display text-base text-foreground">{t(era.name)}</h4>
              <SourceBadge status="VERIFIED" />
            </div>
            {(era.from_period || era.to_period) && (
              <p className="mt-1 text-xs text-muted-foreground">
                {[era.from_period, era.to_period].filter(Boolean).join(" – ")}
              </p>
            )}
            {era.summary && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(era.summary)}</p>
            )}

            {(rulersByEra.get(era.key)?.length ?? 0) > 0 && (
              <ul className="mt-3 grid gap-1.5 border-t border-border/60 pt-3">
                {rulersByEra.get(era.key)!.map((ruler) => (
                  <li key={ruler.id} className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
                    <span className="font-medium text-foreground">{t(ruler.name)}</span>
                    {ruler.dynasty && <span className="text-muted-foreground">· {t(ruler.dynasty)}</span>}
                    {ruler.reign && <span className="text-muted-foreground">· {ruler.reign}</span>}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
