import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutGrid, IdCard, Briefcase, Receipt, HeartPulse, GraduationCap, Home, Car, ShieldCheck, Lightbulb, Gavel,
  TrendingUp, Heart, Baby, Rocket, Plane, Armchair, FileSearch, Search, ClipboardCheck, MonitorSmartphone,
  PackageCheck, Globe2, Landmark, Headphones,
} from "lucide-react";
import hero from "@/assets/inner/digital-hero.jpg";
import portal from "@/assets/home/gov-building.jpg";
import idImg from "@/assets/home/residency.jpg";
import tax from "@/assets/home/tenders.jpg";
import vehicle from "@/assets/home/nile.jpg";
import biz from "@/assets/home/start-biz.jpg";
import {
  InnerPage, cardGrid, SectionHead, PhotoCard, IconCard, SidePanel, LinkList, ImportantNoticeBox, ProcessStepsRow,
  AppPromoCard, BandPromo, type CardItem, type Chip, type ProcessStep,
} from "@/components/layout/InnerPage";
import { SITE } from "@/config/site";

const title = "Digital Government Services in Egypt | Egyptora Hub";
const description =
  "Find Egypt's official digital government services, portals and apps — civil records, business licensing, tax, traffic and more.";

export const Route = createFileRoute("/government-directory_/digital-services")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/government-directory/digital-services` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/government-directory/digital-services` }],
  }),
  component: DigitalServices,
});

const DE = "https://digital.gov.eg";
const GD = "/government-directory";

const chips: Chip[] = [
  { label: "All Services", Icon: LayoutGrid },
  { label: "National ID & Civil Records", Icon: IdCard, to: DE },
  { label: "Business & Licensing", Icon: Briefcase, to: "/do-business" },
  { label: "Tax & Customs", Icon: Receipt, to: "https://www.eta.gov.eg" },
  { label: "Health & Insurance", Icon: HeartPulse, to: DE },
  { label: "Education Services", Icon: GraduationCap, to: DE },
  { label: "Housing & Real Estate", Icon: Home, to: "/real-estate" },
  { label: "Transport & Traffic", Icon: Car, to: DE },
  { label: "Social Insurance", Icon: ShieldCheck, to: DE },
  { label: "Utilities & Bills", Icon: Lightbulb, to: DE },
  { label: "Judicial Services", Icon: Gavel, to: DE },
  { label: "Investment Services", Icon: TrendingUp, to: "/invest-in-egypt" },
];

const featured: CardItem[] = [
  { title: "Digital Egypt Portal", desc: "The national gateway to hundreds of online government services.", img: portal, badge: "Portal", to: DE },
  { title: "National ID Services", desc: "Request or renew your national ID and civil records.", img: idImg, badge: "Civil Records", to: DE },
  { title: "Tax e-Filing", desc: "File and pay taxes online with the Egyptian Tax Authority.", img: tax, badge: "Tax", to: "https://www.eta.gov.eg" },
  { title: "Vehicle License Renewal", desc: "Renew vehicle and driving licences online.", img: vehicle, badge: "Traffic", to: DE },
  { title: "Business Registration Portal", desc: "Set up a company through GAFI's online services.", img: biz, badge: "Business", to: "https://www.gafi.gov.eg" },
];

const lifeEvents: CardItem[] = [
  { title: "Getting Married", desc: "Marriage contracts and civil registration.", Icon: Heart, to: DE },
  { title: "Having a Baby", desc: "Birth certificates and child registration.", Icon: Baby, to: DE },
  { title: "Starting a Business", desc: "Registration, licences and tax cards.", Icon: Rocket, to: "/do-business" },
  { title: "Buying Property", desc: "Title registration and real estate procedures.", Icon: Home, to: "/real-estate" },
  { title: "Traveling Abroad", desc: "Passports, visas and travel documents.", Icon: Plane, to: DE },
  { title: "Retiring", desc: "Pensions and social insurance services.", Icon: Armchair, to: DE },
  { title: "Losing a Document", desc: "Replace lost IDs, licences and certificates.", Icon: FileSearch, to: DE },
];

const steps: ProcessStep[] = [
  { Icon: Search, title: "Find the Service", desc: "Search or browse for the service you need." },
  { Icon: ClipboardCheck, title: "Verify Requirements", desc: "Check the required documents and eligibility." },
  { Icon: MonitorSmartphone, title: "Apply Online", desc: "Complete your application through the official portal." },
  { Icon: PackageCheck, title: "Track & Receive", desc: "Track your request and receive your service." },
];

function DigitalServices() {
  return (
    <InnerPage
      pageName="Digital Government Services"
      parent={{ label: "Government Directory", to: GD }}
      hero={{
        image: hero,
        title: "Digital Government Services",
        subtitle: "Easier Access. A More Connected Egypt.",
        body: "Access official government services online — find the right portal, check requirements and apply from anywhere.",
        placeholder: "Search digital services, portals, or apps…",
        tagline: ["Digital", "Connected", "Accessible"],
      }}
      chips={chips}
      moreTo={GD}
      notice={<ImportantNoticeBox />}
      sidebar={
        <SidePanel title="Quick Access" body="The most-used official portals.">
          <LinkList
            items={[
              { label: "Digital Egypt", to: DE, Icon: Globe2 },
              { label: "Egyptian Tax Authority", to: "https://www.eta.gov.eg", Icon: Receipt },
              { label: "Civil Status", to: DE, Icon: IdCard },
              { label: "GAFI Investor Services", to: "https://www.gafi.gov.eg", Icon: TrendingUp },
              { label: "Government Directory", to: GD, Icon: Landmark },
            ]}
          />
        </SidePanel>
      }
      bottom={
        <div className="grid gap-4 md:grid-cols-2">
          <AppPromoCard eyebrow="Services on the Go" title="Download the Egyptora Hub app" />
          <BandPromo Icon={Headphones} title="Need Help?" body="Not sure which service or portal you need? Our team can point you in the right direction." cta="Contact Us" to="/contact" />
        </div>
      }
    >
      <section>
        <SectionHead title="Featured Digital Services" body="Popular online services from official government portals." to={DE} />
        <div className={cardGrid}>
          {featured.map((c) => <PhotoCard key={c.title} c={c} h="h-32" />)}
        </div>
      </section>
      <section>
        <SectionHead title="Government Services by Life Event" body="Find everything you need for key moments in life." to={DE} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {lifeEvents.map((c) => <IconCard key={c.title} c={c} />)}
        </div>
      </section>
      <section>
        <SectionHead title="How It Works" />
        <ProcessStepsRow steps={steps} />
      </section>
    </InnerPage>
  );
}
