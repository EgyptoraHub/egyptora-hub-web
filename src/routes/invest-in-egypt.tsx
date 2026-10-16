import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutGrid, Building2, Factory, Hotel, Zap, TrainFront, Wheat, Cpu, HeartPulse, GraduationCap, Landmark,
  Globe2, TrendingUp, Handshake, Layers, BookOpen, Scale, BadgePercent, Rocket, Trophy, ArrowRight,
} from "lucide-react";
import hero from "@/assets/inner/invest-hero.jpg";
import capital from "@/assets/sector-realestate.jpg";
import industrial from "@/assets/home/biz-opps.jpg";
import redsea from "@/assets/gov/red-sea.jpg";
import energy from "@/assets/home/energy.jpg";
import people from "@/assets/home/inv-opps.jpg";
import banner from "@/assets/gov/cairo.jpg";
import sIndustry from "@/assets/home/biz-opps.jpg";
import sTourism from "@/assets/dest-hurghada.jpg";
import sInfra from "@/assets/home/tenders.jpg";
import sAgri from "@/assets/sector-rural.jpg";
import sIct from "@/assets/home/biz-support.jpg";
import sHealth from "@/assets/home/health.jpg";
import sEdu from "@/assets/home/education.jpg";
import sFinance from "@/assets/inner/gov-hero.jpg";
import {
  InnerPage, cardGrid, SectionHead, PhotoCard, SidePanel, LinkList, EgyptMap, GoldButton,
  type CardItem, type Chip,
} from "@/components/layout/InnerPage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const title = "Invest in Egypt — Investment Opportunities | Egyptora Hub";
const description = "Discover investment opportunities across Egypt's key sectors: real estate, industry, tourism, energy, ICT and more.";

export const Route = createFileRoute("/invest-in-egypt")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/invest-in-egypt` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/invest-in-egypt` }],
  }),
  component: InvestInEgypt,
});

const IO = "/investment-opportunities";
const chips: Chip[] = [
  { label: "All Sectors", Icon: LayoutGrid },
  { label: "Real Estate & New Cities", Icon: Building2, to: "/real-estate" },
  { label: "Industry & Manufacturing", Icon: Factory, to: `${IO}?sector=industry` },
  { label: "Tourism & Hospitality", Icon: Hotel, to: `${IO}?sector=tourism` },
  { label: "Energy & Renewable", Icon: Zap, to: `${IO}?sector=energy` },
  { label: "Infrastructure & Transportation", Icon: TrainFront, to: `${IO}?sector=infrastructure` },
  { label: "Agriculture & Food Security", Icon: Wheat, to: `${IO}?sector=agriculture` },
  { label: "ICT & Innovation", Icon: Cpu, to: `${IO}?sector=ict` },
  { label: "Healthcare & Pharmaceuticals", Icon: HeartPulse, to: `${IO}?sector=healthcare` },
  { label: "Education & Research", Icon: GraduationCap, to: "/research-programs" },
  { label: "Financial Services", Icon: Landmark, to: `${IO}?sector=finance` },
];

const featured: CardItem[] = [
  { title: "New Administrative Capital", desc: "Mixed-use development", meta: ["Cairo"], badge: "Real Estate", img: capital, to: "/properties" },
  { title: "Ain Sokhna Industrial Zone", desc: "Industrial & logistics hub", meta: ["Suez"], badge: "Industry", img: industrial, to: IO },
  { title: "Red Sea Tourism Development", desc: "Resorts & eco-tourism", meta: ["Red Sea"], badge: "Tourism", img: redsea, to: IO },
  { title: "Renewable Energy Projects", desc: "Solar & wind energy", meta: ["Benban"], badge: "Energy", img: energy, to: IO },
];

const sectors: CardItem[] = [
  { title: "Real Estate", desc: "Urban development and new cities", img: capital, to: "/real-estate" },
  { title: "Industry", desc: "Manufacturing and industrial zones", img: sIndustry, to: IO },
  { title: "Tourism", desc: "Hotels, resorts and experience projects", img: sTourism, to: IO },
  { title: "Energy", desc: "Renewable and traditional energy", img: energy, to: IO },
  { title: "Infrastructure", desc: "Transport, ports and logistics", img: sInfra, to: IO },
  { title: "Agriculture", desc: "Modern agriculture and food industries", img: sAgri, to: IO },
  { title: "ICT & Innovation", desc: "Technology and digital transformation", img: sIct, to: IO },
  { title: "Healthcare", desc: "Hospitals and medical industries", img: sHealth, to: IO },
  { title: "Education", desc: "Universities and research centers", img: sEdu, to: "/research-programs" },
  { title: "Financial Services", desc: "Banks, fintech and financial investments", img: sFinance, to: IO },
];

