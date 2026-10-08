import { createFileRoute, notFound } from "@tanstack/react-router";
import { Quote, Star } from "lucide-react";
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
import { SaveButton } from "@/components/site/SaveButton";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRow } from "@/lib/localized-content";
import { Link } from "@tanstack/react-router";
import { STORY_DETAIL_COLS, destinationToGovernorate, formatDuration } from "@/lib/traveller-stories";
import { videoEmbed } from "@/lib/culture";
import { StoryReportButton } from "@/components/site/StoryReportButton";

type TravellerStory = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  group_type: string | null;
  destinations: string[] | null;
  rating: number | null;
  positives: string[] | null;
  negatives: string[] | null;
  suggestions: string[] | null;
  media_type: string | null;
  summary: string | null;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
  video_url: string | null;
  creator_name: string | null;
  creator_url: string | null;
  consent_status: string;
  rights_statement: string | null;
  duration_seconds: number | null;
  language_code: string | null;
};
type GovLink = { slug: string; name: string; name_ar: string; capital: string | null; cities: string[] | null };


export const Route = createFileRoute("/traveler-stories_/$id")({
  loader: async ({ params }) => {
    // Wrapped in try/catch on purpose: a thrown exception (network failure, cold
    // connection) would otherwise crash the route to the generic error boundary.
    // Visibility (published + video consent/rights) is enforced by the database policy.
    let story: TravellerStory | null = null;
    let govs: GovLink[] = [];
    try {
      const [{ data, error }, g] = await Promise.all([
        supabase.from("traveller_stories").select(STORY_DETAIL_COLS).eq("id", params.id).maybeSingle(),
        supabase.from("governorates").select("slug, name, name_ar, capital, cities"),
      ]);
      govs = (g.data ?? []) as GovLink[];
      if (error) {
        console.error(`[traveler-stories.$id] failed to load ${params.id}:`, error.message);
      } else {
        story = (data as unknown as TravellerStory | null) ?? null;
      }
    } catch (err) {
      console.error(`[traveler-stories.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!story) throw notFound();
    return { story, govs };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Story unavailable | Egyptora Hub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { story } = loaderData;
    const title = `${story.name} | Egyptora Hub`;
    const description = (story.summary ?? story.description ?? story.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE.url}/traveler-stories/${story.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/traveler-stories/${story.id}` }],
    };
  },
  notFoundComponent: StoryNotFound,
  component: StoryDetailPage,
});

function StoryNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/traveler-stories" backLabel={t("Back to traveller stories")} />;
}

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("size-4", n <= rounded ? "fill-gold text-gold" : "text-muted-foreground")}
        />
      ))}
    </span>
  );
}

function StoryDetailPage() {
  const { story: storySource, govs } = Route.useLoaderData();
  const story = useLocalizedRow("traveller_stories", storySource);
  const { t, lang } = useI18n();
  const embed = storySource.consent_status !== "none" && storySource.rights_statement?.trim() ? videoEmbed(storySource.video_url) : null;
  const places = Array.from(new Set((storySource.destinations ?? []).map((d) => destinationToGovernorate(d, govs)).filter((x): x is string => !!x)))
    .map((slug) => govs.find((g) => g.slug === slug)!)
    .filter(Boolean);

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/traveler-stories" label={t("Back to traveller stories")} />

        <GovernanceBanner status={story.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <Quote className="size-6 shrink-0 text-gold" />
            {t(story.name)}
          </h1>
          <SourceBadge status="DEMO" />
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {story.country && t(story.country)}
          {story.group_type && (
            <>
              {story.country && "·"}
              {t(story.group_type)}
            </>
          )}
          <Stars rating={story.rating} />
        </p>

        {embed ? (
          <figure className="mt-6 max-w-3xl">
            <div className="aspect-video overflow-hidden rounded-2xl border border-border">
              <iframe src={embed} title={story.name} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="size-full" />
            </div>
            <figcaption className="mt-2 text-xs text-muted-foreground" dir="auto">
              {storySource.creator_name && (
                <>
                  {t("Video by")}{" "}
                  {storySource.creator_url ? (
                    <a href={storySource.creator_url} target="_blank" rel="noopener noreferrer" className="text-gold underline">{storySource.creator_name}</a>
                  ) : storySource.creator_name}
                  {" · "}
                </>
              )}
              {storySource.rights_statement}
              {storySource.duration_seconds ? <span dir="ltr"> · {formatDuration(storySource.duration_seconds)}</span> : null}
            </figcaption>
          </figure>
        ) : (
          <ImageStrip images={story.images} alt={story.name} />
        )}

        <SaveButton
          className="mt-6"
          itemType="traveller_story"
          itemId={story.id}
          itemName={story.name}
          itemImage={story.images?.[0] ?? null}
        />

        {story.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(story.summary)}
          </p>
        )}
        {story.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(story.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Country")} value={story.country ? t(story.country) : null} />
          <Fact label={t("Travellers")} value={story.group_type ? t(story.group_type) : null} />
          <Fact label={t("Rating")} value={story.rating !== null ? `${story.rating}/5` : null} />
          <Fact label={t("Media")} value={story.media_type ? t(story.media_type) : null} />
        </FactGrid>

        <ChipList label={t("Destinations")} items={story.destinations} />
        <ChipList label={t("What worked well")} items={story.positives} />
        <ChipList label={t("What could be better")} items={story.negatives} />
        <ChipList label={t("Suggestions")} items={story.suggestions} />
        <ChipList label={t("Tags")} items={story.tags} />

        {places.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-foreground">{t("Visit this place")}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {places.map((g) => (
                <li key={g.slug}>
                  <Link to="/governorates/$id" params={{ id: g.slug }} className="inline-flex min-h-10 items-center rounded-full border border-gold-line px-4 text-sm text-gold hover:bg-gold-soft">
                    {lang === "ar" ? g.name_ar : t(g.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <StoryReportButton storyId={story.id} label={story.name} />
        </div>
      </Section>
    </DetailShell>
  );
}
