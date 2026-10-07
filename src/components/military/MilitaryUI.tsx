import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { z } from "zod";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { ChevronRight, Info, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { innerWrap } from "@/components/layout/InnerPage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  BASE, OUTCOMES, PUBLIC_TYPES, TYPE_LABEL, centuryLabel, centuryOf, outcomeLabel, recordCount, regNo,
  type MilEra, type MilRecord, type RecordsSearch,
} from "@/lib/military";

export type Crumb = { label: string; to?: string | undefined; params?: Record<string, string>; search?: Record<string, string> };

export function useBi() {
  const { lang } = useI18n();
  return <T extends Record<string, unknown>>(row: T, base: string): string => {
    const ar = row[`${base}_ar`] as string | null | undefined;
    const en = row[`${base}_en`] as string | null | undefined;
    return (lang === "ar" ? ar || en : en || ar) ?? "";
  };
}

export function MilShell({
  crumbs, title, subtitle, search, children,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  subtitle?: string;
  search?: { value: string; onChange: (v: string) => void; placeholder: string };
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <nav aria-label={t("Breadcrumb")} className="border-b border-border bg-bg-alt">
        <div className={cn(innerWrap, "flex flex-wrap items-center gap-1.5 py-2 text-xs text-text-body")}>
          <Link to="/" className="hover:text-navy hover:underline">{t("Home")}</Link>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="size-3 rtl:rotate-180" aria-hidden="true" />
              {c.to ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static typed paths
                <Link to={c.to as any} params={c.params as any} search={c.search as any} className="hover:text-navy hover:underline" dir="auto">{c.label}</Link>
              ) : (
                <span className="font-medium text-navy" dir="auto">{c.label}</span>
              )}
            </span>
          ))}
        </div>
      </nav>
      <section className="bg-navy text-primary-foreground">
        <div className={cn(innerWrap, "py-10 lg:py-12")}>
          <h1 className="font-display text-2xl font-bold lg:text-4xl" dir="auto">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-sm text-primary-foreground/85" dir="auto">{subtitle}</p>}
          {search && (
            <label className="mt-6 flex max-w-xl items-center gap-2 rounded-full bg-background px-4 py-2.5 text-foreground">
              <Search className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">{search.placeholder}</span>
              <input
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                dir="auto"
              />
            </label>
          )}
        </div>
      </section>
      {children}
      <SiteFooter />
    </div>
  );
}

export function RegisterNotice() {
  const { t } = useI18n();
  return (
    <div className="flex items-start gap-3 rounded-[10px] border border-info/25 bg-bg-notice p-4" role="note">
      <Info className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden="true" />
      <div className="grid gap-2 text-xs leading-relaxed text-navy">
        <p lang="en" dir="ltr">
          Editorial register under academic review. Outcomes are described conservatively; where scholarship differs, disagreement is shown, not a single verdict. EGYPTORA is an independent private platform, not a governmental body.
        </p>
        <p lang="ar" dir="rtl">
          سجل تحريري قيد المراجعة الأكاديمية. تُعرض النتائج بتحفظ؛ وحيث يختلف المؤرخون يُعرض الخلاف لا حكم واحد. إيجبتورا منصة خاصة مستقلة وليست جهة حكومية.
        </p>
        <span className="sr-only">{t("Editorial notice")}</span>
      </div>
    </div>
  );
}

export function ReviewBadge({ status, verifiedAt }: { status: MilRecord["review_status"]; verifiedAt?: string | null }) {
  const { t } = useI18n();
  if (status === "verified")
    return (
      <span className="inline-flex items-center rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-navy">
        {t("Verified")}
        {verifiedAt && <span dir="ltr" className="ms-1 font-normal">· {verifiedAt}</span>}
      </span>
    );
  if (status === "editorial_reviewed")
    return (
      <span className="inline-flex items-center rounded-full border border-gold-line bg-gold-soft px-2.5 py-0.5 text-[11px] font-semibold text-navy">
        {t("Under academic review")}
      </span>
    );
  return null;
}

/** Title in the current language. English with no English title shows the Arabic title, marked, never transliterated. */
export function RecordTitle({ r, className, labelClassName = "text-muted-foreground" }: { r: Pick<MilRecord, "title_en" | "title_ar">; className?: string; labelClassName?: string }) {
  const { t, lang } = useI18n();
  const en = r.title_en?.trim();
  if (lang === "ar" || en) return <span className={className} dir="auto">{lang === "ar" ? r.title_ar || en : en}</span>;
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span lang="ar" dir="rtl" className={className}>{r.title_ar}</span>
      <span className={cn("font-sans text-xs font-normal", labelClassName)}>{t("Arabic title · English pending")}</span>
    </span>
  );
}

