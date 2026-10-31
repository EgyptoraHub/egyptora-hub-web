import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  MAINTENANCE_MODE,
  isMaintenancePreviewHost,
  maintenanceVisibility,
} from "@/config/maintenance";
import { getMaintenance } from "@/lib/maintenance.functions";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { getMyRoles } from "@/lib/roles.functions";
import { supabase } from "@/integrations/supabase/client";

function MaintenancePage() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-gold-line bg-card/60 p-8 text-center backdrop-blur sm:p-12">
        <p className="text-2xs font-semibold eyebrow text-gold-text">
          {SITE.name}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {t("This page is not available")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("We are performing scheduled maintenance. The platform will be back shortly.")}
        </p>
        <a
          href={`mailto:${SITE.email}`}
          className="mt-8 inline-flex items-center justify-center rounded-full border border-gold-line px-6 py-3 text-sm font-semibold text-gold-text transition-colors hover:bg-gold-soft"
        >
          {SITE.email}
        </a>
        <p className="mt-8 text-2xs text-muted-foreground" dir="ltr">
          {SITE.url.replace(/^https?:\/\//, "")}
        </p>
      </div>
    </div>
  );
}

/**
 * Renders the maintenance page for visitors while maintenance mode is on.
 * The switch lives in the database (control panel at /admin/maintenance);
 * MAINTENANCE_MODE in config acts only as a hard override fallback.
 * Preview hosts and server-verified admins keep browsing the real site.
 */
export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isControlPanel = pathname.startsWith("/admin/maintenance");
  const readStatus = useServerFn(getMaintenance);
  const readRoles = useServerFn(getMyRoles);

  const [remoteOn, setRemoteOn] = useState<boolean | null>(null);
  const [preview, setPreview] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setPreview(isMaintenancePreviewHost(window.location.hostname));
    const refreshAdmin = async () => {
      if (active) setAdmin(false);
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;
        const roles = await readRoles();
        if (active) setAdmin(roles.admin);
      } catch { if (active) setAdmin(false); }
    };
    void refreshAdmin();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setAdmin(false);
        // Leave the auth callback before asking the client to read its session.
        window.setTimeout(() => { if (active) void refreshAdmin(); }, 0);
      }
    });
    readStatus()
      .then((r) => { if (active) setRemoteOn(r.enabled); })
      .catch(() => { if (active) setRemoteOn(true); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [readStatus, readRoles, pathname]);

  const maintenanceOn = MAINTENANCE_MODE || remoteOn === true;

  if (!ready) return null;
  const visibility = maintenanceVisibility(maintenanceOn, preview, admin);
  // Keep the existing guarded control page reachable so admins can sign in/check access.
  if (visibility.closed && !isControlPanel) return <MaintenancePage />;

  return (
    <>
      {children}
      {visibility.badge && <div role="status" className="fixed bottom-20 start-4 z-[60] max-w-[calc(100%-2rem)] rounded-full border border-gold-line bg-gold-soft px-4 py-2 text-xs font-semibold text-gold-text shadow-lg">
        {t("Preview — the public site is closed")}
      </div>}
    </>
  );
}
