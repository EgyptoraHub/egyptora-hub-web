import { useNavAvailability, type NavGate } from "@/lib/nav-availability";
/**
 * Shared inner-page template (Explore / Invest / Live / Do Business and future
 * landing pages). Every visible string goes through `t()` so the language
 * switcher translates it site-wide.
 */
import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { AiBadge } from "@/components/site/AiBadge";
import { altForSrc } from "@/lib/generated-images";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Info, Search } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SaveButton } from "@/components/site/SaveButton";
import { useSiteSearch } from "@/lib/site-search";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export type Icon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- static route paths
const L = (to: string) => to as any;
const isExternal = (to: string) => /^https?:\/\//.test(to);

export const innerWrap = "mx-auto w-full max-w-[1280px] px-4 lg:px-8";

/** Dense mockup-style card grid: 2 per row on phones, 5–6 per row on desktop. */
export const cardGrid = "grid gap-3 grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(126px,1fr))]";

/* ---------------- small shared bits ---------------- */

export function SmartLink({
  to,
  className,
  children,
  label,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  label?: string;
}) {
  if (isExternal(to))
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
        {children}
      </a>
    );
  // "/path?key=value" → typed search params, so filters (e.g. ?sector=) survive the router.
  const [path, qs] = to.split("?");
  const search = qs ? Object.fromEntries(new URLSearchParams(qs)) : undefined;
  return (
    <Link to={L(path)} search={search as never} aria-label={label} className={className}>
      {children}
    </Link>
  );
}

export function ArrowCta({ to, label }: { to?: string | undefined; label: string }) {
  const { t } = useI18n();
  if (!to)
    return (
      <button
        type="button"
        onClick={() => toast(t("Coming soon"))}
        aria-label={`${label} — ${t("Coming soon")}`}
        className="grid size-8 shrink-0 cursor-default place-items-center rounded-full bg-muted text-muted-foreground shadow-sm"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
      </button>
    );
  return (
    <SmartLink
      to={to}
      label={label}
      className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-cta text-primary-foreground shadow-sm transition-transform hover:scale-105"
    >
      <ArrowRight className="size-4 rtl:rotate-180" />
    </SmartLink>
  );
}

export function NavyBadge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute start-2 top-2 rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
      {children}
    </span>
  );
}

export function ViewAll({ to, label = "View All" }: { to: string; label?: string | undefined }) {
  const { t, lang } = useI18n();
  return (
    <SmartLink
      to={to}
      className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-navy hover:text-shell-gold"
    >
      {t(label)} <ArrowRight className="size-4 text-shell-gold rtl:rotate-180" />
    </SmartLink>
  );
}

export function SectionHead({
  title,
  body,
  to,
  toLabel,
}: {
  title: string;
  body?: string;
  to?: string;
  toLabel?: string;
}) {
  const { t, lang } = useI18n();
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-bold text-navy sm:text-[28px]">{t(title)}</h2>
        {body && <p className="mt-1 max-w-xl text-sm text-text-body">{t(body)}</p>}
      </div>
      {to && <ViewAll to={to} label={toLabel} />}
    </div>
  );
}

export function GoldButton({ to, children, onClick }: { to?: string; children: ReactNode; onClick?: () => void }) {
  const cls =
    "inline-flex items-center gap-2 rounded-lg bg-gold-cta px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5";
  if (!to)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  return (
    <SmartLink to={to} className={cls}>
      {children}
    </SmartLink>
  );
}

/* ---------------- cards ---------------- */

export type CardItem = {
  title: string;
  desc?: string;
  img?: string;
  badge?: string;
  meta?: string[];
  /** Omitted for Coming-soon cards: the arrow becomes inert (toast), same as the menu. */
  to?: string | undefined;
  Icon?: Icon;
};

