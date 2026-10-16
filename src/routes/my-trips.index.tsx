import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Loader2, MapPin, Plus } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import { SITE } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

type Trip = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  cover_image: string | null;
};

export const Route = createFileRoute("/my-trips/")({
  head: () => ({
    meta: [
      { title: "My trips — plan your Egypt itinerary | Egyptora Hub" },
      {
        name: "description",
        content: "Build and manage your personal Egypt itineraries, day by day, in one place.",
      },
      { property: "og:title", content: "My trips | Egyptora Hub" },
      { property: "og:description", content: "Build and manage your personal Egypt itineraries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/my-trips` }],
  }),
  component: MyTripsPage,
});

function MyTripsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !user) void navigate({ to: "/auth" });
  }, [sessionLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("trips")
          .select("id, title, start_date, end_date, status, cover_image")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (active) setTrips((data ?? []) as Trip[]);
      } catch (err) {
        console.error("[my-trips] failed to load trips:", err);
        if (active) setTrips([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Egyptora Hub"
          title="My trips"
          description="Your saved itineraries — add days, plan items and request bookings."
          action={
            <Link
              to="/my-trips/new"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground"
            >
              <Plus className="size-4" />
              {t("New trip")}
            </Link>
          }
        />

        {loading || sessionLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gold-text" />
          </div>
        ) : trips.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {t("You haven't planned any trips yet.")}
            </p>
            <Link
              to="/my-trips/new"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground"
            >
              <Plus className="size-4" />
              {t("Create your first trip")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                to="/trips/$id"
                params={{ id: trip.id }}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card/60 transition-colors hover:border-gold-line"
              >
                {trip.cover_image && (
                  <img
                    src={trip.cover_image}
                    alt={trip.title}
                    loading="lazy"
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                      <MapPin className="size-4 shrink-0 text-gold-text" />
                      {trip.title}
                    </h2>
                    <span className="rounded-full border border-gold-line/60 bg-gold-soft px-2.5 py-0.5 text-2xs font-semibold eyebrow text-gold-text">
                      {t(trip.status)}
                    </span>
                  </div>
                  {(trip.start_date || trip.end_date) && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5 text-gold-text" />
                      {[trip.start_date, trip.end_date].filter(Boolean).join(" → ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
