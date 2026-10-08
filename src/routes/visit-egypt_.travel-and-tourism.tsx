import { useState } from "react";
import { EmergencyQuickLinks } from "@/components/site/EmergencyQuickLinks";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, BadgePercent, Headphones, BadgeCheck, Ship } from "lucide-react";
import hero from "@/assets/inner/visit-hero.jpg";
import cruise from "@/assets/promo-cruise.jpg";
import desert from "@/assets/sec-desert.jpg";
import diving from "@/assets/home/diving.jpg";
import nile from "@/assets/home/nile.jpg";
import adventure from "@/assets/promo-adventure.jpg";
import luxor from "@/assets/dest-luxor.jpg";
import {
  InnerPage, cardGrid, SectionHead, PhotoCard, IconCard, AppPromoCard, BandPromo, type CardItem,
} from "@/components/layout/InnerPage";
import {
  TravelpayoutsWidget, TP_WIDGET_SRC, TP_ATTRACTIONS_SRC, TP_CAR_RENTAL_SRC,
} from "@/components/site/BookingSearch";
import { visitChips } from "@/data/visit-chips";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const title = "Travel & Tourism — Book Tours, Hotels & Flights in Egypt | Egyptora Hub";
const description =
  "Book tours, hotels, flights and car rental across Egypt through our trusted travel partners.";

export const Route = createFileRoute("/visit-egypt_/travel-and-tourism")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/visit-egypt/travel-and-tourism` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/visit-egypt/travel-and-tourism` }],
  }),
  component: TravelTourism,
});

const tabs = ["Tours", "Hotels", "Flights", "Cruises", "Car Rental"] as const;
type Tab = (typeof tabs)[number];
const SRC: Record<Tab, string | null> = {
  Tours: TP_ATTRACTIONS_SRC,
  Hotels: TP_WIDGET_SRC,
  Flights: TP_WIDGET_SRC,
  Cruises: null,
  "Car Rental": TP_CAR_RENTAL_SRC,
};

function TravelBookingWidget() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("Tours");
  const src = SRC[tab];
  return (
    <div className="overflow-hidden rounded-[14px] border border-shell-gold/40 bg-navy/95 p-4 shadow-lg sm:p-5">
      <div className="mb-3 flex gap-1 overflow-x-auto [scrollbar-width:none]">
        {tabs.map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setTab(x)}
            aria-pressed={tab === x}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              tab === x ? "bg-gold-cta text-navy" : "text-foreground/75 hover:bg-foreground/10 hover:text-foreground",
            )}
          >
            {t(x)}
          </button>
        ))}
      </div>
      {src ? (
        <TravelpayoutsWidget key={tab} src={src} />
      ) : (
        <div className="grid justify-items-center gap-2 rounded-xl border border-foreground/15 px-4 py-10 text-center">
          <Ship className="size-8 text-shell-gold" />
          <p className="font-display text-lg font-bold text-foreground">{t("Nile cruise booking is coming soon")}</p>
          <p className="max-w-md text-sm text-foreground/75">
            {t("Our booking partner does not offer cruise search yet. Ask our AI assistant for cruise options in the meantime.")}
          </p>
        </div>
      )}
    </div>
  );
}

const featured: CardItem[] = [
  { title: "Nile Cruise", desc: "Sail between Luxor and Aswan in comfort.", img: cruise, badge: "Cruise", to: "/offers" },
  { title: "Luxor Day Tour", desc: "Karnak, Valley of the Kings and more.", img: luxor, badge: "Cultural", to: "/offers" },
  { title: "Desert Safari", desc: "Dunes, oases and nights under the stars.", img: desert, badge: "Adventure", to: "/offers" },
  { title: "Diving in Hurghada", desc: "World-class reefs for every level.", img: diving, badge: "Water Sports", to: "/offers" },
  { title: "Felucca Sailing", desc: "A traditional sail at sunset on the Nile.", img: nile, badge: "Nile", to: "/offers" },
  { title: "Hot Air Balloon Luxor", desc: "Sunrise views over temples and the West Bank.", img: adventure, badge: "Adventure", to: "/offers" },
];

const trust: CardItem[] = [
  { title: "Secure Booking", desc: "Payments handled by trusted global partners.", Icon: ShieldCheck, to: "/legal" },
  { title: "Best Price", desc: "Compare offers from many providers at once.", Icon: BadgePercent, to: "/offers" },
  { title: "24/7 Support", desc: "Help from our partners around the clock.", Icon: Headphones, to: "/contact" },
  { title: "Trusted Partners", desc: "Well-known booking brands only.", Icon: BadgeCheck, to: "/providers" },
];

function TravelTourism() {
  return (
    <InnerPage
      pageName="Travel & Tourism"
      parent={{ label: "Visit Egypt", to: "/visit-egypt" }}
      hero={{
        image: hero,
        title: "Travel & Tourism",
        subtitle: "Book tours, hotels, flights and more.",
        placeholder: "",
        tagline: ["Discover", "Explore", "Experience"],
        replaceSearch: <TravelBookingWidget />,
      }}
      chips={visitChips}
      showMore={false}
      bottom={
        <>
        <EmergencyQuickLinks className="mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          <BandPromo Icon={Headphones} title="Need Help Planning?" body="Our team can help you shape the right itinerary for your trip." cta="Contact Us" to="/contact" />
          <AppPromoCard />
        </div>
        </>
      }
    >
      <section>
        <SectionHead title="Featured Tours & Experiences" body="Hand-picked ways to experience Egypt." to="/offers" />
        <div className={cardGrid}>
          {featured.map((c) => <PhotoCard key={c.title} c={c} />)}
        </div>
      </section>
      <section>
        <SectionHead title="Why Book With Us" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((c) => <IconCard key={c.title} c={c} cta={false} />)}
        </div>
      </section>
    </InnerPage>
  );
}
