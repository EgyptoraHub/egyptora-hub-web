import { useMemo, useState } from "react";
import { ExternalLink, Factory } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { NavyBadge, innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { ZONE_TYPE_LABEL, zoneTitle, type EconomicZone, type ZoneFact } from "@/lib/economic-zones";

type Gov = { slug: string; name_en: string; name_ar: string };

const COPY = {
  industrial: {
    en: { title: "Industrial Zones", intro: "A directory of industrial zones in Egypt, with the managing body and the official source for each entry." },
    ar: { title: "المناطق الصناعية", intro: "دليل للمناطق الصناعية في مصر مع جهة الإدارة والمصدر الرسمي لكل منطقة." },
  },
  free: {
    en: { title: "Free Zones", intro: "A directory of public free zones and Suez Canal Economic Zone industrial zones, with the official source for each entry." },
    ar: { title: "المناطق الحرة", intro: "دليل للمناطق الحرة العامة والمناطق الصناعية بالمنطقة الاقتصادية لقناة السويس مع المصدر الرسمي لكل منطقة." },
  },
} as const;

const NOTE = {
  en: "Information is compiled from official sources and may change; always confirm with the relevant authority.",
  ar: "المعلومات مجمّعة من مصادر رسمية وقد تتغير؛ يُرجى دائمًا التأكد من الجهة المختصة.",
};

const L = (lang: string, en: string, ar: string) => (lang === "ar" ? ar : en);

export function EconomicZonesPage({ page, zones, facts, governorates }: { page: "industrial" | "free"; zones: EconomicZone[]; facts: ZoneFact[]; governorates: Gov[] }) {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const copy = ar ? COPY[page].ar : COPY[page].en;
  const [gov, setGov] = useState("");
  const [type, setType] = useState("");
  const govName = useMemo(() => new Map(governorates.map((g) => [g.slug, ar ? g.name_ar : g.name_en])), [governorates, ar]);
  const govOptions = [...new Set(zones.map((z) => z.governorate_slug).filter((x): x is string => !!x))];
  const typeOptions = [...new Set(zones.map((z) => z.zone_type))];
  const shown = zones.filter((z) => (!gov || z.governorate_slug === gov) && (!type || z.zone_type === type));
  const typeLabel = (k: string) => (ZONE_TYPE_LABEL[k] ? (ar ? ZONE_TYPE_LABEL[k].ar : t(ZONE_TYPE_LABEL[k].en)) : k.replace(/_/g, " "));
  const selectCls = "rounded-full border border-border bg-card px-4 py-2 text-sm text-navy";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="border-b border-border bg-bg-band">
        <div className={`${innerWrap} py-10`}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-shell-gold">
            <Factory className="size-4" /> {t("Do Business")}
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">{ar ? copy.title : t(copy.title)}</h1>
          <p className="mt-3 max-w-2xl text-sm text-text-body sm:text-base">{ar ? copy.intro : t(copy.intro)}</p>
          <p className="mt-4 max-w-2xl rounded-[10px] border border-border bg-card p-3 text-xs text-text-body">{ar ? NOTE.ar : t(NOTE.en)}</p>
        </div>
      </section>

      <main className={`${innerWrap} grid gap-10 py-10`}>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label={L(lang, t("Governorate"), "المحافظة")} value={gov} onChange={(e) => setGov(e.target.value)} className={selectCls}>
            <option value="">{L(lang, t("All governorates"), "كل المحافظات")}</option>
            {govOptions.map((g) => <option key={g} value={g}>{govName.get(g) ?? g}</option>)}
          </select>
          {typeOptions.length > 1 ? (
            <select aria-label={L(lang, t("Zone type"), "نوع المنطقة")} value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
              <option value="">{L(lang, t("All zone types"), "كل الأنواع")}</option>
              {typeOptions.map((k) => <option key={k} value={k}>{typeLabel(k)}</option>)}
            </select>
          ) : null}
        </div>

        {shown.length === 0 ? (
          <p className="rounded-[10px] border border-border bg-bg-band p-6 text-center text-sm text-text-body">{L(lang, t("No zones match these filters."), "لا توجد مناطق تطابق هذه الاختيارات.")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((z) => {
              const managing = ar ? z.managing_body_ar || z.managing_body_en : z.managing_body_en || z.managing_body_ar;
              const summary = ar ? z.summary_ar : z.summary_en;
              return (
                <article key={z.id} className="grid content-start gap-2 rounded-[10px] border border-border bg-card p-4 shadow-sm">
                  <span><NavyBadge>{typeLabel(z.zone_type)}</NavyBadge></span>
                  <h2 dir="auto" className="font-display text-base font-bold text-navy">{zoneTitle(z, lang)}</h2>
                  <dl className="grid gap-1 text-xs text-text-body">
                    {z.governorate_slug ? <div><dt className="inline font-semibold">{L(lang, t("Governorate"), "المحافظة")}: </dt><dd className="inline">{govName.get(z.governorate_slug) ?? z.governorate_slug}</dd></div> : null}
                    {z.listed_under ? <div><dt className="inline font-semibold">{L(lang, t("Listed under"), "مدرجة ضمن")}: </dt><dd dir="auto" className="inline">{z.listed_under}</dd></div> : null}
                    {managing ? <div><dt className="inline font-semibold">{L(lang, t("Managing body"), "جهة الإدارة")}: </dt><dd dir="auto" className="inline">{managing}</dd></div> : null}
                  </dl>
                  {summary ? <p dir="auto" className="text-xs text-text-body">{summary}</p> : null}
                  <SourceLine lang={lang} url={z.source_url} date={z.last_verified_at} dateLabel={L(lang, t("Last verified"), "آخر تحقق")} />
                </article>
              );
            })}
          </div>
        )}

        {facts.length > 0 ? (
          <section>
            <h2 className="mb-4 border-b border-border pb-2 font-display text-xl font-bold text-navy">{L(lang, t("Facts"), "حقائق")}</h2>
            <ul className="grid gap-3">
              {facts.map((f) => {
                const text = ar ? f.text_ar || f.text_en : f.text_en || f.text_ar;
                return (
                  <li key={f.id} className="rounded-[10px] border border-border bg-card p-4 text-sm text-navy">
                    <p dir="auto">{text}</p>
                    <p className="mt-2 text-xs text-text-body">
                      {L(lang, t("Source"), "المصدر")}:{" "}
                      {f.source_url ? <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-shell-gold underline">{f.source_name || f.source_url}</a> : <span>{f.source_name}</span>}
                      {f.source_date ? <> · {f.source_date}</> : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

function SourceLine({ lang, url, date, dateLabel }: { lang: string; url: string | null; date: string | null; dateLabel: string }) {
  if (!url && !date) return null;
  let host = "";
  try { host = url ? new URL(url).hostname.replace(/^www\./, "") : ""; } catch { host = url ?? ""; }
  return (
    <p className="mt-auto pt-2 text-xs text-text-body">
      {url ? (
        <>
          {L(lang, "Source", "المصدر")}:{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-shell-gold underline">
            {host} <ExternalLink className="size-3" />
          </a>
        </>
      ) : null}
      {url && date ? " · " : null}
      {date ? <>{dateLabel}: {date}</> : null}
    </p>
  );
}
