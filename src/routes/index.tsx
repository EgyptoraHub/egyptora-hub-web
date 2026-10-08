import { useState, type ComponentType, type SVGProps } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Crosshair,
  GraduationCap,
  Home as HomeIcon,
  Info,
  Landmark,
  LayoutGrid,
  Leaf,
  MapPin,
  Monitor,
  Network,
  Palmtree,
  Plane,
  Search,
  ShieldCheck,
  Stamp,
  Users,
  Globe2,
} from "lucide-react";
import heroImg from "@/assets/home/hero.jpg";
import throughTimeImg from "@/assets/card-through-time.jpg";
import visitImg from "@/assets/home/visit.jpg";
import divingImg from "@/assets/home/diving.jpg";
import nileImg from "@/assets/home/nile.jpg";
import culturalImg from "@/assets/home/cultural.jpg";
import invOppsImg from "@/assets/home/inv-opps.jpg";
import startBizImg from "@/assets/home/start-biz.jpg";
import residencyImg from "@/assets/home/residency.jpg";
import educationImg from "@/assets/home/education.jpg";
import healthImg from "@/assets/home/health.jpg";
import bizOppsImg from "@/assets/home/biz-opps.jpg";
import tendersImg from "@/assets/home/tenders.jpg";
import bizSupportImg from "@/assets/home/biz-support.jpg";
import govBuildingImg from "@/assets/home/gov-building.jpg";
import newsGizaImg from "@/assets/home/news-giza.jpg";
import newsInvestImg from "@/assets/home/news-invest.jpg";
import newsRedSeaImg from "@/assets/home/news-redsea.jpg";
import phonesImg from "@/assets/home/phones.jpg";
import worldImg from "@/assets/home/world.jpg";
import globeImg from "@/assets/home/globe.jpg";
import vision2030Logo from "@/assets/vision-2030.png";
import { BookingSearch } from "@/components/site/BookingSearch";
import { SaveButton } from "@/components/site/SaveButton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useSiteSearch } from "@/lib/site-search";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const title = "Egyptora Hub — Your Gateway to Egypt";
const description =
  "Explore. Invest. Live. Do Business. Belong. Egyptora Hub is a private platform connecting the world to Egypt's opportunities, people and possibilities.";