const benefits = [
  { Icon: Globe2, t: "Strategic Location", s: "Access to global markets" },
  { Icon: TrendingUp, t: "Growing Economy", s: "A promising future" },
  { Icon: Handshake, t: "Investor Support", s: "Facilitated procedures" },
  { Icon: Layers, t: "Diverse Opportunities", s: "Across key sectors" },
];

function HeroTiles() {
  const { t } = useI18n();
  return (
    <div className="mt-8 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl bg-foreground/15 backdrop-blur md:grid-cols-4">
      {benefits.map((b) => (
        <div key={b.t} className="flex items-center gap-3 bg-navy/60 p-3">
          <b.Icon className="size-6 shrink-0 text-gold-text" />
          <div>
            <p className="text-xs font-bold text-foreground">{t(b.t)}</p>
            <p className="text-2xs text-foreground/75">{t(b.s)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InvestInEgypt() {
  const { t } = useI18n();
  return (
    <InnerPage
      pageName="Invest in Egypt"
      hero={{
        image: hero,
        title: "Investment Opportunities",
        subtitle: "A Land of Opportunities for a Prosperous Future",
        body: "Discover investment opportunities across key sectors in Egypt. A strategic location, a growing economy, and a supportive environment for investors.",
        placeholder: "Search investment opportunities, sectors, or locations…",
        tagline: ["Invest", "Grow", "Partner", "Prosper"],
        extra: <HeroTiles />,
      }}
      chips={chips}
      moreTo={IO}
      sidebar={
        <>
          <SidePanel title="Explore Investment by Location" body="Discover opportunities across Egypt's governorates.">
            <EgyptMap pins={["Alexandria", "Cairo", "New Capital", "Suez", "Luxor", "Red Sea", "Aswan"]} />
            <div className="mt-4">
              <GoldButton to="/governorates/cairo">
                {t("Explore the Map")} <ArrowRight className="size-4 rtl:rotate-180" />
              </GoldButton>
            </div>
          </SidePanel>
          <SidePanel title="Investor Resources" body="Everything you need to start and grow your investment in Egypt.">
            <LinkList
              items={[
                { label: "Investment Guide", to: IO, Icon: BookOpen },
                { label: "Laws & Regulations", to: "/legal", Icon: Scale },
                { label: "Incentives & Tax Benefits", to: IO, Icon: BadgePercent },
                { label: "How to Start", to: "/do-business", Icon: Rocket },
                { label: "Success Stories", to: "/traveler-stories", Icon: Trophy },
              ]}
            />
          </SidePanel>
          <div className="on-dark relative h-72 overflow-hidden rounded-[10px]">
            <img src={people} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 to-transparent" />
            <div className="absolute inset-x-5 bottom-5">
              <p className="font-display text-2xl font-bold text-foreground">{t("Invest in People")}</p>
              <p className="font-display text-2xl font-bold text-gold-text">{t("Invest in Egypt")}</p>
            </div>
          </div>
        </>
      }
      bottom={
        <section className="on-dark relative isolate overflow-hidden rounded-[10px]">
          <img src={banner} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-navy/80" />
          <div className={cn("grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-10")}>
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{t("A Strategic Destination for Global Investors")}</h2>
              <p className="mt-3 text-sm text-foreground/85">
                {t("With a dynamic economy, strategic location and ambitious vision, Egypt offers unique opportunities for investors across 195 countries.")}
              </p>
              <div className="mt-5">
                <GoldButton to="/contact">
                  {t("Get in Touch")} <ArrowRight className="size-4 rtl:rotate-180" />
                </GoldButton>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { Icon: Globe2, l: "195 Countries" },
                { Icon: TrendingUp, l: "Growing Economy" },
                { Icon: Handshake, l: "Partner for a Better Tomorrow" },
              ].map((s) => (
                <div key={s.l} className="grid max-w-[120px] justify-items-center gap-2 text-center">
                  <span className="grid size-12 place-items-center rounded-full bg-primary-foreground text-navy">
                    <s.Icon className="size-5" />
                  </span>
                  <span className="text-xs font-semibold text-foreground">{t(s.l)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      }
    >
      <section>
        <SectionHead title="Featured Investment Projects" body="Handpicked opportunities across Egypt." to={IO} />
        <div className={cardGrid}>
          {featured.map((c) => <PhotoCard key={c.title} c={c} h="h-32" />)}
        </div>
      </section>
      <section>
        <SectionHead title="Investment in Key Sectors" body="Explore detailed information, incentives and opportunities." to={IO} toLabel="View All Sectors" />
        <div className={cardGrid}>
          {sectors.map((c) => <PhotoCard key={c.title} c={c} h="h-24" />)}
        </div>
      </section>
    </InnerPage>
  );
}
