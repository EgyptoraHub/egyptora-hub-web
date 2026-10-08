import type { GovernanceStatus } from "@/components/site/GovernanceBanner";

/* Public columns for traveller stories. moderation_state and internal_notes are not granted to visitors;
 * row visibility (published + video consent/rights) is enforced by the database policy. */
export const STORY_LIST_COLS =
  "id, slug, name, country, group_type, destinations, rating, summary, media_type, images, governance_status, video_url, duration_seconds, created_at";
export const STORY_DETAIL_COLS =
  "id, slug, name, country, group_type, destinations, rating, positives, negatives, suggestions, media_type, summary, description, images, tags, governance_status, video_url, creator_name, creator_url, consent_status, rights_statement, duration_seconds, language_code";

export type StoryListRow = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  group_type: string | null;
  destinations: string[] | null;
  rating: number | null;
  summary: string | null;
  media_type: string | null;
  images: string[] | null;
  governance_status: GovernanceStatus;
  video_url: string | null;
  duration_seconds: number | null;
  created_at: string | null;
};

export const formatDuration = (s: number | null) =>
  s == null ? "" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Map a free-text destination to a governorate slug via the governorate name or capital. */
export function destinationToGovernorate(
  dest: string,
  govs: { slug: string; name: string; capital: string | null; cities: string[] | null }[],
): string | null {
  const d = dest.trim().toLowerCase();
  const g = govs.find(
    (x) => x.name.toLowerCase() === d || x.capital?.toLowerCase() === d || (x.cities ?? []).some((c) => c.toLowerCase() === d),
  );
  return g?.slug ?? null;
}
