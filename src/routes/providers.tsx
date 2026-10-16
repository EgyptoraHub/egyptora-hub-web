import { GenImage } from "@/components/site/GenImage";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRows } from "@/lib/localized-content";

// Note: the source dataset's original "verification" field is intentionally not surfaced
// here (see the `demo_verification_label` column comment in Supabase) — 239 of 389 demo
// providers carry that label with no licence_ref behind it, which would misrepresent real
// verification status. `governance_status` (via GovernanceBanner) is the only status this
// page shows the visitor.
type Provider = {
  id: string;
  slug: string;
  name: string;
  type: string;
  governorate_slug: string;
  rating: number | null;
  review_count: number | null;
  price_from: number | null;
  currency: string | null;
  specialties: string[] | null;
  summary: string | null;
  governance_status: GovernanceStatus;
};

const title = "Service Providers in Egypt | Egyptora Hub";
const description =
  "Hotels, guides, tour operators and service providers across Egypt's governorates.";

export const Route = createFileRoute("/providers")({
  loader: async () => {
    // Wrapped in try/catch on purpose: a *thrown* exception from the client (a network
    // failure, a cold Supabase connection) is not caught by only checking `error`, and
    // would crash the whole route to the generic "This page didn't load" error boundary
    // instead of just rendering with an empty list.
    let providers: Provider[] = [];
    try {
      const { data, error } = await supabase
        .from("providers")
        .select(
          "id, slug, name, type, governorate_slug, rating, review_count, price_from, currency, specialties, summary, governance_status",
        )
        .order("name");

      if (error) {
        console.error("[providers] failed to load providers:", error.message);
      } else {
        providers = (data ?? []) as Provider[];
      }
    } catch (err) {
      console.error("[providers] unexpected error loading providers:", err);
    }
    return { providers };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/providers` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/providers` }],
  }),
  component: ProvidersPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function ProvidersPage() {
  const { providers: providersSource } = Route.useLoaderData();
  const providers = useLocalizedRows("providers", providersSource);
  const { t } = useI18n();
  const [type, setType] = useState<string | null>(null);

  const types = useMemo(
    () => Array.from(new Set(providers.map((p) => p.type))).sort(),
    [providers],
  );
  const filtered = type ? providers.filter((p) => p.type === type) : providers;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Invest & business"
          title="Service providers"
          description="Hotels, guides, tour operators and service providers across Egypt's governorates."
        />

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setType(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              type === null
                ? "border-gold-line bg-gold-soft text-gold-text"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
            )}
          >
            {t("All types")}
          </button>
          {types.map((ty) => (
            <button
              key={ty}
              type="button"
              onClick={() => setType(ty)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                type === ty
                  ? "border-gold-line bg-gold-soft text-gold-text"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
              )}
            >
              {t(ty)}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((provider) => (
              <article
                key={provider.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
              >
                <GovernanceBanner status={provider.governance_status} className="mb-3" />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-base text-foreground">
                    <Link
                      to="/providers/$id"
                      params={{ id: provider.id }}
                      className="transition-colors hover:text-gold-text"
                    >
                      {t(provider.name)}
                    </Link>
                  </h2>
                  <SourceBadge status="DEMO" />
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-gold-text" />
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

                {provider.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(provider.summary)}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-foreground/85">
                  {provider.rating !== null && (
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 text-gold-text" />
                      {provider.rating.toFixed(1)}
                      {provider.review_count !== null && (
                        <span className="text-muted-foreground">({provider.review_count})</span>
                      )}
                    </span>
                  )}
                  {provider.price_from !== null && (
                    <span className="text-gold-text">
                      {t("From")} {provider.price_from.toLocaleString()} {provider.currency ?? ""}
                    </span>
                  )}
                </div>

                {provider.specialties && provider.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {provider.specialties.slice(0, 4).map((sp) => (
                      <span
                        key={sp}
                        className="rounded-full border border-gold-line/60 bg-gold-soft px-2 py-0.5 text-2xs text-gold-text"
                      >
                        {t(sp)}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            <GenImage k="ph-providers" sizes="240px" className="mx-auto mb-3 block w-full max-w-[240px] rounded-xl" />
            {t("No providers match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
