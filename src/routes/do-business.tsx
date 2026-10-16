import { GenBanner, GenImage } from "@/components/site/GenImage";
import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard, Rocket, FileCheck2, Scale, BadgePercent, PieChart, LifeBuoy, Factory, Gavel,
  Globe2, TrendingUp, Users, Gift, Building2, Landmark, BookOpen, ClipboardList, BadgeCheck, LineChart,
  ArrowRight, Download, Headphones, FileText, Search, FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import hero from "@/assets/inner/business-hero.jpg";
import solar from "@/assets/home/benban.jpg";
import land from "@/assets/home/biz-opps.jpg";
import tourism from "@/assets/gov/red-sea.jpg";
import residential from "@/assets/sector-realestate.jpg";
import agri from "@/assets/sector-rural.jpg";
import startBiz from "@/assets/home/start-biz.jpg";
import licenses from "@/assets/inner/gov-hero.jpg";
import incentives from "@/assets/home/inv-opps.jpg";
import tenders from "@/assets/home/tenders.jpg";
import trade from "@/assets/trade-suez.jpg";
import support from "@/assets/home/biz-support.jpg";
import energy from "@/assets/home/energy.jpg";
import hurghada from "@/assets/dest-hurghada.jpg";
import health from "@/assets/home/health.jpg";
import finance from "@/assets/gov/cairo.jpg";
import {
  InnerPage, cardGrid, SectionHead, ProcessStepsRow, PhotoCard, SidePanel, LinkList, NavyPromo, GoldButton,
  type CardItem, type Chip,
} from "@/components/layout/InnerPage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

const title = "Do Business in Egypt — Start, Expand & Succeed | Egyptora Hub";
const description = "Start, expand and succeed in Egypt: procedures, licences, incentives, sectors and business opportunities in one place.";

export const Route = createFileRoute("/do-business")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/do-business` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/do-business` }],
  }),
  component: DoBusiness,
});

const IO = "/investment-opportunities";
const chips: Chip[] = [
  { label: "Business Overview", Icon: LayoutDashboard },
  { label: "Start a Business", Icon: Rocket, to: "/government-directory" },
  { label: "Licenses & Permits", Icon: FileCheck2, to: "/government-directory" },
  { label: "Laws & Regulations", Icon: Scale, to: "/legal" },
  { label: "Investment Incentives", Icon: BadgePercent, to: IO },
  { label: "Sectors & Opportunities", Icon: PieChart, to: IO },
  { label: "Business Support", Icon: LifeBuoy, to: "/providers" },
  { label: "Industrial Zones", Icon: Factory, to: IO },
  { label: "Public Procurement", Icon: Gavel },
];

const why = [
  { t: "Strategic Location", d: "A gateway to Africa, the Middle East and Europe.", Icon: Globe2 },
  { t: "Growing Economy", d: "A large and diverse market.", Icon: TrendingUp },
  { t: "Skilled Workforce", d: "A young and talented population.", Icon: Users },
  { t: "Investment Incentives", d: "Attractive incentives and free zones.", Icon: Gift },
  { t: "Mega Projects", d: "New cities and national projects.", Icon: Building2 },
  { t: "Government Support", d: "Reforms and investor-friendly policies.", Icon: Landmark },
];

const services: CardItem[] = [
  { title: "Start a Business", desc: "Step-by-step guidance to establish your company in Egypt.", img: startBiz, to: "/government-directory" },
  { title: "Licenses & Permits", desc: "Find required licenses and procedures.", img: licenses, to: "/government-directory" },
  { title: "Investment Incentives", desc: "Explore incentives and support programs.", img: incentives, to: IO },
  { title: "Tenders & Projects", desc: "Government and private sector opportunities.", img: tenders, to: IO },
  { title: "Trade & Export", desc: "Access export services and international markets.", img: trade, to: IO },
  { title: "Business Support", desc: "Find advisory, legal and financial support.", img: support, to: "/providers" },
];

