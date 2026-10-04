import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  Briefcase, Bus, ChevronRight, ExternalLink, FileText, Flag, GraduationCap, HeartPulse, Home, Info, Landmark,
  Map as MapIcon, Newspaper, Scale, Search, ShieldAlert, ShoppingBag, Smartphone, Store, Wallet, Zap, LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { innerWrap } from "@/components/layout/InnerPage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/* ---------------- data ---------------- */

export type AppCategory = { id: string; slug: string; name_ar: string; name_en: string; icon: string | null; sort_order: number };
export type EgyptApp = {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  publisher: string | null;
  app_type: "government" | "service" | "private";
  description_ar: string | null;
  description_en: string | null;
  google_play_url: string | null;
  app_store_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  sort_order: number;
  last_verified_at: string;
};

/** Public columns only — internal_notes is never requested. */
const APP_COLUMNS =
  "id, category_id, name_ar, name_en, publisher, app_type, description_ar, description_en, google_play_url, app_store_url, website_url, is_featured, sort_order, last_verified_at";

export async function loadEgyptApps() {
  const [cats, apps] = await Promise.all([
    supabase.from("app_categories").select("id, slug, name_ar, name_en, icon, sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("egypt_apps").select(APP_COLUMNS).eq("is_active", true).order("sort_order"),
  ]);
  if (cats.error || apps.error) throw new Error("Could not load apps");
  return { categories: (cats.data ?? []) as AppCategory[], apps: (apps.data ?? []) as unknown as EgyptApp[] };
}

export const appsSearchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(["government", "service", "private"]).optional(),
});
export type AppsSearch = z.infer<typeof appsSearchSchema>;

const ICONS: Record<string, LucideIcon> = {
  landmark: Landmark, bus: Bus, "heart-pulse": HeartPulse, wallet: Wallet, smartphone: Smartphone,
  "file-text": FileText, scale: Scale, zap: Zap, "graduation-cap": GraduationCap, map: MapIcon,
  "shopping-bag": ShoppingBag, store: Store, home: Home, briefcase: Briefcase, newspaper: Newspaper,
};
const iconFor = (name: string | null) => (name && ICONS[name]) || LayoutGrid;

const showPublisher = (p: string | null) => !!p && !/unconfirmed|\?/i.test(p);

const TYPE_LABEL: Record<EgyptApp["app_type"], string> = { government: "Government", service: "Services", private: "Private" };

/* ---------------- page ---------------- */

