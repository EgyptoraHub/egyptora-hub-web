import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getMaintenance, setMaintenance } from "@/lib/maintenance.functions";
import { getMyRoles } from "@/lib/roles.functions";
import { supabase } from "@/integrations/supabase/client";
import { AdminChecking, AdminDenied } from "@/components/admin/AdminStates";
import { SITE } from "@/config/site";

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
  const read = useServerFn(getMaintenance);
  const write = useServerFn(setMaintenance);
  const roles = useServerFn(getMyRoles);
  const [access, setAccess] = useState<"loading" | "denied" | "ready">("loading");
  const [password, setPassword] = useState("");
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");

  // Page-level guard: a valid session AND the admin role (has_role) are required
  // before anything is rendered. The password below stays as a second layer.
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
    setStatus("saving");
    try {
      const res = await write({ data: { password, enabled: next } });
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

        <label className="mt-6 block text-sm text-muted-foreground">
          Owner password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-2 h-11 w-full rounded-full border border-border bg-card/70 px-4 text-sm text-foreground outline-none focus:border-gold-line"
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!password || status === "saving"}
            onClick={() => apply(true)}
            className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground disabled:opacity-40"
          >
            Close site (Maintenance ON)
          </button>
          <button
            type="button"
            disabled={!password || status === "saving"}
            onClick={() => apply(false)}
            className="rounded-full border border-gold-line px-5 py-3 text-sm font-semibold text-gold-text disabled:opacity-40"
          >
            Open site (Maintenance OFF)
          </button>
        </div>

        {status === "error" && (
          <p className="mt-4 text-sm text-destructive">Wrong password or the change could not be saved.</p>
        )}
        {status === "saved" && <p className="mt-4 text-sm text-gold-text">Saved — live for all visitors.</p>}
      </div>
    </div>
  );
}
