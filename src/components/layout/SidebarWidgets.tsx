import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export type SidebarLink = {
  label: string;
  icon: LucideIcon;
  to?: string;
  soon?: boolean;
};

/** White card holding a list of quick links / tools. */
export function SidebarLinkCard({
  title,
  description,
  links,
}: {
  title: string;
  description?: string;
  links: SidebarLink[];
}) {
  const { t } = useI18n();
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="font-display text-base text-foreground">{t(title)}</h2>
      {description && <p className="mt-1 text-xs text-muted-foreground">{t(description)}</p>}
      <ul className="mt-3 grid gap-1">
        {links.map((link) => {
          const inner = (
            <>
              <link.icon className="size-4 shrink-0 text-gold-text" />
              <span className="min-w-0 flex-1 truncate">{t(link.label)}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
            </>
          );
          const base =
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-start text-[13px] transition-colors";
          return (
            <li key={link.label}>
              {link.soon || !link.to ? (
                <button
                  type="button"
                  onClick={() => toast(t("Coming soon"))}
                  className={cn(base, "cursor-default text-muted-foreground")}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
                  to={link.to as any}
                  className={cn(base, "text-foreground/85 hover:bg-gold-soft hover:text-gold-text")}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Dark navy widget with optional stats and a call to action. */
export function SidebarPromoCard({
  title,
  description,
  stats,
  actionLabel,
  actionTo,
  actionHref,
}: {
  title: string;
  description?: string;
  stats?: { label: string; value: string }[];
  actionLabel?: string;
  actionTo?: string;
  actionHref?: string;
}) {
  const { t } = useI18n();
  return (
    <section className="on-dark rounded-2xl bg-primary p-5">
      <h2 className="font-display text-base text-foreground">{t(title)}</h2>
      {description && (
        <p className="mt-1 text-xs leading-relaxed text-foreground/75">{t(description)}</p>
      )}
      {stats && stats.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/15 px-3 py-2.5">
              <p className="text-2xs uppercase tracking-wide text-foreground/65">{t(s.label)}</p>
              <p className="mt-0.5 font-display text-sm text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}
      {actionLabel &&
        (actionTo ? (
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
            to={actionTo as any}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-gold-foreground"
          >
            {t(actionLabel)}
          </Link>
        ) : actionHref ? (
          <a
            href={actionHref}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-gold-foreground"
          >
            {t(actionLabel)}
          </a>
        ) : null)}
    </section>
  );
}

/** Soft gold card used for "talk to us" style calls to action. */
export function SidebarContactCard({
  title,
  description,
  actionLabel,
  actionTo,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
}) {
  const { t } = useI18n();
  return (
    <section className="rounded-2xl border border-gold-line bg-gold-soft p-5 text-center">
      <h2 className="font-display text-base text-foreground">{t(title)}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(description)}</p>
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
        to={actionTo as any}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-gold-foreground"
      >
        {t(actionLabel)}
      </Link>
    </section>
  );
}
