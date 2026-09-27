import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";

/** Only "submitted" is used today; the others are reserved for future badges. */
const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  verified: "Verified",
  strategic: "Strategic",
  technology: "Technology",
  sponsor: "Sponsor",
};

export function PartnerStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return (
    <span className="inline-block rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
      {t(STATUS_LABEL[status] ?? status)}
    </span>
  );
}

type App = {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  partnership_type: string;
  description: string | null;
  status: string;
  created_at: string;
};

/** Lists applications visible to the viewer (RLS: own rows, or all for admins). */
export function PartnerApplicationsList() {
  const { t } = useI18n();
  const [rows, setRows] = useState<App[] | null>(null);

  useEffect(() => {
    void supabase
      .from("partner_applications")
      .select("id, full_name, email, company_name, partnership_type, description, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as App[]) ?? []));
  }, []);

  if (rows === null) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl text-foreground">{t("Partner applications")}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {t("No applications yet.")}{" "}
          <Link to="/become-a-partner" className="text-gold hover:underline">{t("Become a Partner")}</Link>
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card/40 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-foreground">
                  {r.company_name} <span className="text-muted-foreground">· {r.partnership_type.replace("_", " ")}</span>
                </p>
                <PartnerStatusBadge status={r.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.full_name} · {r.email} · {new Date(r.created_at).toLocaleDateString()}
              </p>
              {r.description && <p className="mt-2 text-xs text-foreground/80">{r.description}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
