import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import { SITE } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type SavedRow = {
  id: string;
  item_type: string;
  item_id: string;
  item_name: string | null;
  item_image: string | null;
  created_at: string;
};

/** Detail route per saved item type. Types without a detail page stay unlinked. */
const DETAIL_ROUTE: Record<string, string> = {
  property: "/properties",
  provider: "/providers",
  offer: "/offers",
  investment_opportunity: "/investment-opportunities",
  country: "/countries",
  product: "/products",
  museum: "/museums",
  heritage_site: "/heritage-sites",
  event: "/events",
  research_program: "/research-programs",
  traveller_story: "/traveler-stories",
  heritage_worldwide: "/egyptian-heritage-worldwide",
};

const TYPE_LABEL: Record<string, string> = {
  page: "Page",
  property: "Property",
  provider: "Service provider",
  offer: "Offer",
  investment_opportunity: "Investment opportunity",
  country: "Country",
  product: "Product",
  museum: "Museum",
  heritage_site: "Heritage site",
  event: "Event",
  research_program: "Research programme",
  traveller_story: "Traveller story",
  heritage_worldwide: "Egyptian heritage worldwide",
  destination: "Destination",
};

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved items — your Egyptora Hub favourites" },
      {
        name: "description",
        content:
          "Everything you have saved across Egyptora Hub: places, stays, offers, products and opportunities, in one list.",
      },
      { property: "og:title", content: "Saved items | Egyptora Hub" },
      {
        property: "og:description",
        content: "Your favourite places, stays, offers and opportunities across Egypt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/saved` }],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAuth();
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!sessionLoading && !user) void navigate({ to: "/auth" });
  }, [sessionLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("saved_items")
          .select("id, item_type, item_id, item_name, item_image, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (active) setRows((data ?? []) as SavedRow[]);
      } catch (err) {
        console.error("[saved] failed to load saved items:", err);
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const types = useMemo(() => Array.from(new Set(rows.map((r) => r.item_type))), [rows]);
  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.item_type === filter)),
    [rows, filter],
  );

  const unsave = async (row: SavedRow) => {
    const previous = rows;
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    const { error } = await supabase.from("saved_items").delete().eq("id", row.id);
    if (error) {
      console.error("[saved] failed to remove item:", error.message);
      setRows(previous);
      toast.error(t("Something went wrong. Please try again."));
      return;
    }
    toast.success(t("Removed from your saved items."));
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Egyptora Hub"
          title="Saved items"
          description="Everything you've saved while exploring — open it again or remove it."
        />

        {loading || sessionLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gold-text" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center">
            <Heart className="mx-auto size-6 text-gold-text" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("You haven't saved anything yet.")}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {["all", ...types].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                    filter === type
                      ? "border-gold-line bg-gold-soft text-gold-text"
                      : "border-border text-muted-foreground hover:border-gold-line hover:text-foreground",
                  )}
                >
                  {type === "all" ? t("All") : t(TYPE_LABEL[type] ?? type)}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((row) => {
                const base = DETAIL_ROUTE[row.item_type];
                const name = row.item_name ?? row.item_id;
                return (
                  <article
                    key={row.id}
                    className="overflow-hidden rounded-2xl border border-border/60 bg-card/60"
                  >
                    {row.item_image && (
                      <img
                        src={row.item_image}
                        alt={name}
                        loading="lazy"
                        className="h-36 w-full object-cover"
                      />
                    )}
                    <div className="p-5">
                      <p className="text-2xs font-semibold eyebrow text-gold-text">
                        {t(TYPE_LABEL[row.item_type] ?? row.item_type)}
                      </p>
                      {base ? (
                        <Link
                          to={`${base}/$id` as never}
                          params={{ id: row.item_id } as never}
                          className="mt-1 block font-display text-base text-foreground hover:text-gold-text"
                        >
                          {name}
                        </Link>
                      ) : row.item_type === "page" && row.item_id.includes("|/") ? (
                        <Link
                          to={row.item_id.slice(row.item_id.indexOf("|") + 1) as never}
                          className="mt-1 block font-display text-base text-foreground hover:text-gold-text"
                        >
                          {name}
                        </Link>
                      ) : (
                        <p className="mt-1 font-display text-base text-foreground">{name}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => void unsave(row)}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-gold-line hover:text-gold-text"
                      >
                        <Trash2 className="size-4" />
                        {t("Remove")}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
