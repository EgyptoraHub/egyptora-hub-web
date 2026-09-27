import { createFileRoute } from "@tanstack/react-router";
import {
  Landmark, Ship, Waves, Mountain, Umbrella, Building2, Church, Leaf, Users, PartyPopper,
  Map as MapIcon, Lightbulb, Stamp, UserRound, Ticket, ExternalLink, ArrowRight,
} from "lucide-react";
import hero from "@/assets/home/hero.jpg";
import giza from "@/assets/gov/giza.jpg";
import diving from "@/assets/home/diving.jpg";
import nile from "@/assets/home/nile.jpg";
import aswanGov from "@/assets/gov/aswan.jpg";
import desert from "@/assets/sec-desert.jpg";
import sharm from "@/assets/dest-sharm.jpg";
import cairo from "@/assets/dest-cairo.jpg";
import luxor from "@/assets/dest-luxor.jpg";
import aswan from "@/assets/dest-aswan.jpg";
import hurghada from "@/assets/dest-hurghada.jpg";
import alexandria from "@/assets/dest-alexandria.jpg";
import {
  InnerPage, cardGrid, SectionHead, PhotoCard, SidePanel, LinkList, NavyPromo, EgyptMap, ViewAll, GoldButton, SmartLink,
  type CardItem, type Chip,
} from "@/components/layout/InnerPage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

const title = "Explore Egypt — Tourism & Experiences | Egyptora Hub";
const description = "Discover Egypt's wonders — pyramids, Nile cruises, Red Sea diving, desert safaris and top destinations.";

export const Route = createFileRoute("/explore-egypt")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/explore-egypt` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/explore-egypt` }],
  }),
  component: ExploreEgypt,
});

const chips: Chip[] = [
  { label: "All Experiences", Icon: MapIcon },
  { label: "Cultural & Historical Tours", Icon: Landmark, to: "/heritage-sites" },
  { label: "Nile Cruises", Icon: Ship, to: "/experiences/nile-cruises" },
  { label: "Diving & Marine Activities", Icon: Waves },
  { label: "Desert Safari & Adventure", Icon: Mountain, to: "/experiences/desert" },
  { label: "Beaches & Water Sports", Icon: Umbrella, to: "/experiences/beaches" },
  { label: "Cities & Destinations", Icon: Building2, to: "/countries" },
  { label: "Religious & Spiritual Tourism", Icon: Church },
  { label: "Eco & Nature Tourism", Icon: Leaf },
  { label: "Family Experiences", Icon: Users },
  { label: "Events & Festivals", Icon: PartyPopper, to: "/events" },
];

const featured: CardItem[] = [
  { title: "Pyramids of Giza", badge: "Cultural Tour", desc: "Explore the last standing wonder of the ancient world.", meta: ["Giza", "Half Day"], img: giza, to: "/heritage-sites" },
  { title: "Diving in the Red Sea", badge: "Diving", desc: "Discover a magical underwater world.", meta: ["Hurghada", "Full Day"], img: diving, to: "/offers" },
  { title: "Nile Cruise Experience", badge: "Nile Cruise", desc: "Sail through history on the Nile.", meta: ["Luxor – Aswan", "Multi Days"], img: nile, to: "/offers" },
  { title: "Abu Simbel Temples", badge: "Historical Tour", desc: "A magnificent journey to ancient Egypt.", meta: ["Aswan", "Full Day"], img: aswanGov, to: "/heritage-sites" },
  { title: "Desert Safari", badge: "Adventure", desc: "Feel the thrill of the Egyptian desert.", meta: ["Cairo", "Half Day"], img: desert, to: "/offers" },
  { title: "Sharm El Sheikh", badge: "Beach", desc: "Sun, sea and unforgettable experiences.", meta: ["Sharm El Sheikh", "Full Day"], img: sharm, to: "/offers" },
];

