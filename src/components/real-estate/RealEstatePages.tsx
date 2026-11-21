import { useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MonitorPlay, FileCheck2 } from "lucide-react";
import { SimplePage } from "@/components/site/SimplePage";
import { EmptyState } from "@/components/site/EmptyState";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { safeHealthUrl } from "@/lib/health-public";
import { sourceUrlWarning } from "@/lib/protected-areas";
import { formatLanguages } from "@/lib/format-languages";
import { sourceDateText, sourceNameFor } from "@/lib/trade-public";
import { complaintTextFor } from "@/lib/complaints-public";
import { realEstateHubQuery, realEstatePlatformsQuery, type RealEstatePlatform } from "@/lib/real-estate.functions";
import { REAL_ESTATE_CATEGORY_LABELS, REAL_ESTATE_GUIDE_ACTIVITY, type RealEstateSearch } from "@/lib/real-estate-public";
import { REAL_ESTATE_CATEGORIES } from "@/lib/real-estate-validation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRAIL = [{ label: "Live in Egypt", to: "/live-in-egypt" }];

function External({ url, children, source = false }: { url: string | null | undefined; children: ReactNode; source?: boolean }) {
  const { t } = useI18n();
  const safe = safeHealthUrl(url);
  if (!safe) return null;
  const warning = source ? sourceUrlWarning(safe) : null;
  return (
    <span className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-2">
      <a className="hit-44 min-h-11 inline-flex min-w-0 max-w-full font-semibold text-navy underline [overflow-wrap:anywhere]" href={url ?? safe} target="_blank" rel="noopener noreferrer">{children}</a>
      {warning && <span className="text-xs text-text-body">{t(warning)}</span>}
    </span>
  );
}

