import { Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronRight, Copy, ExternalLink, Info, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SimplePage, simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { guideHubPath, type GuideHub } from "@/data/guideHubs";
import { useI18n } from "@/i18n";

type Num = { id: string; name_ar: string; name_en: string; number: string; dial_string: string | null; last_verified_at: string | null; category_id: string };
type App = { id: string; name_ar: string; name_en: string; publisher: string | null; description_ar: string | null; description_en: string | null; google_play_url: string | null; app_store_url: string | null; website_url: string | null; last_verified_at: string | null };
type Gov = { id: string; entity_name_en: string; entity_name_ar: string | null; description_en: string | null; official_url: string | null; verification_status: string | null };

/** Loads only public rows/columns; visibility is enforced by the database visitor rules. */
export async function loadGuideHub(hub: GuideHub) {
  const [numbers, apps, gov] = await Promise.all([
    hub.emergencyCategories.length
      ? supabase.from("emergency_categories").select("id").eq("is_active", true).in("slug", hub.emergencyCategories).then(async ({ data }) => {
          const ids = (data ?? []).map((c) => c.id);
          if (!ids.length) return [] as Num[];
          const r = await supabase
            .from("emergency_numbers")
            .select("id, category_id, name_ar, name_en, number, dial_string, last_verified_at")
            .eq("is_active", true).eq("status", "verified").in("category_id", ids).order("sort_order");
          return (r.data ?? []) as Num[];
        })
      : Promise.resolve([] as Num[]),
    hub.appCategories.length
      ? supabase.from("app_categories").select("id").eq("is_active", true).in("slug", hub.appCategories).then(async ({ data }) => {
          const ids = (data ?? []).map((c) => c.id);
          if (!ids.length) return [] as App[];
          const r = await supabase
            .from("egypt_apps")
            .select("id, name_ar, name_en, publisher, description_ar, description_en, google_play_url, app_store_url, website_url, last_verified_at")
            .eq("is_active", true).in("category_id", ids).order("sort_order");
          return (r.data ?? []) as App[];
        })
      : Promise.resolve([] as App[]),
    hub.government.length
      ? supabase
          .from("government_entities")
          .select("id, entity_name_en, entity_name_ar, description_en, official_url, verification_status")
          .in("entity_name_en", hub.government).order("sort_order")
          .then(({ data }) => {
            const seen = new Set<string>();
            return ((data ?? []) as Gov[]).filter((g) => !seen.has(g.entity_name_en) && !!seen.add(g.entity_name_en));
          })
      : Promise.resolve([] as Gov[]),
  ]);
  return { numbers, apps, gov };
}

export function guideHubHead(hub: GuideHub) {
  const base = simpleHead(guideHubPath(hub), `${hub.title.en} in Egypt | Egyptora Hub`, hub.intro.en, SITE.url);
  return { ...base, meta: [...base.meta, { name: "description:ar", content: hub.intro.ar }] };
}

const date = (d: string | null) => (d ? d.slice(0, 10) : null);

export function GuideHubPage({ hub, data }: { hub: GuideHub; data: Awaited<ReturnType<typeof loadGuideHub>> }) {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const pick = (en: string, arText?: string | null) => (ar && arText ? arText : en);
  const empty = !data.numbers.length && !data.apps.length && !data.gov.length;
  const card = "rounded-2xl border border-border bg-card p-5";
  const h2 = "font-display text-xl font-semibold text-navy";

  return (
    <SimplePage title={ar ? hub.title.ar : hub.title.en} intro={ar ? hub.intro.ar : hub.intro.en}>
      <p className="mb-8 flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-text-body">
        <Info className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden="true" />
        {ar
          ? "المعلومات مجمّعة من مصادر رسمية؛ يُرجى دائمًا التأكد من الجهة المختصة."
          : t("Information is compiled from official sources; always confirm with the relevant authority.")}
      </p>

      <div className="grid gap-10">
        {empty && (
          <section className={card}>
            <h2 className={h2}>{ar ? "لا توجد مدخلات موثقة بعد" : t("No verified entries yet")}</h2>
            <p className="mt-2 text-sm text-text-body">
              {ar ? "راجع الصفحات ذات الصلة أدناه." : t("See the related pages below.")}
            </p>
          </section>
        )}

        {data.numbers.length > 0 && (
          <section>
            <h2 className={h2}>{ar ? "أرقام مهمة" : t("Key numbers")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.numbers.map((n) => (
                <li key={n.id} className={card}>
                  <p className="font-semibold text-navy" dir="auto">{pick(n.name_en, n.name_ar)}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-navy" dir="ltr">{n.number}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={`tel:${n.dial_string || n.number}`} className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                      <Phone className="size-3.5" aria-hidden="true" /> {t("Call")}
                    </a>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(n.number).then(() => toast(t("Copied")), () => {})}
                      className="inline-flex items-center gap-1.5 rounded-full border border-navy px-3 py-1.5 text-xs font-semibold text-navy"
                    >
                      <Copy className="size-3.5" aria-hidden="true" /> {t("Copy")}
                    </button>
                  </div>
                  {date(n.last_verified_at) && (
                    <p className="mt-3 text-xs text-muted-foreground">{t("Last verified")}: <span dir="ltr">{date(n.last_verified_at)}</span></p>
                  )}
                </li>
              ))}
            </ul>
            <Link to="/emergency-numbers" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy underline">
              {ar ? "كل أرقام الطوارئ" : t("All emergency numbers")} <ChevronRight className="size-4 rtl:rotate-180" />
            </Link>
          </section>
        )}

        {data.apps.length > 0 && (
          <section>
            <h2 className={h2}>{ar ? "تطبيقات مفيدة" : t("Useful apps")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.apps.map((a) => (
                <li key={a.id} className={card}>
                  <p className="font-semibold text-navy" dir="auto">{pick(a.name_en, a.name_ar)}</p>
                  {a.publisher && <p className="text-xs text-muted-foreground" dir="auto">{a.publisher}</p>}
                  {pick(a.description_en ?? "", a.description_ar) && (
                    <p className="mt-2 line-clamp-3 text-sm text-text-body" dir="auto">{pick(a.description_en ?? "", a.description_ar)}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    {a.google_play_url && <a href={a.google_play_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy underline">Google Play <ExternalLink className="size-3" /></a>}
                    {a.app_store_url && <a href={a.app_store_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy underline">App Store <ExternalLink className="size-3" /></a>}
                    {a.website_url && <a href={a.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy underline">{t("Website")} <ExternalLink className="size-3" /></a>}
                  </div>
                  {date(a.last_verified_at) && (
                    <p className="mt-3 text-xs text-muted-foreground">{t("Last verified")}: <span dir="ltr">{date(a.last_verified_at)}</span></p>
                  )}
                </li>
              ))}
            </ul>
            <Link to="/egypt-apps" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy underline">
              {ar ? "كل التطبيقات" : t("All apps")} <ChevronRight className="size-4 rtl:rotate-180" />
            </Link>
          </section>
        )}

        {data.gov.length > 0 && (
          <section>
            <h2 className={h2}>{ar ? "الجهات الحكومية والرسمية" : t("Government & official bodies")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.gov.map((g) => (
                <li key={g.id} className={card}>
                  <p className="font-semibold text-navy" dir="auto">{pick(g.entity_name_en, g.entity_name_ar)}</p>
                  {!ar && g.description_en && <p className="mt-1 line-clamp-3 text-sm text-text-body">{g.description_en}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    {g.official_url && (
                      <a href={g.official_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy underline">
                        {ar ? "الموقع الرسمي" : t("Official website")} <ExternalLink className="size-3" />
                      </a>
                    )}
                    {g.verification_status && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <BadgeCheck className="size-3.5" aria-hidden="true" /> {t(g.verification_status)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className={h2}>{ar ? "صفحات ذات صلة" : t("Related pages")}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hub.related.map((r) => (
              <li key={r.to}>
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static config paths
                  to={r.to as any}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-navy hover:border-gold-line"
                >
                  {ar ? r.labelAr : t(r.label)} <ChevronRight className="size-4 shrink-0 rtl:rotate-180" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SimplePage>
  );
}
