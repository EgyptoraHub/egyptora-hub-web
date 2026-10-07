import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useBi, type Crumb } from "@/components/military/MilitaryUI";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { categoryLabel, sectionByDb, type CultureItem, type GovSummary, type ReviewStatus, type SectionConfig } from "@/lib/culture";

/** Bilingual independent-platform + editorial notice (same look as the military register notice). */
export function CultureNotice({ governorateSummary = false }: { governorateSummary?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="flex items-start gap-3 rounded-[10px] border border-info/25 bg-bg-notice p-4" role="note">
      <Info className="mt-0.5 size-5 shrink-0 text-navy" aria-hidden="true" />
      <div className="grid gap-2 text-xs leading-relaxed text-navy">
        <p lang="en" dir="ltr">
          {governorateSummary
            ? "Governorate entries are short summaries taken from each governorate page. "
            : ""}
          Descriptions are editorial summaries; origins and traditions vary by region and source. EGYPTORA is an independent private platform, not a governmental body.
        </p>
        <p lang="ar" dir="rtl">
          {governorateSummary ? "بيانات المحافظات ملخصات قصيرة مأخوذة من صفحة كل محافظة. " : ""}
          الأوصاف ملخصات تحريرية؛ وتختلف الأصول والتقاليد باختلاف المنطقة والمصدر. إيجبتورا منصة خاصة مستقلة وليست جهة حكومية.
        </p>
        <span className="sr-only">{t("Editorial notice")}</span>
      </div>
    </div>
  );
}

export function CultureBadge({ status, verifiedAt }: { status: ReviewStatus; verifiedAt?: string | null }) {
  const { t, lang } = useI18n();
  if (status === "verified")
    return (
      <span className="inline-flex items-center rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-navy">
        {lang === "ar" ? "موثّق" : t("Verified")}
        {verifiedAt && <span dir="ltr" className="ms-1 font-normal">· {verifiedAt}</span>}
      </span>
    );
  if (status === "editorial_reviewed")
    return (
      <span className="inline-flex items-center rounded-full border border-gold-line bg-gold-soft px-2.5 py-0.5 text-[11px] font-semibold text-navy">
        {t("Under review")}
      </span>
    );
  return null;
}

/** Name in the current language; English without an English name shows the Arabic name, marked. */
export function CultureName({ r, className, labelClassName = "text-muted-foreground" }: { r: Pick<CultureItem, "name_en" | "name_ar">; className?: string; labelClassName?: string }) {
  const { t, lang } = useI18n();
  const en = r.name_en?.trim();
  if (lang === "ar" || en) return <span className={className} dir="auto">{lang === "ar" ? r.name_ar || en : en}</span>;
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span lang="ar" dir="rtl" className={className}>{r.name_ar}</span>
      <span className={cn("font-sans text-xs font-normal", labelClassName)}>{t("Arabic name · English pending")}</span>
    </span>
  );
}

export function CultureCard({ r, govName }: { r: CultureItem; govName?: string | undefined }) {
  const { t } = useI18n();
  const bi = useBi();
  const sec = sectionByDb(r.section)!;
  const place = bi(r, "region") || govName || "";
  return (
    <li className="flex">
      <Link
        to="/live-like-an-egyptian/$section/$slug"
        params={{ section: sec.url, slug: r.slug }}
        className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-gold-line"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {r.category && (
            <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-semibold text-navy">
              {t(categoryLabel(r.category))}
            </span>
          )}
          <CultureBadge status={r.review_status} />
        </div>
        <p className="text-base font-semibold text-navy"><CultureName r={r} /></p>
        {place && <p className="text-xs text-text-body" dir="auto">{place}</p>}
        {bi(r, "summary") && <p className="line-clamp-3 text-xs text-text-body" dir="auto">{bi(r, "summary")}</p>}
      </Link>
    </li>
  );
}

/** "By governorate" block from existing public governorate columns; empty governorates are skipped. */
export function ByGovernorate({ cfg, governorates }: { cfg: SectionConfig; governorates: GovSummary[] }) {
  const { t, lang } = useI18n();
  const rows = governorates.filter((g) => g.values.length > 0);
  if (!rows.length) return null;
  return (
    <section className="grid gap-4">
      <div>
        <h2 className="font-display text-xl font-bold text-navy">{t("By governorate")}</h2>
        <p className="mt-1 text-sm text-text-body">
          {t(cfg.db === "cuisine" ? "Famous food" : cfg.db === "fashion" ? "Traditional clothing" : "Traditional crafts")}
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((g) => (
          <li key={g.id} className="flex">
            <Link
              to="/governorates/$id"
              params={{ id: g.slug }}
              className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-gold-line"
            >
              <p className="text-base font-semibold text-navy" dir="auto">{lang === "ar" ? g.name_ar : t(g.name)}</p>
              <p className="text-xs leading-relaxed text-text-body" dir="auto">{g.values.map((v) => t(v)).join(" · ")}</p>
            </Link>
          </li>
        ))}
      </ul>
      <CultureNotice governorateSummary />
    </section>
  );
}

export function cultureCrumbs(t: (s: string) => string, rest: Crumb[]): Crumb[] {
  return [{ label: t("Live Like an Egyptian"), to: "/live-like-an-egyptian" }, ...rest];
}

const reportSchema = z.object({ message: z.string().trim().min(5).max(500) });

export function CultureReportButton({ itemId, label }: { itemId: string; label: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return setOpen(false);
    const parsed = reportSchema.safeParse({ message });
    if (!parsed.success) return void toast.error(t("Please write 5–500 characters."));
    setBusy(true);
    const { error } = await supabase.from("culture_reports").insert({ item_id: itemId, message: parsed.data.message });
    setBusy(false);
    if (error) return void toast.error(t("Could not send your report. Please try again later."));
    toast.success(t("Thank you — your report was sent."));
    setMessage("");
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
              placeholder={t("What is wrong or missing here?")}
              className="rounded-xl border border-border bg-background p-3 text-sm"
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

export function CultureNotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className={cn(innerWrap, "grid justify-items-center gap-4 py-16 text-center")}>
        <h1 className="font-display text-2xl font-bold text-navy">{t("Page not found")}</h1>
        <p className="text-sm text-text-body">{t("This entry does not exist or is not published yet.")}</p>
        <Link to="/live-like-an-egyptian" className="min-h-11 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-primary-foreground">
          {t("Back to Live Like an Egyptian")}
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}
