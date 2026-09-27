import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-5 lg:px-10", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-14 lg:py-24", className)}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-12">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/80">
            {t(eyebrow)}
          </p>
        )}
        <h2 className="font-display text-2xl leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {t(title)}
        </h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground lg:text-base">
            {t(description)}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

type Status = "DEMO" | "PLANNED" | "SIMULATED" | "VERIFIED";

const statusStyles: Record<Status, string> = {
  DEMO: "border-info/40 text-info",
  PLANNED: "border-border text-muted-foreground",
  SIMULATED: "border-hot/40 text-hot",
  VERIFIED: "border-success/40 text-success",
};

export function SourceBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function GoldButton({
  children,
  href,
  onClick,
  className,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      type={href ? undefined : "button"}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function GhostButton({
  children,
  href,
  className,
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border border-gold-line px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {children}
    </a>
  );
}
