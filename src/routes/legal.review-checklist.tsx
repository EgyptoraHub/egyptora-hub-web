import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { LEGAL_DRAFT_NOTICE, legalDocuments } from "@/data/legal";

const title = "Legal Review Checklist — Egyptora Hub";
const description =
  "Pre-launch checklist identifying which Egyptora Hub policies require confirmation by Egyptian counsel and which third-party integrations require separate contractual or regulatory review.";

export const Route = createFileRoute("/legal/review-checklist")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/legal/review-checklist` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/legal/review-checklist` }],
  }),
  component: ReviewChecklist,
});

function ReviewChecklist() {
  const { t } = useI18n();
  const external = legalDocuments.filter((d) => (d.externalReview?.length ?? 0) > 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Section>
          <SectionHeader
            eyebrow={t("Pre-launch")}
            title={t("Legal review checklist")}
            description={t(
              "Every document below must be confirmed by qualified Egyptian legal counsel before production launch.",
            )}
          />

          <div className="rounded-2xl border border-gold-line bg-gold/5 p-5 text-xs font-semibold eyebrow text-gold-text">
            {t(LEGAL_DRAFT_NOTICE)}
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-sidebar text-2xs eyebrow text-gold-text">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">{t("Document")}</th>
                  <th className="px-4 py-3">{t("Version")}</th>
                  <th className="px-4 py-3">{t("Approval status")}</th>
                  <th className="px-4 py-3">{t("Counsel review")}</th>
                </tr>
              </thead>
              <tbody>
                {legalDocuments.map((d) => (
                  <tr key={d.slug} className="border-t border-border bg-card">
                    <td className="px-4 py-3 text-muted-foreground">{String(d.index).padStart(2, "0")}</td>
                    <td className="px-4 py-3">
                      <Link to="/legal/$slug" params={{ slug: d.slug }} className="text-foreground hover:text-gold-text">
                        {t(d.title)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">v{d.version}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t(d.status)}</td>
                    <td className="px-4 py-3 text-gold-text">
                      {d.counselReviewRequired ? t("Required") : t("Not required")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-12 font-display text-xl tracking-tight text-foreground lg:text-2xl">
            {t("Third-party integrations requiring separate review")}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {external.map((d) => (
              <div key={d.slug} className="rounded-2xl border border-border bg-card p-5">
                <Link to="/legal/$slug" params={{ slug: d.slug }} className="font-display text-base text-foreground hover:text-gold-text">
                  {t(d.title)}
                </Link>
                <ul className="mt-3 space-y-1.5">
                  {(d.externalReview ?? []).map((x) => (
                    <li key={x} className="text-xs text-muted-foreground">
                      · {t(x)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
