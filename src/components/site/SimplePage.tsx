import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useI18n } from "@/i18n";

/** Plain header + title + body page used by static info pages (About, Trust Center, e-Visa). */
export function SimplePage({
  title,
  intro,
  banner,
  placeholder,
  children,
}: {
  title: string;
  intro?: string;
  banner?: ReactNode;
  /** Flags the copy as placeholder text pending editorial review. */
  placeholder?: boolean;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <>
      <SiteHeader />
      {banner}
      <main className="mx-auto max-w-[1280px] px-4 py-10 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-navy lg:text-4xl">{t(title)}</h1>
        {intro && <p className="mt-3 max-w-3xl text-text-body">{t(intro)}</p>}
        {placeholder && (
          <p className="mt-4 inline-block rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("Placeholder copy — under editorial review")}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

export function InfoCard({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold text-navy">{t(title)}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-text-body">{children}</div>
    </section>
  );
}

export function simpleHead(path: string, title: string, description: string, url: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${url}${path}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${url}${path}` }],
  };
}
