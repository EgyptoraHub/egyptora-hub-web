import { useEffect, useRef, useState } from "react";
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

/** Hands a question to the live AI assistant, same behaviour as the hero search. */
export function askConcierge(question: string) {
  const q = question.trim();
  if (!q) return;
  window.dispatchEvent(new CustomEvent("egyptora:ask-concierge", { detail: q }));
}

function LeafLink({ item, onNavigate }: { item: NavLeaf; onNavigate?: () => void }) {
  const { t } = useI18n();
  if (item.soon || !item.to) {
    return (
      <button
        type="button"
        onClick={() => toast(t("Coming soon"))}
        className="flex w-full cursor-default items-center gap-2 rounded-lg px-3 py-2 text-start text-[13px] text-muted-foreground/70"
      >
        <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
        <span className="shrink-0 rounded-full border border-border bg-muted/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
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
      className={cn(item.indent && "ms-4 border-s border-border ps-3")}
      // eslint-disable-next-line react/jsx-no-duplicate-props
      data-indent={item.indent ? "true" : undefined}
    >
      <span className="block truncate rounded-lg px-3 py-2 text-[13px] text-foreground/85 transition-colors hover:bg-gold-soft hover:text-gold"
    >
      {t(item.label)}
    </Link>
  );
}

function DesktopEntry({ entry }: { entry: NavEntry }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const active =
    (!!entry.items && pathname === entry.to) ||
    (!!entry.items &&
    !mainNav.some((e) => !e.items && e.to === pathname) &&
    entry.items.some((i) => i.to && i.to !== "/" && !i.to.includes("#") && pathname === i.to));

  if (!entry.items) {
    return (
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
        to={entry.to as any}
        activeProps={{ className: "font-bold text-navy after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-shell-gold" }}
        activeOptions={{ exact: entry.to === "/" }}
        className="relative whitespace-nowrap rounded-lg px-0.5 py-2 text-[11px] font-medium text-navy/85 transition-colors hover:text-shell-gold"
      >
        {t(entry.label)}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {entry.to && entry.label !== "About" ? (
        <Link
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static, typed route paths
          to={entry.to as any}
          aria-haspopup="true"
          onClick={() => setOpen(false)}
          className={cn(
          "relative flex items-center gap-1 whitespace-nowrap rounded-lg px-0.5 py-2 text-[11px] font-medium transition-colors",
          open ? "text-shell-gold" : "text-navy/85 hover:text-shell-gold",
          active &&
            "font-bold text-navy after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-shell-gold",
        )}
        >
          {t(entry.label)}
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
        </Link>
      ) : (
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex items-center gap-1 whitespace-nowrap rounded-lg px-0.5 py-2 text-[11px] font-medium transition-colors",
          open ? "text-shell-gold" : "text-navy/85 hover:text-shell-gold",
          active &&
            "font-bold text-navy after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-shell-gold",
        )}
      >
        {t(entry.label)}
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>
      )}
      {open && (
        <div className={cn("absolute top-full z-50 w-[280px] pt-1", entry.label === "About" ? "end-0" : "start-0")}>
          <div className="grid gap-0.5 rounded-2xl border border-border bg-popover p-2 shadow-xl">
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background xl:hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-display text-sm tracking-[0.2em] text-foreground">
          EGYPTORA <span className="text-gold">HUB</span>
        </span>
        <div className="flex items-center gap-2">
          <NotificationsBell className="sm:hidden" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close menu")}
            className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {mainNav.map((entry) =>
          entry.items ? (
            <div key={entry.label} className="border-b border-border/60">
              <button
                type="button"
                aria-expanded={openLabel === entry.label}
                onClick={() => setOpenLabel((v) => (v === entry.label ? null : entry.label))}
                className="flex w-full items-center justify-between gap-2 px-3 py-3.5 text-start text-sm font-medium text-foreground"
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
                  {entry.items.map((item) => (
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
              className="block border-b border-border/60 px-3 py-3.5 text-sm font-medium text-foreground"
            >
              {t(entry.label)}
            </Link>
          ),
        )}
      </nav>
      <div className="border-t border-border px-4 py-4 sm:hidden">
        <AuthButtons variant="nav" className="w-full justify-center" />
      </div>
    </div>
  );
}

/** Top navigation shared by every interior page. */
export function MainNav() {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
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
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 lg:px-8 xl:px-5 min-[1440px]:gap-3 min-[1440px]:px-8">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2.5">
          <img
            src={logo.url}
            alt={`${SITE.name} logo`}
            width={40}
            height={40}
            className="size-9 shrink-0 rounded-full ring-1 ring-gold-line sm:size-10"
          />
          <span className="block min-w-0 leading-tight">
            <span className="block whitespace-nowrap font-display text-[13px] font-semibold tracking-[0.12em] text-navy">
              EGYPTORA <span className="text-shell-gold">HUB</span>
            </span>
            <span className="block whitespace-nowrap text-[9.5px] tracking-[0.06em] text-muted-foreground xl:hidden">
              {t(SITE.tagline)}
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 items-center justify-center gap-2.5 xl:flex">
          {mainNav.map((entry) => (
            <DesktopEntry key={entry.label} entry={entry} />
          ))}
        </nav>


        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={t("Search")}
            aria-expanded={searchOpen}
            className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold-line hover:text-gold"
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
            onClick={() => setMobileOpen(true)}
            aria-label={t("Open menu")}
            className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground xl:hidden"
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
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-gold-line"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-gold-cta px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {t("Search")}
            </button>
          </form>
        </div>
      )}

    </header>
    {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </>
  );
}
