import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  Gem,
  Info,
  LifeBuoy,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Radio,
  Settings,
  Star,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { SITE, mailto } from "@/config/site";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/site/Primitives";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABEL, toAccountType } from "@/lib/account-types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Egyptora Hub dashboard — trips, rewards & support" },
      {
        name: "description",
        content:
          "Track live booking status, review past journeys, manage account settings and follow your Egyptora Hub Pass points and benefits.",
      },
      { property: "og:title", content: "My Egyptora Hub dashboard" },
      {
        property: "og:description",
        content: "Live trip tracking, rewards balance, emergency assistance and traveller settings.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/account` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-image.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-image.jpg` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/account` }],
  }),
  component: AccountPage,
});

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  country: string | null;
  emergency_contact: string | null;
  account_type: string;
  points: number;
  tier: string;
};

type Trip = {
  id: string;
  reference: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  live_stage: string | null;
  progress: number;
  travellers: number;
  price_usd: number;
  points_earned: number;
};

type Review = { id: string; trip_id: string; rating: number; comment: string | null };

const INPUT =
  "h-11 rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground outline-none focus:border-gold-line";

const LIVE_STAGES = [
  "Booking confirmed",
  "Guide assigned",
  "Transfer scheduled",
  "Trip in progress",
  "Completed",
];

function AccountPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading: sessionLoading, signOut } = useAuth();
  const [tab, setTab] = useState<"live" | "past" | "settings">("live");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const live = useMemo(
    () => trips.filter((x) => x.status !== "completed" && x.status !== "cancelled"),
    [trips],
  );
  const past = useMemo(() => trips.filter((x) => x.status === "completed"), [trips]);

  // Real trips and reviews for this traveller — same rows /my-trips shows.
  useEffect(() => {
    if (!user) {
      setTrips([]);
      setReviews([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const [tripRes, reviewRes] = await Promise.all([
          supabase
            .from("trips")
            .select(
              "id, reference, title, destination, start_date, end_date, status, live_stage, progress, travellers, price_usd, points_earned",
            )
            .order("created_at", { ascending: false }),
          supabase.from("trip_reviews").select("id, trip_id, rating, comment"),
        ]);
        if (tripRes.error) throw tripRes.error;
        if (reviewRes.error) throw reviewRes.error;
        if (!active) return;
        setTrips((tripRes.data ?? []) as Trip[]);
        setReviews((reviewRes.data ?? []) as Review[]);
      } catch (err) {
        console.error("[account] failed to load trips or reviews:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // This page is for signed-in travellers only — send anyone else to /auth.
  useEffect(() => {
    if (!sessionLoading && !user) {
      void navigate({ to: "/auth" });
    }
  }, [sessionLoading, user, navigate]);

  // Load the real `profiles` row for this account. If it doesn't exist yet — the
  // database trigger that provisions it on sign-up hasn't run, or predates this
  // account — create it here so the page never gets stuck.
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    let active = true;
    setProfileLoading(true);

    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;

        if (data) {
          if (active) setProfile(data as Profile);
          return;
        }

        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email ?? null,
            full_name: (user.user_metadata?.["full_name"] as string | undefined) ?? null,
            whatsapp: (user.user_metadata?.["whatsapp"] as string | undefined) ?? null,
            account_type: toAccountType(user.user_metadata?.["account_type"]),
          })
          .select("*")
          .single();
        if (insertError) throw insertError;
        if (active) setProfile(created as Profile);
      } catch (err) {
        console.error("[account] failed to load or create profile:", err);
        if (active) {
          toast.error(t("We couldn't load your profile. Please refresh the page."));
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, t]);

  // Show the admin entry point only for accounts that actually hold the admin
  // role — same `has_role` check the /admin pages enforce server-side.
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let active = true;
    supabase
      .rpc("has_role", { check_user_id: user.id, check_role: "admin" })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("[account] failed to check admin role:", error.message);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(data === true);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function saveSettings(patch: Partial<Profile>) {
    if (!user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select("*")
        .single();
      if (error) throw error;
      setProfile(data as Profile);
      toast.success(t("Account details saved."));
    } catch (err) {
      console.error("[account] failed to save profile:", err);
      toast.error(t("Couldn't save your changes. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  // Reviews are real rows in `trip_reviews`, owned by the traveller.
  async function saveReview(tripId: string, rating: number, comment: string) {
    if (!user) return;
    try {
      const existing = reviews.find((r) => r.trip_id === tripId);
      if (existing) {
        const { data, error } = await supabase
          .from("trip_reviews")
          .update({ rating, comment: comment.trim() || null })
          .eq("id", existing.id)
          .select("id, trip_id, rating, comment")
          .single();
        if (error) throw error;
        setReviews((prev) => prev.map((r) => (r.id === existing.id ? (data as Review) : r)));
      } else {
        const { data, error } = await supabase
          .from("trip_reviews")
          .insert({ trip_id: tripId, user_id: user.id, rating, comment: comment.trim() || null })
          .select("id, trip_id, rating, comment")
          .single();
        if (error) throw error;
        setReviews((prev) => [...prev, data as Review]);
      }
      toast.success(t("Thanks — your review has been saved."));
    } catch (err) {
      console.error("[account] failed to save review:", err);
      toast.error(t("Couldn't save your review. Please try again."));
    }
  }

  async function handleSignOut() {
    await signOut();
    await navigate({ to: "/" });
  }

  if (sessionLoading || !user || profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <Container className="grid place-items-center py-24">
          <Loader2 className="size-6 animate-spin text-gold" />
        </Container>
        <SiteFooter />
      </div>
    );
  }

  const name = profile.full_name || t("Traveller");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <Container className="py-8 lg:py-12">
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-gold-line/50 bg-gold-soft px-4 py-3 text-xs text-gold">
          <Info className="size-4 shrink-0" />
          {t("Rewards points and membership tiers are still preview values — your trips and reviews below are real.")}
        </div>

        {/* Identity header */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gold-line/50 bg-gold-soft p-5 lg:p-6">
          <div className="grid size-16 place-items-center rounded-full bg-gold text-xl font-bold text-primary-foreground">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold/80">{t("My profile")}</p>
            <h1 className="truncate font-display text-2xl text-foreground lg:text-3xl">{name}</h1>
            <p className="truncate text-sm text-muted-foreground" dir="ltr">
              {profile.email}
            </p>
            <p className="mt-1 inline-flex rounded-full border border-gold-line/60 px-2.5 py-0.5 text-[11px] text-gold">
              {t(ACCOUNT_TYPE_LABEL[toAccountType(profile.account_type)])}
            </p>
          </div>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <Link
              to="/saved"
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-gold-line hover:text-gold"
            >
              <Star className="size-4" />
              {t("Saved items")}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-full border border-gold-line bg-gold-soft px-4 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/15"
              >
                <Settings className="size-4" />
                {t("Admin Dashboard")}
              </Link>
            )}
            <Link
              to="/emergency-numbers"
              className="flex items-center gap-2 rounded-full bg-hot px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-hot/20"
            >
              <LifeBuoy className="size-4" />
              {t("Emergency help")}
            </Link>
            <a href="tel:122" dir="ltr" aria-label={t("Call police 122")} className="flex min-h-11 items-center rounded-full border border-hot/40 px-3 text-sm font-semibold text-hot">122</a>
            <a href="tel:123" dir="ltr" aria-label={t("Call ambulance 123")} className="flex min-h-11 items-center rounded-full border border-hot/40 px-3 text-sm font-semibold text-hot">123</a>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-gold-line hover:text-gold"
            >
              <LogOut className="size-4" />
              {t("Sign out")}
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Gem} label={t("Egyptora Hub Pass points")} value={String(profile.points)} hint={t("1 point = 1 EGP of partner value")} />
          <StatCard icon={BadgeCheck} label={t("Membership tier")} value={t(profile.tier)} hint={t("Unlock Gold at 5,000 points")} />
          <StatCard icon={Radio} label={t("Active bookings")} value={String(live.length)} hint={t("Live status updates in real time")} />
          <StatCard icon={Ticket} label={t("Completed journeys")} value={String(past.length)} hint={t("Rate them to earn bonus points")} />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {([
            ["live", t("Current trips")],
            ["past", t("Past trips")],
            ["settings", t("Account & settings")],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                tab === key
                  ? "border-gold-line bg-gold-soft text-gold"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5">
          {tab === "live" &&
            (live.length ? (
              live.map((trip) => <LiveTripCard key={trip.id} trip={trip} />)
            ) : (
              <EmptyState text={t("No active bookings yet. Start planning your Egyptian journey.")} />
            ))}

          {tab === "past" &&
            (past.length ? (
              past.map((trip) => (
                <PastTripCard
                  key={`${trip.id}:${reviews.find((r) => r.trip_id === trip.id)?.id ?? "new"}`}
                  trip={trip}
                  review={reviews.find((r) => r.trip_id === trip.id)}
                  onSave={(tripId, rating, comment) => void saveReview(tripId, rating, comment)}
                />
              ))
            ) : (
              <EmptyState text={t("Your completed journeys will appear here.")} />
            ))}

          {tab === "settings" && (
            <SettingsPanel profile={profile} saving={saving} onSave={saveSettings} email={profile.email ?? ""} />
          )}
        </div>
      </Container>

      <SiteFooter />
    </div>
  );
}


function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Gem;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="size-4 text-gold" />
        {label}
      </div>
      <p className="mt-3 font-display text-3xl text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function LiveTripCard({ trip }: { trip: Trip }) {
  const { t } = useI18n();
  const stageIndex = Math.max(0, LIVE_STAGES.indexOf(trip.live_stage ?? ""));
  return (
    <article className="rounded-2xl border border-border bg-card/60 p-5 lg:p-6">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold/80">{trip.reference}</p>
          <h3 className="font-display text-xl text-foreground">{t(trip.title)}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {t(trip.destination)}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> {trip.start_date} → {trip.end_date}
            </span>
          </p>
        </div>
        <span className="ms-auto flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          {t(trip.live_stage ?? "Booking confirmed")}
        </span>
      </div>

      <div className="mt-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${trip.progress}%` }} />
        </div>
        <ol className="mt-3 grid gap-2 text-xs sm:grid-cols-5">
          {LIVE_STAGES.map((stage, i) => (
            <li
              key={stage}
              className={cn(
                "rounded-lg border px-2.5 py-2 text-center",
                i <= stageIndex ? "border-gold-line bg-gold-soft text-gold" : "border-border text-muted-foreground",
              )}
            >
              {t(stage)}
            </li>
          ))}
        </ol>
      </div>
    </article>
  );
}

function PastTripCard({
  trip,
  review,
  onSave,
}: {
  trip: Trip;
  review?: Review | undefined;
  onSave: (tripId: string, rating: number, comment: string) => void;
}) {
  const { t } = useI18n();
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");

  return (
    <article className="grid gap-5 rounded-2xl border border-border bg-card/60 p-5 lg:grid-cols-[1fr_320px] lg:p-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold/80">{trip.reference}</p>
        <h3 className="font-display text-xl text-foreground">{t(trip.title)}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(trip.destination)} · {trip.start_date} → {trip.end_date}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("Points earned")}: <span className="text-gold">{trip.points_earned}</span>
        </p>
      </div>

      <div className="rounded-xl border border-gold-line/40 bg-gold-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/80">{t("Rate this trip")}</p>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n}`}>
              <Star className={cn("size-5", n <= rating ? "fill-gold text-gold" : "text-muted-foreground")} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder={t("Tell other travellers about your experience")}
          className="mt-3 w-full rounded-lg border border-border bg-background/60 p-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold-line"
        />
        <button
          onClick={() => onSave(trip.id, rating, comment)}
          className="mt-3 w-full rounded-lg bg-gold py-2 text-sm font-semibold text-primary-foreground"
        >
          {t(review ? "Update review" : "Submit review")}
        </button>
      </div>
    </article>
  );
}

function SettingsPanel({
  profile,
  saving,
  email,
  onSave,
}: {
  profile: Profile | null;
  saving: boolean;
  email: string;
  onSave: (patch: Partial<Profile>) => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    whatsapp: profile?.whatsapp ?? "",
    country: profile?.country ?? "",
    emergency_contact: profile?.emergency_contact ?? "",
    account_type: toAccountType(profile?.account_type),
  });

  useEffect(() => {
    setForm({
      full_name: profile?.full_name ?? "",
      whatsapp: profile?.whatsapp ?? "",
      country: profile?.country ?? "",
      emergency_contact: profile?.emergency_contact ?? "",
      account_type: toAccountType(profile?.account_type),
    });
  }, [profile]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="rounded-2xl border border-border bg-card/60 p-5 lg:p-6">
        <h3 className="flex items-center gap-2 font-display text-lg text-foreground">
          <Settings className="size-4 text-gold" />
          {t("Account details")}
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Labelled label={t("Full name")}>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className={INPUT}
            />
          </Labelled>
          <Labelled label={t("Email address")}>
            <input value={email} disabled dir="ltr" className={cn(INPUT, "opacity-60")} />
          </Labelled>
          <Labelled label={t("WhatsApp number")}>
            <input
              value={form.whatsapp}
              dir="ltr"
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className={INPUT}
            />
          </Labelled>
          <Labelled label={t("Country")}>
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className={INPUT}
            />
          </Labelled>
          <Labelled label={t("Emergency contact")}>
            <input
              value={form.emergency_contact}
              dir="ltr"
              onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
              className={INPUT}
            />
          </Labelled>
          <Labelled label={t("Account type")}>
            <select
              value={form.account_type}
              onChange={(e) => setForm({ ...form, account_type: toAccountType(e.target.value) })}
              className={INPUT}
            >
              {ACCOUNT_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(ACCOUNT_TYPE_LABEL[value])}
                </option>
              ))}
            </select>
          </Labelled>
        </div>
        <button
          onClick={() => onSave(form)}
          disabled={saving}
          className="mt-6 flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          {t("Save changes")}
        </button>
      </div>

      <aside className="rounded-2xl border border-gold-line/50 bg-gold-soft p-5">
        <p className="font-display text-lg text-gold">{t("Egyptora Hub Pass")}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {t("One digital pass for attractions, rewards and partner benefits.")}
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
          {["Priority museum entry", "Member-only hotel rates", "Free airport meet & assist", "Points on every booking"].map(
            (b) => (
              <li key={b} className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-gold" />
                {t(b)}
              </li>
            ),
          )}
        </ul>
        <a
          href={mailto("Egyptora Hub — 24/7 traveller support")}
          className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-gold-line py-2 text-sm text-gold"
        >
          <Phone className="size-4" />
          {t("24/7 Support")}
        </a>
        <Link to="/contact" className="mt-2 block text-center text-xs text-muted-foreground underline">
          {t("Contact")}
        </Link>
      </aside>
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
