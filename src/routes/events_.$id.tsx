import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
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

type EgyptEvent = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  venue: string | null;
  organiser: string | null;
  ticketed: boolean | null;
  languages: string[] | null;
  summary: string | null;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/events_/$id")({
  loader: async ({ params }) => {
    // Wrapped in try/catch on purpose: a thrown exception (network failure, cold
    // connection) would otherwise crash the route to the generic error boundary.
    let event: EgyptEvent | null = null;
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, slug, name, governorate_slug, category, start_date, end_date, venue, organiser, ticketed, languages, summary, description, images, tags, governance_status",
        )
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(`[events.$id] failed to load ${params.id}:`, error.message);
      } else {
        event = (data as EgyptEvent | null) ?? null;
      }
    } catch (err) {
      console.error(`[events.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Event unavailable | Egyptora Hub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { event } = loaderData;
    const title = `${event.name} | Egyptora Hub`;
    const description = (event.summary ?? event.description ?? event.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/events/${event.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/events/${event.id}` }],
    };
  },
  notFoundComponent: EventNotFound,
  component: EventDetailPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function formatDateRange(start: string | null, end: string | null, lang: string) {
  if (!start) return null;
  const locale = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  if (end && end !== start) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start);
}

function EventNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/events" backLabel={t("Back to events")} />;
}

function EventDetailPage() {
  const { event: eventSource } = Route.useLoaderData();
  const event = useLocalizedRow("events", eventSource);
  const { t, lang } = useI18n();

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/events" label={t("Back to events")} />

        <GovernanceBanner status={event.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <CalendarDays className="size-6 shrink-0 text-gold-text" />
            {t(event.name)}
          </h1>
          <SourceBadge status="VERIFIED" />
        </div>

        <p className="mt-3 text-sm font-semibold text-gold-text">
          {formatDateRange(event.start_date, event.end_date, lang)}
        </p>

        <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 text-gold-text" />
          <Link
            to="/governorates/$id"
            params={{ id: event.governorate_slug }}
            className="hover:text-gold-text"
          >
            {t(govName(event.governorate_slug))}
          </Link>
          {event.venue && (
            <>
              {" · "}
              {t(event.venue)}
            </>
          )}
        </p>

        {event.ticketed && (
          <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-info/40 px-2 py-0.5 text-2xs font-semibold eyebrow text-info">
            <Ticket className="size-3" /> {t("Ticketed")}
          </span>
        )}

        <ImageStrip images={event.images} alt={event.name} />

        {event.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(event.summary)}
          </p>
        )}
        {event.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(event.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Category")} value={event.category ? t(event.category) : null} />
          <Fact label={t("Venue")} value={event.venue ? t(event.venue) : null} />
          <Fact label={t("Organiser")} value={event.organiser ? t(event.organiser) : null} />
          <Fact label={t("Governorate")} value={t(govName(event.governorate_slug))} />
          <Fact
            label={t("Dates")}
            value={formatDateRange(event.start_date, event.end_date, lang)}
          />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <ItemActions
            itemType="event"
            itemId={event.id}
            itemName={event.name}
            itemImage={event.images?.[0] ?? null}
          />
          <SaveButton
            itemType="event"
            itemId={event.id}
            itemName={event.name}
            itemImage={event.images?.[0] ?? null}
          />
        </div>

        <ChipList label={t("Languages")} items={event.languages} />
        <ChipList label={t("Tags")} items={event.tags} />
      </Section>
    </DetailShell>
  );
}
