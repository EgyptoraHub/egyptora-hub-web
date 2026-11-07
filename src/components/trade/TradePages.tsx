import { useId, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Factory, Globe2, ClipboardList, ArrowRight, ShieldAlert, ExternalLink, Send, type LucideIcon } from "lucide-react";
import { SimplePage } from "@/components/site/SimplePage";
import { ProcessStepsRow } from "@/components/layout/InnerPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { useNavAvailability } from "@/lib/nav-availability";
import { safeHealthUrl } from "@/lib/health-public";
import { sourceUrlWarning } from "@/lib/protected-areas";
import {
  tradeSectorsQuery, tradeCountriesQuery, tradeCountryQuery, procedureGuidesQuery, procedureGuideQuery,
  submitTradeInquiry, type TradeSector, type TradeCommodity,
} from "@/lib/trade.functions";
import {
  SECTOR_GROUPS, SECTOR_GROUP_LABELS, RECORD_KIND_LABELS, FLOW_LABELS, INQUIRY_TOPICS, INQUIRY_TOPIC_LABELS,
  sourceDateText, showPublishedBlock, isRawMaterialKind,
  type SectorSearch, type CountrySearch, type GuideSearch,
} from "@/lib/trade-public";
import { tradeInquirySchema } from "@/lib/trade-validation";

const TRAIL = [{ label: "Do Business", to: "/do-business" }];

function TradeExternal({ url, children, source = false }: { url: string | null | undefined; children: ReactNode; source?: boolean }) {
  const { t } = useI18n();
  const safe = safeHealthUrl(url);
  if (!safe) return null;
  const warning = source ? sourceUrlWarning(safe) : null;
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2">
      <a className="hit-44 min-h-11 inline-flex break-words font-semibold text-navy underline" href={safe} target="_blank" rel="noopener noreferrer">{children}</a>
      {warning && <span className="text-xs text-text-body">{t(warning)}</span>}
    </span>
  );
}

/** Source name + link + "Last verified" — the date label is hidden when the date is empty. */
function SourceLine({ name, url, date }: { name: string | null; url: string | null; date: string | null }) {
  const { t, lang } = useI18n();
  const verified = sourceDateText(date);
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-body">
      {name && <span dir="auto">{name}</span>}
      <TradeExternal url={url} source>{t("Source")}</TradeExternal>
      {verified && <span>{t("Last verified:")} {new Date(verified).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { timeZone: "UTC" })}</span>}
    </p>
  );
}

export function TradeShell({ title, intro, trail, children }: { title: string; intro?: string; trail?: { label: string; to: string }[]; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <SimplePage title={title} {...(intro ? { intro } : {})} trail={[...TRAIL, ...(trail ?? [])]}>
      <aside className="mb-6 border-s-4 border-gold-line bg-bg-notice p-4 text-sm leading-relaxed text-navy">
        <p>{t("Information is compiled from official sources; confirm with the relevant authority.")}</p>
        <p>{t("Egyptora Hub is an independent private platform, not a government body.")}</p>
      </aside>
      <div className="space-y-8">{children}</div>
    </SimplePage>
  );
}

export function TradeUnavailable() {
  const { t } = useI18n();
  return (
    <TradeShell title="Trade, Industry & Agriculture">
      <div className="py-10 text-center">
        <ShieldAlert className="mx-auto mb-3 size-8 text-gold-text" />
        <p className="font-display text-xl font-semibold text-navy">{t("This section is being prepared")}</p>
        <p className="mt-2 text-sm text-text-body">{t("This page is unavailable or is still being verified.")}</p>
      </div>
    </TradeShell>
  );
}

export function TradeError() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <TradeShell title="Trade, Industry & Agriculture">
      <p role="alert">{t("Trade information is temporarily unavailable.")}</p>
      <Button className="min-h-11" onClick={() => void router.invalidate()}>{t("Try again")}</Button>
    </TradeShell>
  );
}