export const Route = createFileRoute("/")({
  loader: async () => {
    // Era names for the "Egypt Through Time" band; one taxonomy shared with Military History.
    try {
      const { data } = await supabase.from("military_eras").select("slug, number, name_en, name_ar").order("sort_order");
      return { eras: (data ?? []) as { slug: string; number: number; name_en: string; name_ar: string }[] };
    } catch {
      return { eras: [] };
    }
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: SITE.url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/` }],
  }),
  component: Home,
});

type Icon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- static route paths
const L = (to: string) => to as any;

const wrap = "mx-auto w-full max-w-[1280px] px-4 lg:px-8";

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <QuickStrip />
        <ExploreInvest />
        <LiveBusinessWhy />
        <Vision2030 />
        <GovBand />
        <GlobalBand />
        <ThroughTimeBand />
        <BookingSearch />
        <NewsApp />
        <ImportantNotice />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------- shared bits ---------- */

function ArrowCta({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={L(to)}
      aria-label={label}
      className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-cta text-primary-foreground shadow-sm transition-transform hover:scale-105"
    >
      <ArrowRight className="size-4 rtl:rotate-180" />
    </Link>
  );
}

function NavyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute start-2 top-2 rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
      {children}
    </span>
  );
}

function ViewAll({ to }: { to: string }) {
  const { t } = useI18n();
  return (
    <Link
      to={L(to)}
      className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-navy hover:text-shell-gold"
    >
      {t("View All")} <ArrowRight className="size-4 text-shell-gold rtl:rotate-180" />
    </Link>
  );
}

function BlockHead({ title, body, to }: { title: string; body: string; to: string }) {
  const { t } = useI18n();
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">{t(title)}</h2>
        <p className="mt-1 max-w-md text-sm text-text-body">{t(body)}</p>
      </div>
      <ViewAll to={to} />
    </div>
  );
}

type CardData = { title: string; sub: string; img: string; to: string; badge?: string };

function ImgCard({ c, h = "h-32" }: { c: CardData; h?: string }) {
  const { t } = useI18n();
  return (
    <article className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-sm">
      <div className={cn("relative overflow-hidden", h)}>
        <img src={c.img} alt={t(c.title)} loading="lazy" className="size-full object-cover" />
        {c.badge && <NavyBadge>{t(c.badge)}</NavyBadge>}
        <SaveButton
          variant="icon"
          itemType="page"
          itemId={`${c.title}|${c.to}`}
          itemName={c.title}
          itemImage={c.img}
          className="absolute end-2 top-2 size-7 border-primary-foreground/60 bg-navy/35 text-primary-foreground"
        />
      </div>
      <div className="flex flex-1 items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-navy">{t(c.title)}</h3>
          <p className="mt-0.5 text-xs text-text-body">{t(c.sub)}</p>
        </div>
        <ArrowCta to={c.to} label={t(c.title)} />
      </div>
    </article>
  );
}

/* ---------- 1. Hero ---------- */

const popular = [
  "Tourist Visa",
  "Real Estate",
  "Investment Opportunities",
  "Universities",
  "Travel Companies",
  "Government Services",
];

function Hero() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const siteSearch = useSiteSearch();
  return (
    <section className="on-dark relative isolate overflow-hidden">
      <img src={heroImg} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/70 via-navy/30 to-transparent rtl:bg-gradient-to-l" />
      <div className={cn(wrap, "relative pb-20 pt-8 lg:pb-24 lg:pt-12")}>
        <div className="absolute end-6 top-8 hidden text-end md:block lg:end-16">
          <p className="font-display text-5xl italic text-foreground">{t("Egypt")}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-foreground">
            {t("A history that inspires")}
            <br />
            {t("A future that welcomes")}
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-shell-gold">
          {t("Discover a Timeless Land")}
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold text-foreground sm:text-5xl lg:text-[52px]">
          {t("Your Gateway to Egypt")}
        </h1>
        <p className="mt-3 text-lg font-light text-foreground sm:text-xl">
          {t("Explore. Invest. Live. Do Business. Belong.")}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            siteSearch(q);
            setQ("");
          }}
          className="mt-6 flex max-w-xl overflow-hidden rounded-lg bg-primary-foreground shadow-lg"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("What are you looking for in Egypt?")}
            aria-label={t("What are you looking for in Egypt?")}
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-navy outline-none placeholder:text-text-body"
          />
          <button
            type="submit"
            aria-label={t("Search")}
            className="grid w-14 place-items-center bg-gold-cta text-primary-foreground"
          >
            <Search className="size-5" />
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-foreground">{t("Popular searches:")}</span>
          {popular.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => siteSearch(p)}
              className="rounded-full border border-foreground/40 bg-navy/50 px-3 py-1 text-xs text-foreground transition-colors hover:border-shell-gold"
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. Quick strip ---------- */

const quick: { Icon: Icon; title: string; sub?: string; to: string }[] = [
  { Icon: Palmtree, title: "Tourism & Experiences", to: "/offers" },
  { Icon: BarChart3, title: "Investment Opportunities", to: "/investment-opportunities" },
  { Icon: HomeIcon, title: "Real Estate", sub: "Find Your Place", to: "/properties" },
  { Icon: Stamp, title: "Visa & Immigration", sub: "Start Your Journey", to: "/government-directory" },
  { Icon: GraduationCap, title: "Education", sub: "A Brighter Future", to: "/research-programs" },
  { Icon: Briefcase, title: "Do Business", sub: "Launch & Grow", to: "/providers" },
  { Icon: Users, title: "Live in Egypt", sub: "Residency & Lifestyle", to: "/properties" },
  { Icon: Landmark, title: "Government Directory", to: "/government-directory" },
];

function QuickStrip() {
  const { t } = useI18n();
  return (
    <div className={cn(wrap, "relative z-10 -mt-12")}>
      <div className="on-dark grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {quick.map(({ Icon, title, sub, to }) => (
          <Link
            key={title}
            to={L(to)}
            className="flex flex-col items-center gap-1.5 rounded-[10px] border border-foreground/15 bg-navy/90 px-2 py-4 text-center shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:border-shell-gold"
          >
            <Icon className="size-8 fill-shell-gold/25 text-shell-gold" strokeWidth={2} />
            <span className="text-sm font-bold leading-tight text-foreground">{t(title)}</span>
            {sub && <span className="text-xs text-foreground/75">{t(sub)}</span>}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
        <Link to="/emergency-numbers" className="font-semibold text-navy underline">{t("Emergency & Quick Numbers")}</Link>
        <a href="tel:122" className="rounded-full border border-navy px-3 py-1 text-xs font-semibold text-navy" dir="ltr">{t("Police")} 122</a>
        <a href="tel:123" className="rounded-full border border-navy px-3 py-1 text-xs font-semibold text-navy" dir="ltr">{t("Ambulance")} 123</a>
      </div>
    </div>
  );
}

/* ---------- 3. Explore + Invest ---------- */

const exploreCards: CardData[] = [
  { title: "Visit Egypt", sub: "Tourist information and guides", img: visitImg, to: "/offers" },
  { title: "Diving & Marine Activities", sub: "Explore the Red Sea", img: divingImg, to: "/offers" },
  { title: "Nile Cruises", sub: "A unique journey", img: nileImg, to: "/offers" },
  { title: "Cultural & Historical Sites", sub: "Discover Egypt's heritage", img: culturalImg, to: "/heritage-sites" },
];
const investCards: CardData[] = [
  { title: "Investment Opportunities", sub: "Sectors and incentives", img: invOppsImg, to: "/investment-opportunities" },
  { title: "Start Your Business", sub: "Guides and resources", img: startBizImg, to: "/providers" },
];

function ExploreInvest() {
  return (
    <section className="bg-bg-alt py-14">
      <div className={cn(wrap, "grid gap-10 lg:grid-cols-[2fr_1fr]")}>
        <div>
          <BlockHead
            title="Explore Egypt"
            body="From iconic landmarks to hidden gems, Egypt offers unforgettable experiences for every traveler."
            to="/encyclopedia"
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {exploreCards.map((c) => (
              <ImgCard key={c.title} c={c} />
            ))}
          </div>
        </div>
        <div>
          <BlockHead
            title="Invest in Egypt"
            body="Explore opportunities in a growing economy with a strategic global location."
            to="/investment-opportunities"
          />
          <div className="grid grid-cols-2 gap-4">
            {investCards.map((c) => (
              <ImgCard key={c.title} c={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. Live + Business + Why ---------- */

const liveCards: CardData[] = [
  { title: "Residency & Visas", sub: "Live, work and study", img: residencyImg, to: "/properties" },
  { title: "Education", sub: "Universities and schools", img: educationImg, to: "/research-programs" },
  { title: "Healthcare", sub: "Quality medical services", img: healthImg, to: "/providers" },
];
const bizCards: CardData[] = [
  { title: "Business Opportunities", sub: "Across key sectors", img: bizOppsImg, to: "/investment-opportunities" },
  { title: "Tenders & Projects", sub: "Government and private", img: tendersImg, to: "/investment-opportunities" },
  { title: "Business Support", sub: "Legal, financial and more", img: bizSupportImg, to: "/providers" },
];
const why: { Icon: Icon; title: string; body: string }[] = [
  { Icon: ShieldCheck, title: "Trusted Information", body: "Verified and reliable content" },
  { Icon: Users, title: "All in One Place", body: "Tourism, investment, living and more" },
  { Icon: Crosshair, title: "Global Access", body: "From Egypt to 195 countries" },
  { Icon: Globe2, title: "Aligned with Egypt Vision 2030", body: "Supporting a digital and prosperous Egypt" },
];

function IconBadge({ Icon }: { Icon: Icon }) {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-full border border-shell-gold/60 bg-chip-active text-navy">
      <Icon className="size-5" strokeWidth={1.6} />
    </span>
  );
}

function LiveBusinessWhy() {
  const { t } = useI18n();
  return (
    <section className="bg-background py-14">
      <div className={cn(wrap, "grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr]")}>
        <div>
          <BlockHead
            title="Live in Egypt"
            body="Experience a vibrant lifestyle, rich culture and a welcoming community."
            to="/properties"
          />
          <div className="grid grid-cols-3 gap-3">
            {liveCards.map((c) => (
              <ImgCard key={c.title} c={c} h="h-24" />
            ))}
          </div>
        </div>
        <div>
          <BlockHead
            title="Do Business"
            body="Connect with partners, explore markets and grow your business in Egypt."
            to="/providers"
          />
          <div className="grid grid-cols-3 gap-3">
            {bizCards.map((c) => (
              <ImgCard key={c.title} c={c} h="h-24" />
            ))}
          </div>
        </div>
        <div className="rounded-[10px] bg-bg-alt p-5">
          <h2 className="font-display text-2xl font-bold text-navy">{t("Why EGYPTORA?")}</h2>
          <ul className="mt-4 space-y-4">
            {why.map(({ Icon, title, body }) => (
              <li key={title} className="flex items-center gap-3">
                <IconBadge Icon={Icon} />
                <div>
                  <p className="text-sm font-bold text-navy">{t(title)}</p>
                  <p className="text-xs text-text-body">{t(body)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. Vision 2030 ---------- */

const pillars: { Icon: Icon; title: string; body: string }[] = [
  { Icon: Monitor, title: "Digital Access", body: "Easier access to information and services" },
  {
    Icon: Network,
    title: "Public – Private Connectivity",
    body: "Bridging users with private sector providers and official resources",
  },
  { Icon: Crosshair, title: "Opportunities for All", body: "Investment, tourism and sustainable growth" },
  {
    Icon: Leaf,
    title: "Aligned with Egypt Vision 2030",
    body: "Contributing to a more digital, connected and prosperous Egypt",
  },
];

function Vision2030() {
  const { t } = useI18n();
  return (
    <section className="border-y border-border bg-background py-14">
      <div className={cn(wrap, "grid gap-10 lg:grid-cols-[1fr_auto_260px] lg:items-center")}>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-navy">
            {t("A Private Platform Supporting")}
            <br />
            {t("Egypt's Digital Future")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-body">
            {t(
              "EGYPTORA is an independent private platform designed to facilitate access to Egypt's opportunities, services and official resources, in alignment with Egypt's Vision 2030 and the country's digital transformation journey.",
            )}
          </p>
          <Link
            to="/legal"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-shell-gold px-5 py-2 text-sm font-semibold text-navy hover:bg-chip-active"
          >
            {t("Learn More")} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {pillars.map(({ Icon, title, body }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <span className="grid size-14 place-items-center rounded-full bg-chip-active text-navy">
                  <Icon className="size-6" strokeWidth={1.5} />
                </span>
                <p className="mt-3 text-sm font-bold text-navy">{t(title)}</p>
                <p className="mt-1 text-xs text-text-body">{t(body)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden h-full w-px bg-border lg:block" />
        <div className="mx-auto flex w-full max-w-[260px] flex-col items-center gap-4">
          <div className="w-full overflow-hidden rounded-[10px] border border-shell-gold/60 bg-background p-3">
            <img
              src={vision2030Logo}
              alt="Egypt Vision 2030 official logo"
              loading="lazy"
              className="mx-auto h-44 w-full scale-125 object-contain"
            />
          </div>
          <Link
            to="/legal"
            className="inline-flex items-center gap-2 rounded-full border border-shell-gold bg-background px-5 py-2 text-sm font-semibold text-navy hover:bg-chip-active"
          >
            {t("About Our Vision")} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. Government band ---------- */

const govTiles: { Icon: Icon; label: string; hash?: string }[] = [
  { Icon: ShieldCheck, label: "Presidency & Cabinet", hash: "presidency-and-cabinet" },
  { Icon: Landmark, label: "Ministries", hash: "ministries" },
  { Icon: Building2, label: "Authorities & Agencies", hash: "authorities-and-agencies" },
  { Icon: MapPin, label: "Governorates" },
  { Icon: Plane, label: "Tourism & Antiquities", hash: "tourism-and-antiquities" },
  { Icon: Briefcase, label: "Investment & Business", hash: "investment-and-business" },
  { Icon: Stamp, label: "Visa & Immigration" },
  { Icon: LayoutGrid, label: "All Categories" },
];

function GovBand() {
  const { t } = useI18n();
  return (
    <section className="on-dark relative overflow-hidden bg-navy-band">
      <div className="absolute inset-y-0 start-0 hidden w-[34%] md:block">
        <img src={govBuildingImg} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-navy-band/40 to-navy-band rtl:bg-gradient-to-l" />
      </div>
      <div className={cn(wrap, "relative py-12")}>
        <div className="md:ps-[30%]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {t("Egypt Official Government Directory")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {t(
                "Access all Egyptian government entities, ministries, authorities and services in one place.",
              )}
            </p>
          </div>
          <Link
            to="/government-directory"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-shell-gold"
          >
            {t("View Directory")} <ArrowRight className="size-4 text-shell-gold rtl:rotate-180" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {govTiles.map(({ Icon, label, hash }) => (
            <a
              key={label}
              href={`/government-directory${hash ? `#${hash}` : ""}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-foreground/20 bg-foreground/5 px-2 py-4 text-center text-xs text-foreground transition-colors hover:border-shell-gold"
            >
              <Icon className="size-6" strokeWidth={1.4} />
              {t(label)}
            </a>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 7. 195 countries ---------- */

function GlobalBand() {
  const { t } = useI18n();
  return (
    <>
    <section className="border-y border-border bg-background py-10">
      <div className={cn(wrap, "flex flex-wrap items-center justify-between gap-6")}>
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold text-navy">{t("Explore the 27 Governorates")}</h2>
          <p className="mt-2 text-text-body">{t("One interactive map of every governorate — places, events, investment, real estate and services.")}</p>
        </div>
        <Link to="/governorates" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
          {t("Open the Governorates Map")} →
        </Link>
      </div>
    </section>
    <section className="bg-bg-band py-10">
      <div className={cn(wrap, "grid items-center gap-8 lg:grid-cols-[auto_1fr_1fr]")}>
        <div className="flex items-center gap-4">
          <img src={globeImg} alt="" className="size-16 rounded-full" />
          <p className="font-display text-xl font-bold uppercase leading-tight text-navy">
            {t("From Egypt to")}
            <br />
            <span className="text-3xl">{t("195 Countries")}</span>
          </p>
        </div>
        <div className="border-border lg:border-s lg:ps-8">
          <p className="font-display text-xl font-bold text-navy">
            {t("One Platform. One Global Gateway.")}
          </p>
          <p className="mt-1 text-sm text-text-body">
            {t("Connecting Egypt with the world through opportunities, people and culture.")}
          </p>
        </div>
        <div className="relative">
          <img src={worldImg} alt="" className="w-full rounded-lg mix-blend-multiply" />
          <p className="mt-1 text-end text-[11px] font-semibold uppercase tracking-[0.2em] text-navy">
            {t("Egypt to the World")}
          </p>
        </div>
      </div>
    </section>
    </>
  );
}

/* ---------- 7b. Egypt Through Time ---------- */

function ThroughTimeBand() {
  const { eras } = Route.useLoaderData();
  const { t, lang } = useI18n();
  if (!eras.length) return null;
  return (
    <section className="bg-background py-14">
      <div className={cn(wrap, "grid items-center gap-8 lg:grid-cols-[320px_minmax(0,1fr)]")}>
        <img src={throughTimeImg} alt="" loading="lazy" className="h-48 w-full rounded-[10px] object-cover lg:h-full" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-bold text-navy">{t("Egypt Through Time")}</h2>
              <p lang="ar" dir="rtl" className="text-sm text-text-body">مصر عبر العصور</p>
            </div>
            <ViewAll to="/egypt-through-time" />
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {eras.map((e) => (
              <li key={e.slug}>
                <Link
                  to="/egypt-through-time/military-history/records"
                  search={{ era: e.slug }}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-sm text-navy transition-colors hover:border-gold-line"
                >
                  <span className="text-xs font-semibold opacity-70">{e.number.toLocaleString(lang === "ar" ? "ar-EG" : "en")}</span>
                  <span dir="auto">{lang === "ar" ? e.name_ar : t(e.name_en)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 8. News + App ---------- */

const news = [
  { tag: "Tourism", title: "New Discoveries at Giza Plateau", sub: "Insights into Egypt's ancient wonders", date: "Sep 12, 2026", img: newsGizaImg },
  { tag: "Investment", title: "Egypt's Growing Investment Opportunities", sub: "A strategic destination for global investors", date: "Sep 10, 2026", img: newsInvestImg },
  { tag: "Travel", title: "Top Red Sea Destinations for 2026", sub: "Sun, sea and unforgettable experiences", date: "Sep 8, 2026", img: newsRedSeaImg },
];

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.4-.9-2.4-3.4ZM14.2 5.9c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.7-1.3Z" />
    </svg>
  );
}
function GooglePlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.6 2.3Zm11.1 6.5L5.5 3.5l8.4 8.4.8-.8.9-.9-1-.9.1-.5Zm.9 3.9-.9-.9-8.4 8.4 9.2-5.3.1-2.2Zm3.9-2.9-2.6-1.5-1.1 1.1 1.6 1.6-1.6 1.6 1.1 1.1 2.6-1.5c.8-.4.8-1.6 0-2.4Z" />
    </svg>
  );
}

function NewsApp() {
  const { t } = useI18n();
  return (
    <section className="bg-background py-14">
      <div className={cn(wrap, "grid gap-8 lg:grid-cols-[2fr_1fr]")}>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-navy">{t("Latest News & Insights")}</h2>
            <ViewAll to="/traveler-stories" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {news.map((n) => (
              <article key={n.title} className="overflow-hidden rounded-[10px] border border-border bg-card shadow-sm">
                <img src={n.img} alt={t(n.title)} loading="lazy" className="h-36 w-full object-cover" />
                <div className="p-4">
                  <span className="rounded-full bg-bg-band px-2.5 py-0.5 text-[10px] font-semibold uppercase text-navy">
                    {t(n.tag)}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-navy">{t(n.title)}</h3>
                  <p className="mt-1 text-xs text-text-body">{t(n.sub)}</p>
                  <p className="mt-3 text-xs text-text-body" dir="ltr">{n.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[10px] bg-bg-band p-5">
          <img src={phonesImg} alt={t("EGYPTORA Mobile App")} className="w-1/2 max-w-[200px] rounded-lg" />
          <div>
            <h2 className="font-display text-2xl font-bold text-navy">{t("EGYPTORA Mobile App")}</h2>
            <p className="mt-1 text-sm text-text-body">{t("Explore Egypt anytime, anywhere.")}</p>
            <div className="mt-4 flex flex-col gap-2">
              {[
                { label: "App Store", Icon: AppleIcon },
                { label: "Google Play", Icon: GooglePlayIcon },
              ].map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex w-36 items-center gap-2 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Icon className="size-5" /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 9. Important notice ---------- */

function ImportantNotice() {
  return (
    <section className="bg-background pb-14">
      <div className={wrap}>
        <div className="grid gap-5 rounded-[10px] border border-info/25 bg-bg-notice p-5 md:grid-cols-[auto_1fr_1fr] md:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-navy text-primary-foreground">
              <Info className="size-5" />
            </span>
            <p className="font-display text-lg font-bold leading-tight text-navy">
              Important Notice
              <br />
              <span lang="ar">تنويه هام</span>
            </p>
          </div>
          <p dir="ltr" lang="en" className="text-start text-xs leading-relaxed text-navy/80 md:border-s md:border-border md:ps-5">
            EGYPTORA-HUB is an independent private platform and is not a governmental entity. Links to
            government entities and official services are provided for informational and accessibility
            purposes only. Users are redirected to the relevant official government websites, subject to
            the applicable terms, conditions, laws and regulations.
          </p>
          <p dir="rtl" lang="ar" className="text-right text-xs leading-relaxed text-navy/80 md:border-s md:border-border md:ps-5">
            منصة إيجيبتورا-هب منصة رقمية خاصة ومستقلة وليست جهة حكومية. يتم توفير روابط الجهات الحكومية
            والخدمات الرسمية لأغراض التعريف وتسهيل الوصول فقط. ويتم تحويل المستخدمين إلى المواقع الحكومية
            الرسمية وفقاً للشروط والأحكام والقوانين واللوائح المعمول بها.
          </p>
        </div>
      </div>
    </section>
  );
}
