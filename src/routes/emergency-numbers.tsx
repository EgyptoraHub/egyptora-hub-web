import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ChevronRight, Copy, Download, Flag, Info, MessageCircle, Phone, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { innerWrap } from "@/components/layout/InnerPage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

type Category = { id: string; slug: string; name_ar: string; name_en: string; color: string | null; sort_order: number };
type NumberRow = {
  id: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  number: string;
  dial_string: string;
  availability: string | null;
  notes: string | null;
  is_primary: boolean;
  sort_order: number;
  last_verified_at: string;
};

const searchSchema = z.object({ cat: z.string().optional() });

const title = "Emergency Numbers & Quick Government Services in Egypt | Egyptora Hub";
const description =
  "Essential Egyptian emergency and hotline numbers — police, ambulance, fire, tourist police, utilities and government services. Tap to call, copy, or download a printable PDF.";

export const Route = createFileRoute("/emergency-numbers")({
  validateSearch: (s) => searchSchema.parse(s),
  loader: async () => {
    const [cats, nums] = await Promise.all([
      supabase.from("emergency_categories").select("id, slug, name_ar, name_en, color, sort_order").eq("is_active", true).order("sort_order"),
      supabase
        .from("emergency_numbers")
        .select("id, category_id, name_ar, name_en, number, dial_string, availability, notes, is_primary, sort_order, last_verified_at")
        .eq("is_active", true)
        .eq("status", "verified")
        .order("sort_order"),
    ]);
    if (cats.error || nums.error) throw new Error("Could not load emergency numbers");
    return { categories: (cats.data ?? []) as Category[], numbers: (nums.data ?? []) as NumberRow[] };
  },
  head: () => simpleHead("/emergency-numbers", title, description, SITE.url),
  pendingComponent: LoadingSkeleton,
  errorComponent: () => <ErrorState />,
  component: EmergencyPage,
});

/* ---------- helpers ---------- */

function luminance(hex: string) {
  const m = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
}
/** White text when it reaches 4.5:1 on the category colour, otherwise near-black text. */
function headerTextIsWhite(hex: string | null) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return true;
  return 1.05 / (luminance(hex) + 0.05) >= 4.5;
}

const isWhatsAppOnly = (n: NumberRow) => n.dial_string.startsWith("+") && /whatsapp/i.test(n.name_en);
const callHref = (n: NumberRow) => (isWhatsAppOnly(n) ? `https://wa.me/${n.dial_string.replace(/\D/g, "")}` : `tel:${n.dial_string}`);

function formatDate(iso: string, lang: string) {
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  } catch {
    return iso;
  }
}

/* ---------- page ---------- */

