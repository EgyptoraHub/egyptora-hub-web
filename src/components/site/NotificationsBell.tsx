import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

/** Signed-in only: bell with unread badge and a recent-notifications panel. */
export function NotificationsBell({ className }: { className?: string }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, link, read, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setRows((data ?? []) as NotificationRow[]);
    } catch (err) {
      console.error("[notifications] failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRows([]);
      setOpen(false);
      return;
    }
    void load();
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) return null;

  const unread = rows.filter((r) => !r.read).length;

  const markRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, read: true } : r)));
    const { error } = await supabase.from("notifications").update({ read: true }).in("id", ids);
    if (error) console.error("[notifications] failed to mark read:", error.message);
  };

  const openItem = async (row: NotificationRow) => {
    if (!row.read) await markRead([row.id]);
    setOpen(false);
    if (row.link) void navigate({ to: row.link as never });
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={t("Notifications")}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
        className="relative grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-gold-text"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -end-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-2xs font-bold text-gold-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{t("Notifications")}</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void markRead(rows.filter((r) => !r.read).map((r) => r.id))}
                className="text-2xs text-gold-text hover:underline"
              >
                {t("Mark all as read")}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && rows.length === 0 ? (
              <p className="flex items-center gap-2 px-4 py-6 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("Loading…")}
              </p>
            ) : rows.length === 0 ? (
              <p className="px-4 py-6 text-xs text-muted-foreground">
                {t("You have no notifications yet.")}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => void openItem(row)}
                      className={cn(
                        "w-full px-4 py-3 text-start transition-colors hover:bg-background/60",
                        !row.read && "bg-gold-soft/40",
                      )}
                    >
                      <span className="flex items-start gap-2">
                        {!row.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold" />}
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-foreground">
                            {t(row.title)}
                          </span>
                          {row.body && (
                            <span className="mt-0.5 block text-2xs leading-snug text-muted-foreground">
                              {row.body}
                            </span>
                          )}
                          <span className="mt-1 block text-2xs text-muted-foreground">
                            {new Date(row.created_at).toLocaleString()}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
