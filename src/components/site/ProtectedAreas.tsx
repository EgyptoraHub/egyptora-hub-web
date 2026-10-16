import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Leaf } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Crumbs, innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { GenBanner, GenImage } from "@/components/site/GenImage";

const ECO_SLUG = ["ras-mohammed", "white-desert", "wadi-el-hitan", "saint-catherine", "siwa", "wadi-el-gemal", "lake-qarun", "zaranik"];
const ECO_HABITAT: [RegExp, string][] = [[/island|جزيرة|جزر/i, "eco-generic-island"], [/nile|نيل/i, "eco-generic-nile-island"], [/reef|marine|sea|bay|coral|بحر|مرجان|خليج/i, "eco-generic-marine"], [/lake|wetland|بحيرة|بردويل/i, "eco-generic-wetland"], [/mount|جبل|جبال/i, "eco-generic-mountain"], [/desert|wadi|oasis|صحراء|وادي|واحة/i, "eco-generic-desert"]];
/** Slug match first, then a habitat guess from the name; no match → no image. */
function ecoImage(a: ProtectedArea) {
  const s = ECO_SLUG.find((x) => a.slug.includes(x));
  if (s) return `eco-${s}`;
  const text = `${a.name_en ?? ""} ${a.name_ar}`;
  return ECO_HABITAT.find(([re]) => re.test(text))?.[1];
}
import { protectedTitle, type ProtectedArea } from "@/lib/protected-areas";

type Gov = { slug: string; name_en: string; name_ar: string };
const L = (lang: string, en: string, ar: string) => (lang === "ar" ? ar : en);

export function ProtectedAreasPage({ areas, governorates }: { areas: ProtectedArea[]; governorates: Gov[] }) {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const [gov, setGov] = useState("");
  const govName = useMemo(() => new Map(governorates.map((g) => [g.slug, ar ? g.name_ar : g.name_en])), [governorates, ar]);
  const govOptions = [...new Set(areas.map((a) => a.governorate_slug).filter((x): x is string => !!x))];
  const shown = areas.filter((a) => !gov || a.governorate_slug === gov);
  const num = (n: number) => new Intl.NumberFormat(ar ? "ar-EG" : "en-US").format(n);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Crumbs parent={{ label: "Explore Egypt", to: "/explore-egypt" }} page={L(lang, t("Protected Areas"), "المحميات الطبيعية")} />
      <section className="border-b border-border bg-bg-band">
        <div className={`${innerWrap} py-10`}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-shell-gold">
            <Leaf className="size-4" /> {L(lang, t("Eco & Nature Tourism"), "السياحة البيئية والطبيعية")}
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy sm:text-4xl">{L(lang, t("Protected Areas"), "المحميات الطبيعية")}</h1>
          <p className="mt-3 max-w-2xl text-sm text-text-body sm:text-base">
            {L(lang, t("Egypt's declared protected areas, each with its official source."), "المحميات الطبيعية المعلنة في مصر مع المصدر الرسمي لكل محمية.")}
          </p>
        </div>
      </section>

      <div className={`${innerWrap} pt-8`}><GenBanner k="banner-eco-nature" /></div>
      <main className={`${innerWrap} grid gap-10 py-10`}>
        {govOptions.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label={L(lang, t("Governorate"), "المحافظة")} value={gov} onChange={(e) => setGov(e.target.value)} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-navy">
              <option value="">{L(lang, t("All governorates"), "كل المحافظات")}</option>
              {govOptions.map((g) => <option key={g} value={g}>{govName.get(g) ?? g}</option>)}
            </select>
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => {
            const summary = ar ? a.summary_ar : a.summary_en;
            return (
              <article key={a.id} className="grid content-start gap-2 rounded-[10px] border border-border bg-card p-4 shadow-sm">
                <GenImage k={ecoImage(a)} className="aspect-[16/10] w-full rounded-2xl" />
                <h2 dir="auto" className="font-display text-base font-bold text-navy">{protectedTitle(a, lang)}</h2>
                <dl className="grid gap-1 text-xs text-text-body">
                  {a.governorate_slug ? (
                    <div><dt className="inline font-semibold">{L(lang, t("Governorate"), "المحافظة")}: </dt>
                      <dd className="inline"><Link to="/governorates/$id" params={{ id: a.governorate_slug }} className="text-shell-gold underline">{govName.get(a.governorate_slug) ?? a.governorate_slug}</Link></dd></div>
                  ) : null}
                  {a.declared_year ? <div><dt className="inline font-semibold">{L(lang, t("Declared"), "سنة الإعلان")}: </dt><dd className="inline">{a.declared_year}</dd></div> : null}
                  {a.area_km2 != null ? <div><dt className="inline font-semibold">{L(lang, t("Area"), "المساحة")}: </dt><dd className="inline">{num(Number(a.area_km2))} {L(lang, "km²", "كم²")}</dd></div> : null}
                </dl>
                {summary ? <p dir="auto" className="text-xs text-text-body">{summary}</p> : null}
                {a.source_url ? (
                  <p className="mt-auto pt-2 text-xs text-text-body">
                    {L(lang, t("Source"), "المصدر")}:{" "}
                    <a href={a.source_url} target="_blank" rel="noopener noreferrer" dir="auto" className="inline-flex items-center gap-1 font-semibold text-shell-gold underline">
                      {a.source_note || hostOf(a.source_url)} <ExternalLink className="size-3" />
                    </a>
                  </p>
                ) : a.source_note ? <p dir="auto" className="mt-auto pt-2 text-xs text-text-body">{L(lang, t("Source"), "المصدر")}: {a.source_note}</p> : null}
              </article>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function hostOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
