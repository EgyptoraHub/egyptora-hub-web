import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Building, MapPin, Ruler } from "lucide-react";
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

type Property = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  property_type: string | null;
  price_usd: number | null;
  area_m2: number | null;
  city: string | null;
  summary: string | null;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/properties_/$id")({
  loader: async ({ params }) => {
    // Wrapped in try/catch on purpose: a thrown exception (network failure, cold
    // connection) would otherwise crash the route to the generic error boundary.
    let property: Property | null = null;
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, slug, name, governorate_slug, property_type, price_usd, area_m2, city, summary, description, images, tags, governance_status",
        )
        .eq("id", params.id)
        .eq("moderation_state", "PUBLISHED")
        .maybeSingle();

      if (error) {
        console.error(`[properties.$id] failed to load ${params.id}:`, error.message);
      } else {
        property = (data as Property | null) ?? null;
      }
    } catch (err) {
      console.error(`[properties.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Property unavailable | Egyptora Hub" }, { name: "robots", content: "noindex" }],
      };
    }
    const { property } = loaderData;
    const title = `${property.name} | Egyptora Hub`;
    const description = (property.summary ?? property.description ?? property.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/properties/${property.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/properties/${property.id}` }],
    };
  },
  notFoundComponent: PropertyNotFound,
  component: PropertyDetailPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function PropertyNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/properties" backLabel={t("Back to real estate")} />;
}

function PropertyDetailPage() {
  const { property: propertySource } = Route.useLoaderData();
  const property = useLocalizedRow("properties", propertySource);
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/properties" label={t("Back to real estate")} />

        <GovernanceBanner status={property.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <Building className="size-6 shrink-0 text-gold-text" />
            {t(property.name)}
          </h1>
          <SourceBadge status="DEMO" />
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 text-gold-text" />
          <Link
            to="/governorates/$id"
            params={{ id: property.governorate_slug }}
            className="hover:text-gold-text"
          >
            {t(govName(property.governorate_slug))}
          </Link>
          {property.city && (
            <>
              {" · "}
              {t(property.city)}
            </>
          )}
        </p>

        <ImageStrip images={property.images} alt={property.name} />

        {property.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(property.summary)}
          </p>
        )}
        {property.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(property.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Type")} value={property.property_type ? t(property.property_type) : null} />
          <Fact
            label={t("Price")}
            value={
              property.price_usd !== null
                ? `$${property.price_usd.toLocaleString(locale, { maximumFractionDigits: 0 })}`
                : null
            }
          />
          <Fact
            label={t("Area")}
            value={
              property.area_m2 !== null ? (
                <span className="flex items-center gap-1.5">
                  <Ruler className="size-3.5 text-gold-text" />
                  {property.area_m2.toLocaleString(locale)} m²
                </span>
              ) : null
            }
          />
          <Fact label={t("City")} value={property.city ? t(property.city) : null} />
          <Fact label={t("Governorate")} value={t(govName(property.governorate_slug))} />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <ItemActions
            itemType="property"
            itemId={property.id}
            itemName={property.name}
            itemImage={property.images?.[0] ?? null}
            amount={property.price_usd}
            currency="usd"
          />
          <SaveButton
            itemType="property"
            itemId={property.id}
            itemName={property.name}
            itemImage={property.images?.[0] ?? null}
          />
        </div>

        <ChipList label={t("Tags")} items={property.tags} />
      </Section>
    </DetailShell>
  );
}
