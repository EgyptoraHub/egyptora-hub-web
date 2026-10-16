import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  MAINTENANCE_MODE,
  MAINTENANCE_BYPASS_KEY,
  MAINTENANCE_BYPASS_TOKEN,
} from "@/config/maintenance";
import { getMaintenance } from "@/lib/maintenance.functions";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

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
 * Owners with the bypass flag keep browsing the real site.
 */
export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isControlPanel = pathname.startsWith("/admin/maintenance");
  const readStatus = useServerFn(getMaintenance);

  const [remoteOn, setRemoteOn] = useState<boolean | null>(null);
  const [bypass, setBypass] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const param = new URLSearchParams(window.location.search).get("bypass");
      if (param === MAINTENANCE_BYPASS_TOKEN) {
        localStorage.setItem(MAINTENANCE_BYPASS_KEY, "1");
      } else if (param === "off") {
        localStorage.removeItem(MAINTENANCE_BYPASS_KEY);
      }
      setBypass(localStorage.getItem(MAINTENANCE_BYPASS_KEY) === "1");
    } catch {
      setBypass(false);
    }
    readStatus()
      .then((r) => setRemoteOn(r.enabled))
      .catch(() => setRemoteOn(false))
      .finally(() => setReady(true));
  }, [readStatus]);

  const maintenanceOn = MAINTENANCE_MODE || remoteOn === true;

  if (isControlPanel) return <>{children}</>;
  if (!ready) return null;
  if (!maintenanceOn) return <>{children}</>;
  if (!bypass) return <MaintenancePage />;

  return (
    <>
      {children}
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.removeItem(MAINTENANCE_BYPASS_KEY);
          } catch {
            /* ignore */
          }
          window.location.reload();
        }}
        className="fixed bottom-4 start-4 z-[60] rounded-full border border-gold-line bg-gold-soft px-4 py-2 text-xs font-semibold text-gold-text shadow-lg"
        title={t("Maintenance Mode is ON — click to exit owner preview")}
      >
        Maintenance Mode
      </button>
    </>
  );
}