/** "Ask about sourcing, exports or procedures" — shown only where public trade records exist. */
export function TradeInquiryCta() {
  const { t } = useI18n();
  return (
    <section className="rounded-[10px] border border-border bg-bg-band p-5 text-center">
      <h2 className="font-display text-lg font-bold text-navy">{t("Ask about sourcing, exports or procedures")}</h2>
      <p className="mt-1 text-sm text-text-body">{t("Send an administrative inquiry. Do not include financial, identity or medical data.")}</p>
      <div className="mt-3">
        <Link to="/do-business/trade-inquiry" className="hit-44 inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold-cta px-5 text-sm font-semibold text-gold-foreground">
          {t("Send a trade inquiry")} <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}

/* ---------------- Sectors ---------------- */

export function TradeSectorsPage({ search }: { search: SectorSearch }) {
  const { data: sectors } = useSuspenseQuery(tradeSectorsQuery);
  const { t, lang } = useI18n();
  const navigate = useNavigate({ from: "/do-business/industry-agriculture" });
  const group = SECTOR_GROUPS.includes(search.group as (typeof SECTOR_GROUPS)[number]) ? search.group : "";
  const rows = sectors.filter((s) => !group || s.sector_group === group);
  return (
    <TradeShell title="Industry & Agriculture" intro="Sectors compiled from official sources, with what to specify when sourcing.">
      <form className="flex max-w-xl flex-wrap gap-3" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); void navigate({ search: { group: String(fd.get("group") ?? "") } }); }} key={`${lang}-${group}`}>
        <label className="grid gap-1 text-sm text-navy">
          {t("Sector group")}
          <select name="group" defaultValue={group} className="min-h-11 rounded-md border border-input bg-background px-3">
            <option value="">{t("All groups")}</option>
            {SECTOR_GROUPS.map((g) => <option key={g} value={g}>{t(SECTOR_GROUP_LABELS[g])}</option>)}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <Button className="min-h-11" type="submit">{t("Filter")}</Button>
          <Button className="min-h-11" variant="outline" type="button" onClick={() => void navigate({ search: { group: "" } })}>{t("Reset filters")}</Button>
        </div>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((s) => (
          <article key={s.id} className="min-w-0 rounded-lg border border-border bg-card p-5">
            <Factory className="mb-3 size-6 text-gold-text" />
            <h2 className="font-display text-xl font-semibold text-navy" dir="auto">{lang === "ar" ? s.name_ar : s.name_en}</h2>
            <p className="mt-1 text-sm text-text-body">{t(SECTOR_GROUP_LABELS[s.sector_group as keyof typeof SECTOR_GROUP_LABELS] ?? s.sector_group)}</p>
            {(lang === "ar" ? s.scope_ar : s.scope_en) && <p className="mt-2 line-clamp-3 text-sm text-text-body" dir="auto">{lang === "ar" ? s.scope_ar : s.scope_en}</p>}
            <SourceLine name={s.source_name} url={s.source_url} date={s.last_verified_at} />
            <Link to="/do-business/industry-agriculture/$slug" params={{ slug: s.slug }} className="hit-44 mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy underline">
              {t("View sector")} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </article>
        ))}
      </div>
    </TradeShell>
  );
}

export function TradeSectorDetail({ slug }: { slug: string }) {
  const { data: sectors } = useSuspenseQuery(tradeSectorsQuery);
  const { t, lang } = useI18n();
  const avail = useNavAvailability();
  const s = sectors.find((r) => r.slug === slug);
  if (!s) return null;
  const text = (en: string | null, ar: string | null) => (lang === "ar" ? ar : en) ?? en ?? ar ?? "";
  return (
    <TradeShell title={text(s.name_en, s.name_ar)} trail={[{ label: "Industry & Agriculture", to: "/do-business/industry-agriculture" }]}>
      <p className="text-text-body">{t(SECTOR_GROUP_LABELS[s.sector_group as keyof typeof SECTOR_GROUP_LABELS] ?? s.sector_group)}</p>
      {text(s.scope_en, s.scope_ar) && <section><h2 className="font-display text-xl font-semibold text-navy">{t("Scope")}</h2><p className="mt-3 leading-relaxed text-text-body" dir="auto">{text(s.scope_en, s.scope_ar)}</p></section>}
      {text(s.matching_info_en, s.matching_info_ar) && <section><h2 className="font-display text-xl font-semibold text-navy">{t("What to specify when sourcing")}</h2><p className="mt-3 leading-relaxed text-text-body" dir="auto">{text(s.matching_info_en, s.matching_info_ar)}</p></section>}
      <SourceLine name={s.source_name} url={s.source_url} date={s.last_verified_at} />
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-navy">{t("Related links")}</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link to="/government-directory" className="hit-44 inline-flex min-h-11 items-center font-semibold text-navy underline">{t("Government Directory")}</Link>
          <Link to="/products" className="hit-44 inline-flex min-h-11 items-center font-semibold text-navy underline">{t("Trade & Export")}</Link>
          {avail["industrial_zones"] && <Link to="/do-business/industrial-zones" className="hit-44 inline-flex min-h-11 items-center font-semibold text-navy underline">{t("Industrial Zones")}</Link>}
        </div>
      </section>
      <TradeInquiryCta />
    </TradeShell>
  );
}

