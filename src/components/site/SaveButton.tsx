import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { rememberAfterAuth } from "@/lib/after-auth";
import { cn } from "@/lib/utils";

/**
 * Reusable save/favourite toggle. Works for every browsable item type; the
 * signed-out path matches ItemActions (remember page, toast, send to /auth).
 */
export function SaveButton({
  itemType,
  itemId,
  itemName,
  itemImage,
  variant = "button",
  className,
}: {
  itemType: string;
  itemId: string;
  itemName?: string | null;
  itemImage?: string | null;
  /** "button" = pill with label (detail pages), "icon" = round heart (cards). */
  variant?: "button" | "icon";
  className?: string;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("saved_items")
          .select("id")
          .eq("item_type", itemType)
          .eq("item_id", itemId)
          .maybeSingle();
        if (error) throw error;
        if (active) setSaved(Boolean(data));
      } catch (err) {
        console.error("[saved-items] failed to read save state:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, itemType, itemId]);

  const toggle = async () => {
    if (loading || busy) return;
    if (!user) {
      rememberAfterAuth(pathname);
      toast.info(t("Please sign in to continue — we'll bring you back here."));
      void navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      if (saved) {
        const { error } = await supabase
          .from("saved_items")
          .delete()
          .eq("item_type", itemType)
          .eq("item_id", itemId);
        if (error) throw error;
        setSaved(false);
        toast.success(t("Removed from your saved items."));
      } else {
        const { error } = await supabase.from("saved_items").insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
          item_name: itemName ?? null,
          item_image: itemImage ?? null,
        });
        if (error) throw error;
        setSaved(true);
        toast.success(t("Saved to your favourites."));
      }
    } catch (err) {
      console.error("[saved-items] failed to toggle save:", err);
      toast.error(t("Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const label = saved ? t("Saved") : t("Save");

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void toggle();
        }}
        aria-label={label}
        title={label}
        aria-pressed={saved}
        className={cn(
          "grid size-8 place-items-center rounded-full border border-border/70 bg-background/70 text-muted-foreground backdrop-blur transition-colors hover:border-gold-line hover:text-gold-text",
          saved && "border-gold-line text-gold-text",
          className,
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Heart className={cn("size-4", saved && "fill-current")} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors disabled:opacity-60",
        saved
          ? "border border-gold-line bg-gold-soft text-gold-text"
          : "border border-border text-muted-foreground hover:border-gold-line hover:text-gold-text",
        className,
      )}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Heart className={cn("size-4", saved && "fill-current")} />
      )}
      {label}
    </button>
  );
}