export const PROPERTY_NOTICE = "This section is informational only. Egyptora does not list, sell, rent or broker property, verify ownership, or hold documents or payments. Always confirm with the official source.";
export function PropertyNotice() {
  const { t } = useI18n();
  return <aside className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm leading-relaxed text-navy"><p className="font-semibold">{t(PROPERTY_NOTICE)}</p><Link to="/legal/$slug" params={{slug:"real-estate-guide-disclaimer"}} className="hit-44 inline-flex min-h-11 font-semibold underline">{t("Read the full disclaimer")}</Link></aside>;
}
export function PropertyHubCards() {
 const { data } = useSuspenseQuery(realEstateHubQuery); const { t } = useI18n();
 return <div className="grid gap-4 sm:grid-cols-2">
 {data.platforms && <Link to="/real-estate/platforms" search={{q:"",category:""}} className="group min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm hover:border-gold-line"><MonitorPlay className="size-8 text-gold-text"/><h2 className="mt-3 font-display text-xl font-semibold text-navy">{t("Official property platforms")}</h2><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy">{t("Open")}<ArrowRight className="size-4 rtl:rotate-180"/></span></Link>}
 {data.guides && <Link to="/do-business/procedure-guides" search={{activity:REAL_ESTATE_GUIDE_ACTIVITY}} className="group min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm hover:border-gold-line"><FileCheck2 className="size-8 text-gold-text"/><h2 className="mt-3 font-display text-xl font-semibold text-navy">{t("Registration & ownership documents guides")}</h2><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy">{t("Open")}<ArrowRight className="size-4 rtl:rotate-180"/></span></Link>}
 </div>;
}

function PlatformCard({ p }: { p: RealEstatePlatform }) {
  const { t, lang } = useI18n();
  const tx = (en: string | null, ar: string | null) => complaintTextFor(lang, en, ar);
  const name = tx(p.name_en, p.name_ar);
  const operator = tx(p.operator_name_en, p.operator_name_ar);
  const audience = tx(p.audience_en, p.audience_ar);
  const services = tx(p.services_summary_en, p.services_summary_ar);
  const languages = formatLanguages(p.languages, lang);
  
  const verified = sourceDateText(p.last_verified_at);
  const sourceName = sourceNameFor(lang, p.source_name, p.source_name_ar);
  return (
    <li className="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-navy" dir="auto">{name}</h2>
      <p className="mt-1 text-sm text-text-body">
        <span className="font-semibold">{t(REAL_ESTATE_CATEGORY_LABELS[p.category as keyof typeof REAL_ESTATE_CATEGORY_LABELS] ?? "Other")}</span>
        {operator && <><span aria-hidden="true"> · </span><span dir="auto">{operator}</span></>}
      </p>
      <dl className="mt-3 grid gap-2 text-sm text-text-body">
        {audience && <div><dt className="inline font-semibold">{t("Audience:")} </dt><dd className="inline" dir="auto">{audience}</dd></div>}
        {services && <div><dt className="inline font-semibold">{t("Services:")} </dt><dd className="inline" dir="auto">{services}</dd></div>}
        {languages && <div><dt className="inline font-semibold">{t("Languages:")} </dt><dd className="inline" dir="auto">{languages}</dd></div>}
      </dl>
      <div className="mt-3 min-w-0"><External url={p.official_url}>{t("Official website")}</External></div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-text-body">
        <span>{t("Source:")}</span>
        {sourceName && <span dir="auto">{sourceName}</span>}
        <External url={p.source_url} source>{t("Source")}</External>
        {verified && <span className="whitespace-nowrap">· {t("Last verified:")} {verified}</span>}
      </p>
    </li>
  );
}

export function RealEstatePlatformsPage({ search }: { search: RealEstateSearch }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(realEstatePlatformsQuery);
  const q = search.q.trim().toLowerCase();
  const rows = useMemo(() => data.filter((p) => (!search.category || p.category === search.category) && (!q || [p.name_en, p.name_ar, p.operator_name_en, p.operator_name_ar, p.services_summary_en, p.services_summary_ar].some((v) => (v ?? "").toLowerCase().includes(q)))), [data, search.category, q]);
  const set = (next: Partial<RealEstateSearch>) => navigate({ to: "/real-estate/platforms", search: { ...search, ...next }, replace: true });
  return (
    <SimplePage title="Official property platforms" intro="Official Egyptian property platforms, each linked to its official source." trail={[...TRAIL, { label: "Real Estate & Property", to: "/real-estate" }]}>
      <PropertyNotice />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input dir="auto" value={search.q} onChange={(e) => set({ q: e.target.value })} placeholder={t("Search platforms")} aria-label={t("Search platforms")} className="sm:max-w-sm" />
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("Category")}>
          {["", ...REAL_ESTATE_CATEGORIES].map((c) => (
            <Button variant="outline" key={c || "all"} type="button" aria-pressed={search.category === c} onClick={() => set({ category: c })} className={cn("hit-44 min-h-11 rounded-full border px-4 text-sm font-semibold", search.category === c ? "border-navy bg-navy text-primary-foreground" : "border-border text-navy")}>
              {t(c ? REAL_ESTATE_CATEGORY_LABELS[c as keyof typeof REAL_ESTATE_CATEGORY_LABELS] : "All")}
            </Button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? <div className="mt-6"><EmptyState text="No platforms match your search." /></div> : <ul className="mt-6 grid gap-4 md:grid-cols-2" lang={lang}>{rows.map((p) => <PlatformCard key={p.id} p={p} />)}</ul>}
    </SimplePage>
  );
}

export function RealEstateError() {
  const { t } = useI18n();
  return <SimplePage title="Real Estate & Property"><p className="text-text-body">{t("Property information is temporarily unavailable.")}</p></SimplePage>;
}
export function RealEstateUnavailable() {
  const { t } = useI18n();
  return <SimplePage title="Page not found"><p className="text-text-body">{t("This page is not available yet.")}</p><Link className="hit-44 min-h-11 inline-flex font-semibold text-navy underline" to="/real-estate">{t("Back to Real Estate & Property")}</Link></SimplePage>;
}