export function EgyptAppsDirectory({
  categories,
  apps,
  search,
  category,
}: {
  categories: AppCategory[];
  apps: EgyptApp[];
  search: AppsSearch;
  category?: AppCategory | null;
}) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [reportFor, setReportFor] = useState<EgyptApp | null>(null);
  const [ios, setIos] = useState(false);
  useEffect(() => setIos(/iPhone|iPad|iPod/i.test(navigator.userAgent)), []);
  useEffect(() => setQ(search.q ?? ""), [search.q]);

  const name = (r: { name_ar: string; name_en: string }) => (lang === "ar" ? r.name_ar : r.name_en);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Only categories with at least one active app are public; counts come from the data.
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of apps) m.set(a.category_id, (m.get(a.category_id) ?? 0) + 1);
    return m;
  }, [apps]);
  const visibleCats = categories.filter((c) => (counts.get(c.id) ?? 0) > 0);

  const needle = (search.q ?? "").trim().toLowerCase();
  const filtered = apps.filter((a) => {
    if (category && a.category_id !== category.id) return false;
    if (search.type && a.app_type !== search.type) return false;
    if (!needle) return true;
    const c = catById.get(a.category_id);
    return [a.name_en, a.name_ar, showPublisher(a.publisher) ? a.publisher : "", c?.name_en, c?.name_ar]
      .some((v) => (v ?? "").toLowerCase().includes(needle));
  });
  const featured = filtered.filter((a) => a.is_featured);
  const lastVerified = apps.reduce((m, a) => (a.last_verified_at > m ? a.last_verified_at : m), "");

  const setSearch = (next: AppsSearch) =>
    void navigate({ to: ".", search: (prev: AppsSearch) => ({ ...prev, ...next }), replace: true });

  useEffect(() => {
    const id = setTimeout(() => {
      const v = q.trim() || undefined;
      if (v !== (search.q || undefined)) setSearch({ q: v });
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const CatIcon = category ? iconFor(category.icon) : null;
  const title = category ? name(category) : t("Egypt Apps Directory");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <nav aria-label={t("Breadcrumb")} className="border-b border-border bg-bg-alt">
        <div className={cn(innerWrap, "flex flex-wrap items-center gap-1.5 py-2 text-xs text-text-body")}>
          <Link to="/" className="hover:text-shell-gold">{t("Home")}</Link>
          <ChevronRight className="size-3 rtl:rotate-180" />
          <Link to="/government-directory" className="hover:text-shell-gold">{t("Government Directory")}</Link>
          <ChevronRight className="size-3 rtl:rotate-180" />
          {category ? (
            <>
              <Link to="/egypt-apps" className="hover:text-shell-gold">{t("Egypt Apps")}</Link>
              <ChevronRight className="size-3 rtl:rotate-180" />
              <span className="font-medium text-navy">{name(category)}</span>
            </>
          ) : (
            <span className="font-medium text-navy">{t("Egypt Apps")}</span>
          )}
        </div>
      </nav>

      <section className="bg-navy text-primary-foreground">
        <div className={cn(innerWrap, "py-10 lg:py-12")}>
          <h1 className="flex items-center gap-3 font-display text-2xl font-bold lg:text-4xl">
            {CatIcon && <CatIcon className="size-7 shrink-0" aria-hidden="true" />}
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-primary-foreground/80">
            {category
              ? appCount(filtered.length, lang)
              : t("Key government and everyday service apps in Egypt, with direct links to Google Play, the App Store and official websites.")}
          </p>
          <label className="mt-6 flex max-w-xl items-center gap-2 rounded-full bg-background px-4 py-2.5 text-foreground">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">{t("Search apps by name, publisher or category")}</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search apps by name, publisher or category")}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        </div>
      </section>

      <div className={cn(innerWrap, "pt-6")}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={!search.type} onClick={() => setSearch({ type: undefined })}>{t("All")}</Chip>
          {(Object.keys(TYPE_LABEL) as EgyptApp["app_type"][]).map((k) => (
            <Chip key={k} active={search.type === k} onClick={() => setSearch({ type: k })}>{t(TYPE_LABEL[k])}</Chip>
          ))}
        </div>
      </div>

      <main className={cn(innerWrap, "grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_320px]")}>
        <div className="grid content-start gap-8">
          {!category && (
            <section aria-labelledby="cats">
              <h2 id="cats" className="font-display text-xl font-bold text-navy">{t("Categories")}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visibleCats.map((c) => {
                  const Icon = iconFor(c.icon);
                  return (
                    <Link
                      key={c.id}
                      to="/egypt-apps/$category"
                      params={{ category: c.slug }}
                      className="flex min-h-[88px] flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-gold-line"
                    >
                      <Icon className="size-6 text-navy" aria-hidden="true" />
                      <span className="text-sm font-semibold text-navy">{name(c)}</span>
                      <span className="text-xs text-muted-foreground">{appCount(counts.get(c.id) ?? 0, lang)}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {featured.length > 0 && (
            <section aria-labelledby="featured">
              <h2 id="featured" className="font-display text-xl font-bold text-navy">{t("Featured apps")}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {featured.map((a) => <AppCard key={a.id} app={a} ios={ios} onReport={() => setReportFor(a)} />)}
              </ul>
            </section>
          )}

          <section aria-labelledby="all">
            <h2 id="all" className="font-display text-xl font-bold text-navy">{category ? t("Apps") : t("All apps")}</h2>
            {filtered.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm text-text-body">
                {t("No apps match your search. Try another name or filter.")}
              </p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {filtered.map((a) => <AppCard key={a.id} app={a} ios={ios} onReport={() => setReportFor(a)} />)}
              </ul>
            )}
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <Notice Icon={Info} text={t("Egyptora Hub is an independent private platform, not a government entity. Listing an app is not an endorsement.")} />
          <Notice Icon={ShieldAlert} text={t("Always download apps from the official store link and verify the publisher.")} />
          {lastVerified && (
            <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-navy">
              {t("Last verified")}: <span dir="ltr" className="ms-1">{lastVerified}</span>
            </span>
          )}
        </aside>
      </main>

      <AppReportDialog app={reportFor} label={reportFor ? name(reportFor) : ""} onClose={() => setReportFor(null)} />
      <SiteFooter />
    </div>
  );
}

function AppCard({ app, ios, onReport }: { app: EgyptApp; ios: boolean; onReport: () => void }) {
  const { t, lang } = useI18n();
  const desc = (lang === "ar" ? app.description_ar : app.description_en)?.trim();
  const links = [
    app.google_play_url && { key: "gp", label: "Google Play", href: app.google_play_url },
    app.app_store_url && { key: "ap", label: "App Store", href: app.app_store_url },
    app.website_url && { key: "web", label: t("Website"), href: app.website_url },
  ].filter(Boolean) as { key: string; label: string; href: string }[];
  if (ios) links.sort((a, b) => (a.key === "ap" ? -1 : b.key === "ap" ? 1 : 0));

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-base font-semibold text-navy" dir="auto">{lang === "ar" ? app.name_ar : app.name_en}</p>
          {showPublisher(app.publisher) && <p className="text-xs text-muted-foreground" dir="auto">{app.publisher}</p>}
        </div>
        <span className="shrink-0 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-navy">
          {t(TYPE_LABEL[app.app_type])}
        </span>
      </div>
      {desc && <p className="text-sm text-text-body">{desc}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {links.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-navy px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-primary-foreground"
          >
            {l.label}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ))}
        <button type="button" onClick={onReport} className="ms-auto flex min-h-11 items-center gap-1 px-1 text-xs text-muted-foreground underline-offset-2 hover:text-navy hover:underline">
          <Flag className="size-3.5" /> {t("Report")}
        </button>
      </div>
    </li>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
        active ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy hover:border-gold-line",
      )}
    >
      {children}
    </button>
  );
}

