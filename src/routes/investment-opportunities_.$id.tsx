import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Landmark, MapPin, TrendingUp } from "lucide-react";
import { Section, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import {
  BackLink,
  ChipList,
  DetailNotFound,
  DetailShell,
  Fact,
  FactGrid,
} from "@/components/site/DetailPrimitives";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { SaveButton } from "@/components/site/SaveButton";
import { ItemActions } from "@/lib/trip-actions";
import { useLocalizedRow } from "@/lib/localized-content";

type Opportunity = {
  id: string;
  slug: string;
  name: string;
  sector: string | null;
  governorate_slug: string | null;
  stage: string | null;
  investment_min_usd: number | null;
  investment_max_usd: number | null;
  land_requirement_ha: number | null;
  competent_entity: string | null;
  restrictions: string[] | null;
  demand_signals: string[] | null;
  risks: string[] | null;
  summary: string | null;
  description: string | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/investment-opportunities_/$id")({
  loader: async ({ params }) => {
    let opportunity: Opportunity | null = null;
    try {
      const { data, error } = await supabase
        .from("investment_opportunities")
        .select(
          "id, slug, name, sector, governorate_slug, stage, investment_min_usd, investment_max_usd, land_requirement_ha, competent_entity, restrictions, demand_signals, risks, summary, description, governance_status",
        )
        .eq("id", params.id)
        .eq("moderation_state", "PUBLISHED")
        .maybeSingle();

      if (error) {
        console.error(`[investment-opportunities.$id] failed to load ${params.id}:`, error.message);
      } else {
        opportunity = (data as Opportunity | null) ?? null;
      }
    } catch (err) {
      console.error(`[investment-opportunities.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!opportunity) throw notFound();
    return { opportunity };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Opportunity unavailable | Egyptora Hub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { opportunity } = loaderData;
    const title = `${opportunity.name} | Egyptora Hub`;
    const description = (opportunity.summary ?? opportunity.description ?? opportunity.name).slice(
      0,
      155,
    );
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/investment-opportunities/${opportunity.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: `${SITE.url}/investment-opportunities/${opportunity.id}` },
      ],
    };
  },
  notFoundComponent: OpportunityNotFound,
  component: OpportunityDetailPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function formatRange(min: number | null, max: number | null, locale: string) {
  const fmt = (n: number) => `$${n.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
  if (min !== null) return `${fmt(min)}+`;
  if (max !== null) return `≤ ${fmt(max)}`;
  return null;
}

function OpportunityNotFound() {
  const { t } = useI18n();
  return (
    <DetailNotFound backTo="/investment-opportunities" backLabel={t("Back to investment opportunities")} />
  );
}

function OpportunityDetailPage() {
  const { opportunity: opportunitySource } = Route.useLoaderData();
  const opportunity = useLocalizedRow("investment_opportunities", opportunitySource);
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/investment-opportunities" label={t("Back to investment opportunities")} />

        <GovernanceBanner status={opportunity.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <Landmark className="size-6 shrink-0 text-gold-text" />
            {t(opportunity.name)}
          </h1>
          <SourceBadge status="DEMO" />
        </div>

        {opportunity.governorate_slug && (
          <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4 text-gold-text" />
            <Link
              to="/governorates/$id"
              params={{ id: opportunity.governorate_slug }}
              className="hover:text-gold-text"
            >
              {t(govName(opportunity.governorate_slug))}
            </Link>
          </p>
        )}

        {opportunity.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(opportunity.summary)}
          </p>
        )}
        {opportunity.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(opportunity.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Sector")} value={opportunity.sector ? t(opportunity.sector) : null} />
          <Fact label={t("Stage")} value={opportunity.stage ? t(opportunity.stage) : null} />
          <Fact
            label={t("Investment size")}
            value={
              formatRange(
                opportunity.investment_min_usd,
                opportunity.investment_max_usd,
                locale,
              ) && (
                <span className="flex items-center gap-1.5 text-gold-text">
                  <TrendingUp className="size-3.5" />
                  {formatRange(
                    opportunity.investment_min_usd,
                    opportunity.investment_max_usd,
                    locale,
                  )}
                </span>
              )
            }
          />
          <Fact
            label={t("Land requirement")}
            value={
              opportunity.land_requirement_ha !== null
                ? `${opportunity.land_requirement_ha.toLocaleString(locale)} ${t("hectares")}`
                : null
            }
          />
          <Fact
            label={t("Competent entity")}
            value={opportunity.competent_entity ? t(opportunity.competent_entity) : null}
          />
          <Fact
            label={t("Governorate")}
            value={
              opportunity.governorate_slug ? t(govName(opportunity.governorate_slug)) : null
            }
          />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <ItemActions
            itemType="investment_opportunity"
            itemId={opportunity.id}
            itemName={opportunity.name}
          />
          <SaveButton
            itemType="investment_opportunity"
            itemId={opportunity.id}
            itemName={opportunity.name}
          />
        </div>

        <ChipList label={t("Demand signals")} items={opportunity.demand_signals} />
        <ChipList label={t("Restrictions")} items={opportunity.restrictions} />
        <ChipList label={t("Risks")} items={opportunity.risks} />
      </Section>
    </DetailShell>
  );
}
