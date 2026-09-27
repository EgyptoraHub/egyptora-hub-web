import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { PartnerApplicationsList } from "@/components/site/PartnerApplications";
import { AdminChecking, AdminDenied, adminHead } from "@/components/admin/AdminStates";
import { getPartnerPortal, type PartnerAssignedItem, type PartnerProfile } from "@/lib/partners.functions";
import { MODERATION_LABEL } from "@/lib/partners.config";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/partners/")({
  ssr: false,
  head: () => adminHead(`Partner portal — ${SITE.name}`, "Partner content portal."),
  component: PartnerPortalPage,
});

function PartnerPortalPage() {
  const { t } = useI18n();
  const load = useServerFn(getPartnerPortal);
  const [state, setState] = useState<"loading" | "denied" | "applicant" | "ready">("loading");
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [items, setItems] = useState<PartnerAssignedItem[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setState("denied");
        return;
      }
      const result = await load({ data: {} as never });
      if (!active) return;
      if (!result.authorized) {
        setState("applicant");
        return;
      }
      setPartner(result.partner);
      setItems(result.items);
      setState("ready");
    })().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [load]);

  if (state === "loading") return <AdminChecking />;
  if (state === "denied") return <AdminDenied />;
  if (state === "applicant")
    return (
      <div className="min-h-screen bg-background px-5 py-14">
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/80">
            {SITE.name} · {t("Partner portal")}
          </p>
          <PartnerApplicationsList />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background px-5 py-14">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/80">
          {SITE.name} · {t("Partner portal")}
        </p>
        <h1 className="mt-3 font-display text-3xl text-foreground">{partner?.orgName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("The entries you may edit. Every change is reviewed before it goes live.")}
        </p>

        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <Link
              key={`${item.itemType}:${item.itemId}`}
              to="/partners/$type/$id"
              params={{ type: item.itemType, id: item.itemId }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/40 px-5 py-4 transition-colors hover:border-gold/50"
            >
              <div>
                <p className="text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.itemType === "property" ? t("Property") : t("Investment opportunity")}
                  {item.lastSubmittedAt
                    ? ` · ${t("Last submitted")} ${new Date(item.lastSubmittedAt).toLocaleString()}`
                    : ""}
                </p>
              </div>
              <span className="rounded-full border border-border/70 px-3 py-1 text-[11px] text-muted-foreground">
                {t(MODERATION_LABEL[item.moderationState] ?? item.moderationState)}
              </span>
            </Link>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t("Nothing has been assigned to you yet.")}
            </p>
          )}
        </div>
        <PartnerApplicationsList />
      </div>
    </div>
  );
}