function Notice({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[10px] border border-info/25 bg-bg-notice p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-navy/85">{text}</p>
    </div>
  );
}

const reportSchema = z.object({
  message: z.string().trim().min(5).max(500),
  contact_email: z.union([z.literal(""), z.string().trim().email().max(254)]),
});

function AppReportDialog({ app, label, onClose }: { app: EgyptApp | null; label: string; onClose: () => void }) {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    if (website) return onClose();
    const parsed = reportSchema.safeParse({ message, contact_email: email });
    if (!parsed.success) {
      toast.error(t("Please write 5–500 characters and a valid email (optional)."));
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("app_reports").insert({
      app_id: app.id,
      message: parsed.data.message,
      contact_email: parsed.data.contact_email || null,
    });
    setBusy(false);
    if (error) {
      toast.error(t("Could not send your report. Please try again later."));
      return;
    }
    toast.success(t("Thank you — your report was sent."));
    setMessage("");
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Report a broken link or wrong info")}</DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="grid gap-3">
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder={t("What is wrong with this app listing?")}
            className="rounded-xl border border-border bg-background p-3 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("Your email (optional)")}
            className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm"
          />
          <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" name="website" />
          <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-gold px-4 text-sm font-semibold text-navy disabled:opacity-60">
            {busy ? t("Sending…") : t("Send report")}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AppsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "grid gap-4 py-10")}>
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-[88px] animate-pulse rounded-2xl bg-muted" />)}
        </div>
        {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    </div>
  );
}

export function AppsError() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "py-16 text-center")}>
        <p className="text-sm text-text-body">{t("The apps directory could not be loaded right now.")}</p>
      </div>
      <SiteFooter />
    </div>
  );
}

export function AppsCategoryNotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "grid justify-items-center gap-4 py-16 text-center")}>
        <p className="text-sm text-text-body">{t("This app category does not exist or has no apps yet.")}</p>
        <Link to="/egypt-apps" className="min-h-11 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-primary-foreground">
          {t("Back to Egypt Apps")}
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}

/** Proper plural for app counts: Arabic rules for ar, English rule for every other language. */
export function appCount(n: number, lang: string): string {
  if (lang === "ar") {
    const r = new Intl.PluralRules("ar").select(n);
    const num = n.toLocaleString("ar-EG");
    if (r === "zero") return `${num} تطبيق`;
    if (r === "one") return "تطبيق واحد";
    if (r === "two") return "تطبيقان";
    if (r === "few") return `${num} تطبيقات`;
    return `${num} تطبيقًا`;
  }
  return `${n} ${n === 1 ? "app" : "apps"}`;
}
