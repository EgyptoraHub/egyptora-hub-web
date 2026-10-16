import { GenImage } from "@/components/site/GenImage";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRows } from "@/lib/localized-content";

type Offer = {
  id: string;
  slug: string;
  name: string;
  kind: string | null;
  summary: string | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

const title = "Offers & Packages in Egypt | Egyptora Hub";
const description =
  "Travel offers and packages across Egypt — hotels, tours and experiences bundled for visitors.";

export const Route = createFileRoute("/offers")({
  loader: async () => {
    const { data, error } = await supabase
      .from("offers")
      .select("id, slug, name, kind, summary, tags, governance_status")
      .order("name");

    if (error) {
      console.error("[offers] failed to load offers:", error.message);
    }
    return { offers: (data ?? []) as Offer[] };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/offers` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/offers` }],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { offers: offersSource } = Route.useLoaderData();
  const offers = useLocalizedRows("offers", offersSource);
  const { t } = useI18n();
  const [kind, setKind] = useState<string | null>(null);

  const kinds = useMemo(
    () => Array.from(new Set(offers.map((o) => o.kind).filter((v): v is string => !!v))).sort(),
    [offers],
  );
  const filtered = kind ? offers.filter((o) => o.kind === kind) : offers;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Egyptora Hub"
          title="Offers & packages"
          description="Curated travel offers and packages across Egypt's hotels, tours and experiences."
        />

        {kinds.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setKind(null)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                kind === null
                  ? "border-gold-line bg-gold-soft text-gold"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold",
              )}
            >
              {t("All offers")}
            </button>
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  kind === k
                    ? "border-gold-line bg-gold-soft text-gold"
                    : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold",
                )}
              >
                {t(k)}
              </button>
            ))}
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((offer) => (
              <article
                key={offer.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
              >
                <GovernanceBanner status={offer.governance_status} className="mb-3" />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                    <Tag className="size-4 shrink-0 text-gold" />
                    <Link
                      to="/offers/$id"
                      params={{ id: offer.id }}
                      className="transition-colors hover:text-gold"
                    >
                      {t(offer.name)}
                    </Link>
                  </h2>
                  <SourceBadge status="DEMO" />
                </div>

                {offer.kind && (
                  <p className="mt-2 text-xs text-muted-foreground">{t(offer.kind)}</p>
                )}
                {offer.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(offer.summary)}
                  </p>
                )}
                {offer.tags && offer.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {offer.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gold-line/60 bg-gold-soft px-2 py-0.5 text-[10px] text-gold"
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
            <GenImage k="ph-offers" sizes="240px" className="mx-auto mb-3 block w-full max-w-[240px] rounded-xl" />
            {t("No offers match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