const destinations: CardItem[] = [
  { title: "Cairo", desc: "History & Culture", img: cairo, to: "/governorates/cairo" },
  { title: "Luxor", desc: "Ancient Wonders", img: luxor, to: "/governorates/luxor" },
  { title: "Aswan", desc: "Nature & Heritage", img: aswan, to: "/governorates/aswan" },
  { title: "Hurghada", desc: "Beaches & Diving", img: hurghada, to: "/governorates/red-sea" },
  { title: "Sharm El Sheikh", desc: "Sun & Adventure", img: sharm, to: "/governorates/south-sinai" },
  { title: "Alexandria", desc: "Culture & Sea", img: alexandria, to: "/governorates/alexandria" },
];

function ExploreEgypt() {
  const { t } = useI18n();
  return (
    <InnerPage
      pageName="Explore Egypt"
      hero={{
        image: hero,
        title: "Tourism & Experiences",
        subtitle: "Discover Egypt's wonders — from ancient history to breathtaking adventures.",
        placeholder: "Search destinations, activities, tours or cities…",
        tagline: ["A journey through time", "A lifetime of experiences"],
        popular: ["Pyramids", "Nile Cruise", "Red Sea", "Luxor", "Aswan", "Diving", "Desert Safari", "Cultural Tours"],
      }}
      chips={chips}
      moreTo="/encyclopedia"
      sidebar={
        <>
          <SidePanel title="Plan Your Trip" body="Let us help you create your perfect Egypt experience.">
            <LinkList
              items={[
                { label: "Suggested Itineraries", to: "/my-trips/new", Icon: MapIcon },
                { label: "Travel Tips", to: "/traveler-stories", Icon: Lightbulb },
                { label: "Visa Information", to: "/government-directory", Icon: Stamp },
                { label: "Local Guides", to: "/providers", Icon: UserRound },
                { label: "Book Experiences", to: "/offers", Icon: Ticket },
              ]}
            />
          </SidePanel>
          <NavyPromo>
            <p className="text-xs uppercase tracking-[0.2em] text-shell-gold">{t("Explore on the Go")}</p>
            <p className="mt-1 font-display text-xl font-bold">{t("Download EGYPTORA App")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["App Store", "Google Play"].map((s) => (
                <span key={s} className="rounded-lg border border-foreground/30 px-3 py-1.5 text-xs font-semibold">
                  {t(s)}
                </span>
              ))}
            </div>
          </NavyPromo>
        </>
      }
      bottom={
        <section className="flex flex-wrap items-center justify-between gap-6 rounded-[10px] border border-border bg-bg-band p-6 lg:p-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-navy">{t("Licensed Travel Companies in Egypt")}</h2>
            <p className="mt-2 text-sm text-text-body">
              {t("Search the official ETAA directory of licensed travel agencies and tour operators. Find trusted travel companies by name, city, area or licence number.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <GoldButton to="/providers">
              {t("Search Travel Companies")} <ArrowRight className="size-4 rtl:rotate-180" />
            </GoldButton>
            <SmartLink
              to="https://www.etaa-egypt.org/"
              className="inline-flex items-center gap-2 rounded-lg border border-navy px-5 py-2.5 text-sm font-semibold text-navy hover:bg-card"
            >
              {t("Visit Official ETAA Directory")} <ExternalLink className="size-4" />
            </SmartLink>
          </div>
        </section>
      }
    >
      <section>
        <SectionHead title="Featured Experiences" body="Handpicked experiences to make your trip unforgettable." to="/offers" />
        <div className={cardGrid}>
          {featured.map((c) => <PhotoCard key={c.title} c={c} />)}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="rounded-[10px] border border-border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-navy">{t("Explore Egypt by Map")}</h2>
          <p className="mt-1 text-sm text-text-body">{t("Discover top destinations and experiences across Egypt.")}</p>
          <EgyptMap className="mt-4" pins={["Alexandria", "Siwa Oasis", "Cairo", "Hurghada", "Luxor", "Aswan"]} />
          <div className="mt-4"><ViewAll to="/governorates" label="Explore all 27 Governorates" /></div>
        </div>
        <div>
          <SectionHead title="Top Destinations" body="Explore Egypt's most popular cities and regions." to="/countries" toLabel="View All Destinations" />
          <div className={cardGrid}>
            {destinations.map((c) => <PhotoCard key={c.title} c={c} h="h-28" />)}
          </div>
        </div>
      </section>
    </InnerPage>
  );
}