/* ---------------- World Gateway ---------------- */

export function TradeCountriesPage({ search }: { search: CountrySearch }) {
  const { data: countries } = useSuspenseQuery(tradeCountriesQuery);
  const { t, lang } = useI18n();
  const navigate = useNavigate({ from: "/do-business/world-gateway" });
  const regions = [...new Set(countries.map((c) => c.region).filter((r): r is string => Boolean(r)))];
  const q = search.q.trim().toLowerCase();
  const rows = countries.filter((c) => (!search.region || c.region === search.region) && (!q || `${c.name_en} ${c.name_ar}`.toLowerCase().includes(q)));
  return (
    <TradeShell title="World Gateway" intro="Country profiles compiled from official sources.">
      <p className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm font-semibold text-navy">{t("A country profile is information only. It does not imply an agreement, an available supplier or an export permission.")}</p>
      <form className="grid max-w-2xl gap-3 sm:grid-cols-[1fr_auto_auto]" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); void navigate({ search: { q: String(fd.get("q") ?? ""), region: String(fd.get("region") ?? "") } }); }} key={`${lang}-${search.q}-${search.region}`}>
        <label className="grid gap-1 text-sm text-navy">{t("Search countries")}<Input name="q" defaultValue={search.q} className="min-h-11" dir="auto" maxLength={200} /></label>
        <label className="grid gap-1 text-sm text-navy">{t("Region")}<select name="region" defaultValue={search.region} className="min-h-11 rounded-md border border-input bg-background px-3"><option value="">{t("All regions")}</option>{regions.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
        <div className="flex items-end gap-3"><Button className="min-h-11" type="submit">{t("Search")}</Button><Button className="min-h-11" variant="outline" type="button" onClick={() => void navigate({ search: { q: "", region: "" } })}>{t("Reset filters")}</Button></div>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <article key={c.id} className="min-w-0 rounded-lg border border-border bg-card p-5">
            <Globe2 className="mb-3 size-6 text-gold-text" />
            <h2 className="font-display text-xl font-semibold text-navy" dir="auto">{lang === "ar" ? c.name_ar : c.name_en}</h2>
            {c.region && <p className="mt-1 text-sm text-text-body">{c.region}</p>}
            {(lang === "ar" ? c.summary_ar : c.summary_en) && <p className="mt-2 line-clamp-3 text-sm text-text-body" dir="auto">{lang === "ar" ? c.summary_ar : c.summary_en}</p>}
            <SourceLine name={c.source_name} url={c.source_url} date={c.last_verified_at} />
            <Link to="/do-business/world-gateway/$slug" params={{ slug: c.slug }} className="hit-44 mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy underline">
              {t("View profile")} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </article>
        ))}
      </div>
    </TradeShell>
  );
}

