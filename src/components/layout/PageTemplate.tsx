import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { MainNav } from "@/components/layout/MainNav";
import { useSiteSearch } from "@/lib/site-search";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Hero with one search field (hands the question to the AI assistant) */
/* ------------------------------------------------------------------ */

export function HeroSearch({
  title,
  subtitle,
  description,
  image,
  imageAlt,
  placeholder,
  sideNote,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  imageAlt: string;
  placeholder: string;
  sideNote?: string[];
  breadcrumb?: { label: string; to?: string }[];
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const siteSearch = useSiteSearch();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    siteSearch(query);
    setQuery("");
  };

  return (
    <section className="relative overflow-hidden">
      <img
        src={image}
        alt={imageAlt}
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover"
      />
      {/* Dark side follows the text side (flipped in RTL); phones get extra shade since text spans the full width. */}
      <div
        className="absolute inset-0 rtl:-scale-x-100"
        style={{
          background:
            "linear-gradient(to right, oklch(0.243 0.058 249.8 / 92%) 0%, oklch(0.243 0.058 249.8 / 68%) 55%, oklch(0.243 0.058 249.8 / 32%) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-navy/45 sm:hidden" aria-hidden="true" />

      <div className="on-dark relative mx-auto w-full max-w-[1500px] px-4 pb-12 pt-6 lg:px-8 lg:pb-16">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-foreground/70">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3 rtl:rotate-180" />}
                {crumb.to ? (
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
                    to={crumb.to as any}
                    className="transition-colors hover:text-gold"
                  >
                    {t(crumb.label)}
                  </Link>
                ) : (
                  <span className="text-foreground">{t(crumb.label)}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl leading-[1.05] text-foreground drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-[52px]">
              {t(title)}
            </h1>
            {subtitle && (
              <p className="mt-3 font-display text-lg text-foreground/90 sm:text-2xl">
                {t(subtitle)}
              </p>
            )}
            {description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
                {t(description)}
              </p>
            )}

            <form onSubmit={submit} className="mt-7 flex w-full max-w-2xl items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(placeholder)}
                aria-label={t(placeholder)}
                className="min-w-0 flex-1 rounded-full bg-white px-5 py-3.5 text-sm text-primary outline-none ring-1 ring-white/40 placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                {t("Search")}
              </button>
            </form>
          </div>

          {sideNote && sideNote.length > 0 && (
            <ul className="hidden gap-1 text-[11px] uppercase tracking-[0.2em] text-foreground/80 lg:grid">
              {sideNote.map((line) => (
                <li key={line}>{t(line)}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-category tab row                                                */
/* ------------------------------------------------------------------ */

export type CategoryTab = {
  id: string;
  label: string;
  labelAr?: string;
  icon: LucideIcon;
  /** No data behind this tab yet — selecting it shows an honest empty state. */
  soon?: boolean;
};

export function CategoryTabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: CategoryTab[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="relative z-10 mx-auto -mt-8 w-full max-w-[1500px] px-4 lg:px-8">
      <div className="flex gap-2.5 overflow-x-auto rounded-2xl border border-border bg-card p-2.5 shadow-[0_18px_40px_-28px_rgba(6,33,58,0.45)] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              aria-pressed={isActive}
              className={cn(
                "grid min-w-[112px] shrink-0 justify-items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-colors",
                isActive
                  ? "border-gold-line bg-gold-soft"
                  : "border-transparent bg-background hover:border-gold-line",
              )}
            >
              <tab.icon className={cn("size-5", isActive ? "text-gold" : "text-primary")} />
              <span
                className={cn(
                  "text-[11px] font-semibold leading-tight",
                  isActive ? "text-gold" : "text-foreground",
                )}
              >
                {t(tab.label)}
              </span>
              {tab.labelAr && (
                <span className="text-[10px] leading-tight text-muted-foreground" dir="rtl">
                  {tab.labelAr}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section header used by every block inside the template              */
/* ------------------------------------------------------------------ */

export function BlockHeader({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-xl text-foreground sm:text-2xl">{t(title)}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{t(description)}</p>
        )}
      </div>
      {actionLabel && (actionTo || onAction) && (
        actionTo ? (
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
            to={actionTo as any}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-gold"
          >
            {t(actionLabel)} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-gold"
          >
            {t(actionLabel)} <ArrowRight className="size-4 rtl:rotate-180" />
          </button>
        )
      )}
    </div>
  );
}

/** Horizontal, scrollable row of feature cards. */
export function FeaturedRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">{children}</div>
  );
}

/* ------------------------------------------------------------------ */
/* "Explore by ..." grid of small icon/label cards                     */
/* ------------------------------------------------------------------ */

export type ExploreItem = {
  label: string;
  labelAr?: string;
  description?: string;
  icon: LucideIcon;
  to?: string;
  soon?: boolean;
};

export function ExploreGrid({ items }: { items: ExploreItem[] }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const inner = (
          <>
            <item.icon className="size-5 shrink-0 text-gold" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {t(item.label)}
              </span>
              {item.labelAr && (
                <span className="block truncate text-xs text-muted-foreground" dir="rtl">
                  {item.labelAr}
                </span>
              )}
              {item.description && (
                <span className="block text-xs text-muted-foreground">{t(item.description)}</span>
              )}
            </span>
          </>
        );
        const base =
          "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-start transition-colors";
        if (item.soon || !item.to) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => toast(t("Coming soon"))}
              className={cn(base, "cursor-default opacity-70")}
            >
              {inner}
              <span className="ms-auto shrink-0 rounded-full border border-border bg-muted/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
                {t("Coming soon")}
              </span>
            </button>
          );
        }
        return (
          <Link
            key={item.label}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
            to={item.to as any}
            className={cn(base, "hover:border-gold-line")}
          >
            {inner}
            <ChevronRight className="ms-auto size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
          </Link>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page shell                                                          */
/* ------------------------------------------------------------------ */

export function PageTemplate({
  hero,
  tabs,
  sidebar,
  children,
}: {
  hero: ReactNode;
  tabs?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      {hero}
      {tabs}
      <main className="mx-auto w-full max-w-[1500px] px-4 py-10 lg:px-8 lg:py-14">
        <div
          className={cn(
            "grid gap-8",
            sidebar && "lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10",
          )}
        >
          <div className="grid min-w-0 gap-12">{children}</div>
          {sidebar && <aside className="grid content-start gap-5">{sidebar}</aside>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
