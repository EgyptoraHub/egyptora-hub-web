import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CalendarPlus, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { rememberAfterAuth } from "@/lib/after-auth";
import { cn } from "@/lib/utils";

/** Catalogue kinds that can be planned into a trip or requested as a booking. */
export type TripItemType =
  | "property"
  | "offer"
  | "event"
  | "heritage_site"
  | "museum"
  | "investment_opportunity";

type TripRow = { id: string; title: string };
type DayRow = { id: string; day_number: number };

const FIELD =
  "h-10 w-full rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground outline-none focus:border-gold-line";

const BUTTON_BASE =
  "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-60";

/**
 * Standalone booking request for items that are not trip-day items (service providers).
 * Records the item's real price on the booking when one exists.
 */
export function RequestBookingButton({
  itemType,
  itemId,
  itemName,
  amount,
  currency,
  className,
}: {
  itemType: string;
  itemId: string;
  itemName: string;
  amount?: number | null;
  currency?: string | null;
  className?: string;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (loading) return;
    if (!user) {
      rememberAfterAuth(pathname);
      toast.info(t("Please sign in to continue — we'll bring you back here."));
      void navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        status: "pending",
        contact_email: user.email ?? null,
        amount: amount ?? null,
        currency: amount != null ? (currency ?? "usd").toLowerCase() : null,
      });
      if (error) throw error;
      toast.success(t("Your request has been received, we'll be in touch."));
    } catch (err) {
      console.error("[trip-actions] failed to create booking:", err);
      toast.error(t("Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void submit()}
      disabled={busy}
      className={cn(
        BUTTON_BASE,
        "border border-gold-line bg-gold-soft text-gold-text hover:bg-gold hover:text-primary-foreground",
        className,
      )}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      {t("Request booking")}
    </button>
  );
}

export function ItemActions({
  itemType,
  itemId,
  itemName,
  itemImage,
  amount,
  currency,
  className,
}: {
  itemType: TripItemType;
  itemId: string;
  itemName: string;
  itemImage?: string | null;
  /** Real per-booking price, when the item type has one (e.g. properties). */
  amount?: number | null;
  currency?: string | null;
  className?: string;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [days, setDays] = useState<DayRow[]>([]);
  const [tripId, setTripId] = useState<string>("new");
  const [dayId, setDayId] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(false);

  const requireSignIn = () => {
    rememberAfterAuth(pathname);
    toast.info(t("Please sign in to continue — we'll bring you back here."));
    void navigate({ to: "/auth" });
  };

  const loadDays = async (id: string) => {
    setDayId("");
    setDays([]);
    if (id === "new") return;
    const { data, error } = await supabase
      .from("trip_days")
      .select("id, day_number")
      .eq("trip_id", id)
      .order("day_number");
    if (error) {
      console.error("[trip-actions] failed to load days:", error.message);
      return;
    }
    setDays((data ?? []) as DayRow[]);
  };

  const openDialog = async () => {
    if (loading) return;
    if (!user) return requireSignIn();
    setOpen(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as TripRow[];
      setTrips(rows);
      const first = rows[0];
      if (first) {
        setTripId(first.id);
        await loadDays(first.id);
      } else {
        setTripId("new");
      }
    } catch (err) {
      console.error("[trip-actions] failed to load trips:", err);
      toast.error(t("Something went wrong. Please try again."));
    }
  };

  const addToTrip = async () => {
    if (!user) return requireSignIn();
    setBusy(true);
    try {
      let targetTrip = tripId;
      let targetDay: string | null = dayId || null;

      if (targetTrip === "new") {
        const title = newTitle.trim() || t("My Egypt trip");
        const { data, error } = await supabase
          .from("trips")
          .insert({ user_id: user.id, title })
          .select("id")
          .single();
        if (error) throw error;
        targetTrip = (data as { id: string }).id;
        targetDay = null;
      }

      const { count } = await supabase
        .from("trip_items")
        .select("id", { count: "exact", head: true })
        .eq("trip_id", targetTrip);

      const { error: insertError } = await supabase.from("trip_items").insert({
        trip_id: targetTrip,
        trip_day_id: targetDay,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        item_image: itemImage ?? null,
        position: count ?? 0,
      });
      if (insertError) throw insertError;

      setOpen(false);
      toast.success(t("Added to your trip."));
      void navigate({ to: "/trips/$id", params: { id: targetTrip } });
    } catch (err) {
      console.error("[trip-actions] failed to add item:", err);
      toast.error(t("Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const requestBooking = async () => {
    if (loading) return;
    if (!user) return requireSignIn();
    setBooking(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        status: "pending",
        contact_email: user.email ?? null,
        amount: amount ?? null,
        currency: amount != null ? (currency ?? "usd").toLowerCase() : null,
      });
      if (error) throw error;
      toast.success(t("Your request has been received, we'll be in touch."));
    } catch (err) {
      console.error("[trip-actions] failed to create booking:", err);
      toast.error(t("Something went wrong. Please try again."));
    } finally {
      setBooking(false);
    }
  };

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <button
          type="button"
          onClick={() => void openDialog()}
          className={cn(BUTTON_BASE, "border border-gold-line bg-gold-soft text-gold-text hover:bg-gold hover:text-primary-foreground")}
        >
          <CalendarPlus className="size-4" />
          {t("Add to trip")}
        </button>
        <button
          type="button"
          onClick={() => void requestBooking()}
          disabled={booking}
          className={cn(BUTTON_BASE, "border border-border text-muted-foreground hover:border-gold-line hover:text-gold-text")}
        >
          {booking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {t("Request booking")}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Add to trip")}</DialogTitle>
            <DialogDescription>
              {t("Choose one of your trips, or start a new one.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t("Trip")}</label>
              <select
                className={FIELD}
                value={tripId}
                onChange={(e) => {
                  setTripId(e.target.value);
                  void loadDays(e.target.value);
                }}
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title}
                  </option>
                ))}
                <option value="new">{t("Create a new trip")}</option>
              </select>
            </div>

            {tripId === "new" ? (
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  {t("Trip title")}
                </label>
                <input
                  className={FIELD}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t("My Egypt trip")}
                />
              </div>
            ) : (
              days.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">
                    {t("Day (optional)")}
                  </label>
                  <select className={FIELD} value={dayId} onChange={(e) => setDayId(e.target.value)}>
                    <option value="">{t("Unscheduled")}</option>
                    {days.map((day) => (
                      <option key={day.id} value={day.id}>
                        {`${t("Day")} ${day.day_number}`}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            <button
              type="button"
              onClick={() => void addToTrip()}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {t("Add to trip")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