function CommodityTable({ title, rows }: { title: string; rows: TradeCommodity[] }) {
  const { t, lang } = useI18n();
  if (!rows.length) return null;
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold text-navy">{t(title)}</h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-bg-alt text-start text-navy">
            <tr>{["Commodity", "Kind", "Flow", "HS code", "Reference year", "Unit", "Quantity", "Source"].map((h) => <th key={h} className="px-3 py-2 text-start font-semibold">{t(h)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-3 py-2 text-navy" dir="auto">{lang === "ar" ? c.commodity_ar : c.commodity_en}</td>
                <td className="px-3 py-2 text-text-body">{t(RECORD_KIND_LABELS[c.record_kind] ?? c.record_kind)}</td>
                <td className="px-3 py-2 text-text-body">{t(FLOW_LABELS[c.flow] ?? c.flow)}</td>
                <td className="px-3 py-2 text-text-body" dir="ltr">{[c.hs_code, c.hs_revision].filter(Boolean).join(" · ") || "—"}</td>
                <td className="px-3 py-2 text-text-body">{c.reference_year}</td>
                <td className="px-3 py-2 text-text-body">{c.unit ?? "—"}</td>
                <td className="px-3 py-2 text-text-body">{c.quantity ?? "—"}</td>
                <td className="px-3 py-2"><TradeExternal url={c.source_url} source>{t("Source")}</TradeExternal></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function TradeCountryDetail({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(tradeCountryQuery(slug));
  const { t, lang } = useI18n();
  const c = data.profile;
  if (!c) return null;
  const raw = data.commodities.filter((x) => isRawMaterialKind(x.record_kind));
  const made = data.commodities.filter((x) => !isRawMaterialKind(x.record_kind));
  return (
    <TradeShell title={lang === "ar" ? c.name_ar : c.name_en} trail={[{ label: "World Gateway", to: "/do-business/world-gateway" }]}>
      <p className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm font-semibold text-navy">{t("A country profile is information only. It does not imply an agreement, an available supplier or an export permission.")}</p>
      {c.region && <p className="text-text-body">{c.region}</p>}
      {(lang === "ar" ? c.summary_ar : c.summary_en) && <p className="leading-relaxed text-text-body" dir="auto">{lang === "ar" ? c.summary_ar : c.summary_en}</p>}
      <div className="text-sm"><TradeExternal url={c.official_trade_site_url}>{t("Official trade website")}</TradeExternal></div>
      <SourceLine name={c.source_name} url={c.source_url} date={c.last_verified_at} />
      {data.commodities.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold text-navy">{t("Key commodities")}</h2>
          <div className="space-y-8">
            <CommodityTable title="Raw materials" rows={raw} />
            <CommodityTable title="Manufactured goods & services" rows={made} />
          </div>
        </section>
      )}
    </TradeShell>
  );
}

/* ---------------- Procedure guides ---------------- */

export function TradeGuidesPage({ search }: { search: GuideSearch }) {
  const { data: guides } = useSuspenseQuery(procedureGuidesQuery);
  const { t, lang } = useI18n();
  const navigate = useNavigate({ from: "/do-business/procedure-guides" });
  const activities = [...new Set(guides.map((g) => g.activity).filter((a): a is string => Boolean(a)))];
  const rows = guides.filter((g) => !search.activity || g.activity === search.activity);
  return (
    <TradeShell title="Procedure Guides" intro="Official procedures compiled from the competent authorities.">
      <form className="flex max-w-xl flex-wrap gap-3" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); void navigate({ search: { activity: String(fd.get("activity") ?? "") } }); }} key={`${lang}-${search.activity}`}>
        <label className="grid gap-1 text-sm text-navy">{t("Activity")}<select name="activity" defaultValue={search.activity} className="min-h-11 rounded-md border border-input bg-background px-3"><option value="">{t("All activities")}</option>{activities.map((a) => <option key={a} value={a}>{a}</option>)}</select></label>
        <div className="flex items-end gap-3"><Button className="min-h-11" type="submit">{t("Filter")}</Button><Button className="min-h-11" variant="outline" type="button" onClick={() => void navigate({ search: { activity: "" } })}>{t("Reset filters")}</Button></div>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((g) => (
          <article key={g.id} className="min-w-0 rounded-lg border border-border bg-card p-5">
            <ClipboardList className="mb-3 size-6 text-gold-text" />
            <h2 className="font-display text-xl font-semibold text-navy" dir="auto">{lang === "ar" ? g.title_ar : g.title_en}</h2>
            {(lang === "ar" ? g.authority_name_ar : g.authority_name_en) && <p className="mt-1 text-sm text-text-body" dir="auto">{lang === "ar" ? g.authority_name_ar : g.authority_name_en}</p>}
            {(lang === "ar" ? g.summary_ar : g.summary_en) && <p className="mt-2 line-clamp-3 text-sm text-text-body" dir="auto">{lang === "ar" ? g.summary_ar : g.summary_en}</p>}
            <div className="mt-3 text-sm"><TradeExternal url={g.official_service_url}>{t("Official link")}</TradeExternal></div>
            <SourceLine name={g.source_name} url={g.source_url} date={g.last_verified_at} />
            <Link to="/do-business/procedure-guides/$slug" params={{ slug: g.slug }} className="hit-44 mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy underline">
              {t("View guide")} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </article>
        ))}
      </div>
    </TradeShell>
  );
}

