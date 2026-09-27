import { useMemo } from "react";
import { SECTOR_GROUPS, matchesSector } from "@/data/investment-sectors";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Building2,
  Factory,
  GraduationCap,
  Landmark,
  Layers,
  Leaf,
  MapPin,
  Plane,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  BlockHeader,
  CategoryTabs,
  FeaturedRow,
  ExploreGrid,
  HeroSearch,
  PageTemplate,
  type CategoryTab,
} from "@/components/layout/PageTemplate";
import {
  SidebarContactCard,
  SidebarLinkCard,
  SidebarPromoCard,
} from "@/components/layout/SidebarWidgets";
import { SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import heroImage from "@/assets/sector-realestate.jpg";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useLocalizedRows } from "@/lib/localized-content";

type InvestmentOpportunity = {
  id: string;
  slug: string;
  name: string;
  sector: string | null;
  governorate_slug: string | null;
  stage: string | null;
  investment_min_usd: number | null;
  investment_max_usd: number | null;
  competent_entity: string | null;
  summary: string | null;
  governance_status: GovernanceStatus;
};

const title = "Investment Opportunities in Egypt | Egyptora Hub";
const description =
  "Sector-by-sector investment opportunities across Egypt's governorates — projects, land and partnerships open to investors.";

export const Route = createFileRoute("/investment-opportunities")({
  validateSearch: (search: Record<string, unknown>): { sector?: string } =>
    typeof search.sector === "string" ? { sector: search.sector } : {},
  loader: async () => {
    const { data, error } = await supabase
      .from("investment_opportunities")
      .select(
        "id, slug, name, sector, governorate_slug, stage, investment_min_usd, investment_max_usd, competent_entity, summary, governance_status",
      )
      .eq("moderation_state", "PUBLISHED")
      .order("name");

    if (error) {
      console.error(
        "[investment-opportunities] failed to load investment_opportunities:",
        error.message,
      );
    }
    return { opportunities: (data ?? []) as InvestmentOpportunity[] };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/investment-opportunities` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/investment-opportunities` }],
  }),
  component: InvestmentOpportunitiesPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function formatRange(min: number | null, max: number | null, lang: string) {
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const fmt = (n: number) => `$${n.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
  if (min !== null) return `${fmt(min)}+`;
  if (max !== null) return `≤ ${fmt(max)}`;
  return null;
}

/** Icon chosen from the sector name so new sectors still render sensibly. */
function sectorIcon(sector: string): LucideIcon {
  const s = sector.toLowerCase();
  if (s.includes("real estate") || s.includes("housing") || s.includes("propert"))
    return Building2;
  if (s.includes("industr") || s.includes("manufact")) return Factory;
  if (s.includes("energy") || s.includes("renew") || s.includes("power")) return Zap;
  if (s.includes("tour") || s.includes("hospital")) return Plane;
  if (s.includes("agri") || s.includes("food") || s.includes("farm")) return Leaf;
  if (s.includes("transport") || s.includes("logis") || s.includes("infrastr")) return Truck;
  if (s.includes("educat") || s.includes("research")) return GraduationCap;
  if (s.includes("financ") || s.includes("bank")) return Briefcase;
  return Landmark;
}

function OpportunityCard({ opp }: { opp: InvestmentOpportunity }) {
  const { t, lang } = useI18n();
  const range = formatRange(opp.investment_min_usd, opp.investment_max_usd, lang);
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold-line">
      <GovernanceBanner status={opp.governance_status} className="mb-3" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex min-w-0 items-center gap-2 font-display text-base text-foreground">
          <Landmark className="size-4 shrink-0 text-gold" />
          <Link
            to="/investment-opportunities/$id"
            params={{ id: opp.id }}
            className="min-w-0 transition-colors hover:text-gold"
          >
            {t(opp.name)}
          </Link>
        </h3>
        <SourceBadge status="DEMO" />
      </div>

      {opp.governorate_slug && (
        <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 text-gold/70" />
          <Link
            to="/governorates/$id"
            params={{ id: opp.governorate_slug }}
            className="hover:text-gold"
          >
            {t(govName(opp.governorate_slug))}
          </Link>
          {opp.stage && (
            <>
              {" · "}
              {t(opp.stage)}
            </>
          )}
        </p>
      )}
      {opp.summary && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(opp.summary)}</p>
      )}
      <div className="mt-auto pt-3">
        {range && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-gold">
            <TrendingUp className="size-3.5 shrink-0" />
            {range}
          </p>
        )}
        {opp.competent_entity && (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("Competent entity")}: {t(opp.competent_entity)}
          </p>
        )}
      </div>
    </article>
  );
}

function InvestmentOpportunitiesPage() {
  const { opportunities: opportunitiesSource } = Route.useLoaderData();
  const opportunities = useLocalizedRows("investment_opportunities", opportunitiesSource);
  const { t } = useI18n();
  const { sector } = Route.useSearch();
  const navigate = Route.useNavigate();
  const active = sector && SECTOR_GROUPS.some((g) => g.id === sector) ? sector : "all";
  const setActive = (id: string) =>
    void navigate({ to: ".", search: id === "all" ? {} : { sector: id }, replace: true, resetScroll: false });

  const sectors = useMemo(
    () =>
      Array.from(
        new Set(opportunities.map((o) => o.sector).filter((v): v is string => !!v)),
      ).sort(),
    [opportunities],
  );

  const tabs: CategoryTab[] = [
    { id: "all", label: "All Sectors", icon: Layers },
    ...SECTOR_GROUPS.map((g) => ({ id: g.id, label: g.label, icon: sectorIcon(g.label) })),
  ];

  const filtered =
    active === "all" ? opportunities : opportunities.filter((o) => matchesSector(o.sector, active));

  const featured = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  const exploreItems = [
    { label: "Real estate & new cities", icon: Building2, to: "/properties" },
    { label: "Education & research", icon: GraduationCap, to: "/research-programs" },
    { label: "Business services & providers", icon: Briefcase, to: "/providers" },
    { label: "Trade & export products", icon: Truck, to: "/products" },
    { label: "Industry & manufacturing", icon: Factory, soon: true },
    { label: "Energy & renewables", icon: Zap, soon: true },
    { label: "Agriculture & food security", icon: Leaf, soon: true },
    { label: "Tourism & hospitality", icon: Plane, soon: true },
  ];

  return (
    <PageTemplate
      hero={
        <HeroSearch
          title="Invest in Egypt"
          subtitle="Opportunities across every sector and governorate"
          description="Explore projects, land and partnerships open to investors, with the competent authority named for each one."
          image={heroImage}
          imageAlt={t("Investment and development in Egypt")}
          placeholder="Search a sector, governorate or project..."
          breadcrumb={[{ label: "Home", to: "/" }, { label: "Invest in Egypt" }]}
          sideNote={[
            `${opportunities.length} ${t("opportunities")}`,
            `${sectors.length} ${t("sectors")}`,
          ]}
        />
      }
      tabs={<CategoryTabs tabs={tabs} active={active} onSelect={setActive} />}
      sidebar={
        <>
          <SidebarPromoCard
            title="Investing at a glance"
            description="Live figures from the opportunities published on this platform."
            stats={[
              { label: "Opportunities", value: String(opportunities.length) },
              { label: "Sectors", value: String(sectors.length) },
              { label: "Governorates", value: String(governorates.length) },
            ]}
            actionLabel="Talk to our team"
            actionTo="/contact"
          />
          <SidebarLinkCard
            title="Useful for investors"
            links={[
              { label: "Government directory", icon: Landmark, to: "/government-directory" },
              { label: "Real estate listings", icon: Building2, to: "/properties" },
              { label: "Business service providers", icon: Briefcase, to: "/providers" },
              { label: "Laws & regulations", icon: Layers, to: "/legal" },
              { label: "Incentives calculator", icon: TrendingUp, soon: true },
            ]}
          />
          <SidebarContactCard
            title="Need guidance?"
            description="Tell us what you plan to invest in and we will point you to the right authority."
            actionLabel="Contact us"
            actionTo="/contact"
          />
        </>
      }
    >
      <section>
        <BlockHeader
          title={active === "all" ? "Featured opportunities" : "Featured in this sector"}
          description="Selected projects currently open to investors."
        />
        {featured.length > 0 ? (
          <FeaturedRow>
            {featured.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </FeaturedRow>
        ) : (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {t("No opportunities are published in this sector yet.")}
          </p>
        )}
      </section>

      {rest.length > 0 && (
        <section>
          <BlockHeader
            title="More opportunities"
            description="Every published opportunity in this selection."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        </section>
      )}

      <section>
        <BlockHeader
          title="Explore by area of investment"
          description="Jump to the parts of the platform investors use most."
        />
        <ExploreGrid items={exploreItems} />
      </section>
    </PageTemplate>
  );
}
