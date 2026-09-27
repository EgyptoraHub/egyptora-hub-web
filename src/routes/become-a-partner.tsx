import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SimplePage, simpleHead } from "@/components/site/SimplePage";
import { PartnerStatusBadge } from "@/components/site/PartnerApplications";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/become-a-partner")({
  head: () =>
    simpleHead(
      "/become-a-partner",
      "Become a Partner | Egyptora Hub",
      "Apply to list your hotel, development, services or export products on Egyptora Hub.",
      SITE.url,
    ),
  component: BecomePartnerPage,
});

const TYPES = [
  { id: "hotel", label: "Hotel / hospitality" },
  { id: "developer", label: "Real estate developer" },
  { id: "service_provider", label: "Service provider" },
  { id: "exporter", label: "Exporter / producer" },
] as const;

const schema = z.object({
  full_name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  company_name: z.string().trim().min(1, "Please enter your company name").max(160),
  partnership_type: z.enum(["hotel", "developer", "service_provider", "exporter"]),
  description: z.string().trim().max(2000).optional(),
});

function BecomePartnerPage() {
  const { t } = useI18n();
  const [form, setForm] = useState({ full_name: "", email: "", company_name: "", partnership_type: "hotel", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    setError(null);
    const { data: s } = await supabase.auth.getSession();
    const { error: err } = await supabase.from("partner_applications").insert({
      ...parsed.data,
      description: parsed.data.description || null,
      user_id: s.session?.user.id ?? null,
    });
    setBusy(false);
    if (err) setError("We could not send your application. Please try again.");
    else setDone(true);
  };

  const field = "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary";

  return (
    <SimplePage
      title="Become a Partner"
      intro="Hotels, developers, service providers and exporters can apply to be listed on Egyptora Hub. Our team reviews every application; no documents are needed at this stage."
    >
      {done ? (
        <div className="max-w-xl rounded-2xl border border-border bg-card p-6">
          <PartnerStatusBadge status="submitted" />
          <h2 className="mt-3 font-display text-xl font-semibold text-navy">{t("Application received")}</h2>
          <p className="mt-2 text-sm text-text-body">
            {t("Thank you — we'll contact you by email. Signed-in applicants can follow the status in the partner portal.")}
          </p>
          <p className="mt-2 text-sm text-text-body">
            {t("Next step: upload your business registration and authorization documents in the partner portal to get the Verified badge.")}
          </p>
          <Link to="/partners" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            {t("Upload documents in the partner portal")}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="grid max-w-xl gap-4">
          <label className="grid gap-1 text-sm font-medium text-navy">
            {t("Your name")}
            <input className={field} value={form.full_name} maxLength={120} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-navy">
            {t("Email")}
            <input type="email" className={field} value={form.email} maxLength={200} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-navy">
            {t("Company name")}
            <input className={field} value={form.company_name} maxLength={160} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-navy">
            {t("Partnership type")}
            <select className={field} value={form.partnership_type} onChange={(e) => setForm({ ...form, partnership_type: e.target.value })}>
              {TYPES.map((ty) => (
                <option key={ty.id} value={ty.id}>{t(ty.label)}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-navy">
            {t("Short description")}
            <textarea
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          {error && <p className="text-sm text-destructive" role="alert">{t(error)}</p>}
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? t("Sending…") : t("Submit application")}
          </button>
        </form>
      )}
    </SimplePage>
  );
}
