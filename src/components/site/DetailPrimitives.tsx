import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section } from "@/components/site/Primitives";
import { useI18n } from "@/i18n";

/**
 * Shared building blocks for the single-record detail pages
 * (properties, providers, offers, investment opportunities, countries, products).
 * Every label passed in is translated by the caller via t(); nothing here hardcodes copy.
 */

export function DetailShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

/** "Back to <list page>" link shown at the top of every detail page. */
export function BackLink({ to, label }: { to: string; label: string }) {
  const { dir } = useI18n();
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
      to={to as any}
      className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-gold-text"
    >
      <ArrowLeft className={dir === "rtl" ? "size-4 rotate-180" : "size-4"} />
      {label}
    </Link>
  );
}

/** One label/value row in the facts grid. Renders nothing when the value is empty. */
export function Fact({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="text-2xs font-semibold eyebrow text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 text-sm text-foreground/90">{value}</div>
    </div>
  );
}

export function FactGrid({ children }: { children: ReactNode }) {
  return <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

/** A translated chip list (tags, specialties, amenities, restrictions…). */
export function ChipList({ label, items }: { label: string; items: string[] | null | undefined }) {
  const { t } = useI18n();
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6">
      <h2 className="font-display text-sm text-gold-text">{label}</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-gold-line/60 bg-gold-soft px-2.5 py-1 text-2xs text-gold-text"
          >
            {t(item)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Gallery for records that carry an `images` array. */
export function ImageStrip({ images, alt }: { images: string[] | null | undefined; alt: string }) {
  if (!images || images.length === 0) return null;
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {images.slice(0, 6).map((src) => (
        <img
          key={src}
          src={src}
          alt={alt}
          loading="lazy"
          width={1280}
          height={720}
          className="h-48 w-full rounded-2xl border border-border/60 object-cover"
        />
      ))}
    </div>
  );
}

/** Shared graceful "record not found" state for a bad or missing id. */
export function DetailNotFound({ backTo, backLabel }: { backTo: string; backLabel: string }) {
  const { t } = useI18n();
  return (
    <DetailShell>
      <Section className="py-24 text-center">
        <h1 className="font-display text-3xl text-gold-text">{t("We couldn't find this record")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("It may have been removed, or the link you followed is incorrect.")}
        </p>
        <div className="mt-6 flex justify-center">
          <BackLink to={backTo} label={backLabel} />
        </div>
      </Section>
    </DetailShell>
  );
}
