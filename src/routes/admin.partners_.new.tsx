import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminChecking, AdminDenied, adminHead } from "@/components/admin/AdminStates";
import { PARTNER_TYPES, listPartners, savePartner } from "@/lib/admin-partners.functions";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/partners_/new")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { id?: string } =>
    typeof s["id"] === "string" && s["id"] ? { id: s["id"] as string } : {},
  head: () => adminHead(`Add a partner — ${SITE.name}`, "Create a partner account directly."),
  component: AddPartnerPage,
});

const TYPE_LABEL: Record<string, string> = {
  real_estate: "Real estate",
  investment: "Investment",
  government: "Government",
};

const input = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

function AddPartnerPage() {
  const { t } = useI18n();
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const load = useServerFn(listPartners);
  const save = useServerFn(savePartner);
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [form, setForm] = useState({ orgName: "", partnerType: "real_estate", contactEmail: "", userEmail: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) return active && setState("denied");
      const res = await load({ data: {} as never });
      if (!active) return;
      if (!res.authorized) return setState("denied");
      const p = id ? res.partners.find((x) => x.id === id) : null;
      if (p)
        setForm({
          orgName: p.orgName,
          partnerType: p.partnerType,
          contactEmail: p.contactEmail ?? "",
          userEmail: p.userEmail ?? "",
        });
      setState("ready");
    })().catch(() => active && setState("denied"));
    return () => {
      active = false;
    };
  }, [id, load]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await save({ data: { id: id ?? null, ...form } });
    setBusy(false);
    if (!res.authorized) return setState("denied");
    if (!res.ok) return setError(res.error ?? "Could not save.");
    toast.success(id ? t("Partner updated.") : t("Partner created."));
    void navigate({ to: "/admin/partners" });
  };

  if (state === "loading") return <AdminChecking />;
  if (state === "denied") return <AdminDenied />;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link to="/admin/partners" className="text-xs text-muted-foreground hover:text-gold">
        ← {t("Back to Partners")}
      </Link>
      <h1 className="mt-3 font-display text-3xl text-foreground">
        {id ? t("Edit partner") : t("Add a partner directly")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("For admins creating a partner account by hand — not linked to a public application.")}
      </p>
      {error && <p className="mt-4 text-sm text-destructive">{t(error)}</p>}
      <section className="mt-6 rounded-2xl border border-border bg-card/40 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted-foreground">
            {t("Organisation name")}
            <input value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} className={input} />
          </label>
          <label className="text-xs text-muted-foreground">
            {t("Partner type")}
            <select value={form.partnerType} onChange={(e) => setForm({ ...form, partnerType: e.target.value })} className={input}>
              {PARTNER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(TYPE_LABEL[type] ?? type)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">
            {t("Contact email")}
            <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={input} />
          </label>
          <label className="text-xs text-muted-foreground">
            {t("Login account email (optional)")}
            <input value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} className={input} />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={busy || !form.orgName.trim()}
            onClick={() => void submit()}
            className="rounded-full border border-gold/60 bg-gold/10 px-4 py-1.5 text-xs text-gold disabled:opacity-50"
          >
            {id ? t("Save partner") : t("Create partner")}
          </button>
          <Link to="/admin/partners" className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground">
            {t("Cancel")}
          </Link>
        </div>
      </section>
    </div>
  );
}
