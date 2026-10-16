import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Building2, MapPin } from "lucide-react";
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

type Museum = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  opened: string | null;
  access: string | null;
  collections_count: number | null;
  highlights: string[] | null;
  summary: string | null;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/museums_/$id")({
  loader: async ({ params }) => {
    // Wrapped in try/catch on purpose: a thrown exception (network failure, cold
    // connection) would otherwise crash the route to the generic error boundary.
    let museum: Museum | null = null;
    try {
      const { data, error } = await supabase
        .from("museums")
        .select(
          "id, slug, name, governorate_slug, opened, access, collections_count, highlights, summary, description, images, tags, governance_status",
        )
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(`[museums.$id] failed to load ${params.id}:`, error.message);
      } else {
        museum = (data as Museum | null) ?? null;
      }
    } catch (err) {
      console.error(`[museums.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!museum) throw notFound();
    return { museum };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Museum unavailable | Egyptora Hub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { museum } = loaderData;
    const title = `${museum.name} | Egyptora Hub`;
    const description = (museum.summary ?? museum.description ?? museum.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/museums/${museum.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/museums/${museum.id}` }],
    };
  },
  notFoundComponent: MuseumNotFound,
  component: MuseumDetailPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function MuseumNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/museums" backLabel={t("Back to museums")} />;
}

function MuseumDetailPage() {
  const { museum: museumSource } = Route.useLoaderData();
  const museum = useLocalizedRow("museums", museumSource);
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/museums" label={t("Back to museums")} />

        <GovernanceBanner status={museum.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <Building2 className="size-6 shrink-0 text-gold-text" />
            {t(museum.name)}
          </h1>
          <SourceBadge status="VERIFIED" />
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 text-gold-text" />
          <Link
            to="/governorates/$id"
            params={{ id: museum.governorate_slug }}
            className="hover:text-gold-text"
          >
            {t(govName(museum.governorate_slug))}
          </Link>
          {museum.opened && (
            <>
              {" · "}
              {t("Opened")} {museum.opened}
            </>
          )}
        </p>

        <ImageStrip images={museum.images} alt={museum.name} />

        {museum.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(museum.summary)}
          </p>
        )}
        {museum.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(museum.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Governorate")} value={t(govName(museum.governorate_slug))} />
          <Fact label={t("Opened")} value={museum.opened ? t(museum.opened) : null} />
          <Fact label={t("Access")} value={museum.access ? t(museum.access) : null} />
          <Fact
            label={t("Collections")}
            value={
              museum.collections_count !== null
                ? museum.collections_count.toLocaleString(locale)
                : null
            }
          />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <ItemActions
            itemType="museum"
            itemId={museum.id}
            itemName={museum.name}
            itemImage={museum.images?.[0] ?? null}
          />
          <SaveButton
            itemType="museum"
            itemId={museum.id}
            itemName={museum.name}
            itemImage={museum.images?.[0] ?? null}
          />
        </div>

        <ChipList label={t("Highlights")} items={museum.highlights} />
        <ChipList label={t("Tags")} items={museum.tags} />
      </Section>
    </DetailShell>
  );
}
