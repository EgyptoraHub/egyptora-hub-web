import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Landmark, MapPin } from "lucide-react";
import { Section, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import {
  BackLink,
  ChipList,
  DetailNotFound,
  DetailShell,
  Fact,
  FactGrid,
  ImageStrip,
} from "@/components/site/DetailPrimitives";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { SaveButton } from "@/components/site/SaveButton";
import { ItemActions } from "@/lib/trip-actions";
import { useLocalizedRow } from "@/lib/localized-content";

type HeritageSite = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  era: string;
  classification: string | null;
  access: string | null;
  restoration_status: string | null;
  summary: string | null;
  description: string | null;
  academic_references: string[] | null;
  related_figures: string[] | null;
  accessibility: string[] | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/heritage-sites_/$id")({
  loader: async ({ params }) => {
    // Wrapped in try/catch on purpose: a thrown exception (network failure, cold
    // connection) would otherwise crash the route to the generic error boundary.
    let site: HeritageSite | null = null;
    try {
      const { data, error } = await supabase
        .from("heritage_sites")
        .select(
          "id, slug, name, governorate_slug, era, classification, access, restoration_status, summary, description, academic_references, related_figures, accessibility, images, tags, governance_status",
        )
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(`[heritage-sites.$id] failed to load ${params.id}:`, error.message);
      } else {
        site = (data as HeritageSite | null) ?? null;
      }
    } catch (err) {
      console.error(`[heritage-sites.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!site) throw notFound();
    return { site };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Heritage site unavailable | Egyptora Hub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { site } = loaderData;
    const title = `${site.name} | Egyptora Hub`;
    const description = (site.summary ?? site.description ?? site.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/heritage-sites/${site.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/heritage-sites/${site.id}` }],
    };
  },
  notFoundComponent: HeritageSiteNotFound,
  component: HeritageSiteDetailPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function HeritageSiteNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/heritage-sites" backLabel={t("Back to heritage sites")} />;
}

function HeritageSiteDetailPage() {
  const { site: siteSource } = Route.useLoaderData();
  const site = useLocalizedRow("heritage_sites", siteSource);
  const { t } = useI18n();

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/heritage-sites" label={t("Back to heritage sites")} />

        <GovernanceBanner status={site.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <Landmark className="size-6 shrink-0 text-gold-text" />
            {t(site.name)}
          </h1>
          <SourceBadge status="VERIFIED" />
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 text-gold-text" />
          <Link
            to="/governorates/$id"
            params={{ id: site.governorate_slug }}
            className="hover:text-gold-text"
          >
            {t(govName(site.governorate_slug))}
          </Link>
          {" · "}
          {t(site.era)}
        </p>

        <ImageStrip images={site.images} alt={site.name} />

        {site.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(site.summary)}
          </p>
        )}
        {site.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(site.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Era")} value={t(site.era)} />
          <Fact label={t("Governorate")} value={t(govName(site.governorate_slug))} />
          <Fact
            label={t("Classification")}
            value={site.classification ? t(site.classification) : null}
          />
          <Fact label={t("Access")} value={site.access ? t(site.access) : null} />
          <Fact
            label={t("Restoration status")}
            value={site.restoration_status ? t(site.restoration_status) : null}
          />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <ItemActions
            itemType="heritage_site"
            itemId={site.id}
            itemName={site.name}
            itemImage={site.images?.[0] ?? null}
          />
          <SaveButton
            itemType="heritage_site"
            itemId={site.id}
            itemName={site.name}
            itemImage={site.images?.[0] ?? null}
          />
        </div>

        <ChipList label={t("Accessibility")} items={site.accessibility} />
        <ChipList label={t("Related figures")} items={site.related_figures} />
        <ChipList label={t("Academic references")} items={site.academic_references} />
        <ChipList label={t("Tags")} items={site.tags} />
      </Section>
    </DetailShell>
  );
}