const STEP_ICONS: LucideIcon[] = [ClipboardList, Factory, Globe2, ArrowRight];

export function TradeGuideDetail({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(procedureGuideQuery(slug));
  const { t, lang } = useI18n();
  const g = data.guide;
  if (!g) return null;
  const text = (en: string | null, ar: string | null) => (lang === "ar" ? ar : en) ?? en ?? ar ?? "";
  const official = safeHealthUrl(g.official_service_url);
  return (
    <TradeShell title={text(g.title_en, g.title_ar)} trail={[{ label: "Procedure Guides", to: "/do-business/procedure-guides" }]}>
      <p className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm font-semibold text-navy">{t("EGYPTORA is a private platform. Approvals and decisions remain with the competent authority.")}</p>
      {text(g.authority_name_en, g.authority_name_ar) && <p className="text-text-body" dir="auto">{text(g.authority_name_en, g.authority_name_ar)}</p>}
      {text(g.summary_en, g.summary_ar) && <p className="leading-relaxed text-text-body" dir="auto">{text(g.summary_en, g.summary_ar)}</p>}
      {official && (
        <div>
          <a href={official} target="_blank" rel="noopener noreferrer" className="hit-44 inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold-cta px-5 text-sm font-semibold text-gold-foreground">
            {t("Open the official service")} <ExternalLink className="size-4" />
          </a>
        </div>
      )}
      {showPublishedBlock(g.published_fee_text, g.fee_source_url) && (
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-xl font-semibold text-navy">{t("Published fee")}</h2>
          <p className="mt-2 text-text-body" dir="auto">{g.published_fee_text}</p>
          <TradeExternal url={g.fee_source_url} source>{t("Fee source")}</TradeExternal>
        </section>
      )}
      {showPublishedBlock(g.published_processing_time_text, g.time_source_url) && (
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-display text-xl font-semibold text-navy">{t("Published processing time")}</h2>
          <p className="mt-2 text-text-body" dir="auto">{g.published_processing_time_text}</p>
          <TradeExternal url={g.time_source_url} source>{t("Processing time source")}</TradeExternal>
        </section>
      )}
      {data.steps.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold text-navy">{t("Steps")}</h2>
          <ProcessStepsRow steps={data.steps.map((s, i) => ({ Icon: STEP_ICONS[i % STEP_ICONS.length] ?? ClipboardList, title: text(s.title_en, s.title_ar), desc: text(s.description_en, s.description_ar) }))} />
        </section>
      )}
      {data.documents.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-2xl font-semibold text-navy">{t("Required documents")}</h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-bg-alt text-navy">
                <tr>{["Document", "Issuing source", "Last reviewed", "Official link"].map((h) => <th key={h} className="px-3 py-2 text-start font-semibold">{t(h)}</th>)}</tr>
              </thead>
              <tbody>
                {data.documents.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-3 py-2 text-navy" dir="auto">{lang === "ar" ? d.document_name_ar : d.document_name_en}</td>
                    <td className="px-3 py-2 text-text-body" dir="auto">{(lang === "ar" ? d.issuing_source_ar : d.issuing_source_en) ?? "—"}</td>
                    <td className="px-3 py-2 text-text-body">{sourceDateText(d.last_reviewed_at) ? new Date(d.last_reviewed_at!).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { timeZone: "UTC" }) : "—"}</td>
                    <td className="px-3 py-2"><TradeExternal url={d.official_url}>{t("Official link")}</TradeExternal></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <SourceLine name={g.source_name} url={g.source_url} date={g.last_verified_at} />
      <TradeInquiryCta />
    </TradeShell>
  );
}

/* ---------------- Inquiry form ---------------- */

export function TradeInquiryPage() {
  const { t } = useI18n();
  const id = useId();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<"success" | "error" | "invalid" | null>(null);
  return (
    <TradeShell title="Trade Inquiry" intro="Send an administrative inquiry about sourcing, exports or procedures.">
      {state === "success" ? (
        <div role="status" className="border-s-4 border-gold-line bg-bg-notice p-5 text-navy">
          {t("Your inquiry has been received. An administrator will respond.")}
          <Button className="ms-3 min-h-11" variant="outline" onClick={() => setState(null)}>{t("Send another")}</Button>
        </div>
      ) : (
        <form className="grid max-w-3xl gap-4" aria-label={t("Trade inquiry")} onSubmit={async (e) => {
          e.preventDefault();
          setState(null);
          const fd = new FormData(e.currentTarget);
          const str = (key: string) => String(fd.get(key) ?? "");
          const raw = { name: str("name"), email: str("email"), country: str("country"), organization: str("organization") || null, inquiry_topic: str("inquiry_topic"), message: str("message"), consent: fd.get("consent") === "on", consent_at: new Date().toISOString() };
          const parsed = tradeInquirySchema.safeParse(raw);
          if (!parsed.success) { setState("invalid"); return; }
          setPending(true);
          try {
            const res = await submitTradeInquiry({ data: parsed.data });
            setState(res.ok ? "success" : "error");
          } catch { setState("error"); } finally { setPending(false); }
        }}>
          <p className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm font-semibold text-navy">{t("Do not include financial, identity or medical data, passwords or confidential business documents.")}</p>
          <label htmlFor={`${id}-name`} className="grid gap-1 text-sm text-navy">{t("Full name")}<Input className="min-h-11" id={`${id}-name`} name="name" required maxLength={100} autoComplete="name" dir="auto" /></label>
          <label htmlFor={`${id}-email`} className="grid gap-1 text-sm text-navy">{t("Email")}<Input className="min-h-11" id={`${id}-email`} name="email" type="email" required maxLength={255} autoComplete="email" dir="ltr" /></label>
          <label htmlFor={`${id}-country`} className="grid gap-1 text-sm text-navy">{t("Country")}<Input className="min-h-11" id={`${id}-country`} name="country" required maxLength={100} dir="auto" /></label>
          <label htmlFor={`${id}-org`} className="grid gap-1 text-sm text-navy">{t("Organization (optional)")}<Input className="min-h-11" id={`${id}-org`} name="organization" maxLength={200} autoComplete="organization" dir="auto" /></label>
          <label htmlFor={`${id}-topic`} className="grid gap-1 text-sm text-navy">{t("Inquiry topic")}<select id={`${id}-topic`} name="inquiry_topic" className="min-h-11 rounded-md border border-input bg-background px-3">{INQUIRY_TOPICS.map((topic) => <option key={topic} value={topic}>{t(INQUIRY_TOPIC_LABELS[topic])}</option>)}</select></label>
          <label htmlFor={`${id}-message`} className="grid gap-1 text-sm text-navy">{t("Message")}<Textarea id={`${id}-message`} name="message" required maxLength={1500} rows={5} dir="auto" /><span className="text-xs text-text-body">{t("Maximum characters:")} 1500</span></label>
          <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed text-navy"><input className="mt-1 size-5 shrink-0 accent-primary" type="checkbox" name="consent" required />{t("I consent to Egyptora Hub using these contact details to respond to this administrative request.")}</label>
          {state && <p role="alert" className="text-sm text-destructive">{t(state === "invalid" ? "Please check the fields, message length and consent." : "Your request could not be saved. Please try again.")}</p>}
          <Button type="submit" className="min-h-11 justify-self-start" disabled={pending}><Send />{t(pending ? "Sending…" : "Send request")}</Button>
        </form>
      )}
    </TradeShell>
  );
}
