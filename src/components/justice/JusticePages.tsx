import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Landmark, Map as MapIcon } from "lucide-react";
import { SimplePage } from "@/components/site/SimplePage";
import { useI18n } from "@/i18n";
import { useNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { JUSTICE_AREAS, JUSTICE_AREAS_NOTE, JUSTICE_CARDS, JUSTICE_CONCEPT, JUSTICE_DATA_NOTE, JUSTICE_DEADLINE_NOTE, JUSTICE_INTRO, JUSTICE_LATER, JUSTICE_LEGAL_NOTE, JUSTICE_NOTICE, JUSTICE_OFFICIAL_LINE, JUSTICE_TITLE } from "@/lib/justice-public";
import { justiceGuidesQuery } from "@/lib/justice.functions";
import { safeHealthUrl } from "@/lib/health-public";
import { sourceUrlWarning } from "@/lib/protected-areas";
import { formatLanguages } from "@/lib/format-languages";
import { justiceServiceAreaLabel } from "@/i18n/justice-translations";

const GD = { label: "Government Directory", to: "/government-directory" };
const ICONS = [MapIcon, Landmark] as const;
const linkCls = "inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline";

export function JusticeShell({ title, children, hub = false }: { title: string; children: ReactNode; hub?: boolean }) {
  const { t } = useI18n();
  return (
    <SimplePage title={title} trail={hub ? [GD] : [GD, { label: JUSTICE_TITLE, to: "/justice" }]} {...(hub ? { intro: JUSTICE_INTRO } : {})}>
      <aside className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm font-semibold leading-relaxed text-navy">{t(JUSTICE_NOTICE)}</aside>
      <div className="mt-8 space-y-8">{children}</div>
      <div className="mt-10 space-y-2 border-t border-border pt-5">
        <p className="text-sm text-text-body">{t(JUSTICE_CONCEPT)}</p>
        <Link to="/legal/$slug" params={{ slug: "justice-guide-disclaimer" }} className={linkCls}>{t("Justice & Legal Services Guide Disclaimer")} · {t("Draft disclaimer")}</Link>
      </div>
    </SimplePage>
  );
}

export function JusticeError() { const { t } = useI18n(); return <JusticeShell title={JUSTICE_TITLE}><p role="alert">{t("Justice guide information is temporarily unavailable.")}</p></JusticeShell>; }

export function JusticeEntryCard() {
  const { t } = useI18n(); const avail = useNavAvailability();
  if (linkGatedOff("/justice", avail)) return null;
  return <Link to="/justice" className="group flex min-w-0 items-center gap-5 rounded-lg border border-gold-line bg-bg-notice p-6 transition-colors hover:bg-chip-active"><BookOpen className="size-9 shrink-0 text-gold-text" /><div className="min-w-0 flex-1"><h2 className="font-display text-2xl font-bold text-navy">{t(JUSTICE_TITLE)}</h2><p className="mt-2 text-sm text-text-body">{t("Official justice-related portals and services. This section is under development.")}</p></div><ArrowRight className="size-6 shrink-0 text-navy rtl:rotate-180" /></Link>;
}

export function JusticeHub() {
  const { t } = useI18n();
  return (
    <JusticeShell title={JUSTICE_TITLE} hub>
      <div className="grid gap-5 md:grid-cols-2">
        {JUSTICE_CARDS.map((c, i) => { const Icon = ICONS[i] ?? Landmark; return (
          <Link key={c.to} to={c.to} className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-6 hover:border-gold-line">
            <Icon className="size-9 text-gold-text" />
            <h2 className="mt-4 font-display text-xl font-bold text-navy">{t(c.title)}</h2>
            <p className="mt-3 flex-1 leading-relaxed text-text-body">{t(c.body)}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-navy">{t("Open")}<ArrowRight className="size-4 rtl:rotate-180" /></span>
          </Link>); })}
      </div>
      <div className="grid gap-8 border-y border-border py-6 md:grid-cols-2">
        <section><h2 className="font-display text-xl font-semibold text-navy">{t("What is available today")}</h2>
          <ul className="mt-3 space-y-2">{JUSTICE_CARDS.map(c => <li key={c.to}><Link to={c.to} className={linkCls}>{t(c.title)}<ArrowRight className="size-4 rtl:rotate-180" /></Link></li>)}</ul></section>
        <section><h2 className="font-display text-xl font-semibold text-navy">{t("Coming later")} · {t("Not available")}</h2>
          <ul className="mt-4 grid gap-2 text-sm text-text-body sm:grid-cols-2">{JUSTICE_LATER.map(l => <li key={l}>{t(l)}</li>)}</ul></section>
      </div>
      <section>
        <p className="max-w-3xl leading-relaxed text-text-body">{t(JUSTICE_OFFICIAL_LINE)}</p>
        <div className="mt-3 flex flex-wrap gap-x-6">
          <Link to="/government-directory/complaints" search={{ q: "", family: "" }} className={linkCls}>{t("Complaints & Services Guide")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
          <Link to="/government-directory" className={linkCls}>{t("Official Directory")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
          <Link to="/emergency-numbers" className={linkCls}>{t("Emergency numbers")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
        </div>
      </section>
    </JusticeShell>
  );
}

export function JusticeServiceAreas() {
  const { t } = useI18n();
  return (
    <JusticeShell title="Service areas">
      <p className="text-text-body">{t(JUSTICE_AREAS_NOTE)}</p>
      <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2">{JUSTICE_AREAS.map(a => <li key={a.title} className="min-w-0 border-t border-border pt-4"><h2 className="font-display text-xl font-bold text-navy">{t(a.title)}</h2><p className="mt-2 text-text-body">{t(a.body)}</p></li>)}</ul>
      <div className="space-y-3 border-t border-border pt-5 text-sm leading-relaxed text-text-body"><p>{t(JUSTICE_LEGAL_NOTE)}</p><p>{t(JUSTICE_DEADLINE_NOTE)}</p><p>{t(JUSTICE_DATA_NOTE)}</p></div>
    </JusticeShell>
  );
}

export function JusticeServicesGuide() {
  const { t, lang } = useI18n();
  const { data } = useSuspenseQuery(justiceGuidesQuery);
  return (
    <JusticeShell title="Official services guide">
      {!data.length ? (
        <div className="flex items-center gap-4 border-y border-border py-10 text-navy"><Landmark className="size-8 shrink-0 text-gold-text" /><p>{t("Official sources are being verified")}</p></div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">{data.map(g => { const official = safeHealthUrl(g.official_url); const source = safeHealthUrl(g.source_url); const warning = source ? sourceUrlWarning(source) : null; const provider = lang === "ar" ? (g.provider_name_ar || g.provider_name_en) : g.provider_name_en; return (
          <li key={g.id} className="min-w-0 rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-xl font-semibold text-navy" dir="auto">{lang === "ar" ? g.title_ar : g.title_en}</h2>
            <p className="mt-1 text-sm font-semibold text-gold-text">{justiceServiceAreaLabel(g.service_area, lang)}</p>
            {provider && <p className="mt-2 text-text-body" dir="auto">{t("Provider:")} {provider}</p>}
            <p className="mt-2 text-text-body" dir="auto">{lang === "ar" ? (g.summary_ar || g.summary_en) : g.summary_en}</p>
            <p className="mt-2 text-sm text-text-body">{formatLanguages(g.languages, lang)}</p>
            <div className="mt-3 flex flex-wrap gap-4">{official && <a href={official} target="_blank" rel="noopener noreferrer" className="min-h-11 font-semibold text-navy underline">{t("Official website")}</a>}{source && <a href={source} target="_blank" rel="noopener noreferrer" className="min-h-11 font-semibold text-navy underline">{t("Source")}: {lang === "ar" ? (g.source_name_ar || g.source_name) : g.source_name}</a>}</div>
            {warning && <p className="text-xs text-text-body">{t(warning)}</p>}
            {g.verified_on && <p className="text-xs text-text-body">{t("Last verified:")} <bdi>{g.verified_on}</bdi></p>}
          </li>); })}</ul>
      )}
    </JusticeShell>
  );
}
