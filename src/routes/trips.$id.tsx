import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, CalendarDays, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section } from "@/components/site/Primitives";
import { BackLink, DetailNotFound } from "@/components/site/DetailPrimitives";
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
type Day = { id: string; day_number: number; date: string | null };
type Item = {
  id: string;
  trip_day_id: string | null;
  item_type: string;
  item_id: string;
  item_name: string | null;
  item_image: string | null;
  position: number;
  notes: string | null;
};

const ITEM_TYPE_LABEL: Record<string, string> = {
  property: "Property",
  offer: "Offer",
  event: "Event",
  heritage_site: "Heritage site",
  museum: "Museum",
  investment_opportunity: "Investment opportunity",
};

export const Route = createFileRoute("/trips/$id")({
  head: () => ({
    meta: [
      { title: "Trip builder | Egyptora Hub" },
      { name: "description", content: "Plan your Egypt itinerary day by day." },
      { property: "og:title", content: "Trip builder | Egyptora Hub" },
      { property: "og:description", content: "Plan your Egypt itinerary day by day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/my-trips` }],
  }),
  component: TripBuilderPage,
});

function TripBuilderPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionLoading && !user) void navigate({ to: "/auth" });
  }, [sessionLoading, user, navigate]);

  const load = useCallback(async () => {
    // RLS keeps this owner-only: another user's id simply returns no row,
    // which renders the shared graceful "not found" state.
    try {
      const { data: tripRow, error } = await supabase
        .from("trips")
        .select("id, title, start_date, end_date, status, cover_image")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      setTrip((tripRow as Trip | null) ?? null);
      if (!tripRow) return;

      const [{ data: dayRows }, { data: itemRows }] = await Promise.all([
        supabase.from("trip_days").select("id, day_number, date").eq("trip_id", id).order("day_number"),
        supabase
          .from("trip_items")
          .select("id, trip_day_id, item_type, item_id, item_name, item_image, position, notes")
          .eq("trip_id", id)
          .order("position"),
      ]);
      setDays((dayRows ?? []) as Day[]);
      setItems((itemRows ?? []) as Item[]);
    } catch (err) {
      console.error("[trips.$id] failed to load trip:", err);
      setTrip(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user, load]);

  const addDay = async () => {
    const next = (days.at(-1)?.day_number ?? 0) + 1;
    const { error } = await supabase.from("trip_days").insert({ trip_id: id, day_number: next });
    if (error) {
      console.error("[trips.$id] failed to add day:", error.message);
      toast.error(t("Something went wrong. Please try again."));
      return;
    }
    toast.success(t("Day added."));
    void load();
  };

  const removeDay = async (dayId: string) => {
    const { error } = await supabase.from("trip_days").delete().eq("id", dayId);
    if (error) {
      console.error("[trips.$id] failed to remove day:", error.message);
      toast.error(t("Something went wrong. Please try again."));
      return;
    }
    toast.success(t("Day removed."));
    void load();
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase.from("trip_items").delete().eq("id", itemId);
    if (error) {
      console.error("[trips.$id] failed to remove item:", error.message);
      toast.error(t("Something went wrong. Please try again."));
      return;
    }
    toast.success(t("Item removed."));
    void load();
  };

  /** Swap two items' `position` values to move one up or down within its group. */
  const move = async (group: Item[], index: number, direction: -1 | 1) => {
    const current = group[index];
    const target = group[index + direction];
    if (!current || !target) return;
    const results = await Promise.all([
      supabase.from("trip_items").update({ position: target.position }).eq("id", current.id),
      supabase.from("trip_items").update({ position: current.position }).eq("id", target.id),
    ]);
    if (results.some((r) => r.error)) {
      toast.error(t("Something went wrong. Please try again."));
      return;
    }
    void load();
  };

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <Section className="flex justify-center py-24">
          <Loader2 className="size-6 animate-spin text-gold-text" />
        </Section>
        <SiteFooter />
      </div>
    );
  }

  if (!trip) {
    return <DetailNotFound backTo="/my-trips" backLabel={t("Back to my trips")} />;
  }

  const unscheduled = items.filter((item) => !item.trip_day_id);

  const renderItems = (group: Item[]) =>
    group.length === 0 ? (
      <p className="mt-3 text-xs text-muted-foreground">{t("Nothing planned here yet.")}</p>
    ) : (
      <ul className="mt-3 space-y-2">
        {group.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3"
          >
            {item.item_image ? (
              <img
                src={item.item_image}
                alt={item.item_name ?? item.item_id}
                loading="lazy"
                className="size-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="size-12 shrink-0 rounded-lg border border-border/60 bg-card/60" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{t(item.item_name ?? item.item_id)}</p>
              <p className="text-2xs text-muted-foreground">
                {t(ITEM_TYPE_LABEL[item.item_type] ?? item.item_type)}
              </p>
              {item.notes && <p className="mt-1 text-2xs text-muted-foreground">{item.notes}</p>}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={t("Move up")}
                disabled={index === 0}
                onClick={() => void move(group, index, -1)}
                className="rounded-full border border-border/60 p-1.5 text-muted-foreground transition-colors hover:text-gold-text disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={t("Move down")}
                disabled={index === group.length - 1}
                onClick={() => void move(group, index, 1)}
                className="rounded-full border border-border/60 p-1.5 text-muted-foreground transition-colors hover:text-gold-text disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={t("Remove item")}
                onClick={() => void removeItem(item.id)}
                className="rounded-full border border-border/60 p-1.5 text-muted-foreground transition-colors hover:text-hot"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section className="py-10 lg:py-14">
        <BackLink to="/my-trips" label={t("Back to my trips")} />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-foreground lg:text-4xl">{trip.title}</h1>
            {(trip.start_date || trip.end_date) && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5 text-gold-text" />
                {[trip.start_date, trip.end_date].filter(Boolean).join(" → ")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void addDay()}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground"
          >
            <Plus className="size-4" />
            {t("Add day")}
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {days.map((day) => {
            const group = items.filter((item) => item.trip_day_id === day.id);
            return (
              <section key={day.id} className="rounded-2xl border border-border/60 bg-card/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-base text-gold-text">
                    {`${t("Day")} ${day.day_number}`}
                    {day.date ? ` · ${day.date}` : ""}
                  </h2>
                  <button
                    type="button"
                    aria-label={t("Remove day")}
                    onClick={() => void removeDay(day.id)}
                    className="rounded-full border border-border/60 p-1.5 text-muted-foreground transition-colors hover:text-hot"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {renderItems(group)}
              </section>
            );
          })}

          {days.length === 0 && (
            <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
              {t("No days yet — add your first day to start planning.")}
            </p>
          )}

          {unscheduled.length > 0 && (
            <section className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <h2 className="font-display text-base text-gold-text">{t("Unscheduled")}</h2>
              {renderItems(unscheduled)}
            </section>
          )}
        </div>
      </Section>
      <SiteFooter />
    </div>
  );
}
