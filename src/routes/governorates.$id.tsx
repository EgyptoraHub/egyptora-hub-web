import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, Bot, Clock, Landmark, MapPin, Sparkles, UtensilsCrossed, Shirt } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, GoldButton } from "@/components/site/Primitives";
import { useI18n } from "@/i18n";
import { SITE } from "@/config/site";
import { governorates } from "@/data/governorates";
import { governorateProfiles, type Bilingual } from "@/data/governorate-profiles";
import { supabase } from "@/integrations/supabase/client";
import { useLocalizedRows } from "@/lib/localized-content";
import { loadGovernorateCulture } from "@/lib/culture";
import { CultureCard } from "@/components/culture/CultureUI";

const TABS = [
  "discover",
  "stay",
  "experiences",
  "events",
  "investment",
  "real-estate",
  "business",
  "made-in",
  "mobility",
  "essential-services",
  "research-education",
  "ai",
] as const;
type Tab = (typeof TABS)[number];

type Card = {
  id: string;
  name: string;
  summary?: string | null;
  images?: string[] | null;
  meta?: string | null;
  href?: { to: string; id: string };
};

type GovContent = {
  flag_image_url: string | null;
  history: string | null;
  highlights: string[] | null;
  famous_food: string[] | null;
  famous_clothing: string[] | null;
};

type Area = { id: string; slug: string; name: string; name_ar: string | null; type: string; summary: string | null; images: string[] | null };

async function safe<T>(label: string, p: PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  try {
    const { data, error } = await p;
    if (error) {
      console.error(`[governorates.$id] ${label}:`, error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error(`[governorates.$id] ${label}:`, err);
    return [];
  }
}

export const Route = createFileRoute("/governorates/$id")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } =>
    TABS.includes(s['tab'] as Tab) ? { tab: s['tab'] as Tab } : {},
  loader: async ({ params }) => {
    const gov = governorates.find((g) => g.id === params.id);
    const profile = governorateProfiles[params.id];
    if (!gov || !profile) throw notFound();
    const g = gov.id;

    const [content, areas, destinations, heritage, museums, events, invest, properties, providers, products, culture] =
      await Promise.all([
        safe<GovContent>("governorate", supabase.from("governorates").select("flag_image_url, history, highlights, famous_food, famous_clothing").eq("slug", g).limit(1)),
        safe<Area>("areas", supabase.from("governorate_areas").select("id, slug, name, name_ar, type, summary, images").eq("governorate_slug", g).order("name")),
        safe<{ id: string; name: string; category: string; summary: string | null; images: string[] | null }>("destinations", supabase.from("destinations").select("id, name, category, summary, images").eq("governorate_slug", g).order("name")),
        safe<{ id: string; name: string; era: string; summary: string | null; images: string[] | null }>("heritage", supabase.from("heritage_sites").select("id, name, era, summary, images").eq("governorate_slug", g).order("name")),
        safe<{ id: string; name: string; summary: string | null; images: string[] | null }>("museums", supabase.from("museums").select("id, name, summary, images").eq("governorate_slug", g).order("name")),
        safe<{ id: string; name: string; start_date: string | null; venue: string | null; summary: string | null; images: string[] | null }>("events", supabase.from("events").select("id, name, start_date, venue, summary, images").eq("governorate_slug", g).order("start_date")),
        safe<{ id: string; name: string; sector: string | null; stage: string | null; summary: string | null }>("investment", supabase.from("investment_opportunities").select("id, name, sector, stage, summary").eq("governorate_slug", g).order("name")),
        safe<{ id: string; name: string; property_type: string | null; city: string | null; summary: string | null; images: string[] | null }>("properties", supabase.from("properties").select("id, name, property_type, city, summary, images").eq("governorate_slug", g).order("name")),
        safe<{ id: string; name: string; type: string; summary: string | null; images: string[] | null }>("providers", supabase.from("providers").select("id, name, type, summary, images").eq("governorate_slug", g).order("name")),
        safe<{ id: string; name: string; category: string | null; summary: string | null; images: string[] | null }>("products", supabase.from("products").select("id, name, category, summary, images").eq("governorate_slug", g).order("name")),
        loadGovernorateCulture(g).catch(() => []),
      ]);

    return {
      name: gov.name,
      tagline: profile.tagline.en,
      story: profile.story.en,
      id: gov.id,
      content: content[0] ?? null,
      areas,
      destinations,
      heritage,
      museums,
      events,
      invest,
      properties,
      providers,
      products,
      culture,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Governorate unavailable | Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} — ${loaderData.tagline} | Egyptora Hub`;
    const description = loaderData.story.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/governorates/${loaderData.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/governorates/${loaderData.id}` }],
    };
  },
  notFoundComponent: GovernorateNotFound,
  component: GovernoratePage,
});

function GovernorateNotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section className="py-24 text-center">
        <h1 className="font-display text-3xl text-gold">{t("Governorate not found")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <Link to="/" className="text-gold underline">
            {t("Back to the national gateway")}
          </Link>
        </p>
      </Section>
      <SiteFooter />
    </div>
  );
}

const TAB_LABEL: Record<Tab, string> = {
  discover: "Discover",
  stay: "Stay",
  experiences: "Experiences",
  events: "Events",
  investment: "Investment",
  "real-estate": "Real Estate",
  business: "Business",
  "made-in": "Made in",
  mobility: "Mobility",
  "essential-services": "Essential Services",
  "research-education": "Research & Education",
  ai: "AI",
};

const pretty = (s: string | null | undefined) =>
  s ? s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

function GovernoratePage() {
  const { id } = Route.useParams();
  const { tab = "discover" } = Route.useSearch();
  const data = Route.useLoaderData();
  const destinations = useLocalizedRows("destinations", data.destinations);
  const { t, lang } = useI18n();
  const gov = governorates.find((g) => g.id === id)!;
  const profile = governorateProfiles[id]!;
  const pick = (b: Bilingual) => (lang === "ar" ? b.ar : b.en);
  const govName = t(gov.name);
  const neighbours = governorates.filter((g) => g.region === gov.region && g.id !== gov.id).slice(0, 6);

  const STAY = new Set(["HOSPITALITY", "HOTEL_APARTMENT"]);
  const stay: Card[] = [
    ...data.properties.filter((p) => STAY.has(p.property_type ?? "")).map((p) => ({ id: p.id, name: p.name, summary: p.summary, images: p.images, meta: [pretty(p.property_type), p.city].filter(Boolean).join(" · "), href: { to: "/properties/$id", id: p.id } })),
    ...data.providers.filter((p) => p.type === "HOTEL").map((p) => ({ id: p.id, name: p.name, summary: p.summary, images: p.images, meta: t("Hotel"), href: { to: "/providers/$id", id: p.id } })),
  ];
  const realEstate: Card[] = data.properties
    .filter((p) => !STAY.has(p.property_type ?? ""))
    .map((p) => ({ id: p.id, name: p.name, summary: p.summary, images: p.images, meta: [pretty(p.property_type), p.city].filter(Boolean).join(" · "), href: { to: "/properties/$id", id: p.id } }));
  const business: Card[] = data.providers
    .filter((p) => p.type !== "HOTEL")
    .map((p) => ({ id: p.id, name: p.name, summary: p.summary, images: p.images, meta: pretty(p.type), href: { to: "/providers/$id", id: p.id } }));
  const eventCards: Card[] = data.events.map((e) => ({ id: e.id, name: e.name, summary: e.summary, images: e.images, meta: [e.start_date, e.venue].filter(Boolean).join(" · "), href: { to: "/events/$id", id: e.id } }));
  const experiences: Card[] = [
    ...data.heritage.map((h) => ({ id: h.id, name: h.name, summary: h.summary, images: h.images, meta: t("Heritage site"), href: { to: "/heritage-sites/$id", id: h.id } })),
    ...data.museums.map((m) => ({ id: m.id, name: m.name, summary: m.summary, images: m.images, meta: t("Museum"), href: { to: "/museums/$id", id: m.id } })),
    ...eventCards.slice(0, 3),
  ];
  const investCards: Card[] = data.invest.map((i) => ({ id: i.id, name: i.name, summary: i.summary, meta: [pretty(i.sector), pretty(i.stage)].filter(Boolean).join(" · "), href: { to: "/investment-opportunities/$id", id: i.id } }));
  const productCards: Card[] = data.products.map((p) => ({ id: p.id, name: p.name, summary: p.summary, images: p.images, meta: pretty(p.category), href: { to: "/products/$id", id: p.id } }));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative">
          <img
            src={profile.image}
            alt={`${gov.name} — ${profile.tagline.en}`}
            width={1280}
            height={720}
            className="h-[40vh] min-h-[300px] w-full object-cover lg:h-[50vh]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--background) 6%, color-mix(in oklab, var(--background) 78%, transparent) 45%, color-mix(in oklab, var(--background) 35%, transparent) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-[1360px] px-5 pb-8 lg:px-10 lg:pb-12">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                {t(gov.region)} · {t("Capital")}: {t(gov.capital)}
              </p>
              <div className="flex items-center gap-4">
                {data.content?.flag_image_url && (
                  <img
                    src={data.content.flag_image_url}
                    alt={`${gov.name} ${t("flag")}`}
                    className="h-12 w-auto max-w-[90px] rounded border border-gold-line bg-card object-contain p-1 lg:h-16"
                  />
                )}
                <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl lg:text-6xl">{govName}</h1>
              </div>
              <p className="mt-2 text-sm text-gold/90 lg:text-base">{pick(profile.tagline)}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/85 lg:text-base">{pick(profile.story)}</p>
            </div>
          </div>
        </section>

        <nav aria-label={t("Governorate sections")} className="sticky top-0 z-20 border-y border-border/60 bg-background/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1360px] gap-1 overflow-x-auto px-5 py-2 lg:px-10">
            {TABS.map((k) => (
              <Link
                key={k}
                to="/governorates/$id"
                params={{ id }}
                search={k === "discover" ? {} : { tab: k }}
                resetScroll={false}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  tab === k ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-gold"
                }`}
              >
                {k === "made-in" ? `${t("Made in")} ${govName}` : t(TAB_LABEL[k])}
              </Link>
            ))}
          </div>
        </nav>

        {tab === "discover" && (
          <>
            <Section className="py-10 lg:py-14">
              <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-2xl border border-border/70 bg-surface-2 p-6">
                  <h2 className="font-display text-2xl text-gold">{t("History")}</h2>
                  {(data.content?.history ?? pick(profile.history)).split(/\n\n+/).map((para, i) => (
                    <p key={i} className="mt-3 text-sm leading-relaxed text-foreground/85">
                      {para}
                    </p>
                  ))}
                </div>
                <div className="rounded-2xl border border-gold-line bg-card p-6">
                  <h2 className="flex items-center gap-2 font-display text-xl text-gold">
                    <Sparkles className="size-4" /> {t("What makes it distinctive")}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {(data.content?.highlights?.length ? data.content.highlights : profile.highlights.map(pick)).map((h) => (
                      <li key={h} className="flex gap-2 text-sm text-foreground/90">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <ListBox icon={<UtensilsCrossed className="size-4" />} title={t("Famous food")} items={data.content?.famous_food} />
                <ListBox icon={<Shirt className="size-4" />} title={t("Traditional clothing & crafts")} items={data.content?.famous_clothing} />
              </div>
              {data.culture.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-display text-lg font-bold text-foreground">{t("Local culture")}</h3>
                  <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.culture.map((c) => <CultureCard key={c.id} r={c} />)}
                  </ul>
                </div>
              )}
            </Section>

            <Section className="py-6 lg:py-10">
              <SectionHeader eyebrow={t("Where to go")} title={`${t("Top destinations in")} ${govName}`} />
              <CardGrid
                cards={destinations.map((d) => ({ id: d.id, name: t(d.name), summary: d.summary ? t(d.summary) : null, images: d.images, meta: pretty(d.category) }))}
                empty={t("Destinations for this governorate are being added — check back soon.")}
              />
            </Section>

            <Section className="py-6 lg:py-10">
              <SectionHeader
                eyebrow={t("Markaz & districts")}
                title={`${t("Places in")} ${govName}`}
                description={t("The administrative districts (markaz and qism) that make up the governorate.")}
              />
              <CardGrid
                cards={data.areas.map((a) => ({
                  id: a.id,
                  name: lang === "ar" && a.name_ar ? a.name_ar : a.name,
                  summary: a.summary,
                  images: a.images,
                  meta: a.type === "district" ? t("District (qism)") : t("Markaz"),
                  href: { to: "/places/$id", id: a.slug },
                }))}
                empty={t("Places for this governorate are being added — check back soon.")}
              />
            </Section>
          </>
        )}

        {tab === "stay" && <TabSection title={`${t("Where to stay in")} ${govName}`} cards={stay} empty={t("No stays listed here yet — check back soon.")} />}
        {tab === "experiences" && <TabSection title={`${t("Experiences in")} ${govName}`} cards={experiences} empty={t("Experiences for this governorate are being added — check back soon.")} />}
        {tab === "events" && <TabSection title={`${t("Events in")} ${govName}`} cards={eventCards} empty={t("No upcoming events listed here yet.")} />}
        {tab === "investment" && <TabSection title={`${t("Investment opportunities in")} ${govName}`} cards={investCards} empty={t("No investment opportunities listed here yet.")} />}
        {tab === "real-estate" && <TabSection title={`${t("Real estate in")} ${govName}`} cards={realEstate} empty={t("No property listings here yet.")} />}
        {tab === "business" && <TabSection title={`${t("Businesses & services in")} ${govName}`} cards={business} empty={t("No businesses listed here yet.")} />}
        {tab === "made-in" && <TabSection title={`${t("Made in")} ${govName}`} cards={productCards} empty={t("Local products from this governorate are being added — check back soon.")} />}
        {(tab === "mobility" || tab === "essential-services" || tab === "research-education") && (
          <Section className="py-16">
            <div className="mx-auto max-w-xl rounded-2xl border border-gold-line bg-card p-8 text-center">
              <Clock className="mx-auto size-8 text-gold" />
              <h2 className="mt-3 font-display text-2xl text-foreground">
                {t(TAB_LABEL[tab])} — {t("Coming soon")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("We're preparing verified information for this section. In the meantime, ask the AI Concierge.")}
              </p>
            </div>
          </Section>
        )}
        {tab === "ai" && (
          <Section className="py-16">
            <div className="mx-auto max-w-xl rounded-2xl border border-gold-line bg-card p-8 text-center">
              <Bot className="mx-auto size-8 text-gold" />
              <h2 className="mt-3 font-display text-2xl text-foreground">
                {t("Ask about")} {govName}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("While you're on this page, the AI Concierge focuses its answers on this governorate.")}
              </p>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("egyptora:open-concierge"))}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Bot className="size-4" /> {t("Open AI Concierge")}
              </button>
            </div>
          </Section>
        )}

        <Section className="py-10 lg:py-16">
          <SectionHeader eyebrow={t("Nearby")} title={t("More in this region")} />
          <div className="mt-5 flex flex-wrap gap-2">
            {neighbours.map((g) => (
              <Link
                key={g.id}
                to="/governorates/$id"
                params={{ id: g.id }}
                className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold-line hover:text-gold"
              >
                {t(g.name)}
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <GoldButton
              onClick={() =>
                window.dispatchEvent(new CustomEvent("egyptora:ask-concierge", { detail: `${t("Plan a visit to")} ${t(gov.name)}` }))
              }
            >
              {t("Plan a visit")}
            </GoldButton>
            <Link
              to="/"
              hash="explore"
              className="inline-flex items-center gap-2 rounded-xl border border-gold-line bg-gold-soft px-4 py-2 text-sm font-semibold text-gold"
            >
              <MapPin className="size-4" /> {t("Back to the 27 governorates map")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

// Research notes (unconfirmed / "none found" entries) stay in the database for owner review but are not shown publicly.
const RESEARCH_NOTE = /^no (strongly|single|distinctive|specific)|flagged|owner (review|confirmation)|unverified|needs confirmation/i;

function ListBox({ icon, title, items: raw }: { icon: ReactNode; title: string; items: string[] | null | undefined }) {
  const { t } = useI18n();
  const items = raw?.filter((it) => !RESEARCH_NOTE.test(it));
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-xl text-gold">
        {icon} {title}
      </h2>
      {items && items.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {items.map((it) => {
            const [head, ...rest] = it.split(" — ");
            return (
              <li key={it} className="text-sm leading-relaxed text-foreground/85">
                {rest.length ? (
                  <>
                    <span className="font-semibold text-foreground">{head}</span> — {rest.join(" — ")}
                  </>
                ) : (
                  it
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{t("Being researched — check back soon.")}</p>
      )}
    </div>
  );
}

function TabSection({ title, cards, empty }: { title: string; cards: Card[]; empty: string }) {
  return (
    <Section className="py-10 lg:py-14">
      <SectionHeader title={title} />
      <CardGrid cards={cards} empty={empty} />
    </Section>
  );
}

function CardGrid({ cards, empty }: { cards: Card[]; empty: string }) {
  if (cards.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-card/50 p-8 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => {
        const img = c.images?.[0];
        const inner = (
          <>
            {img ? (
              <div className="relative h-40 overflow-hidden">
                <img
                  src={img}
                  alt={c.name}
                  loading="lazy"
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center bg-surface-2">
                <Landmark className="size-6 text-gold/60" />
              </div>
            )}
            <div className="p-4">
              {c.meta && <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{c.meta}</div>}
              <div className="mt-1 text-sm font-semibold text-foreground">{c.name}</div>
              {c.summary && <p className="mt-1 line-clamp-3 text-[12px] text-muted-foreground">{c.summary}</p>}
            </div>
          </>
        );
        const cls = "group block overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-gold-line";
        return c.href ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static typed detail routes
          <Link key={c.id} to={c.href.to as any} params={{ id: c.href.id } as any} className={cls}>
            {inner}
          </Link>
        ) : (
          <article key={c.id} className={cls}>
            {inner}
          </article>
        );
      })}
    </div>
  );
}

