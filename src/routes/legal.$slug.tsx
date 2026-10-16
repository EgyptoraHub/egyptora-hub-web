import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section } from "@/components/site/Primitives";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { LEGAL_DRAFT_NOTICE, getLegalDocument, legalDocuments } from "@/data/legal";

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ params }) => {
    const document = getLegalDocument(params.slug);
    if (!document) throw notFound();
    return { document };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Document not found — Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    }
    const d = loaderData.document;
    const title = `${d.title} — Egyptora Hub Legal Center`;
    return {
      meta: [
        { title },
        { name: "description", content: d.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: d.summary },
        { property: "og:url", content: `${SITE.url}/legal/${d.slug}` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/legal/${d.slug}` }],
    };
  },
  notFoundComponent: LegalNotFound,
  component: LegalDocumentPage,
});

function LegalNotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <h1 className="font-display text-3xl text-foreground">{t("Document not found")}</h1>
        <Link to="/legal" className="mt-4 inline-block text-sm text-gold-text">
          {t("Back to the Legal Center")}
        </Link>
      </Section>
      <SiteFooter />
    </div>
  );
}

function LegalDocumentPage() {
  const { document: d } = Route.useLoaderData();
  const { t } = useI18n();
  const related = legalDocuments.filter((x) => x.category === d.category && x.slug !== d.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Section>
          <Link
            to="/legal"
            className="inline-flex items-center gap-2 text-xs eyebrow text-gold-text hover:text-gold-text"
          >
            <ArrowLeft className="size-3.5" /> {t("Legal Center")}
          </Link>

          <h1 className="mt-5 max-w-4xl font-display text-3xl leading-tight tracking-tight text-foreground lg:text-4xl">
            {t(d.title)}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground lg:text-base">
            {t(d.summary)}
          </p>

          <div className="mt-6 rounded-2xl border border-gold-line bg-gold/5 p-5">
            <p className="text-xs font-semibold eyebrow text-gold-text">
              {t(LEGAL_DRAFT_NOTICE)}
            </p>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [t("Version"), d.version],
              [t("Effective date"), d.effectiveDate],
              [t("Last updated"), d.updatedDate],
              [t("Document owner"), t(d.owner)],
              [t("Approval status"), t(d.status)],
              [t("Applicable languages"), d.languages.map((l) => l.toUpperCase()).join(", ")],
              [t("Category"), t(d.category)],
              [t("Counsel review"), d.counselReviewRequired ? t("Required") : t("Not required")],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-card p-4">
                <dt className="text-2xs eyebrow text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          <article className="mt-10 max-w-3xl">
            {d.sections.map((s, i) => (
              <section key={s.heading} className="mt-8 first:mt-0">
                <h2 className="font-display text-xl text-foreground">
                  <span className="mr-2 text-gold-text">{i + 1}.</span>
                  {t(s.heading)}
                </h2>
                {s.body.map((p) => (
                  <p key={p} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(p)}
                  </p>
                ))}
              </section>
            ))}
          </article>

          {d.externalReview?.length ? (
            <div className="mt-10 max-w-3xl rounded-2xl border border-border bg-card p-5">
              <h2 className="text-2xs font-semibold eyebrow text-gold-text">
                {t("Requires separate contractual or regulatory review")}
              </h2>
              <ul className="mt-3 space-y-2">
                {d.externalReview.map((x) => (
                  <li key={x} className="text-sm text-muted-foreground">
                    · {t(x)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10 max-w-3xl">
            <h2 className="text-2xs font-semibold eyebrow text-gold-text">
              {t("Change history")}
            </h2>
            <ul className="mt-3 space-y-2">
              {d.changeHistory.map((c) => (
                <li
                  key={c.version + c.date}
                  className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground"
                >
                  <span className="text-foreground">v{c.version}</span> · {c.date} — {t(c.note)}
                </li>
              ))}
            </ul>
          </div>

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xs font-semibold eyebrow text-gold-text">
                {t("Related documents")}
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to="/legal/$slug"
                    params={{ slug: r.slug }}
                    className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground transition-colors hover:border-gold-line hover:text-foreground"
                  >
                    {t(r.title)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