const sectorRow: CardItem[] = [
  { title: "Real Estate & Construction", img: residential, to: "/properties" },
  { title: "Industry & Manufacturing", img: land, to: IO },
  { title: "Tourism & Hospitality", img: hurghada, to: IO },
  { title: "Energy & Renewables", img: energy, to: IO },
  { title: "Agriculture & Food", img: agri, to: IO },
  { title: "ICT & Innovation", img: support, to: IO },
  { title: "Healthcare & Pharmaceuticals", img: health, to: IO },
  { title: "Logistics & Transportation", img: trade, to: IO },
  { title: "Financial Services", img: finance, to: IO },
];

const stories: CardItem[] = [
  { title: "Renewable Energy Project", desc: "Powering a sustainable future in Egypt.", img: solar, badge: "Example", to: IO },
  { title: "International Hotel Chain", desc: "Expanding hospitality in the Red Sea.", img: tourism, badge: "Example", to: IO },
  { title: "Manufacturing Investment", desc: "Creating jobs and local value.", img: land, badge: "Example", to: IO },
  { title: "Logistics Hub", desc: "Connecting regional markets.", img: trade, badge: "Example", to: IO },
];

const steps = [
  { Icon: BookOpen, title: "Learn", desc: "Understand the requirements and choose your activity." },
  { Icon: ClipboardList, title: "Register", desc: "Complete registration procedures online or in person." },
  { Icon: BadgeCheck, title: "Obtain Licenses", desc: "Get the necessary permits and approvals." },
  { Icon: LineChart, title: "Operate & Grow", desc: "Start your business and access support services." },
];

const opps: CardItem[] = [
  { title: "Solar Energy Project", meta: ["Benban, Aswan"], desc: "Renewable energy investment opportunities.", img: solar, to: IO },
  { title: "Industrial Land", meta: ["10th of Ramadan"], desc: "Ready-to-develop industrial plots.", img: land, to: IO },
  { title: "Tourism Development", meta: ["Red Sea"], desc: "Hotel and resort development opportunities.", img: tourism, to: IO },
  { title: "Residential Project", meta: ["New Administrative Capital"], desc: "Mixed-use real estate development.", img: residential, to: "/properties" },
  { title: "Agri-Food Processing", meta: ["Beheira"], desc: "Investment in food processing and export.", img: agri, to: IO },
];

const keySectors = [
  "Energy (Oil, Gas & Renewables)", "Manufacturing & Industrial", "Real Estate & Construction", "Tourism & Hospitality",
  "Agriculture & Food Processing", "ICT & Digital Economy", "Healthcare & Pharmaceuticals", "Transport & Logistics",
  "Education & Training", "Financial Services", "Creative Industries", "Green & Sustainable Projects",
];

