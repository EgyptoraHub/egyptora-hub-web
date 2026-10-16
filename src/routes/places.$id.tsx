import { createFileRoute, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Section } from "@/components/site/Primitives";
import { BackLink, DetailNotFound, DetailShell, Fact, FactGrid, ImageStrip } from "@/components/site/DetailPrimitives";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

type Place = {
  id: string;
  slug: string;
  governorate_slug: string;
  name: string;
  name_ar: string | null;
  type: string;
  summary: string | null;
  description: string | null;
  images: string[] | null;
};

export const Route = createFileRoute("/places/$id")({
  loader: async ({ params }) => {
    let place: Place | null = null;
    try {
      const { data, error } = await supabase
        .from("governorate_areas")
        .select("id, slug, governorate_slug, name, name_ar, type, summary, description, images")
        .eq("slug", params.id)
        .maybeSingle();
      if (error) console.error(`[places.$id] ${params.id}:`, error.message);
      else place = (data as Place | null) ?? null;
    } catch (err) {
      console.error(`[places.$id] ${params.id}:`, err);
    }
    if (!place) throw notFound();
    return { place };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Place unavailable | Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    const { place } = loaderData;
    const gov = governorates.find((g) => g.id === place.governorate_slug)?.name ?? "";
    const title = `${place.name}, ${gov} | Egyptora Hub`;
    const description = (place.summary ?? `${place.name} — a ${place.type} of ${gov} Governorate, Egypt.`).slice(0, 155);
    const img = place.images?.[0];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/places/${place.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/places/${place.slug}` }],
    };
  },
  notFoundComponent: PlaceNotFound,
  component: PlacePage,
});

function PlaceNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/" backLabel={t("Back to the national gateway")} />;
}

function PlacePage() {
  const { place } = Route.useLoaderData();
  const { t, lang } = useI18n();
  const gov = governorates.find((g) => g.id === place.governorate_slug);
  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to={`/governorates/${place.governorate_slug}`} label={`${t("Back to")} ${t(gov?.name ?? "")}`} />
        <h1 className="mt-5 flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
          <MapPin className="size-6 shrink-0 text-gold-text" />
          {lang === "ar" && place.name_ar ? place.name_ar : place.name}
        </h1>
        {place.name_ar && lang !== "ar" && <p className="mt-1 text-sm text-muted-foreground" dir="rtl">{place.name_ar}</p>}
        <FactGrid>
          <Fact label={t("Type")} value={place.type === "district" ? t("District (qism)") : t("Markaz")} />
          <Fact label={t("Governorate")} value={t(gov?.name ?? place.governorate_slug)} />
        </FactGrid>
        <ImageStrip images={place.images} alt={place.name} />
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
          {place.description ?? place.summary ?? t("A detailed profile for this place is being prepared — check back soon.")}
        </p>
      </Section>
    </DetailShell>
  );
}
