import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutGrid, Building, Home, Castle, Store, Construction, Umbrella, LandPlot, Hammer, Building2, Waves, ShieldCheck,
  Users, TrendingUp, Sparkles, Crown, Wallet, CalendarClock, KeyRound, Landmark, Banknote, Scale, Wrench, Palette,
  Truck, MessagesSquare, ArrowRight, Headphones,
} from "lucide-react";
import hero from "@/assets/inner/realestate-hero.jpg";
import capital from "@/assets/sector-realestate.jpg";
import coast from "@/assets/dest-alexandria.jpg";
import zamalek from "@/assets/dest-cairo.jpg";
import october from "@/assets/re-compound.jpg";
import sahl from "@/assets/dest-hurghada.jpg";
import {
  InnerPage, cardGrid, SectionHead, PhotoCard, IconCard, SidePanel, EgyptMap, ViewAll, GoldButton, AppPromoCard,
  type CardItem, type Chip,
} from "@/components/layout/InnerPage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

const title = "Real Estate & Property in Egypt — Buy, Invest & Live | Egyptora Hub";
const description =
  "Explore Egypt's real estate market: apartments, villas, compounds, coastal homes and new cities, plus financing and legal services.";

export const Route = createFileRoute("/real-estate")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/real-estate` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/real-estate` }],
  }),
  component: RealEstate,
});

const P = "/properties";

const chips: Chip[] = [
  { label: "All Properties", Icon: LayoutGrid },
  { label: "Apartments", Icon: Building, to: P },
  { label: "Villas", Icon: Castle, to: P },
  { label: "Compounds & Gated Communities", Icon: Home, to: P },
  { label: "Commercial Properties", Icon: Store, to: P },
  { label: "New Developments", Icon: Construction, to: P },
  { label: "Coastal & Vacation Homes", Icon: Umbrella, to: P },
  { label: "Land & Plots", Icon: LandPlot, to: P },
  { label: "Off-Plan Projects", Icon: Hammer, to: P },
];

const featured: CardItem[] = [
  { title: "New Capital Residence", desc: "Apartment", meta: ["3 Bedrooms", "EGP 4,500,000"], img: capital, badge: "New Capital", to: P },
  { title: "North Coast Villa", desc: "Villa", meta: ["4 Bedrooms", "EGP 12,000,000"], img: coast, badge: "North Coast", to: P },
  { title: "Zamalek Apartment", desc: "Apartment", meta: ["2 Bedrooms", "EGP 6,000,000"], img: zamalek, badge: "Cairo", to: P },
  { title: "Al Rehab City Compound Unit", desc: "Apartment", meta: ["3 Bedrooms", "EGP 3,200,000"], img: october, badge: "New Cairo", to: P },
  { title: "Sahl Hasheesh Chalet", desc: "Chalet", meta: ["2 Bedrooms", "EGP 5,500,000"], img: sahl, badge: "Red Sea", to: P },
];

const lifestyle: CardItem[] = [
  { title: "Urban Living", desc: "City apartments close to work and culture.", Icon: Building2, to: P },
  { title: "Coastal Living", desc: "Homes on the Mediterranean and Red Sea.", Icon: Waves, to: P },
  { title: "Gated Communities", desc: "Secure compounds with shared amenities.", Icon: ShieldCheck, to: P },
  { title: "Family Homes", desc: "Space, schools and green areas nearby.", Icon: Users, to: P },
  { title: "Investment Properties", desc: "Units with strong rental potential.", Icon: TrendingUp, to: "/invest-in-egypt" },
  { title: "New Cities", desc: "Modern planned cities across Egypt.", Icon: Sparkles, to: P },
  { title: "Luxury Living", desc: "Premium villas and penthouses.", Icon: Crown, to: P },
  { title: "Affordable Housing", desc: "Accessible homes and payment plans.", Icon: Wallet, to: P },
];

const why = [
  { Icon: TrendingUp, t: "Strong Market Growth", d: "Steady demand driven by a young, growing population." },
  { Icon: Wallet, t: "Affordable Entry Prices", d: "Competitive prices compared with regional markets." },
  { Icon: CalendarClock, t: "Flexible Payment Plans", d: "Long instalment plans from many developers." },
  { Icon: KeyRound, t: "Growing Rental Demand", d: "Rising demand from residents, students and visitors." },
  { Icon: Landmark, t: "Government-Backed New Cities", d: "National projects expanding modern urban areas." },
];

const services: CardItem[] = [
  { title: "Mortgage & Financing", Icon: Banknote, to: "/providers" },
  { title: "Legal & Title Services", Icon: Scale, to: "/providers" },
  { title: "Property Management", Icon: Wrench, to: "/providers" },
  { title: "Interior Design", Icon: Palette, to: "/providers" },
  { title: "Relocation Support", Icon: Truck, to: "/live-in-egypt" },
  { title: "Real Estate Consultancy", Icon: MessagesSquare, to: "/contact" },
];

function RealEstate() {
  const { t } = useI18n();
  return (
    <InnerPage
      pageName="Real Estate & Property"
      hero={{
        image: hero,
        title: "Real Estate & Property",
        subtitle: "Find. Invest. Live. Grow in Egypt.",
        body: "Explore Egypt's real estate market — from city apartments to coastal homes and new cities.",
        placeholder: "Search properties, cities, or developments…",
        tagline: ["Find", "Invest", "Live", "Grow"],
      }}
      chips={chips}
      moreTo={P}
      sidebar={
        <>
          <SidePanel title="Search on Interactive Map">
            <EgyptMap pins={["Alexandria", "Cairo", "New Capital", "Hurghada", "Red Sea", "Luxor"]} />
            <div className="mt-3">
              <ViewAll to={P} label="Explore the Map" />
            </div>
          </SidePanel>
          <SidePanel title="Why Real Estate in Egypt?">
            <ul className="grid gap-4">
              {why.map((w) => (
                <li key={w.t} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-chip-active text-gold-text">
                    <w.Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-navy">{t(w.t)}</span>
                    <span className="block text-xs text-text-body">{t(w.d)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </SidePanel>
        </>
      }
      bottom={
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-[10px] border border-border bg-bg-band p-6">
            <Headphones className="size-7 text-gold-text" />
            <h3 className="mt-3 font-display text-lg font-bold text-navy">{t("Talk to a Real Estate Advisor")}</h3>
            <p className="mt-1 text-sm text-text-body">{t("Get guidance on buying, renting or investing in property in Egypt.")}</p>
            <div className="mt-4">
              <GoldButton to="/contact">
                {t("Get in Touch")} <ArrowRight className="size-4 rtl:rotate-180" />
              </GoldButton>
            </div>
          </section>
          <AppPromoCard eyebrow="Browse on the Go" title="Download EGYPTORA App" />
        </div>
      }
    >
      <section>
        <SectionHead title="Featured Properties" body="Sample listings across Egypt's most popular areas." to={P} />
        <div className={cardGrid}>
          {featured.map((c) => <PhotoCard key={c.title} c={c} h="h-36" />)}
        </div>
      </section>
      <section>
        <SectionHead title="Explore by Lifestyle" to={P} />
        <div className={cardGrid}>
          {lifestyle.map((c) => <IconCard key={c.title} c={c} />)}
        </div>
      </section>
      <section>
        <SectionHead title="Additional Services" to="/providers" />
        <div className={cardGrid}>
          {services.map((c) => <IconCard key={c.title} c={c} />)}
        </div>
      </section>
    </InnerPage>
  );
}
