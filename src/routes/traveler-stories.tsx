import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Quote, Star } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner } from "@/components/site/GovernanceBanner";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRows } from "@/lib/localized-content";
import { destinationToGovernorate, formatDuration, STORY_LIST_COLS, type StoryListRow } from "@/lib/traveller-stories";

const title = "Tourist Experiences — real trips across Egypt | Egyptora Hub";
const description =
  "Tourist experiences, stories and videos from real trips across Egypt, by country of origin, destination and traveller group.";

export const Route = createFileRoute("/traveler-stories")({
  loader: async () => {
    // Wrapped in try/catch: a thrown client exception must not crash the route.
    let stories: StoryListRow[] = [];
    let govs: { slug: string; name: string; name_ar: string; capital: string | null; cities: string[] | null }[] = [];
    try {
      const [s, g] = await Promise.all([
        supabase.from("traveller_stories").select(STORY_LIST_COLS).order("name"),
        supabase.from("governorates").select("slug, name, name_ar, capital, cities").order("name"),
      ]);
      if (s.error) console.error("[traveler-stories] failed to load traveller_stories:", s.error.message);
      else stories = (s.data ?? []) as unknown as StoryListRow[];
      govs = (g.data ?? []) as typeof govs;
    } catch (err) {
      console.error("[traveler-stories] unexpected error loading traveller_stories:", err);
    }
    return { stories, govs };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/traveler-stories` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/traveler-stories` }],
  }),
  component: TravelerStoriesPage,
});

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn("size-3.5", n <= rounded ? "fill-gold text-gold" : "text-muted-foreground")} />
      ))}
    </span>
  );
}

const chipCls = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1.5 text-xs transition-colors",
    active ? "border-gold-line bg-gold-soft text-gold" : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold",
  );
const selectCls = "min-h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground";

function TravelerStoriesPage() {
  const { stories: storiesSource, govs } = Route.useLoaderData();
  const stories = useLocalizedRows("traveller_stories", storiesSource);
  const { t, lang } = useI18n();
  const [groupType, setGroupType] = useState<string | null>(null);
  const [videosOnly, setVideosOnly] = useState(false);
  const [country, setCountry] = useState("");
  const [gov, setGov] = useState("");
  const [media, setMedia] = useState("");

  const uniq = (xs: (string | null | undefined)[]) => Array.from(new Set(xs.filter((v): v is string => !!v))).sort();
  const groupTypes = useMemo(() => uniq(storiesSource.map((s) => s.group_type)), [storiesSource]);
  const countries = useMemo(() => uniq(storiesSource.map((s) => s.country)), [storiesSource]);
  const mediaTypes = useMemo(() => uniq(storiesSource.map((s) => s.media_type)), [storiesSource]);
  const govOf = (s: StoryListRow) => uniq((s.destinations ?? []).map((d) => destinationToGovernorate(d, govs)));
  const presentGovs = govs.filter((g) => storiesSource.some((s) => govOf(s).includes(g.slug)));
  const hasVideos = storiesSource.some((s) => !!s.video_url);

  const filtered = stories.filter((s, i) => {
    const src = storiesSource[i]!;
    return (
      (!groupType || src.group_type === groupType) &&
      (!videosOnly || !!src.video_url) &&
      (!country || src.country === country) &&
      (!media || src.media_type === media) &&
      (!gov || govOf(src).includes(gov))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Plan your trip"
          title="Tourist Experiences"
          description="Stories, reviews and videos from real trips across Egypt."
        />
        <p lang="ar" dir="rtl" className="-mt-6 mb-6 text-sm text-muted-foreground lg:-mt-8">تجارب السياح في مصر</p>

        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setGroupType(null); setVideosOnly(false); }} className={chipCls(groupType === null && !videosOnly)}>
            {t("All travellers")}
          </button>
          {hasVideos && (
            <button type="button" aria-pressed={videosOnly} onClick={() => setVideosOnly((v) => !v)} className={chipCls(videosOnly)}>
              <Play className="me-1 inline size-3" aria-hidden="true" />
              {t("Videos")}
            </button>
          )}
          {groupTypes.map((g) => (
            <button key={g} type="button" onClick={() => setGroupType(groupType === g ? null : g)} className={chipCls(groupType === g)}>
              {t(g)}
            </button>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {countries.length > 1 && (
            <label className="grid gap-1 text-xs font-semibold text-foreground">
              {t("Country")}
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls}>
                <option value="">{t("All")}</option>
                {countries.map((c) => <option key={c} value={c}>{t(c)}</option>)}
              </select>
            </label>
          )}
          {presentGovs.length > 0 && (
            <label className="grid gap-1 text-xs font-semibold text-foreground">
              {t("Destination")}
              <select value={gov} onChange={(e) => setGov(e.target.value)} className={selectCls}>
                <option value="">{t("All")}</option>
                {presentGovs.map((g) => <option key={g.slug} value={g.slug}>{lang === "ar" ? g.name_ar : t(g.name)}</option>)}
              </select>
            </label>
          )}
          {mediaTypes.length > 1 && (
            <label className="grid gap-1 text-xs font-semibold text-foreground">
              {t("Media")}
              <select value={media} onChange={(e) => setMedia(e.target.value)} className={selectCls}>
                <option value="">{t("All")}</option>
                {mediaTypes.map((m) => <option key={m} value={m}>{t(m)}</option>)}
              </select>
            </label>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((story, i) => {
              const src = filtered === stories ? storiesSource[i]! : storiesSource.find((s) => s.id === story.id)!;
              return (
                <article key={story.id} className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line">
                  <GovernanceBanner status={story.governance_status} className="mb-3" />
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                      <Quote className="size-4 shrink-0 text-gold" />
                      <Link to="/traveler-stories/$id" params={{ id: story.id }} className="transition-colors hover:text-gold">
                        {t(story.name)}
                      </Link>
                    </h2>
                    <SourceBadge status="DEMO" />
                  </div>
                  {src.video_url && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      <Play className="size-3" aria-hidden="true" /> {t("Video")}
                      {src.duration_seconds ? <span dir="ltr"> · {formatDuration(src.duration_seconds)}</span> : null}
                    </p>
                  )}
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {story.country && t(story.country)}
                    {story.group_type && (
                      <>
                        {story.country && "·"}
                        {t(story.group_type)}
                      </>
                    )}
                    <Stars rating={story.rating} />
                  </p>
                  {story.summary && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(story.summary)}</p>}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            {t("No traveller stories match this filter yet.")}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/60 p-5">
          <div>
            <h2 className="font-display text-lg text-foreground">{t("Share your experience")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("Videos are shown only with the creator's consent.")}</p>
          </div>
          <Link
            to="/contact"
            search={{ topic: "Share a tourist experience" }}
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {t("Share your experience")}
          </Link>
        </div>
      </Section>
      <SiteFooter />
    </div>
  );
}
