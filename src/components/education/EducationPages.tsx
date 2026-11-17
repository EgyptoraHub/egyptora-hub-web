import { useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, MonitorPlay, FileCheck2 } from "lucide-react";
import { SimplePage } from "@/components/site/SimplePage";
import { EmptyState } from "@/components/site/EmptyState";
import { GenImage } from "@/components/site/GenImage";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { safeHealthUrl } from "@/lib/health-public";
import { sourceUrlWarning } from "@/lib/protected-areas";
import { sourceDateText, sourceNameFor } from "@/lib/trade-public";
import { complaintTextFor } from "@/lib/complaints-public";
import { educationHubQuery, educationPlatformsQuery, type EducationPlatform } from "@/lib/education.functions";
import { EDUCATION_CATEGORY_LABELS, EDUCATION_GUIDE_ACTIVITY, accreditationLabel, educationHubCards, showPlatformFee, type EducationSearch } from "@/lib/education-public";
import { EDUCATION_CATEGORIES } from "@/lib/education-validation";
import { cn } from "@/lib/utils";

const TRAIL = [{ label: "Live in Egypt", to: "/live-in-egypt" }];

function External({ url, children, source = false }: { url: string | null | undefined; children: ReactNode; source?: boolean }) {
  const { t } = useI18n();
  const safe = safeHealthUrl(url);
  if (!safe) return null;
  const warning = source ? sourceUrlWarning(safe) : null;
  return (
    <span className="inline-flex min-w-0 max-w-full flex-wrap items-center gap-2">
      <a className="hit-44 min-h-11 inline-flex min-w-0 max-w-full font-semibold text-navy underline [overflow-wrap:anywhere]" href={safe} target="_blank" rel="noopener noreferrer">{children}</a>
      {warning && <span className="text-xs text-text-body">{t(warning)}</span>}
    </span>
  );
}

function Notice() {
  const { t } = useI18n();
  return (
    <aside className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm leading-relaxed text-navy">
      <p className="font-semibold">{t("This section is informational only. Egyptora does not handle admissions, applications, transfers or certificates.")}</p>
      <p className="mt-1">{t("The competent authority decides on admission, equivalency and accreditation. Always confirm on the official website.")}</p>
      <Link className="hit-44 min-h-11 inline-flex font-semibold underline" to="/legal/$slug" params={{ slug: "education-guide-disclaimer" }}>{t("Read the full disclaimer")}</Link>
    </aside>
  );
}

function HubCard({ to, search, Icon, title, desc }: { to: string; search?: Record<string, string>; Icon: typeof GraduationCap; title: string; desc: string }) {
  const { t } = useI18n();
  return (
    <Link to={to as never} search={search as never} className="group flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-gold-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Icon aria-hidden="true" className="size-8 text-gold-text" />
      <h2 className="font-display text-xl font-semibold text-navy">{t(title)}</h2>
      <p className="text-sm text-text-body">{t(desc)}</p>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-navy">{t("Open")}<ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" /></span>
    </Link>
  );
}

export function EducationHubPage() {
  const { data } = useSuspenseQuery(educationHubQuery);
  const cards = educationHubCards(data);
  return (
    <SimplePage title="Education & Schools" intro="Official Egyptian education resources: universities and programmes, learning platforms and certificate guides — each linked to its official source." trail={TRAIL}>
      <div className="grid gap-6 md:grid-cols-[1fr_200px] md:items-start">
        <Notice />
        <GenImage k="ill-education" sizes="200px" className="mx-auto hidden w-full max-w-[200px] rounded-xl md:block" />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.includes("research") && <HubCard to="/research-programs" Icon={GraduationCap} title="Universities & programmes" desc="Research and study programmes at Egyptian universities and institutes." />}
        {cards.includes("platforms") && <HubCard to="/education/platforms" Icon={MonitorPlay} title="Official learning platforms" desc="Official Egyptian learning platforms with their operator and source." />}
        {cards.includes("guides") && <HubCard to="/do-business/procedure-guides" search={{ activity: EDUCATION_GUIDE_ACTIVITY }} Icon={FileCheck2} title="Certificates & equivalency guides" desc="Official procedure guides for certificates and equivalency." />}
      </div>
    </SimplePage>
  );
}

