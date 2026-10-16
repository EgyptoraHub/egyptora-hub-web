import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useSiteSearch } from "@/lib/site-search";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/egyptora-hub-logo.png.asset.json";
import { SITE } from "@/config/site";
import { mainNav, type NavEntry, type NavLeaf } from "@/data/navigation";
import { AuthButtons } from "@/components/site/AuthButtons";
import { CurrencySwitcher } from "@/components/site/CurrencySwitcher";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { NotificationsBell } from "@/components/site/NotificationsBell";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { useNavAvailability } from "@/lib/nav-availability";

/** Hands a question to the live AI assistant, same behaviour as the hero search. */
export function askConcierge(question: string) {
  const q = question.trim();
  if (!q) return;
  window.dispatchEvent(new CustomEvent("egyptora:ask-concierge", { detail: q }));
}

function LeafLink({ item, onNavigate }: { item: NavLeaf; onNavigate?: () => void }) {
  const { t } = useI18n();
  const avail = useNavAvailability();
  const open = !!item.gate && !!avail[item.gate];
  if ((item.soon && !open) || !item.to) {
    return (
      <button
        type="button"
        onClick={() => toast(t("Coming soon"))}
        data-menu-item
        aria-disabled="true"
        role="menuitem"
        className="flex min-h-11 w-full cursor-default items-center gap-2 rounded-lg px-3 text-start text-[13px] text-muted-foreground"
      >
        <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
        <span className="shrink-0 rounded-full border border-border bg-muted/40 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("Coming soon")}
        </span>
      </button>
    );
  }
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
      to={item.to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static search params
      search={item.search as any}
      onClick={onNavigate}
      data-menu-item
      role="menuitem"
      className={cn(
        "flex min-h-11 items-center truncate rounded-lg px-3 text-[13px] text-foreground/85 transition-colors hover:bg-gold-soft hover:text-navy",
        item.indent && "ms-4 border-s-2 border-gold-line ps-3",
      )}
    >
      {t(item.label)}
    </Link>
  );
}

/** Exactly one top-level entry is active: its own path (or a child path), else the first entry listing the page. */
export function activeEntryLabel(pathname: string): string | null {
  const own = mainNav.find(
    (e) => e.to && (e.to === "/" ? pathname === "/" : pathname === e.to || pathname.startsWith(e.to + "/")),
  );
  if (own) return own.label;
  const listed = mainNav.find((e) =>
    e.items?.some((i) => i.to && i.to !== "/" && !i.to.includes("#") && pathname === i.to),
  );
  return listed?.label ?? null;
}

const activeCls =
  "font-bold text-navy after:absolute after:inset-x-0.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-shell-gold";

