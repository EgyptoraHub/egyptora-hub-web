import { GenImage } from "@/components/site/GenImage";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
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

type EgyptEvent = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  venue: string | null;
  ticketed: boolean | null;
  summary: string | null;
};

const title = "Events & Festivals in Egypt | Egyptora Hub";
const description =
  "Egypt's festivals and events calendar — film, music, heritage and cultural events across the country's governorates.";

export const Route = createFileRoute("/events")({
  loader: async () => {
    // Wrapped in try/catch on purpose: a *thrown* exception from the client (a network
    // failure, a cold Supabase connection) is not caught by only checking `error`, and
    // would crash the whole route to the generic "This page didn't load" error boundary
    // instead of just rendering with an empty list.
    let events: EgyptEvent[] = [];
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, slug, name, governorate_slug, category, start_date, end_date, venue, ticketed, summary",
        )
        .order("start_date");

      if (error) {
        console.error("[events] failed to load events:", error.message);
      } else {
        events = (data ?? []) as EgyptEvent[];
      }
    } catch (err) {
      console.error("[events] unexpected error loading events:", err);
    }
    return { events };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/events` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/events` }],
  }),
  component: EventsPage,
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

function EventsPage() {
  const { events: eventsSource } = Route.useLoaderData();
  const events = useLocalizedRows("events", eventsSource);
  const { t, lang } = useI18n();
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(events.map((e) => e.category).filter((c): c is string => !!c))).sort(),
    [events],
  );

  const filtered = category ? events.filter((e) => e.category === category) : events;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = filtered.filter((e) => !e.start_date || e.start_date >= today);
  const past = filtered.filter((e) => e.start_date && e.start_date < today);

  const EventCard = ({ event }: { event: EgyptEvent }) => (
    <article className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-base text-foreground">
          <CalendarDays className="size-4 shrink-0 text-gold" />
          <Link to="/events/$id" params={{ id: event.id }} className="transition-colors hover:text-gold">
            {t(event.name)}
          </Link>
        </h3>
        <SourceBadge status="VERIFIED" />
      </div>

      <p className="mt-2 text-xs font-semibold text-gold">
        {formatDateRange(event.start_date, event.end_date, lang)}
      </p>

      <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="size-3.5 text-gold/70" />
        <Link
          to="/governorates/$id"
          params={{ id: event.governorate_slug }}
          className="hover:text-gold"
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

      {event.summary && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(event.summary)}</p>
      )}
      {event.ticketed && (
        <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-info/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-info">
          <Ticket className="size-3" /> {t("Ticketed")}
        </span>
      )}
      <ItemActions className="mt-4" itemType="event" itemId={event.id} itemName={event.name} />
    </article>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Egyptora Hub"
          title="Events & festivals"
          description="Egypt's festival and events calendar across film, music, heritage and culture."
        />

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              category === null
                ? "border-gold-line bg-gold-soft text-gold"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold",
            )}
          >
            {t("All categories")}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                category === c
                  ? "border-gold-line bg-gold-soft text-gold"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold",
              )}
            >
              {t(c)}
            </button>
          ))}
        </div>

        {upcoming.length > 0 && (
          <>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/80">
              {t("Upcoming")}
            </h2>
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {t("Past events")}
            </h2>
            <div className="grid gap-4 opacity-70 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 && (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            <GenImage k="ph-events" sizes="240px" className="mx-auto mb-3 block w-full max-w-[240px] rounded-xl" />
            {t("No events match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
