import { GenImage } from "@/components/site/GenImage";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, MapPin } from "lucide-react";
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

type Museum = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  opened: string | null;
  highlights: string[] | null;
  summary: string | null;
};

const title = "Museums of Egypt — 27 museums to explore | Egyptora Hub";
const description =
  "Explore Egypt's museums by governorate, from the Grand Egyptian Museum to regional collections across the country.";

export const Route = createFileRoute("/museums")({
  loader: async () => {
    // Wrapped in try/catch on purpose: a *thrown* exception from the client (a network
    // failure, a cold Supabase connection) is not caught by only checking `error`, and
    // would crash the whole route to the generic "This page didn't load" error boundary
    // instead of just rendering with an empty list.
    let museums: Museum[] = [];
    try {
      const { data, error } = await supabase
        .from("museums")
        .select("id, slug, name, governorate_slug, opened, highlights, summary")
        .order("name");

      if (error) {
        console.error("[museums] failed to load museums:", error.message);
      } else {
        museums = (data ?? []) as Museum[];
      }
    } catch (err) {
      console.error("[museums] unexpected error loading museums:", err);
    }
    return { museums };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/museums` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/museums` }],
  }),
  component: MuseumsPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function MuseumsPage() {
  const { museums: museumsSource } = Route.useLoaderData();
  const museums = useLocalizedRows("museums", museumsSource);
  const { t } = useI18n();
  const [gov, setGov] = useState<string | null>(null);

  const govOptions = useMemo(
    () => Array.from(new Set(museums.map((m) => m.governorate_slug))).sort(),
    [museums],
  );
  const filtered = gov ? museums.filter((m) => m.governorate_slug === gov) : museums;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Egyptora Hub"
          title="Museums & exhibitions"
          description="Egypt's museums, from national institutions to regional collections."
        />

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGov(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              gov === null
                ? "border-gold-line bg-gold-soft text-gold-text"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
            )}
          >
            {t("All governorates")}
          </button>
          {govOptions.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setGov(slug)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                gov === slug
                  ? "border-gold-line bg-gold-soft text-gold-text"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
              )}
            >
              {t(govName(slug))}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((museum) => (
              <article
                key={museum.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                    <Building2 className="size-4 shrink-0 text-gold-text" />
                    <Link
                      to="/museums/$id"
                      params={{ id: museum.id }}
                      className="transition-colors hover:text-gold-text"
                    >
                      {t(museum.name)}
                    </Link>
                  </h2>
                  <SourceBadge status="VERIFIED" />
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-gold-text" />
                  <Link
                    to="/governorates/$id"
                    params={{ id: museum.governorate_slug }}
                    className="hover:text-gold-text"
                  >
                    {t(govName(museum.governorate_slug))}
                  </Link>
                  {museum.opened && (
                    <>
                      {" "}
                      {" · "}
                      {t("Opened")} {museum.opened}
                    </>
                  )}
                </p>

                {museum.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(museum.summary)}
                  </p>
                )}
                {museum.highlights && museum.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {museum.highlights.slice(0, 3).map((h) => (
                      <span
                        key={h}
                        className="rounded-full border border-gold-line/60 bg-gold-soft px-2 py-0.5 text-2xs text-gold-text"
                      >
                        {t(h)}
                      </span>
                    ))}
                  </div>
                )}
                <ItemActions
                  className="mt-4"
                  itemType="museum"
                  itemId={museum.id}
                  itemName={museum.name}
                />
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            <GenImage k="ph-museums" sizes="240px" className="mx-auto mb-3 block w-full max-w-[240px] rounded-xl" />
            {t("No museums match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
