import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, FileText, ScrollText, Lock } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import {
  LEGAL_DRAFT_NOTICE,
  governmentIntegrationStatuses,
  legalCategories,
  legalDocuments,
  partnerOnboardingGates,
} from "@/data/legal";

const title = "Legal & Compliance Center — Egyptora Hub";
const description =
  "Egyptora Hub's legal architecture: terms, privacy, data protection, security, AI transparency, partner and government integration policies, with version control and consent management.";

export const Route = createFileRoute("/legal/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/legal` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-banner.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/legal` }],
  }),
  component: LegalCenter,
});

function LegalCenter() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Section>
          <SectionHeader
            eyebrow={t("Legal & Compliance")}
            title={t("Egyptora Hub Legal Center")}
            description={t(
              "Every policy governing the platform, each with its own version, owner, effective date and change history.",
            )}
          />

          <div className="rounded-2xl border border-gold-line bg-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              {t("Legal review status")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(LEGAL_DRAFT_NOTICE)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/80">
              {t(
                "These drafts do not guarantee compliance with Egyptian or international law. A full legal review checklist is published below.",
              )}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/80">
              {t("Egyptora Hub is a brand operated by")} {SITE.parentCompany},{" "}
              {t("the registered legal entity for this platform.")}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                label: t("Policy documents"),
                value: String(legalDocuments.length),
              },
              { icon: ShieldCheck, label: t("Consent types recorded separately"), value: "11" },
              { icon: Lock, label: t("Enhanced-control data categories"), value: "7" },
              { icon: ScrollText, label: t("Approval status"), value: t("DRAFT") },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                <s.icon className="size-4 text-gold" />
                <p className="mt-3 font-display text-2xl text-foreground">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/legal/consent"
              className="rounded-xl border border-gold-line bg-gold/10 px-5 py-3 text-sm text-gold transition-colors hover:bg-gold/20"
            >
              {t("Open the Consent Centre")}
            </Link>
            <Link
              to="/legal/review-checklist"
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm text-foreground transition-colors hover:border-gold-line"
            >
              {t("Legal review checklist")}
            </Link>
          </div>
        </Section>

        {legalCategories.map((category) => {
          const docs = legalDocuments.filter((d) => d.category === category);
          if (!docs.length) return null;
          return (
            <Section key={category} className="py-8 lg:py-10">
              <h2 className="font-display text-xl tracking-tight text-foreground lg:text-2xl">
                {t(category)}
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {docs.map((d) => (
                  <Link
                    key={d.slug}
                    to="/legal/$slug"
                    params={{ slug: d.slug }}
                    className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold-line"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80">
                      {t("Document")} {String(d.index).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 font-display text-base leading-snug text-foreground group-hover:text-gold">
                      {t(d.title)}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {t(d.summary)}
                    </p>
                    <p className="mt-3 text-[11px] text-muted-foreground/80">
                      v{d.version} · {t("Effective")} {d.effectiveDate} · {t(d.status)}
                    </p>
                  </Link>
                ))}
              </div>
            </Section>
          );
        })}

        <Section className="py-8 lg:py-12">
          <h2 className="font-display text-xl tracking-tight text-foreground lg:text-2xl">
            {t("Government & official integration status")}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {t(
              "Egyptora Hub is an independent platform and does not represent the Egyptian Government. Every integration carries an explicit status; LIVE is enabled only after documented authorisation.",
            )}
          </p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-sidebar text-[11px] uppercase tracking-[0.16em] text-gold/80">
                <tr>
                  <th className="px-4 py-3">{t("Entity")}</th>
                  <th className="px-4 py-3">{t("Scope")}</th>
                  <th className="px-4 py-3">{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {governmentIntegrationStatuses.map((g) => (
                  <tr key={g.entity} className="border-t border-border bg-card">
                    <td className="px-4 py-3 text-foreground">{t(g.entity)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t(g.scope)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-gold-line px-3 py-1 text-[11px] text-gold">
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-12 font-display text-xl tracking-tight text-foreground lg:text-2xl">
            {t("Partner legal onboarding gates")}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {t(
              'A partner cannot be marked ACTIVE until every gate is cleared. Claims such as "Official" or "Verified by Egyptora Hub" are only displayed where retained evidence supports that exact claim.',
            )}
          </p>
          <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {partnerOnboardingGates.map((gate, i) => (
              <li
                key={gate}
                className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"
              >
                <span className="mr-2 text-gold">{String(i + 1).padStart(2, "0")}</span>
                {t(gate)}
              </li>
            ))}
          </ol>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
