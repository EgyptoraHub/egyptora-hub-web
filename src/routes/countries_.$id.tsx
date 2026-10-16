import { createFileRoute, notFound } from "@tanstack/react-router";
import { Globe2, Plane, ShieldCheck } from "lucide-react";
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
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { SaveButton } from "@/components/site/SaveButton";
import { RequestBookingButton } from "@/lib/trip-actions";
import { useLocalizedRow } from "@/lib/localized-content";

type Country = {
  id: string;
  slug: string;
  name: string;
  iso2: string | null;
  region: string | null;
  currency: string | null;
  language: string | null;
  has_egyptian_mission: boolean | null;
  mission_note: string | null;
  visa_route: string | null;
  direct_flights: string[] | null;
  suggested_routes: string[] | null;
  travellers_to_egypt: number | null;
  summary: string | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/countries_/$id")({
  loader: async ({ params }) => {
    let country: Country | null = null;
    try {
      const { data, error } = await supabase
        .from("countries")
        .select(
          "id, slug, name, iso2, region, currency, language, has_egyptian_mission, mission_note, visa_route, direct_flights, suggested_routes, travellers_to_egypt, summary, governance_status",
        )
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(`[countries.$id] failed to load ${params.id}:`, error.message);
      } else {
        country = (data as Country | null) ?? null;
      }
    } catch (err) {
      console.error(`[countries.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!country) throw notFound();
    return { country };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Country unavailable | Egyptora Hub" }, { name: "robots", content: "noindex" }],
      };
    }
    const { country } = loaderData;
    const title = `${country.name} — travel to Egypt | Egyptora Hub`;
    const description = (
      country.summary ?? `Visa routes and travel information to Egypt from ${country.name}.`
    ).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/countries/${country.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/countries/${country.id}` }],
    };
  },
  notFoundComponent: CountryNotFound,
  component: CountryDetailPage,
});

function CountryNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/countries" backLabel={t("Back to visa & entry by country")} />;
}

function CountryDetailPage() {
  const { country: countrySource } = Route.useLoaderData();
  const country = useLocalizedRow("countries", countrySource);
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/countries" label={t("Back to visa & entry by country")} />

        <GovernanceBanner status={country.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <Globe2 className="size-6 shrink-0 text-gold-text" />
            {t(country.name)}
          </h1>
          <SourceBadge status="DEMO" />
        </div>

        {country.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(country.summary)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Region")} value={country.region ? t(country.region) : null} />
          <Fact label={t("Currency")} value={country.currency ? t(country.currency) : null} />
          <Fact label={t("Language")} value={country.language ? t(country.language) : null} />
          <Fact
            label={t("Visa route")}
            value={
              country.visa_route ? (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-gold-text" />
                  {t(country.visa_route)}
                </span>
              ) : null
            }
          />
          <Fact
            label={t("Egyptian mission")}
            value={
              country.has_egyptian_mission
                ? t(country.mission_note ?? "Egyptian mission present")
                : null
            }
          />
          <Fact
            label={t("Travellers to Egypt")}
            value={
              country.travellers_to_egypt !== null
                ? country.travellers_to_egypt.toLocaleString(locale)
                : null
            }
          />
          <Fact
            label={t("Direct flights")}
            value={
              country.direct_flights && country.direct_flights.length > 0 ? (
                <span className="flex items-center gap-1.5">
                  <Plane className="size-3.5 text-gold-text" />
                  {country.direct_flights.map((f) => t(f)).join(", ")}
                </span>
              ) : null
            }
          />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <RequestBookingButton
            itemType="country"
            itemId={country.id}
            itemName={country.name}
          />
          <SaveButton
            itemType="country"
            itemId={country.id}
            itemName={country.name}
          />
        </div>

        <ChipList label={t("Suggested routes")} items={country.suggested_routes} />
      </Section>
    </DetailShell>
  );
}