function EmergencyPage() {
  const { categories, numbers } = Route.useLoaderData();
  const { cat } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [reportFor, setReportFor] = useState<NumberRow | null>(null);
  const name = (r: { name_ar: string; name_en: string }) => (lang === "ar" ? r.name_ar : r.name_en);

  const lastVerified = useMemo(() => numbers.reduce((m, n) => (n.last_verified_at > m ? n.last_verified_at : m), ""), [numbers]);
  const primary = numbers.filter((n) => n.is_primary);
  const needle = q.trim().toLowerCase();
  const filtered = numbers.filter(
    (n) =>
      !needle ||
      n.name_en.toLowerCase().includes(needle) ||
      n.name_ar.includes(q.trim()) ||
      n.number.replace(/\s/g, "").includes(needle.replace(/\s/g, "")),
  );
  const visibleCats = categories.filter((c) => !cat || c.slug === cat);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <nav aria-label={t("Breadcrumb")} className="border-b border-border bg-bg-alt">
        <div className={cn(innerWrap, "flex items-center gap-1.5 py-2 text-xs text-text-body")}>
          <Link to="/" className="hover:text-shell-gold">{t("Home")}</Link>
          <ChevronRight className="size-3 rtl:rotate-180" />
          <Link to="/government-directory" className="hover:text-shell-gold">{t("Government Directory")}</Link>
          <ChevronRight className="size-3 rtl:rotate-180" />
          <span className="font-medium text-navy">{t("Emergency & Quick Numbers")}</span>
        </div>
      </nav>

      {/* Hero + search */}
      <section className="bg-navy text-primary-foreground">
        <div className={cn(innerWrap, "py-10 lg:py-12")}>
          <h1 className="font-display text-2xl font-bold lg:text-4xl">{t("Emergency Numbers & Quick Government Services")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-primary-foreground/80">
            {t("Essential Egyptian emergency and hotline numbers. Tap to call, copy a number, or download a printable list.")}
          </p>
          <label className="mt-6 flex max-w-xl items-center gap-2 rounded-full bg-background px-4 py-2.5 text-foreground">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">{t("Search by name or number")}</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search by name or number")}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        </div>
      </section>

      {/* Primary emergency strip */}
      <section className={cn(innerWrap, "pt-6")}>
        <div className="grid grid-cols-3 gap-3">
          {primary.map((n) => (
            <a
              key={n.id}
              href={callHref(n)}
              className="flex min-h-[72px] flex-col items-center justify-center gap-0.5 rounded-2xl bg-hot px-2 py-3 text-center text-white shadow-lg shadow-hot/20 transition-transform active:scale-[0.98]"
            >
              <span dir="ltr" className="font-display text-3xl font-bold leading-none lg:text-4xl">{n.number}</span>
              <span className="text-xs font-semibold lg:text-sm">{name(n)}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Chips */}
      <div className={cn(innerWrap, "pt-6")}>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={!cat} onClick={() => void navigate({ search: {}, replace: true })}>{t("All")}</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={cat === c.slug} onClick={() => void navigate({ search: { cat: c.slug }, replace: true })}>
              {name(c)}
            </Chip>
          ))}
        </div>
      </div>

      <main className={cn(innerWrap, "grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_320px]")}>
        <div className="grid content-start gap-5">
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-border bg-card p-6 text-sm text-text-body">
              {t("No numbers match your search. Try another name or number.")}
            </p>
          )}
          {visibleCats.map((c) => {
            const rows = filtered.filter((n) => n.category_id === c.id);
            if (!rows.length) return null;
            const white = headerTextIsWhite(c.color);
            return (
              <section key={c.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <h2
                  className={cn("px-5 py-3 font-display text-base font-bold", white ? "text-white" : "text-navy")}
                  style={{ backgroundColor: c.color ?? undefined }}
                >
                  {name(c)}
                </h2>
                <ul className="divide-y divide-border">
                  {rows.map((n) => (
                    <NumberItem key={n.id} n={n} label={name(n)} onReport={() => setReportFor(n)} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <aside className="grid content-start gap-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-display text-base font-bold text-navy">{t("Printable lists")}</h2>
            <div className="mt-3 grid gap-2">
              <a href="/downloads/egyptora-emergency-numbers-ar.pdf" download className="flex min-h-11 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold text-navy">
                <Download className="size-4" /> {t("Download PDF (Arabic)")}
              </a>
              <a href="/downloads/egyptora-emergency-numbers-en.pdf" download className="flex min-h-11 items-center gap-2 rounded-full border border-gold-line px-4 text-sm font-semibold text-navy">
                <Download className="size-4" /> {t("Download PDF (English)")}
              </a>
            </div>
            {lastVerified && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("Last updated")}: <span dir="ltr">{formatDate(lastVerified, lang)}</span>
              </p>
            )}
          </div>

          <Notice Icon={Info} text={t("Egyptora Hub is an independent private platform, not a government entity. Numbers are compiled from public sources and may change; always confirm in critical situations.")} />
          <Notice Icon={ShieldAlert} text={t("Short codes (15xxx / 16xxx / 19xxx) may not work from foreign SIM cards or roaming. Use 122 / 123 / 180, or call the long-form number if listed.")} />
          {lastVerified && (
            <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-navy">
              {t("Last verified")}: <span dir="ltr" className="ms-1">{formatDate(lastVerified, lang)}</span>
            </span>
          )}
        </aside>
      </main>

      <ReportDialog row={reportFor} label={reportFor ? name(reportFor) : ""} onClose={() => setReportFor(null)} />
      <SiteFooter />
    </div>
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

function Notice({ Icon, text }: { Icon: typeof Info; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[10px] border border-info/25 bg-bg-notice p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-navy/85">{text}</p>
    </div>
  );
}

function NumberItem({ n, label, onReport }: { n: NumberRow; label: string; onReport: () => void }) {
  const { t } = useI18n();
  const [showNote, setShowNote] = useState(false);
  const wa = isWhatsAppOnly(n);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(n.number);
      toast.success(t("Copied"));
    } catch {
      toast.error(t("Could not copy"));
    }
  };
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3">
      <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
        <p className="flex items-center gap-1 text-sm font-semibold text-navy">
          {label}
          {n.notes && (
            <button type="button" onClick={() => setShowNote((v) => !v)} aria-label={t("More info")} aria-expanded={showNote} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:text-navy">
              <Info className="size-3.5" />
            </button>
          )}
        </p>
        {n.availability && <p className="text-xs text-muted-foreground">{n.availability}</p>}
        {showNote && n.notes && <p className="mt-1 rounded-lg bg-muted/60 px-2 py-1 text-xs text-text-body">{n.notes}</p>}
      </div>
      <a
        href={callHref(n)}
        target={wa ? "_blank" : undefined}
        rel={wa ? "noopener noreferrer" : undefined}
        dir="ltr"
        className="flex min-h-11 items-center gap-1.5 rounded-full bg-navy px-4 font-display text-base font-bold text-primary-foreground"
      >
        {wa ? <MessageCircle className="size-4" /> : <Phone className="size-4" />}
        {n.number}
      </a>
      <button type="button" onClick={() => void copy()} aria-label={t("Copy number")} className="grid size-11 place-items-center rounded-full border border-border text-navy hover:border-gold-line">
        <Copy className="size-4" />
      </button>
      <button type="button" onClick={onReport} className="flex min-h-11 items-center gap-1 px-1 text-xs text-muted-foreground underline-offset-2 hover:text-navy hover:underline">
        <Flag className="size-3.5" /> {t("Report")}
      </button>
    </li>
  );
}

const reportSchema = z.object({
  message: z.string().trim().min(5).max(500),
  contact_email: z.union([z.literal(""), z.string().trim().email().max(254)]),
});

function ReportDialog({ row, label, onClose }: { row: NumberRow | null; label: string; onClose: () => void }) {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row) return;
    if (website) return onClose();
    const parsed = reportSchema.safeParse({ message, contact_email: email });
    if (!parsed.success) {
      toast.error(t("Please write 5–500 characters and a valid email (optional)."));
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("emergency_reports").insert({
      number_id: row.id,
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
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Report a wrong number")}</DialogTitle>
          <DialogDescription>
            {label} — <span dir="ltr">{row?.number}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="grid gap-3">
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder={t("What is wrong with this number?")}
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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "grid gap-4 py-10")}>
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-muted" />)}
        </div>
        {[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    </div>
  );
}

function ErrorState() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "py-16 text-center")}>
        <p className="text-sm text-text-body">{t("Emergency numbers could not be loaded right now.")}</p>
      </div>
      <SiteFooter />
    </div>
  );
}
