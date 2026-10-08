import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutGrid, Stamp, Home, GraduationCap, HeartPulse, Briefcase, Wallet, ShieldCheck, Users, Bus, Plug,
  Calculator, School, Hospital, TrainFront, Phone, ArrowRight,
} from "lucide-react";
import hero from "@/assets/inner/live-hero.jpg";
import residency from "@/assets/home/residency.jpg";
import housing from "@/assets/sector-realestate.jpg";
import education from "@/assets/home/education.jpg";
import health from "@/assets/home/health.jpg";
import work from "@/assets/home/start-biz.jpg";
import individuals from "@/assets/home/visit.jpg";
import families from "@/assets/sec-family.jpg";
import students from "@/assets/sec-education.jpg";
import professionals from "@/assets/home/biz-support.jpg";
import retirees from "@/assets/sec-wellness.jpg";
import cairo from "@/assets/dest-cairo.jpg";
import alexandria from "@/assets/dest-alexandria.jpg";
import capital from "@/assets/home/gov-building.jpg";
import giza from "@/assets/gov/giza.jpg";
import hurghada from "@/assets/dest-hurghada.jpg";
import sharm from "@/assets/dest-sharm.jpg";
import luxor from "@/assets/dest-luxor.jpg";
import aswan from "@/assets/dest-aswan.jpg";
import marsa from "@/assets/gov/red-sea.jpg";
import move from "@/assets/sec-marina.jpg";
import banner from "@/assets/home/nile.jpg";
import {
  InnerPage, cardGrid, SectionHead, PhotoCard, SidePanel, LinkList, NavyPromo, GoldButton,
  type CardItem, type Chip,
} from "@/components/layout/InnerPage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

const title = "Live in Egypt — Residency, Housing & Lifestyle | Egyptora Hub";
const description = "Residency, housing, schools, healthcare, work and popular cities — everything you need to make Egypt your home.";

export const Route = createFileRoute("/live-in-egypt")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/live-in-egypt` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/live-in-egypt` }],
  }),
  component: LiveInEgypt,
});

const GD = "/government-directory";
const chips: Chip[] = [
  { label: "All Living Options", Icon: LayoutGrid },
  { label: "Residency & Visas", Icon: Stamp, to: GD },
  { label: "Housing & Real Estate", Icon: Home, to: "/properties" },
  { label: "Education & Schools", Icon: GraduationCap, to: "/research-programs" },
  { label: "Healthcare & Medical Services", Icon: HeartPulse, to: "/providers" },
  { label: "Work & Employment", Icon: Briefcase, to: "/providers" },
  { label: "Cost of Living", Icon: Wallet },
  { label: "Safety & Security", Icon: ShieldCheck, to: "/legal" },
  { label: "Community & Lifestyle", Icon: Users, to: "/traveler-stories" },
  { label: "Transportation & Mobility", Icon: Bus },
  { label: "Utilities & Services", Icon: Plug, to: GD },
];

const life: CardItem[] = [
  { title: "Residency & Visas", desc: "Residency options, visa information and procedures.", img: residency, to: GD },
  { title: "Housing & Real Estate", desc: "Apartments, villas, compounds and rental options.", img: housing, to: "/properties" },
  { title: "Education & Schools", desc: "International and local schools, universities and programs.", img: education, to: "/research-programs" },
  { title: "Healthcare & Medical Services", desc: "Hospitals, clinics and quality medical care.", img: health, to: "/providers" },
  { title: "Work & Employment", desc: "Job opportunities, work permits and career growth.", img: work, to: "/providers" },
  { title: "Know Your Roots", desc: "Explore the governorate your family comes from.", img: cairo, to: "/know-your-roots" },
];

const stages: CardItem[] = [
  { title: "Individuals", desc: "Live, work and explore", img: individuals, to: "/properties" },
  { title: "Families", desc: "A great place to raise your family", img: families, to: "/properties" },
  { title: "Students", desc: "Quality education and bright future", img: students, to: "/research-programs" },
  { title: "Professionals", desc: "Career growth and opportunities", img: professionals, to: "/do-business" },
  { title: "Retirees", desc: "A relaxing and fulfilling lifestyle", img: retirees, to: "/properties" },
];

