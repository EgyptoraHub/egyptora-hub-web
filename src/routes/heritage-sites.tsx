import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Landmark, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, SourceBadge } from "@/components/site/Primitives";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ItemActions } from "@/lib/trip-actions";
import { useLocalizedRows } from "@/lib/localized-content";

type HeritageSite = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  era: string;
  classification: string | null;
  access: string | null;
  summary: string | null;
  hidden: boolean | null;
};

const title = "Heritage Sites of Egypt — 74 registered sites | Egyptora Hub";
const description =
  "Browse Egypt's registered heritage sites by governorate and historical era, from Pharaonic temples to Islamic, Coptic and Ottoman monuments.";

export const Route = createFileRoute("/heritage-sites")({
  validateSearch: (s: Record<string, unknown>): { hidden?: boolean } =>
    s.hidden === true || s.hidden === "1" || s.hidden === 1 ? { hidden: true } : {},
  loader: async () => {
    // Wrapped in try/catch on purpose: a *thrown* exception from the client (a network
    // failure, a cold Supabase connection) is not caught by only checking `error`, and
    // would crash the whole route to the generic "This page didn't load" error boundary
    // instead of just rendering with an empty list.
    let sites: HeritageSite[] = [];
    try {
      const { data, error } = await supabase
        .from("heritage_sites")
        .select("id, slug, name, governorate_slug, era, classification, access, summary, hidden")
        .order("name");

      if (error) {
        console.error("[heritage-sites] failed to load heritage_sites:", error.message);
      } else {
        sites = (data ?? []) as HeritageSite[];
      }
    } catch (err) {
      console.error("[heritage-sites] unexpected error loading heritage_sites:", err);
    }
    return { sites };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/heritage-sites` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/heritage-sites` }],
  }),
  component: HeritageSitesPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

const accessStyles: Record<string, string> = {
  OPEN: "border-success/40 text-success",
  LIMITED_ACCESS: "border-hot/40 text-hot",
  PERMIT_REQUIRED: "border-info/40 text-info",
};

function HeritageSitesPage() {
  const { sites: sitesSource } = Route.useLoaderData();
  const sites = useLocalizedRows("heritage_sites", sitesSource);
  const { t } = useI18n();
  const [era, setEra] = useState<string | null>(null);
  const { hidden } = Route.useSearch();
  const navigate = Route.useNavigate();

  const eras = useMemo(() => Array.from(new Set(sites.map((s) => s.era))).sort(), [sites]);
  const filtered = sites.filter((s) => (!era || s.era === era) && (!hidden || s.hidden === true));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Egyptora Hub"
          title="Heritage sites"
          description="Registered heritage sites across all 27 governorates, spanning ancient, Coptic, Islamic and modern eras."
        />

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate({ search: hidden ? {} : { hidden: true } })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              hidden
                ? "border-gold-line bg-gold-soft text-gold"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold",
            )}
          >
            {t("Hidden Egypt")} ({sites.filter((s) => s.hidden === true).length})
          </button>
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEra(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              era === null
                ? "border-gold-line bg-gold-soft text-gold"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold",
            )}
          >
            {t("All eras")}
          </button>
          {eras.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEra(e)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                era === e
                  ? "border-gold-line bg-gold-soft text-gold"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold",
              )}
            >
              {t(e)}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((site) => (
              <article
                key={site.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                    <Landmark className="size-4 shrink-0 text-gold" />
                    <Link
                      to="/heritage-sites/$id"
                      params={{ id: site.id }}
                      className="transition-colors hover:text-gold"
                    >
                      {t(site.name)}
                    </Link>
                  </h2>
                  <SourceBadge status="VERIFIED" />
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-gold/70" />
                  <Link
                    to="/governorates/$id"
                    params={{ id: site.governorate_slug }}
                    className="hover:text-gold"
                  >
                    {t(govName(site.governorate_slug))}
                  </Link>
                  {" · "}
                  {t(site.era)}
                </p>

                {site.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(site.summary)}
                  </p>
                )}
                {site.access && (
                  <span
                    className={cn(
                      "mt-3 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
                      accessStyles[site.access] ?? "border-border text-muted-foreground",
                    )}
                  >
                    {t(site.access)}
                  </span>
                )}
                <ItemActions
                  className="mt-4"
                  itemType="heritage_site"
                  itemId={site.id}
                  itemName={site.name}
                />
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            {t("No heritage sites match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
