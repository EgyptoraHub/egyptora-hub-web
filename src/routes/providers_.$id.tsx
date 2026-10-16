import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
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
import { RequestBookingButton } from "@/lib/trip-actions";
import { useLocalizedRow } from "@/lib/localized-content";

// As on the list page, the source dataset's "demo_verification_label" is deliberately
// not surfaced — it would misrepresent real verification status.
type Provider = {
  id: string;
  slug: string;
  name: string;
  type: string;
  governorate_slug: string;
  licence_ref: string | null;
  rating: number | null;
  review_count: number | null;
  price_from: number | null;
  currency: string | null;
  summary: string | null;
  images: string[] | null;
  amenities: string[] | null;
  accessibility: string[] | null;
  specialties: string[] | null;
  languages: string[] | null;
  availability: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/providers_/$id")({
  loader: async ({ params }) => {
    let provider: Provider | null = null;
    try {
      const { data, error } = await supabase
        .from("providers")
        .select(
          "id, slug, name, type, governorate_slug, licence_ref, rating, review_count, price_from, currency, summary, images, amenities, accessibility, specialties, languages, availability, governance_status",
        )
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(`[providers.$id] failed to load ${params.id}:`, error.message);
      } else {
        provider = (data as Provider | null) ?? null;
      }
    } catch (err) {
      console.error(`[providers.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!provider) throw notFound();
    return { provider };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Provider unavailable | Egyptora Hub" }, { name: "robots", content: "noindex" }],
      };
    }
    const { provider } = loaderData;
    const title = `${provider.name} | Egyptora Hub`;
    const description = (provider.summary ?? provider.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/providers/${provider.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/providers/${provider.id}` }],
    };
  },
  notFoundComponent: ProviderNotFound,
  component: ProviderDetailPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function ProviderNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/providers" backLabel={t("Back to service providers")} />;
}

function ProviderDetailPage() {
  const { provider: providerSource } = Route.useLoaderData();
  const provider = useLocalizedRow("providers", providerSource);
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/providers" label={t("Back to service providers")} />

        <GovernanceBanner status={provider.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-display text-3xl text-foreground lg:text-4xl">{t(provider.name)}</h1>
          <SourceBadge status="DEMO" />
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 text-gold-text" />
          <Link
            to="/governorates/$id"
            params={{ id: provider.governorate_slug }}
            className="hover:text-gold-text"
          >
            {t(govName(provider.governorate_slug))}
          </Link>
          {" · "}
          {t(provider.type)}
        </p>

        <ImageStrip images={provider.images} alt={provider.name} />

        {provider.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(provider.summary)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Type")} value={t(provider.type)} />
          <Fact
            label={t("Rating")}
            value={
              provider.rating !== null ? (
                <span className="flex items-center gap-1.5">
                  <Star className="size-3.5 text-gold-text" />
                  {provider.rating.toFixed(1)}
                  {provider.review_count !== null && (
                    <span className="text-muted-foreground">({provider.review_count})</span>
                  )}
                </span>
              ) : null
            }
          />
          <Fact
            label={t("Price from")}
            value={
              provider.price_from !== null
                ? `${provider.price_from.toLocaleString(locale)} ${provider.currency ?? ""}`.trim()
                : null
            }
          />
          <Fact label={t("Licence reference")} value={provider.licence_ref} />
          <Fact label={t("Governorate")} value={t(govName(provider.governorate_slug))} />
          <Fact
            label={t("Languages")}
            value={
              provider.languages && provider.languages.length > 0
                ? provider.languages.map((l) => t(l)).join(", ")
                : null
            }
          />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <RequestBookingButton
            itemType="provider"
            itemId={provider.id}
            itemName={provider.name}
            amount={provider.price_from}
            currency={provider.currency}
          />
          <SaveButton
            itemType="provider"
            itemId={provider.id}
            itemName={provider.name}
            itemImage={provider.images?.[0] ?? null}
          />
        </div>

        <ChipList label={t("Specialties")} items={provider.specialties} />
        <ChipList label={t("Amenities")} items={provider.amenities} />
        <ChipList label={t("Accessibility")} items={provider.accessibility} />
        <ChipList label={t("Availability")} items={provider.availability} />
      </Section>
    </DetailShell>
  );
}
