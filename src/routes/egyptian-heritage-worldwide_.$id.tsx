import { createFileRoute, notFound } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
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
import { SaveButton } from "@/components/site/SaveButton";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useLocalizedRow } from "@/lib/localized-content";

type HeritageWorldwideItem = {
  id: string;
  slug: string;
  name: string;
  object: string | null;
  era: string | null;
  institution: string | null;
  country: string | null;
  provenance_note: string | null;
  summary: string | null;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/egyptian-heritage-worldwide_/$id")({
  loader: async ({ params }) => {
    // Wrapped in try/catch on purpose: a thrown exception (network failure, cold
    // connection) would otherwise crash the route to the generic error boundary.
    let item: HeritageWorldwideItem | null = null;
    let eraName: string | null = null;
    try {
      const { data, error } = await supabase
        .from("heritage_worldwide")
        .select(
          "id, slug, name, object, era, institution, country, provenance_note, summary, description, images, tags, governance_status",
        )
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(
          `[egyptian-heritage-worldwide.$id] failed to load ${params.id}:`,
          error.message,
        );
      } else {
        item = (data as HeritageWorldwideItem | null) ?? null;
      }

      if (item?.era) {
        const eraRes = await supabase
          .from("eras")
          .select("key, name")
          .eq("key", item.era)
          .maybeSingle();
        eraName = (eraRes.data as { name: string } | null)?.name ?? item.era;
      }
    } catch (err) {
      console.error(`[egyptian-heritage-worldwide.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!item) throw notFound();
    return { item, eraName };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Object unavailable | Egyptora Hub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { item } = loaderData;
    const title = `${item.name} | Egyptora Hub`;
    const description = (item.summary ?? item.description ?? item.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/egyptian-heritage-worldwide/${item.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/egyptian-heritage-worldwide/${item.id}` }],
    };
  },
  notFoundComponent: HeritageWorldwideNotFound,
  component: HeritageWorldwideDetailPage,
});

function HeritageWorldwideNotFound() {
  const { t } = useI18n();
  return (
    <DetailNotFound
      backTo="/egyptian-heritage-worldwide"
      backLabel={t("Back to Egyptian heritage worldwide")}
    />
  );
}

function HeritageWorldwideDetailPage() {
  const { item: itemSource, eraName } = Route.useLoaderData();
  const item = useLocalizedRow("heritage_worldwide", itemSource);
  const { t } = useI18n();

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink
          to="/egyptian-heritage-worldwide"
          label={t("Back to Egyptian heritage worldwide")}
        />

        <GovernanceBanner status={item.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <Globe2 className="size-6 shrink-0 text-gold-text" />
            {t(item.name)}
          </h1>
          <SourceBadge status="DEMO" />
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {item.institution && t(item.institution)}
          {item.country && (
            <>
              {item.institution && " · "}
              {t(item.country)}
            </>
          )}
          {eraName && (
            <>
              {" · "}
              {t(eraName)}
            </>
          )}
        </p>

        <ImageStrip images={item.images} alt={item.name} />

        <SaveButton
          className="mt-6"
          itemType="heritage_worldwide"
          itemId={item.id}
          itemName={item.name}
          itemImage={item.images?.[0] ?? null}
        />

        {item.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(item.summary)}
          </p>
        )}
        {item.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(item.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Object")} value={item.object ? t(item.object) : null} />
          <Fact label={t("Institution")} value={item.institution ? t(item.institution) : null} />
          <Fact label={t("Country")} value={item.country ? t(item.country) : null} />
          <Fact label={t("Era")} value={eraName ? t(eraName) : null} />
          <Fact
            label={t("Provenance")}
            value={item.provenance_note ? t(item.provenance_note) : null}
          />
        </FactGrid>

        <ChipList label={t("Tags")} items={item.tags} />
      </Section>
    </DetailShell>
  );
}