export function PhotoCard({ c, h = "h-28" }: { c: CardItem; h?: string }) {
  const { t, lang } = useI18n();
  return (
    <article className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-sm">
      {c.img && (
        <div className={cn("relative overflow-hidden", h)}>
          <img src={c.img} alt={altForSrc(c.img, lang, t(c.title))} loading="lazy" className="size-full object-cover" />
          <AiBadge src={c.img} />
          {c.badge && <NavyBadge>{t(c.badge)}</NavyBadge>}
          <SaveButton
            variant="icon"
            itemType="page"
            itemId={`${c.title}|${c.to ?? ""}`}
            itemName={c.title}
            itemImage={c.img}
            className="absolute end-2 top-2 size-7 border-primary-foreground/60 bg-navy/35 text-primary-foreground"
          />
        </div>
      )}
      <div className="flex flex-1 items-end justify-between gap-2 p-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold leading-snug text-navy">{t(c.title)}</h3>
          {c.desc && <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-text-body">{t(c.desc)}</p>}
          {c.meta && c.meta.length > 0 && (
            <p className="mt-2 text-[11px] font-medium text-navy/70">
              {c.meta.map((m) => t(m)).join(" · ")}
            </p>
          )}
        </div>
        <ArrowCta to={c.to} label={t(c.title)} />
      </div>
    </article>
  );
}

export function IconCard({ c, cta = true }: { c: CardItem; cta?: boolean }) {
  const { t, lang } = useI18n();
  return (
    <article className="flex h-full flex-col rounded-[10px] border border-border bg-card p-3 shadow-sm">
      {c.Icon && (
        <span className="mb-2 grid size-9 place-items-center rounded-full bg-chip-active text-navy">
          <c.Icon className="size-5 fill-navy/15" strokeWidth={2.2} />
        </span>
      )}
      <div className="flex flex-1 items-end justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[13px] font-bold leading-snug text-navy">{t(c.title)}</h3>
          {c.desc && <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-text-body">{t(c.desc)}</p>}
        </div>
        {cta && <ArrowCta to={c.to} label={t(c.title)} />}
      </div>
    </article>
  );
}

/* ---------------- sidebar modules ---------------- */

export function SidePanel({ title, body, children }: { title: string; body?: string; children: ReactNode }) {
  const { t, lang } = useI18n();
  return (
    <section className="rounded-[10px] border border-border bg-card p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold text-navy">{t(title)}</h3>
      {body && <p className="mt-1 text-xs text-text-body">{t(body)}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function LinkList({ items }: { items: { label: string; to?: string | undefined; Icon?: Icon }[] }) {
  const { t, lang } = useI18n();
  return (
    <ul className="divide-y divide-border">
      {items.map((i) => (
        <li key={i.label}>
          {!i.to ? (
            <button
              type="button"
              onClick={() => toast(t("Coming soon"))}
              className="flex w-full cursor-default items-center gap-3 py-2.5 text-start text-sm text-muted-foreground"
            >
              {i.Icon && <i.Icon className="size-4 shrink-0 text-muted-foreground" />}
              <span className="flex-1">{t(i.label)}</span>
              <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase">{t("Coming soon")}</span>
            </button>
          ) : (
          <SmartLink
            to={i.to}
            className="flex items-center gap-3 py-2.5 text-sm text-navy transition-colors hover:text-shell-gold"
          >
            {i.Icon && <i.Icon className="size-4 shrink-0 text-shell-gold" />}
            <span className="flex-1">{t(i.label)}</span>
            <ChevronRight className="size-4 text-text-body rtl:rotate-180" />
          </SmartLink>
          )}
        </li>
      ))}
    </ul>
  );
}

export function NavyPromo({ children }: { children: ReactNode }) {
  return <section className="on-dark rounded-[10px] bg-navy p-5 text-foreground shadow-sm">{children}</section>;
}

/* ---------------- stylised Egypt map ---------------- */

const PINS: Record<string, [number, number]> = {
  Alexandria: [31.2, 29.9],
  "Siwa Oasis": [29.2, 25.5],
  Cairo: [30.04, 31.24],
  "New Capital": [30.02, 31.9],
  Suez: [29.97, 32.55],
  Hurghada: [27.26, 33.81],
  "Red Sea": [25.6, 34.6],
  Luxor: [25.69, 32.64],
  Aswan: [24.09, 32.9],
};
const px = (lon: number) => (lon - 24.6) * 30;
const py = (lat: number) => (31.9 - lat) * 30;
const outline: [number, number][] = [
  [25, 31.6], [29, 30.9], [30.4, 31.5], [32.3, 31.3], [34.2, 31.3], [34.9, 29.5], [34.3, 27.8],
  [33.6, 28.6], [32.6, 29.9], [32.4, 29.5], [33.9, 27.1], [35.6, 23.9], [36.9, 22], [25, 22],
];
const nile: [number, number][] = [
  [31.6, 22], [32.9, 24.1], [32.6, 25.7], [32.7, 26.2], [31.2, 27.2], [30.8, 28.8], [31.24, 30.04], [30.8, 31.4],
];

export function EgyptMap({ pins, className }: { pins: string[]; className?: string }) {
  const { t, lang } = useI18n();
  const pts = (arr: [number, number][]) => arr.map(([lo, la]) => `${px(lo)},${py(la)}`).join(" ");
  return (
    <svg viewBox="0 0 375 310" className={cn("w-full", className)} role="img" aria-label={t("Map of Egypt")}>
      <rect width="375" height="310" rx="10" className="fill-bg-band" />
      <polygon points={pts(outline)} className="fill-chip-active stroke-shell-gold" strokeWidth="1.5" />
      <polyline points={pts(nile)} fill="none" className="stroke-info" strokeWidth="2" strokeLinecap="round" />
      {pins.map((p) => {
        const c = PINS[p];
        if (!c) return null;
        const x = px(c[1]);
        const y = py(c[0]);
        return (
          <g key={p}>
            <circle cx={x} cy={y} r="5" className="fill-gold-cta stroke-card" strokeWidth="1.5" />
            <text x={x + 8} y={y + (p === "New Capital" ? 16 : p === "Cairo" ? -6 : 4)} className="fill-navy text-[11px] font-semibold">
              {t(p)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- hero ---------------- */

export type HeroConfig = {
  image: string;
  title: string;
  subtitle: string;
  body?: string;
  placeholder: string;
  tagline: string[];
  popular?: string[];
  extra?: ReactNode;
  /** Replaces the search bar (e.g. a booking widget). */
  replaceSearch?: ReactNode;
};

function InnerHero({ h }: { h: HeroConfig }) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const siteSearch = useSiteSearch();
  return (
    <section className="on-dark relative isolate overflow-hidden">
      <img src={h.image} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/90 via-navy/55 to-transparent to-[62%] rtl:bg-gradient-to-l" />
      {/* Phones: text spans the full width, so shade the whole image for ≥4.5:1 contrast. */}
      <div className="absolute inset-0 -z-10 bg-navy/55 sm:hidden" aria-hidden="true" />
      <div className={cn(innerWrap, "relative pb-16 pt-8 lg:pb-20 lg:pt-10")}>
        <div className="absolute end-6 top-8 hidden text-end md:block lg:end-10">
          <p className="font-display text-5xl italic text-foreground drop-shadow">{t("Egypt")}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.2em] text-foreground">
            {h.tagline.map((l) => (
              <span key={l} className="block">
                {t(l)}
              </span>
            ))}
          </p>
        </div>
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[48px]">
            {t(h.title)}
          </h1>
          <p className="mt-3 text-lg font-bold text-foreground sm:text-xl">{t(h.subtitle)}</p>
          {h.body && <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/85">{t(h.body)}</p>}
          {h.replaceSearch ? null : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              siteSearch(q);
              setQ("");
            }}
            className="mt-5 flex max-w-xl items-center gap-2 rounded-full bg-primary-foreground p-1.5 shadow-lg"
          >
            <Search className="ms-3 size-4 shrink-0 text-text-body" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t(h.placeholder)}
              aria-label={t(h.placeholder)}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-navy outline-none placeholder:text-text-body"
            />
            <button type="submit" className="shrink-0 rounded-full bg-gold-cta px-5 py-2 text-sm font-semibold text-primary-foreground">
              {t("Search")}
            </button>
          </form>
          )}
          {h.popular && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground">{t("Popular:")}</span>
              {h.popular.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => siteSearch(p)}
                  className="rounded-full border border-foreground/40 bg-navy/50 px-3 py-1 text-xs text-foreground transition-colors hover:border-shell-gold"
                >
                  {t(p)}
                </button>
              ))}
            </div>
          )}
        </div>
        {h.replaceSearch && <div className="mt-6 max-w-4xl">{h.replaceSearch}</div>}
        {h.extra}
      </div>
    </section>
  );
}

/* ---------------- chip strip ---------------- */

/** `gate`: data-driven chip — links to `to` only while the section has a public record (same check as the menu). */
export type Chip = { label: string; Icon: Icon; to?: string | undefined; gate?: NavGate | undefined };

function MoreDots({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} style={{ fill: "currentColor" }} aria-hidden>
      <circle cx="5" cy="5" r="2.5" />
      <circle cx="15" cy="5" r="2.5" />
      <circle cx="5" cy="15" r="2.5" />
      <circle cx="15" cy="15" r="2.5" />
    </svg>
  );
}

function ChipStrip({ chips, moreTo, showMore = true }: { chips: Chip[]; moreTo?: string | undefined; showMore?: boolean | undefined }) {
  const { t } = useI18n();
  const avail = useNavAvailability();
  const all: (Chip & { more?: boolean })[] = showMore
    ? [...chips, { label: "More", Icon: MoreDots, to: moreTo, more: true }]
    : chips;
  return (
    <div className={cn(innerWrap, "relative z-10 -mt-10")}>
      <div className="flex overflow-x-auto rounded-xl border border-border bg-card shadow-[0_18px_40px_-28px_rgba(6,33,58,0.45)] [scrollbar-width:none]">
        {all.map((c, i) => {
          const active = i === 0;
          const cls = cn(
            "relative grid min-w-[104px] flex-1 justify-items-center gap-1.5 border-e border-border px-2 py-3.5 text-center last:border-e-0 transition-colors",
            active ? "bg-chip-active after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-shell-gold" : "hover:bg-bg-alt",
          );
          const inner = (
            <>
              <c.Icon strokeWidth={2.3} className={cn("size-7", active ? "fill-shell-gold/25 text-shell-gold" : "fill-navy/20 text-navy")} />
              <span className="text-[12px] font-semibold leading-tight text-navy">{t(c.label)}</span>
            </>
          );
          if (c.to && !active && (!c.gate || avail[c.gate]))
            return (
              <SmartLink key={c.label} to={c.to} className={cls}>
                {inner}
              </SmartLink>
            );
          return (
            <button
              key={c.label}
              type="button"
              aria-pressed={active}
              onClick={active ? undefined : () => toast(t("Coming soon"))}
              className={cls}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- shell ---------------- */

export function InnerPage({
  pageName,
  hero,
  chips,
  moreTo,
  children,
  sidebar,
  bottom,
  parent,
  notice,
  showMore,
}: {
  parent?: { label: string; to: string };
  notice?: ReactNode;
  showMore?: boolean | undefined;
  pageName: string;
  hero: HeroConfig;
  chips: Chip[];
  moreTo?: string | undefined;
  children: ReactNode;
  sidebar?: ReactNode;
  bottom?: ReactNode;
}) {
  const { t, lang } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <nav aria-label={t("Breadcrumb")} className="border-b border-border bg-bg-alt">
        <div className={cn(innerWrap, "flex items-center gap-1.5 py-2 text-xs text-text-body")}>
          <Link to="/" className="hover:text-shell-gold">
            {t("Home")}
          </Link>
          <ChevronRight className="size-3 rtl:rotate-180" />
          {parent && (
            <>
              <SmartLink to={parent.to} className="hover:text-shell-gold">
                {t(parent.label)}
              </SmartLink>
              <ChevronRight className="size-3 rtl:rotate-180" />
            </>
          )}
          <span className="font-medium text-navy">{t(pageName)}</span>
        </div>
      </nav>
      <InnerHero h={hero} />
      <ChipStrip chips={chips} moreTo={moreTo} showMore={showMore} />
      {notice && <div className={cn(innerWrap, "pt-8")}>{notice}</div>}
      <main className={cn(innerWrap, "py-12 lg:py-14")}>
        <div className={cn("grid gap-10", sidebar && "lg:grid-cols-[minmax(0,1fr)_320px]")}>
          <div className="grid min-w-0 content-start gap-12">{children}</div>
          {sidebar && <aside className="grid content-start gap-5">{sidebar}</aside>}
        </div>
        {bottom && <div className="mt-14">{bottom}</div>}
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------------- shared blocks ---------------- */

export function ImportantNoticeBox({
  text = "Information is provided for guidance only. Please verify procedures and requirements with the official entity before proceeding.",
}: {
  text?: string;
}) {
  const { t, lang } = useI18n();
  return (
    <div className="flex items-start gap-4 rounded-[10px] border border-info/25 bg-bg-notice p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-primary-foreground">
        <Info className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-base font-bold text-navy">{t("Important Notice")}</p>
        <p className="mt-1 text-xs leading-relaxed text-navy/80">{t(text)}</p>
      </div>
    </div>
  );
}

export type ProcessStep = { Icon: Icon; title: string; desc: string };

export function ProcessStepsRow({ steps }: { steps: ProcessStep[] }) {
  const { t, lang } = useI18n();
  return (
    <ol className="grid gap-4 md:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.title} className="relative grid justify-items-center gap-2 rounded-[10px] border border-border bg-card p-5 text-center shadow-sm">
          <span className="grid size-14 place-items-center rounded-full bg-gold-cta text-primary-foreground">
            <s.Icon className="size-6" />
          </span>
          <span className="font-display text-2xl font-bold text-navy">{i + 1}</span>
          <h3 className="text-sm font-bold text-navy">{t(s.title)}</h3>
          <p className="text-xs text-text-body">{t(s.desc)}</p>
          {i < steps.length - 1 && (
            <ChevronRight className="absolute -end-4 top-1/2 z-10 hidden size-6 -translate-y-1/2 text-shell-gold md:block rtl:rotate-180" />
          )}
        </li>
      ))}
    </ol>
  );
}

/** Circular icon tile with a label beneath (ministries, services). */
export function CircleTile({ label, Icon: I, to }: { label: string; Icon: Icon; to: string }) {
  const { t, lang } = useI18n();
  return (
    <SmartLink to={to} className="group grid justify-items-center gap-2 text-center">
      <span className="grid size-16 place-items-center rounded-full border border-shell-gold/50 bg-chip-active text-shell-gold transition-colors group-hover:bg-gold-cta group-hover:text-primary-foreground">
        <I className="size-6" />
      </span>
      <span className="text-xs font-semibold leading-tight text-navy">{t(label)}</span>
    </SmartLink>
  );
}

/** Dark navy app-download promo used in bottom banner rows. */
export function AppPromoCard({ eyebrow = "Explore on the Go", title = "Download EGYPTORA App" }: { eyebrow?: string; title?: string }) {
  const { t, lang } = useI18n();
  return (
    <section className="on-dark rounded-[10px] bg-navy p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-shell-gold">{t(eyebrow)}</p>
      <p className="mt-1 font-display text-xl font-bold text-foreground">{t(title)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["App Store", "Google Play"].map((s) => (
          <span key={s} className="rounded-lg border border-foreground/30 px-3 py-1.5 text-xs font-semibold text-foreground">
            {t(s)}
          </span>
        ))}
      </div>
    </section>
  );
}

/** Light band promo with icon, copy and gold button. */
export function BandPromo({ Icon: I, title, body, cta, to }: { Icon: Icon; title: string; body: string; cta: string; to: string }) {
  const { t, lang } = useI18n();
  return (
    <section className="rounded-[10px] border border-border bg-bg-band p-6">
      <I className="size-7 text-shell-gold" />
      <h3 className="mt-3 font-display text-lg font-bold text-navy">{t(title)}</h3>
      <p className="mt-1 text-sm text-text-body">{t(body)}</p>
      <div className="mt-4">
        <GoldButton to={to}>
          {t(cta)} <ArrowRight className="size-4 rtl:rotate-180" />
        </GoldButton>
      </div>
    </section>
  );
}
