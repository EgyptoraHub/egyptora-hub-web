import { createFileRoute, notFound } from "@tanstack/react-router";
import { Tag } from "lucide-react";
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
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { SaveButton } from "@/components/site/SaveButton";
import { ItemActions } from "@/lib/trip-actions";
import { useLocalizedRow } from "@/lib/localized-content";

type Offer = {
  id: string;
  slug: string;
  name: string;
  kind: string | null;
  summary: string | null;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/offers_/$id")({
  loader: async ({ params }) => {
    let offer: Offer | null = null;
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("id, slug, name, kind, summary, description, images, tags, governance_status")
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(`[offers.$id] failed to load ${params.id}:`, error.message);
      } else {
        offer = (data as Offer | null) ?? null;
      }
    } catch (err) {
      console.error(`[offers.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!offer) throw notFound();
    return { offer };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Offer unavailable | Egyptora Hub" }, { name: "robots", content: "noindex" }],
      };
    }
    const { offer } = loaderData;
    const title = `${offer.name} | Egyptora Hub`;
    const description = (offer.summary ?? offer.description ?? offer.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/offers/${offer.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/offers/${offer.id}` }],
    };
  },
  notFoundComponent: OfferNotFound,
  component: OfferDetailPage,
});

function OfferNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/offers" backLabel={t("Back to offers & packages")} />;
}

function OfferDetailPage() {
  const { offer: offerSource } = Route.useLoaderData();
  const offer = useLocalizedRow("offers", offerSource);
  const { t } = useI18n();

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/offers" label={t("Back to offers & packages")} />

        <GovernanceBanner status={offer.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <Tag className="size-6 shrink-0 text-gold-text" />
            {t(offer.name)}
          </h1>
          <SourceBadge status="DEMO" />
        </div>

        <ImageStrip images={offer.images} alt={offer.name} />

        {offer.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(offer.summary)}
          </p>
        )}
        {offer.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(offer.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Offer type")} value={offer.kind ? t(offer.kind) : null} />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <ItemActions
            itemType="offer"
            itemId={offer.id}
            itemName={offer.name}
            itemImage={offer.images?.[0] ?? null}
          />
          <SaveButton
            itemType="offer"
            itemId={offer.id}
            itemName={offer.name}
            itemImage={offer.images?.[0] ?? null}
          />
        </div>

        <ChipList label={t("Tags")} items={offer.tags} />
      </Section>
    </DetailShell>
  );
}