function PlatformCard({ p }: { p: EducationPlatform }) {
  const { t, lang } = useI18n();
  const tx = (en: string | null, ar: string | null) => complaintTextFor(lang, en, ar);
  const name = tx(p.name_en, p.name_ar);
  const operator = tx(p.operator_name_en, p.operator_name_ar);
  const audience = tx(p.audience_en, p.audience_ar);
  const services = tx(p.services_summary_en, p.services_summary_ar);
  const fee = showPlatformFee(p) ? tx(p.published_fee_text, p.published_fee_text_ar) : null;
  const verified = sourceDateText(p.last_verified_at);
  const sourceName = sourceNameFor(lang, p.source_name, p.source_name_ar);
  return (
    <li className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-navy" dir="auto">{name}</h2>
      <p className="mt-1 text-sm text-text-body">
        <span className="font-semibold">{t(EDUCATION_CATEGORY_LABELS[p.category as keyof typeof EDUCATION_CATEGORY_LABELS] ?? "Other")}</span>
        {operator && <><span aria-hidden="true"> · </span><span dir="auto">{operator}</span></>}
      </p>
      <dl className="mt-3 grid gap-2 text-sm text-text-body">
        {audience && <div><dt className="inline font-semibold">{t("Audience:")} </dt><dd className="inline" dir="auto">{audience}</dd></div>}
        {services && <div><dt className="inline font-semibold">{t("Services:")} </dt><dd className="inline" dir="auto">{services}</dd></div>}
        {p.languages && <div><dt className="inline font-semibold">{t("Languages:")} </dt><dd className="inline" dir="ltr">{p.languages}</dd></div>}
        {fee && <div><dt className="inline font-semibold">{t("Published fee:")} </dt><dd className="inline" dir="auto">{fee}</dd> <External url={p.fee_source_url} source>{t("Fee source")}</External></div>}
        <div><dd>{t(accreditationLabel(p))}</dd>{p.accreditation_status === "accredited" && <External url={p.accreditation_source_url} source>{t("Accreditation source")}</External>}</div>
      </dl>
      <div className="mt-3 min-w-0"><External url={p.official_url}>{t("Official website")}</External></div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-text-body">
        <span>{t("Source:")}</span>
        {sourceName && <span dir="auto">{sourceName}</span>}
        <External url={p.source_url} source>{t("Source")}</External>
        {verified && <span className="whitespace-nowrap">· {t("Last verified:")} {new Date(verified).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { timeZone: "UTC" })}</span>}
      </p>
    </li>
  );
}

export function EducationPlatformsPage({ search }: { search: EducationSearch }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(educationPlatformsQuery);
  const q = search.q.trim().toLowerCase();
  const rows = useMemo(() => data.filter((p) => (!search.category || p.category === search.category) && (!q || [p.name_en, p.name_ar, p.operator_name_en, p.operator_name_ar, p.services_summary_en, p.services_summary_ar].some((v) => (v ?? "").toLowerCase().includes(q)))), [data, search.category, q]);
  const set = (next: Partial<EducationSearch>) => navigate({ to: "/education/platforms", search: { ...search, ...next }, replace: true });
  return (
    <SimplePage title="Official learning platforms" intro="Official Egyptian learning platforms, each with its operator, official link and source." trail={[...TRAIL, { label: "Education & Schools", to: "/education" }]}>
      <Notice />
      <p className="mt-4 rounded-xl border border-border bg-card p-3 text-sm font-semibold text-navy">{t("Listing a platform here does not mean its certificates are recognised.")}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input dir="auto" value={search.q} onChange={(e) => set({ q: e.target.value })} placeholder={t("Search platforms")} aria-label={t("Search platforms")} className="sm:max-w-sm" />
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("Category")}>
          {["", ...EDUCATION_CATEGORIES].map((c) => (
            <button key={c || "all"} type="button" aria-pressed={search.category === c} onClick={() => set({ category: c })} className={cn("hit-44 min-h-11 rounded-full border px-4 text-sm font-semibold", search.category === c ? "border-navy bg-navy text-primary-foreground" : "border-border text-navy")}>
              {t(c ? EDUCATION_CATEGORY_LABELS[c as keyof typeof EDUCATION_CATEGORY_LABELS] : "All")}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? <div className="mt-6"><EmptyState text="No platforms match your search." /></div> : <ul className="mt-6 grid gap-4 md:grid-cols-2" lang={lang}>{rows.map((p) => <PlatformCard key={p.id} p={p} />)}</ul>}
    </SimplePage>
  );
}

export function EducationError() {
  const { t } = useI18n();
  return <SimplePage title="Education & Schools"><p className="text-text-body">{t("Education information is temporarily unavailable.")}</p></SimplePage>;
}
export function EducationUnavailable() {
  const { t } = useI18n();
  return <SimplePage title="Page not found"><p className="text-text-body">{t("This page is not available yet.")}</p><Link className="hit-44 min-h-11 inline-flex font-semibold text-navy underline" to="/education">{t("Back to Education & Schools")}</Link></SimplePage>;
}
