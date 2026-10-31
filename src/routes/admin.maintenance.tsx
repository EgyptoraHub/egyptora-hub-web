import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getMaintenance, setMaintenance } from "@/lib/maintenance.functions";
import { getMyRoles } from "@/lib/roles.functions";
import { supabase } from "@/integrations/supabase/client";
import { AdminChecking, AdminDenied } from "@/components/admin/AdminStates";
import { SITE } from "@/config/site";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/maintenance")({
  ssr: false,
  component: MaintenanceAdmin,
  head: () => ({
    meta: [
      { title: `Maintenance control — ${SITE.name}` },
      { name: "description", content: "Owner control panel to open or close Egyptora Hub to visitors." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Maintenance control — ${SITE.name}` },
      { property: "og:description", content: "Owner-only maintenance switch for Egyptora Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function MaintenanceAdmin() {
  const { t } = useI18n();
  const read = useServerFn(getMaintenance);
  const write = useServerFn(setMaintenance);
  const roles = useServerFn(getMyRoles);
  const [access, setAccess] = useState<"loading" | "denied" | "ready">("loading");
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");

  // Page-level guard: a valid session AND the admin role (has_role) are required
  // before anything is rendered. The write also verifies the role on the server.
  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!data.session) throw new Error("no session");
        return roles();
      })
      .then((result) => {
        if (!active) return;
        if (!result.admin) {
          setAccess("denied");
          return;
        }
        setAccess("ready");
      })
      .catch(() => active && setAccess("denied"));
    return () => {
      active = false;
    };
  }, [roles]);

  useEffect(() => {
    if (access !== "ready") return;
    read().then((r) => setEnabled(r.enabled)).catch(() => setEnabled(false));
  }, [read, access]);

  if (access === "loading") return <AdminChecking />;
  if (access === "denied") return <AdminDenied />;


  const apply = async (next: boolean) => {
    if (!window.confirm(t(next ? "Close the site to the public?" : "Open the site to the public?"))) return;
    setStatus("saving");
    try {
      const res = await write({ data: { enabled: next } });
      if (!res.ok) return setStatus("error");
      setEnabled(next);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-gold-line bg-card/60 p-8 backdrop-blur">
        <p className="text-2xs font-semibold eyebrow text-gold-text">{SITE.name}</p>
        <h1 className="mt-3 font-display text-3xl text-foreground">Maintenance Mode</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Close or open the site to visitors instantly. The backend, database and your editing tools keep
          running normally.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Current status</p>
          <p className="mt-1 font-display text-xl text-foreground">
            {enabled === null ? "…" : enabled ? "Closed — visitors see the maintenance page" : "Open to visitors"}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            variant="gold"
            type="button"
            disabled={enabled === null || status === "saving"}
            onClick={() => apply(true)}
            className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground disabled:opacity-40"
          >
            Close site (Maintenance ON)
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={enabled === null || status === "saving"}
            onClick={() => apply(false)}
            className="rounded-full border border-gold-line px-5 py-3 text-sm font-semibold text-gold-text disabled:opacity-40"
          >
            Open site (Maintenance OFF)
          </Button>
        </div>

        {status === "error" && (
          <p className="mt-4 text-sm text-destructive">{t("The change could not be saved.")}</p>
        )}
        {status === "saved" && <p className="mt-4 text-sm text-gold-text">Saved — live for all visitors.</p>}
      </div>
    </div>
  );
}
