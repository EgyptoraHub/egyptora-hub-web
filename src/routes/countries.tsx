import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2, Plane, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRows } from "@/lib/localized-content";

type Country = {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  currency: string | null;
  language: string | null;
  has_egyptian_mission: boolean | null;
  mission_note: string | null;
  visa_route: string | null;
  direct_flights: string[] | null;
  travellers_to_egypt: number | null;
  summary: string | null;
  governance_status: GovernanceStatus;
};

const title = "Visa & Entry by Country | Egyptora Hub";
const description =
  "Visa routes, Egyptian missions and travel information to Egypt, organised by country of origin.";

export const Route = createFileRoute("/countries")({
  loader: async () => {
    const { data, error } = await supabase
      .from("countries")
      .select(
        "id, slug, name, region, currency, language, has_egyptian_mission, mission_note, visa_route, direct_flights, travellers_to_egypt, summary, governance_status",
      )
      .order("name");

    if (error) {
      console.error("[countries] failed to load countries:", error.message);
    }
    return { countries: (data ?? []) as Country[] };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/countries` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/countries` }],
  }),
  component: CountriesPage,
});

function CountriesPage() {
  const { countries: countriesSource } = Route.useLoaderData();
  const countries = useLocalizedRows("countries", countriesSource);
  const { t, lang } = useI18n();
  const [region, setRegion] = useState<string | null>(null);

  const regions = useMemo(
    () =>
      Array.from(new Set(countries.map((c) => c.region).filter((v): v is string => !!v))).sort(),
    [countries],
  );
  const filtered = region ? countries.filter((c) => c.region === region) : countries;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Services"
          title="Visa & entry by country"
          description="Visa routes, Egyptian missions abroad and travel information to Egypt, by country of origin."
        />

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRegion(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              region === null
                ? "border-gold-line bg-gold-soft text-gold-text"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
            )}
          >
            {t("All regions")}
          </button>
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                region === r
                  ? "border-gold-line bg-gold-soft text-gold-text"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
              )}
            >
              {t(r)}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((country) => (
              <article
                key={country.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
              >
                <GovernanceBanner status={country.governance_status} className="mb-3" />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                    <Globe2 className="size-4 shrink-0 text-gold-text" />
                    <Link
                      to="/countries/$id"
                      params={{ id: country.id }}
                      className="transition-colors hover:text-gold-text"
                    >
                      {t(country.name)}
                    </Link>
                  </h2>
                  <SourceBadge status="DEMO" />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {[country.region, country.currency, country.language]
                    .filter(Boolean)
                    .map((v) => t(v as string))
                    .join(" · ")}
                </p>

                {country.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(country.summary)}
                  </p>
                )}

                <div className="mt-3 space-y-1.5 text-xs text-foreground/85">
                  {country.visa_route && (
                    <p className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 shrink-0 text-gold-text" />
                      {t(country.visa_route)}
                    </p>
                  )}
                  {country.direct_flights && country.direct_flights.length > 0 && (
                    <p className="flex items-center gap-1.5">
                      <Plane className="size-3.5 shrink-0 text-gold-text" />
                      {country.direct_flights.map((f) => t(f)).join(", ")}
                    </p>
                  )}
                </div>

                {country.has_egyptian_mission && (
                  <span className="mt-3 inline-block rounded-full border border-gold-line/60 bg-gold-soft px-2 py-0.5 text-2xs text-gold-text">
                    {t("Egyptian mission present")}
                  </span>
                )}
                {country.travellers_to_egypt !== null && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("Travellers to Egypt")}:{" "}
                    {country.travellers_to_egypt.toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            {t("No countries match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