function DoBusiness() {
  const { t } = useI18n();
  return (
    <InnerPage
      pageName="Do Business"
      hero={{
        image: hero,
        title: "Do Business in Egypt",
        subtitle: "Your Partner for Growth",
        body: "Start, expand and succeed in Egypt. Find the information, resources and partners you need — all in one place.",
        placeholder: "Search business opportunities, procedures, sectors, or partners…",
        tagline: ["Opportunities", "People", "Partnerships", "A brighter tomorrow"],
      }}
      chips={chips}
      moreTo="/providers"
      sidebar={
        <>
          <SidePanel title="Why Do Business in Egypt?">
            <ul className="grid gap-3">
              {why.map((w) => (
                <li key={w.t} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-chip-active text-navy">
                    <w.Icon className="size-4 fill-navy/15" strokeWidth={2.2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-navy">{t(w.t)}</span>
                    <span className="block text-[11px] text-text-body">{t(w.d)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </SidePanel>
          <SidePanel title="Key Resources">
            <LinkList
              items={[
                { label: "Investment Guide", to: IO, Icon: BookOpen },
                { label: "Laws & Regulations", to: "/legal", Icon: Scale },
                { label: "Government Entities", to: "/government-directory", Icon: Landmark },
                { label: "Industrial & Free Zones", to: IO, Icon: Factory },
                { label: "Business Service Providers", to: "/providers", Icon: Search },
                { label: "Useful Documents & Forms", to: "/legal", Icon: FolderOpen },
              ]}
            />
          </SidePanel>
          <section className="rounded-[10px] border border-border bg-bg-band p-5 text-center">
            <Headphones className="mx-auto size-8 text-shell-gold" />
            <h3 className="mt-2 font-display text-lg font-bold text-navy">{t("Need Assistance?")}</h3>
            <p className="mt-1 text-xs text-text-body">{t("Our team is here to support you.")}</p>
            <div className="mt-3">
              <GoldButton to="/contact">
                {t("Contact Us")} <ArrowRight className="size-4 rtl:rotate-180" />
              </GoldButton>
            </div>
          </section>
          <SidePanel title="Key Sectors">
            <LinkList items={keySectors.map((s) => ({ label: s, to: IO }))} />
          </SidePanel>
        </>
      }
      bottom={
        <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <NavyPromo>
            <h3 className="font-display text-2xl font-bold">{t("Invest in People. Invest in Egypt.")}</h3>
            <p className="mt-1 text-sm text-foreground/80">{t("A dynamic market. A strategic location. A brighter tomorrow.")}</p>
            <div className="mt-4">
              <GoldButton to={IO}>
                {t("Explore Opportunities")} <ArrowRight className="size-4 rtl:rotate-180" />
              </GoldButton>
            </div>
          </NavyPromo>
          <section className="flex items-center gap-4 rounded-[10px] border border-border bg-bg-band p-5">
            <GenImage k="cover-business-guide" sizes="96px" className="h-32 w-auto shrink-0 rounded-md shadow-sm" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-bold text-navy">{t("Download the Business Guide")}</h3>
              <p className="mt-1 text-sm text-text-body">{t("Your complete guide to doing business in Egypt.")}</p>
              <button
                type="button"
                onClick={() => toast(t("Coming soon"))}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-card"
              >
                {t("Download Now")} <Download className="size-4" />
              </button>
            </div>
            <FileText className="size-14 shrink-0 text-shell-gold" strokeWidth={1.5} />
          </section>
        </div>
      }
    >
      <section>
        <SectionHead title="Featured Business Services" body="Everything you need to start, run and grow your business in Egypt." to="/providers" toLabel="View All Services" />
        <div className={cardGrid}>
          {services.map((c) => <PhotoCard key={c.title} c={c} />)}
        </div>
      </section>
      <section>
        <SectionHead title="Explore Business Opportunities by Sector" body="Discover opportunities across key sectors." to={IO} toLabel="View All Sectors" />
        <div className={cardGrid}>
          {sectorRow.map((c) => <PhotoCard key={c.title} c={c} h="h-20" />)}
        </div>
      </section>
      <section>
        <SectionHead title="Start Your Business Journey" body="Simple steps to establish and grow your business in Egypt." to="/government-directory" toLabel="View Full Guide" />
        <ProcessStepsRow steps={steps} />
      </section>
      <section>
        <SectionHead title="Featured Business Opportunities" body="Discover current opportunities across key sectors." to={IO} toLabel="View All Opportunities" />
        <div className={cardGrid}>
          {opps.map((c) => <PhotoCard key={c.title} c={c} />)}
        </div>
      </section>
      <section>
        <SectionHead title="Success Stories" body="Illustrative examples of the kinds of businesses growing in Egypt." to={IO} toLabel="View All Stories" />
        <div className={cardGrid}>
          {stories.map((c) => <PhotoCard key={c.title} c={c} />)}
        </div>
      </section>
    </InnerPage>
  );
}
