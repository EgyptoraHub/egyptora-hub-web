import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { consentTypes, getLegalDocument } from "@/data/legal";

const title = "Consent Centre — Egyptora Hub";
const description =
  "Grant or withdraw each Egyptora Hub consent separately: cookies, marketing, location, trip tracking, media use, AI processing and sensitive data.";

export const Route = createFileRoute("/legal/consent")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/legal/consent` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-banner.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/legal/consent` }],
  }),
  component: ConsentCentre,
});

type ConsentRow = {
  consent_type: string;
  status: string;
  policy_version: string | null;
  granted_at: string | null;
  withdrawn_at: string | null;
};

function ConsentCentre() {
  const { t } = useI18n();
  const [rows] = useState<Record<string, ConsentRow>>({});
  const [busy] = useState<string | null>(null);

  function setConsent(_key: string, _grant: boolean) {
    toast(t("Preview — consent recording isn't connected to a backend yet"));
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Section>
          <SectionHeader
            eyebrow={t("Legal & Compliance")}
            title={t("Consent Centre")}
            description={t(
              "Each purpose is consented to separately — never through a single checkbox. Optional consents can be withdrawn at any time, and every change is recorded with its policy version and timestamp.",
            )}
          />

          <div className="rounded-2xl border border-gold-line bg-card p-6">
            <ShieldCheck className="size-5 text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("Preview — consent recording isn't connected to a backend yet")}
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {consentTypes.map((c) => {
              const row = rows[c.key];
              const granted = c.required || row?.status === "granted";
              const policy = getLegalDocument(c.policySlug);
              return (
                <div key={c.key} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-base text-foreground">{t(c.label)}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {t(c.description)}
                      </p>
                    </div>
                    <span
                      className={
                        c.required
                          ? "shrink-0 rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                          : "shrink-0 rounded-full border border-gold-line px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-gold"
                      }
                    >
                      {c.required ? t("Required") : t("Optional")}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/80">
                    {policy && (
                      <Link to="/legal/$slug" params={{ slug: policy.slug }} className="text-gold hover:underline">
                        {t(policy.title)} · v{policy.version}
                      </Link>
                    )}
                    {c.sensitive && <span>{t("Enhanced controls apply")}</span>}
                    {row?.withdrawn_at && (
                      <span>
                        {t("Withdrawn")} {new Date(row.withdrawn_at).toLocaleDateString()}
                      </span>
                    )}
                    {row?.status === "granted" && row.granted_at && (
                      <span>
                        {t("Granted")} {new Date(row.granted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    {c.required ? (
                      <p className="text-xs text-muted-foreground/80">
                        {t("Necessary for the service to operate — cannot be withdrawn while you use the platform.")}
                      </p>
                    ) : (
                      <button
                        type="button"
                        disabled={busy === c.key}
                        onClick={() => setConsent(c.key, !granted)}
                        className="rounded-xl border border-gold-line bg-gold/10 px-4 py-2 text-xs text-gold transition-colors hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {granted ? t("Withdraw consent") : t("Give consent")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground/80">
            {t(
              "Each record stores the user, policy, policy version, consent type, status, grant timestamp, withdrawal timestamp and audit metadata. Withdrawal does not affect processing carried out lawfully before it.",
            )}
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
