import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRows } from "@/lib/localized-content";

type HeritageWorldwideItem = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  institution: string | null;
  object: string | null;
  era: string | null;
  summary: string | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

type EraLookup = { key: string; name: string };

const title = "Egyptian Heritage Worldwide — objects held abroad | Egyptora Hub";
const description =
  "Egyptian antiquities and heritage objects held in museums and institutions around the world, documented by country, institution and era.";

export const Route = createFileRoute("/egyptian-heritage-worldwide")({
  loader: async () => {
    // Wrapped in try/catch on purpose: a *thrown* exception from the client (a network
    // failure, a cold Supabase connection) is not caught by only checking `error`, and
    // would crash the whole route to the generic "This page didn't load" error boundary
    // instead of just rendering with an empty list.
    let items: HeritageWorldwideItem[] = [];
    let eras: EraLookup[] = [];
    try {
      const [itemsRes, erasRes] = await Promise.all([
        supabase
          .from("heritage_worldwide")
          .select(
            "id, slug, name, country, institution, object, era, summary, tags, governance_status",
          )
          .order("name"),
        supabase.from("eras").select("key, name"),
      ]);

      if (itemsRes.error) {
        console.error(
          "[egyptian-heritage-worldwide] failed to load heritage_worldwide:",
          itemsRes.error.message,
        );
      } else {
        items = (itemsRes.data ?? []) as HeritageWorldwideItem[];
      }

      if (erasRes.error) {
        console.error("[egyptian-heritage-worldwide] failed to load eras:", erasRes.error.message);
      } else {
        eras = (erasRes.data ?? []) as EraLookup[];
      }
    } catch (err) {
      console.error("[egyptian-heritage-worldwide] unexpected error loading data:", err);
    }
    return { items, eras };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/egyptian-heritage-worldwide` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/egyptian-heritage-worldwide` }],
  }),
  component: HeritageWorldwidePage,
});

function HeritageWorldwidePage() {
  const { items: itemsSource, eras } = Route.useLoaderData();
  const items = useLocalizedRows("heritage_worldwide", itemsSource);
  const { t } = useI18n();
  const [country, setCountry] = useState<string | null>(null);

  const eraName = (key: string | null) =>
    key ? (eras.find((e) => e.key === key)?.name ?? key) : null;

  const countries = useMemo(
    () => Array.from(new Set(items.map((i) => i.country).filter((v): v is string => !!v))).sort(),
    [items],
  );
  const filtered = country ? items.filter((i) => i.country === country) : items;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Discover Egypt"
          title="Egyptian heritage worldwide"
          description="Egyptian antiquities and heritage objects held in museums and institutions around the world."
        />

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCountry(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              country === null
                ? "border-gold-line bg-gold-soft text-gold-text"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
            )}
          >
            {t("All countries")}
          </button>
          {countries.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCountry(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                country === c
                  ? "border-gold-line bg-gold-soft text-gold-text"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
              )}
            >
              {t(c)}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
              >
                <GovernanceBanner status={item.governance_status} className="mb-3" />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                    <Globe2 className="size-4 shrink-0 text-gold-text" />
                    <Link
                      to="/egyptian-heritage-worldwide/$id"
                      params={{ id: item.id }}
                      className="transition-colors hover:text-gold-text"
                    >
                      {t(item.name)}
                    </Link>
                  </h2>
                  <SourceBadge status="DEMO" />
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  {item.institution && t(item.institution)}
                  {item.country && (
                    <>
                      {item.institution && " · "}
                      {t(item.country)}
                    </>
                  )}
                  {eraName(item.era) && (
                    <>
                      {" · "}
                      {t(eraName(item.era)!)}
                    </>
                  )}
                </p>

                {item.object && (
                  <p className="mt-3 text-sm font-medium text-foreground">{t(item.object)}</p>
                )}

                {item.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(item.summary)}
                  </p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gold-line/60 bg-gold-soft px-2 py-0.5 text-2xs text-gold-text"
                      >
                        {t(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            {t("No heritage-worldwide objects match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
