import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Ticket } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import { BackLink } from "@/components/site/DetailPrimitives";
import { SITE } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

type Booking = {
  id: string;
  item_type: string;
  item_id: string;
  item_name: string | null;
  status: string;
  requested_at: string;
};

const ITEM_TYPE_LABEL: Record<string, string> = {
  property: "Property",
  offer: "Offer",
  event: "Event",
  heritage_site: "Heritage site",
  museum: "Museum",
  investment_opportunity: "Investment opportunity",
};

export const Route = createFileRoute("/account_/bookings")({
  head: () => ({
    meta: [
      { title: "My booking requests | Egyptora Hub" },
      { name: "description", content: "Track the status of every booking request you've sent." },
      { property: "og:title", content: "My booking requests | Egyptora Hub" },
      {
        property: "og:description",
        content: "Track the status of every booking request you've sent.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/account/bookings` }],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
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
          .from("bookings")
          .select("id, item_type, item_id, item_name, status, requested_at")
          .order("requested_at", { ascending: false });
        if (error) throw error;
        if (active) setBookings((data ?? []) as Booking[]);
      } catch (err) {
        console.error("[account/bookings] failed to load bookings:", err);
        if (active) setBookings([]);
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
        <BackLink to="/account" label={t("Back to my dashboard")} />
        <div className="mt-5">
          <SectionHeader
            eyebrow="Egyptora Hub"
            title="My booking requests"
            description="Every request you've sent, with its current status. Our team follows up by email."
          />
        </div>

        {loading || sessionLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gold-text" />
          </div>
        ) : bookings.length === 0 ? (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
            {t("You haven't requested any bookings yet.")}
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/60 p-5"
              >
                <div>
                  <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                    <Ticket className="size-4 shrink-0 text-gold-text" />
                    {t(booking.item_name ?? booking.item_id)}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(ITEM_TYPE_LABEL[booking.item_type] ?? booking.item_type)}
                    {" · "}
                    {new Date(booking.requested_at).toLocaleDateString(lang)}
                  </p>
                </div>
                <span className="rounded-full border border-gold-line/60 bg-gold-soft px-2.5 py-1 text-2xs font-semibold eyebrow text-gold-text">
                  {t(booking.status)}
                </span>
              </article>
            ))}
          </div>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