export function TypeBadge({ type }: { type: MilRecord["record_type"] }) {
  const { t } = useI18n();
  if (type === "needs_classification") return null;
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-semibold text-navy">
      {t(TYPE_LABEL[type])}
    </span>
  );
}

export function RecordCard({ r, era }: { r: MilRecord; era?: MilEra | undefined }) {
  const { t } = useI18n();
  const bi = useBi();
  const out = outcomeLabel(r.outcome);
  return (
    <li className="flex">
      <Link
        to="/egypt-through-time/military-history/records/$slug"
        params={{ slug: r.slug }}
        className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-gold-line"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {r.register_no != null && (
            <span className="rounded-md bg-navy px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary-foreground" dir="ltr">
              #{regNo(r.register_no)}
            </span>
          )}
          <TypeBadge type={r.record_type} />
          <ReviewBadge status={r.review_status} />
        </div>
        <p className="text-base font-semibold text-navy"><RecordTitle r={r} /></p>
        <p className="text-xs text-text-body" dir="auto">
          {bi(r, "date_label")}
          {era ? ` · ${bi(era, "name")}` : ""}
        </p>
        {out && <p className="text-xs font-medium text-navy">{t(out)}</p>}
      </Link>
    </li>
  );
}

export function EraStrip({
  eras, counts, active, onPick,
}: {
  eras: MilEra[];
  counts: Map<string, number>;
  active?: string;
  onPick?: (slug: string | undefined) => void;
}) {
  const { t, lang } = useI18n();
  const bi = useBi();
  return (
    <div className="flex gap-2 overflow-x-auto pb-2" role="list">
      {eras.map((e) => {
        const isActive = active === e.slug;
        const cls = cn(
          "flex min-h-11 w-56 shrink-0 flex-col gap-0.5 rounded-xl border px-3 py-2 text-start transition-colors",
          isActive ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy hover:border-gold-line",
        );
        const inner = (
          <>
            <span className="text-[11px] font-semibold opacity-80">{t("Era")} {e.number.toLocaleString(lang === "ar" ? "ar-EG" : "en")}</span>
            <span className="line-clamp-2 text-sm font-semibold" dir="auto">{bi(e, "name")}</span>
            <span className="text-[11px] opacity-85" dir="auto">{bi(e, "start_label")}</span>
            <span className="text-[11px] opacity-85">{recordCount(counts.get(e.id) ?? 0, lang)}</span>
          </>
        );
        return (
          <div role="listitem" key={e.id}>
            {onPick ? (
              <button type="button" aria-pressed={isActive} onClick={() => onPick(isActive ? undefined : e.slug)} className={cls}>
                {inner}
              </button>
            ) : (
              <Link to="/egypt-through-time/military-history/records" search={{ era: e.slug }} className={cls}>
                {inner}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
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

/* ---------------- filters (desktop panel / mobile bottom sheet) ---------------- */

export function useRecordsNav() {
  const navigate = useNavigate();
  return (next: Partial<RecordsSearch>) =>
    void navigate({
      to: ".",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- shared "." reducer across routes
      search: ((prev: RecordsSearch) => ({ ...prev, page: undefined, ...next })) as any,
      replace: true,
    });
}

export function RecordFilters({
  eras, records, search, set, showCentury = true,
}: {
  eras: MilEra[];
  records: MilRecord[];
  search: RecordsSearch;
  set: (n: Partial<RecordsSearch>) => void;
  showCentury?: boolean;
}) {
  const { t, lang } = useI18n();
  const bi = useBi();
  const [open, setOpen] = useState(false);
  const presentOutcomes = OUTCOMES.filter((o) => outcomeLabel(o) && records.some((r) => r.outcome === o));
  const presentTypes = PUBLIC_TYPES.filter((ty) => records.some((r) => r.record_type === ty));
  const presentReview = (["editorial_reviewed", "verified"] as const).filter((s) => records.some((r) => r.review_status === s));
  const cents = records.filter((r) => r.year_from != null).flatMap((r) => [centuryOf(r.year_from!), centuryOf(r.year_to ?? r.year_from!)]);
  const cMin = cents.length ? Math.min(...cents) : -31;
  const cMax = cents.length ? Math.max(...cents) : 21;
  const [range, setRange] = useState<[number, number]>([search.cfrom ?? cMin, search.cto ?? cMax]);
  useEffect(() => setRange([search.cfrom ?? cMin, search.cto ?? cMax]), [search.cfrom, search.cto, cMin, cMax]);

  const select = (label: string, value: string | undefined, opts: { v: string; l: string }[], key: keyof RecordsSearch) => (
    <label className="grid gap-1 text-xs font-semibold text-navy">
      {label}
      <select
        value={value ?? ""}
        onChange={(e) => set({ [key]: e.target.value || undefined } as Partial<RecordsSearch>)}
        className="min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground"
      >
        <option value="">{t("All")}</option>
        {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );

  const body = (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      {select(t("Era"), search.era, eras.map((e) => ({ v: e.slug, l: `${e.number}. ${bi(e, "name")}` })), "era")}
      {select(t("Record type"), search.type, presentTypes.map((ty) => ({ v: ty, l: t(TYPE_LABEL[ty]) })), "type")}
      {presentOutcomes.length > 0 &&
        select(t("Outcome"), search.outcome, presentOutcomes.map((o) => ({ v: o, l: t(outcomeLabel(o)!) + (o === "inconclusive" ? ` (${t("inconclusive")})` : "") })), "outcome")}
      {presentReview.length > 0 &&
        select(t("Review status"), search.review, presentReview.map((s) => ({ v: s, l: s === "verified" ? t("Verified") : t("Under academic review") })), "review")}
      {showCentury && cents.length > 0 && (
        <div className="grid gap-2 text-xs font-semibold text-navy">
          <span>{t("Century range")}</span>
          <SliderPrimitive.Root
            min={cMin}
            max={cMax}
            step={1}
            value={range}
            onValueChange={(v) => setRange([v[0]!, v[1]!])}
            onValueCommit={(v) => set({ cfrom: v[0] === cMin ? undefined : v[0], cto: v[1] === cMax ? undefined : v[1] })}
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="relative flex h-6 w-full touch-none select-none items-center"
          >
            <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
              <SliderPrimitive.Range className="absolute h-full bg-navy" />
            </SliderPrimitive.Track>
            {[0, 1].map((i) => (
              <SliderPrimitive.Thumb
                key={i}
                aria-label={i === 0 ? t("From century") : t("To century")}
                className="block size-5 rounded-full border-2 border-navy bg-background shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ))}
          </SliderPrimitive.Root>
          <span className="font-normal text-text-body">
            {centuryLabel(range[0], lang)} – {centuryLabel(range[1], lang)}
          </span>
          <span className="font-normal text-muted-foreground">{t("Undated records always stay in the list.")}</span>
        </div>
      )}
      <label className="grid gap-1 text-xs font-semibold text-navy">
        {t("Sort")}
        <select
          value={search.sort ?? "chrono"}
          onChange={(e) => set({ sort: e.target.value === "new" ? "new" : undefined })}
          className="min-h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-sm font-normal text-foreground"
        >
          <option value="chrono">{t("Chronological")}</option>
          <option value="new">{t("Newest added")}</option>
        </select>
      </label>
    </div>
  );

  return (
    <>
      <div className="hidden min-w-0 lg:block">{body}</div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-navy px-4 text-sm font-semibold text-navy lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" /> {t("Filters")}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>{t("Filters")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{body}</div>
          <button type="button" onClick={() => setOpen(false)} className="mt-6 min-h-11 w-full rounded-full bg-navy text-sm font-semibold text-primary-foreground">
            {t("Show results")}
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function ActiveChips({ eras, search, set }: { eras: MilEra[]; search: RecordsSearch; set: (n: Partial<RecordsSearch>) => void }) {
  const { t, lang } = useI18n();
  const bi = useBi();
  const chips: { label: string; clear: Partial<RecordsSearch> }[] = [];
  if (search.q) chips.push({ label: `“${search.q}”`, clear: { q: undefined } });
  if (search.era) {
    const e = eras.find((x) => x.slug === search.era);
    if (e) chips.push({ label: bi(e, "name"), clear: { era: undefined } });
  }
  if (search.type) chips.push({ label: t(TYPE_LABEL[search.type]), clear: { type: undefined } });
  if (search.outcome && outcomeLabel(search.outcome)) chips.push({ label: t(outcomeLabel(search.outcome)!), clear: { outcome: undefined } });
  if (search.review) chips.push({ label: search.review === "verified" ? t("Verified") : t("Under academic review"), clear: { review: undefined } });
  if (search.cfrom != null || search.cto != null)
    chips.push({
      label: `${search.cfrom != null ? centuryLabel(search.cfrom, lang) : "…"} – ${search.cto != null ? centuryLabel(search.cto, lang) : "…"}`,
      clear: { cfrom: undefined, cto: undefined },
    });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={() => set(c.clear)}
          className="flex min-h-9 items-center gap-1 rounded-full border border-navy/30 bg-muted/50 px-3 text-xs font-medium text-navy"
          aria-label={`${t("Remove filter")}: ${c.label}`}
        >
          <span dir="auto">{c.label}</span> <X className="size-3.5" aria-hidden="true" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => set({ q: undefined, era: undefined, type: undefined, outcome: undefined, review: undefined, cfrom: undefined, cto: undefined })}
        className="min-h-9 px-2 text-xs text-navy underline"
      >
        {t("Clear all")}
      </button>
    </div>
  );
}

/* ---------------- report ---------------- */

const reportSchema = z.object({
  message: z.string().trim().min(5).max(500),
  contact_email: z.union([z.literal(""), z.string().trim().email().max(254)]),
});

export function ReportButton({ recordId, label }: { recordId: string; label: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return setOpen(false);
    const parsed = reportSchema.safeParse({ message, contact_email: email });
    if (!parsed.success) {
      toast.error(t("Please write 5–500 characters and a valid email (optional)."));
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("military_reports").insert({
      record_id: recordId,
      message: parsed.data.message,
      contact_email: parsed.data.contact_email || null,
    });
    setBusy(false);
    if (error) return void toast.error(t("Could not send your report. Please try again later."));
    toast.success(t("Thank you — your report was sent."));
    setMessage("");
    setEmail("");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-full border border-navy px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-primary-foreground"
      >
        {t("Report an error")}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Report an error")}</DialogTitle>
            <DialogDescription dir="auto">{label}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void submit(e)} className="grid gap-3">
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              dir="auto"
              placeholder={t("What is wrong or missing in this record?")}
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
            <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-navy px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {busy ? t("Sending…") : t("Send report")}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------------- states ---------------- */

export function MilLoading() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "grid gap-4 py-10")}>
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        {[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    </div>
  );
}

export function MilError() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "py-16 text-center")}>
        <p className="text-sm text-text-body">{t("The military history register could not be loaded right now.")}</p>
      </div>
      <SiteFooter />
    </div>
  );
}

export function MilNotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "grid justify-items-center gap-4 py-16 text-center")}>
        <h1 className="font-display text-2xl font-bold text-navy">{t("Page not found")}</h1>
        <p className="text-sm text-text-body">{t("This entry does not exist or is not published yet.")}</p>
        <Link to="/egypt-through-time/military-history" className="min-h-11 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-primary-foreground">
          {t("Back to Military History")}
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}

export function SubNav() {
  const { t } = useI18n();
  const items = [
    { to: BASE, label: "Overview", exact: true },
    { to: `${BASE}/records`, label: "Records" },
    { to: `${BASE}/timeline`, label: "Timeline" },
    { to: `${BASE}/map`, label: "Map" },
    { to: `${BASE}/figures`, label: "Historical figures" },
    { to: `${BASE}/library`, label: "Library" },
  ];
  return (
    <div className="border-b border-border bg-card">
      <nav aria-label={t("Military History")} className={cn(innerWrap, "flex gap-1 overflow-x-auto py-2")}>
        {items.map((i) => (
          <Link
            key={i.to}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static typed paths
            to={i.to as any}
            activeOptions={{ exact: !!i.exact }}
            activeProps={{ className: "bg-navy text-primary-foreground" }}
            inactiveProps={{ className: "text-navy hover:bg-muted" }}
            className="flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium"
          >
            {t(i.label)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function militaryCrumbs(t: (k: string) => string, extra: Crumb[] = []): Crumb[] {
  return [
    { label: t("Egypt Through Time"), to: "/egypt-through-time" },
    { label: t("Military History"), to: extra.length ? BASE : undefined },
    ...extra,
  ];
}
