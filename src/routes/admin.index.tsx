import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getAdminStats, type AdminStats, type AdminStatsResult } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { DemoStoriesSwitch } from "@/components/admin/DemoStoriesSwitch";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: `Admin — ${SITE.name}` },
      { name: "description", content: "Internal administration dashboard." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Admin — ${SITE.name}` },
      { property: "og:description", content: "Internal administration dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const { t } = useI18n();
  const load = useServerFn(getAdminStats);
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!data.session) throw new Error("no session");
        return load();
      })
      .then((result: AdminStatsResult) => {
        if (!active) return;
        if (!result.authorized) {
          setState("denied");
          return;
        }
        setStats(result.stats);
        setState("ready");
      })
      .catch(() => active && setState("denied"));
    return () => {
      active = false;
    };
  }, [load]);

  if (state === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <p className="text-sm text-muted-foreground">{t("Checking your access…")}</p>
      </div>
    );
  }

  if (state === "denied" || !stats) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/60 p-8 text-center">
          <h1 className="font-display text-3xl text-foreground">{t("Not authorized")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("You do not have permission to view this page.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-14">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/80">{SITE.name}</p>
        <h1 className="mt-3 font-display text-3xl text-foreground">{t("Admin dashboard")}</h1>
        <DemoStoriesSwitch />

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("Overview")}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label={t("Total users")} value={stats.users} />
          <Stat label={t("Total trips")} value={stats.trips} />
          <Stat label={t("Total bookings")} value={stats.bookings.total} />
          <Stat label={t("Bookings pending")} value={stats.bookings.pending} />
          <Stat label={t("Bookings confirmed")} value={stats.bookings.confirmed} />
          <Stat label={t("Bookings cancelled")} value={stats.bookings.cancelled} />
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("Content records")}
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.content.map((row) => (
            <Stat key={row.table} label={row.table.replace(/_/g, " ")} value={row.count} />
          ))}
        </div>
      </div>
    </div>
  );
}