const cities: CardItem[] = [
  { title: "Cairo", desc: "A dynamic capital", img: cairo, to: "/governorates/cairo" },
  { title: "Alexandria", desc: "Mediterranean charm", img: alexandria, to: "/governorates/alexandria" },
  { title: "New Capital", desc: "Modern living", img: capital, to: "/properties" },
  { title: "Giza", desc: "History at your doorstep", img: giza, to: "/governorates/giza" },
  { title: "Hurghada", desc: "Red Sea lifestyle", img: hurghada, to: "/governorates/red-sea" },
  { title: "Sharm El Sheikh", desc: "Sun, sea and more", img: sharm, to: "/governorates/south-sinai" },
  { title: "Luxor", desc: "Ancient wonders", img: luxor, to: "/governorates/luxor" },
  { title: "Aswan", desc: "Peace and natural beauty", img: aswan, to: "/governorates/aswan" },
  { title: "Marsa Alam", desc: "Coastal serenity", img: marsa, to: "/governorates/red-sea" },
];

function LiveInEgypt() {
  const { t } = useI18n();
  return (
    <InnerPage
      pageName="Live in Egypt"
      hero={{
        image: hero,
        title: "Live in Egypt",
        subtitle: "A Vibrant Lifestyle. A Welcoming Community.",
        body: "Experience modern cities, rich culture, affordable living and endless opportunities. Make Egypt your home.",
        placeholder: "Search residency, housing, schools, healthcare, or cities…",
        tagline: ["Live", "Work", "Study", "Belong"],
      }}
      chips={chips}
      moreTo={GD}
      sidebar={
        <>
          <SidePanel title="Quick Tools">
            <LinkList
              items={[
                { label: "Visa Information", to: GD, Icon: Stamp },
                { label: "Cost of Living Calculator", to: "/properties", Icon: Calculator },
                { label: "International Schools Directory", to: "/research-programs", Icon: School },
                { label: "Hospitals & Clinics Near You", to: "/providers", Icon: Hospital },
                { label: "Public Transportation Guide", to: GD, Icon: TrainFront },
                { label: "Emergency Contacts", to: "/contact", Icon: Phone },
              ]}
            />
          </SidePanel>
          <NavyPromo>
            <h3 className="font-display text-lg font-bold">{t("Cost of Living in Egypt")}</h3>
            <p className="mt-1 text-xs text-foreground/75">{t("Affordable living, exceptional lifestyle.")}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["Housing", "from $200/month"],
                ["Utilities", "from $50/month"],
                ["Dining", "from $5/meal"],
              ].map(([a, b]) => (
                <div key={a} className="rounded-lg bg-foreground/10 p-2 text-center">
                  <p className="text-[11px] font-bold text-shell-gold">{t(a!)}</p>
                  <p className="mt-0.5 text-[10px] text-foreground/85">{t(b!)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <GoldButton to="/properties">
                {t("See Full Cost of Living Guide")} <ArrowRight className="size-4 rtl:rotate-180" />
              </GoldButton>
            </div>
          </NavyPromo>
          <PhotoCard c={{ title: "Plan Your Move", desc: "Step-by-step guide to moving and settling in Egypt.", img: move, to: GD }} />
        </>
      }
      bottom={
        <section className="on-dark relative isolate overflow-hidden rounded-[10px]">
          <img src={banner} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/90 to-navy/40 rtl:bg-gradient-to-l" />
          <div className="flex flex-wrap items-center justify-between gap-6 p-6 lg:p-10">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{t("More Than a Place to Live")}</h2>
              <p className="mt-2 text-sm text-foreground/85">{t("A welcoming people, a rich culture, and a future full of possibilities.")}</p>
              <div className="mt-5">
                <GoldButton to="/properties">
                  {t("Start Your Journey")} <ArrowRight className="size-4 rtl:rotate-180" />
                </GoldButton>
              </div>
            </div>
            <div className="text-end">
              <p className="font-display text-5xl italic text-foreground">{t("Egypt")}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">{t("A home for every story")}</p>
            </div>
          </div>
        </section>
      }
    >
      <section>
        <SectionHead title="Life in Egypt" body="Discover everything you need to live, work, study and enjoy life in Egypt." to={GD} toLabel="View All Living Options" />
        <div className={cardGrid}>
          {life.map((c) => <PhotoCard key={c.title} c={c} h="h-28" />)}
        </div>
      </section>
      <section>
        <SectionHead title="Life Stages in Egypt" body="Tailored information for every stage of your journey." to="/properties" />
        <div className={cardGrid}>
          {stages.map((c) => <PhotoCard key={c.title} c={c} h="h-28" />)}
        </div>
      </section>
      <section>
        <SectionHead title="Explore Popular Cities" body="Find the right city for your lifestyle." to="/countries" toLabel="View All Cities" />
        <div className={cardGrid}>
          {cities.map((c) => <PhotoCard key={c.title} c={c} h="h-28" />)}
        </div>
      </section>
    </InnerPage>
  );
}
