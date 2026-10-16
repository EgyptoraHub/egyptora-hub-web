import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import { BackLink } from "@/components/site/DetailPrimitives";
import { SITE } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

const FIELD =
  "h-11 w-full rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground outline-none focus:border-gold-line";

export const Route = createFileRoute("/my-trips/new")({
  head: () => ({
    meta: [
      { title: "Create a new trip | Egyptora Hub" },
      { name: "description", content: "Start a new Egypt itinerary and plan it day by day." },
      { property: "og:title", content: "Create a new trip | Egyptora Hub" },
      { property: "og:description", content: "Start a new Egypt itinerary and plan it day by day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/my-trips/new` }],
  }),
  component: NewTripPage,
});

function NewTripPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !user) void navigate({ to: "/auth" });
  }, [sessionLoading, user, navigate]);

  const submit = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast.error(t("Please add a trip title."));
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setDateError(t("The end date can't be before the start date."));
      return;
    }
    setDateError(null);
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("trips")
        .insert({
          user_id: user.id,
          title: title.trim(),
          start_date: startDate || null,
          end_date: endDate || null,
          cover_image: coverImage.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success(t("Trip created."));
      void navigate({ to: "/trips/$id", params: { id: (data as { id: string }).id } });
    } catch (err) {
      console.error("[my-trips/new] failed to create trip:", err);
      toast.error(t("Something went wrong. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <BackLink to="/my-trips" label={t("Back to my trips")} />
        <div className="mt-5">
          <SectionHeader
            eyebrow="Egyptora Hub"
            title="Create a new trip"
            description="Give your journey a name and dates — you can add days and places next."
          />
        </div>

        <form
          className="max-w-xl space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">{t("Trip title")}</label>
            <input className={FIELD} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t("Start date")}</label>
              <input
                type="date"
                className={FIELD}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">{t("End date")}</label>
              <input
                type="date"
                className={FIELD}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateError(null);
                }}
              />
            </div>
          </div>
          {dateError && <p className="text-sm text-hot">{dateError}</p>}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              {t("Cover image link (optional)")}
            </label>
            <input
              className={FIELD}
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("Create trip")}
          </button>
        </form>
      </Section>
      <SiteFooter />
    </div>
  );
}
