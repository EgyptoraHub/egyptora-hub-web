import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminChecking, AdminDenied, adminHead } from "@/components/admin/AdminStates";
import { INTEGRATIONS, INTEGRATION_STATUS_LABEL } from "@/lib/integrations.config";
import { getMyRoles } from "@/lib/roles.functions";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/integrations")({
  ssr: false,
  head: () => adminHead(`Integrations — ${SITE.name}`, "Planned future integrations."),
  component: AdminIntegrationsPage,
});

function AdminIntegrationsPage() {
  const { t } = useI18n();
  const loadRoles = useServerFn(getMyRoles);
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setState("denied");
        return;
      }
      const roles = await loadRoles({ data: {} as never });
      if (!active) return;
      setState(roles.admin ? "ready" : "denied");
    })().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [loadRoles]);

  if (state === "loading") return <AdminChecking />;
  if (state === "denied") return <AdminDenied />;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10">
      <h1 className="font-display text-3xl text-foreground">{t("Integrations")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("Planned connections. Nothing here is live and nothing connects anywhere yet.")}
      </p>

      <ul className="mt-8 space-y-4">
        {INTEGRATIONS.map((entry) => (
          <li key={entry.key} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg text-foreground">{t(entry.name)}</h2>
              <span className="rounded-full border border-border/70 px-3 py-1 text-2xs uppercase tracking-wide text-muted-foreground">
                {t(INTEGRATION_STATUS_LABEL[entry.status])}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t(entry.description)}</p>
            <p className="mt-3 text-xs text-muted-foreground">{t(entry.notes)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