function DesktopEntry({ entry, active }: { entry: NavEntry; active: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };
  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const menuItems = () =>
    Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-menu-item]") ?? []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const items = menuItems();
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        requestAnimationFrame(() => menuItems()[0]?.focus());
      } else items[Math.min(idx + 1, items.length - 1)]?.focus();
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      if (idx <= 0) triggerRef.current?.focus();
      else items[idx - 1]?.focus();
    } else if (e.key === " " && document.activeElement === triggerRef.current) {
      e.preventDefault();
      setOpen((v) => !v);
    }
  };

  if (!entry.items) {
    return (
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
        to={entry.to as any}
        className={cn(
          "relative flex min-h-11 items-center whitespace-nowrap rounded-lg px-0.5 text-2xs font-medium text-navy/85 transition-colors hover:text-gold-text",
          active && activeCls,
        )}
      >
        {t(entry.label)}
      </Link>
    );
  }

  const triggerCls = cn(
    "relative flex min-h-11 items-center gap-1 whitespace-nowrap rounded-lg px-0.5 text-2xs font-medium transition-colors",
    open ? "text-gold-text" : "text-navy/85 hover:text-gold-text",
    active && activeCls,
  );
  const chevron = <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />;

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onKeyDown={onKeyDown}
    >
      {entry.to && entry.label !== "About" ? (
        <Link
          ref={(el: HTMLAnchorElement | null) => {
            triggerRef.current = el;
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
          to={entry.to as any}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(false)}
          className={triggerCls}
        >
          {t(entry.label)}
          {chevron}
        </Link>
      ) : (
        <button
          ref={(el) => {
            triggerRef.current = el;
          }}
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((v) => !v)}
          className={triggerCls}
        >
          {t(entry.label)}
          {chevron}
        </button>
      )}
      {open && (
        <div className={cn("absolute top-full z-50 w-[280px] pt-1", entry.label === "About" ? "end-0" : "start-0")}>
          <div role="menu" className="grid max-h-[70vh] gap-0.5 overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-xl">
            {entry.items.map((item) => (
              <LeafLink key={item.label} item={item} onNavigate={() => setOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock, focus trap and Esc-to-close (focus returns to the opener via onClose).
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const f = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const flat = (entry: NavEntry) => !entry.items || entry.label === "Government Directory";

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label={t("Open menu")}>
      <button
        type="button"
        aria-label={t("Close menu")}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-navy/40"
      />
      <div
        ref={panelRef}
        className="absolute inset-y-0 start-0 flex w-[min(360px,88vw)] flex-col bg-background shadow-2xl animate-in ltr:slide-in-from-left rtl:slide-in-from-right"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-display text-sm tracking-[0.2em] text-foreground">
            EGYPTORA <span className="text-gold-text">HUB</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close menu")}
            className="hit-44 grid size-9 place-items-center rounded-full border border-border text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {mainNav.map((entry) =>
            !flat(entry) ? (
              <div key={entry.label} className="border-b border-border/60">
                <button
                  type="button"
                  aria-expanded={openLabel === entry.label}
                  onClick={() => setOpenLabel((v) => (v === entry.label ? null : entry.label))}
                  className="flex min-h-12 w-full items-center justify-between gap-2 px-3 text-start text-sm font-medium text-foreground"
                >
                  {t(entry.label)}
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform",
                      openLabel === entry.label && "rotate-180",
                    )}
                  />
                </button>
                {openLabel === entry.label && (
                  <div className="grid gap-0.5 pb-3 ps-2">
                    {entry.items!.map((item) => (
                      <LeafLink key={item.label} item={item} onNavigate={onClose} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={entry.label}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
                to={entry.to as any}
                onClick={onClose}
                className="flex min-h-12 items-center border-b border-border/60 px-3 text-sm font-medium text-foreground"
              >
                {t(entry.label)}
              </Link>
            ),
          )}
        </nav>
        <div className="grid gap-3 border-t border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <CurrencySwitcher />
            <NotificationsBell />
          </div>
          <AuthButtons variant="nav" className="w-full justify-center" />
        </div>
      </div>
    </div>
  );
}

/** Top navigation shared by every interior page. */
export function MainNav() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const activeLabel = activeEntryLabel(pathname);
  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => menuBtnRef.current?.focus());
  }, []);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const siteSearch = useSiteSearch();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    siteSearch(query);
    setQuery("");
    setSearchOpen(false);
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1280px] items-center gap-3 px-4 py-2 lg:px-8 xl:gap-4 xl:px-5 2xl:max-w-[1480px] 2xl:gap-6 2xl:px-8">
        <Link to="/" className="flex min-h-11 min-w-0 items-center gap-2.5 xl:me-2">
          <img
            src={logo.url}
            alt={`${SITE.name} logo`}
            width={40}
            height={40}
            className="size-9 shrink-0 rounded-full ring-1 ring-gold-line sm:size-10"
          />
          <span className="block min-w-0 overflow-hidden leading-tight">
            <span className="block whitespace-nowrap font-display text-[13px] font-semibold tracking-[0.12em] text-navy xl:tracking-[0.06em] 2xl:tracking-[0.12em]">
              EGYPTORA <span className="text-gold-text xl:hidden 2xl:inline">HUB</span>
            </span>
            <span className="block truncate text-2xs tracking-[0.06em] text-muted-foreground xl:hidden">
              {t(SITE.tagline)}
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-3 xl:flex min-[1440px]:gap-4 2xl:gap-6">
          {mainNav.map((entry) => (
            <DesktopEntry key={entry.label} entry={entry} active={entry.label === activeLabel} />
          ))}
        </nav>


        <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:ms-0">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={t("Search")}
            aria-expanded={searchOpen}
            className="hit-44 grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold-line hover:text-gold-text"
          >
            <Search className="size-4" />
          </button>
          <LanguageSwitcher compact />
          <span className="hidden sm:block">
            <CurrencySwitcher compact />
          </span>
          <NotificationsBell className="hidden sm:block" />
          <AuthButtons variant="nav" className="hidden sm:flex" />
          <button
            type="button"
            ref={menuBtnRef}
            onClick={() => setMobileOpen(true)}
            aria-label={t("Open menu")}
            aria-expanded={mobileOpen}
            className="hit-44 grid size-9 place-items-center rounded-full border border-border text-muted-foreground xl:hidden"
          >
            <Menu className="size-4" />
          </button>

        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border bg-card/60">
          <form
            onSubmit={submit}
            className="mx-auto flex w-full max-w-[1280px] items-center gap-2 px-4 py-3 lg:px-8"
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("What are you looking for in Egypt?")}
              className="min-h-11 min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-gold-line"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-gold-cta px-5 py-2.5 text-sm font-semibold text-gold-foreground"
            >
              {t("Search")}
            </button>
          </form>
        </div>
      )}

    </header>
    {mobileOpen && <MobileMenu onClose={closeMobile} />}
    </>
  );
}
