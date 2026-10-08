import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { MilError, MilLoading, MilShell } from "@/components/military/MilitaryUI";
import { CultureCard } from "@/components/culture/CultureUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { loadGovernorateCulture, type CultureItem } from "@/lib/culture";

const title = "Know Your Roots — explore Egypt's 27 governorates | Egyptora Hub";
const description =
  "For Egyptians in Egypt and abroad: explore each governorate's profile, heritage sites, museums, places and local culture.";

type Gov = { slug: string; name: string; name_ar: string; summary: string | null };
type Named = { id: string; name: string };

const searchSchema = z.object({ gov: z.string().optional() });

export const Route = createFileRoute("/know-your-roots")({
  validateSearch: (s) => searchSchema.parse(s),
  loaderDeps: ({ search }) => ({ gov: search.gov }),
  loader: async ({ deps }) => {
    const { data } = await supabase.from("governorates").select("slug, name, name_ar, summary").order("name");
    const govs = (data ?? []) as Gov[];
    const g = deps.gov && govs.some((x) => x.slug === deps.gov) ? deps.gov : null;
    if (!g) return { govs, selected: null };
    const [heritage, museums, places, culture] = await Promise.all([
      supabase.from("heritage_sites").select("id, name").eq("governorate_slug", g).order("name").limit(12),
      supabase.from("museums").select("id, name").eq("governorate_slug", g).order("name").limit(12),
      supabase.from("destinations").select("id, name").eq("governorate_slug", g).order("name").limit(12),
      loadGovernorateCulture(g).catch(() => [] as CultureItem[]),
    ]);
    return {
      govs,
      selected: {
        slug: g,
        heritage: (heritage.data ?? []) as Named[],
        museums: (museums.data ?? []) as Named[],
        places: (places.data ?? []) as Named[],
        culture,
      },
    };
  },
  head: () => simpleHead("/know-your-roots", title, description, SITE.url),
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  component: KnowYourRoots,
});

/** Config-driven tool cards: add future "roots" tools here. `planned` cards never collect data. */
const ROOTS_TOOLS: { title: string; body: string; to?: string; planned?: boolean }[] = [
  { title: "Egyptian Heritage Worldwide", body: "Egyptian objects and collections held in museums around the world.", to: "/egyptian-heritage-worldwide" },
  { title: "Government Directory", body: "Official bodies, including the ministry responsible for Egyptians abroad.", to: "/government-directory" },
  { title: "Egypt Through Time", body: "The eras and regions of Egyptian history.", to: "/egypt-through-time" },
  { title: "Family roots tools", body: "Family tree, surname and place-name origins — planned for a later phase.", planned: true },
];

function Block({ heading, items, to }: { heading: string; items: Named[]; to: string }) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm font-bold text-navy">{t(heading)}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-text-body">{t("Nothing listed for this governorate yet.")}</p>
      ) : (
        <ul className="mt-2 grid gap-1 text-sm text-text-body">
          {items.map((i) => <li key={i.id} dir="auto">{t(i.name)}</li>)}
        </ul>
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- static paths */}
      <Link to={to as any} className="mt-3 inline-block text-xs font-semibold text-navy underline">{t("View all")} ›</Link>
    </div>
  );
}

function KnowYourRoots() {
  const { govs, selected } = Route.useLoaderData();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const gname = (g: Gov) => (lang === "ar" ? g.name_ar : t(g.name));
  const sel = selected ? govs.find((g) => g.slug === selected.slug) : undefined;

  return (
    <MilShell
      crumbs={[{ label: t("Know Your Roots") }]}
      title={<>{t("Know Your Roots")} <span lang="ar" dir="rtl" className="ms-3 inline-block text-lg font-normal opacity-85 lg:text-2xl">اعرف أصولك</span></>}
      subtitle={t("For Egyptians in Egypt and abroad: pick a governorate to explore its places, heritage and local culture.")}
    >
      <main className={cn(innerWrap, "grid gap-10 py-8")}>
        <section className="grid gap-3">
          <h2 className="font-display text-xl font-bold text-navy">{t("Choose a governorate")}</h2>
          <ul className="flex flex-wrap gap-2">
            {govs.map((g) => (
              <li key={g.slug}>
                <button
                  type="button"
                  aria-pressed={selected?.slug === g.slug}
                  onClick={() => void navigate({ to: ".", search: { gov: g.slug }, replace: true })}
                  className={cn(
                    "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors",
                    selected?.slug === g.slug ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy hover:border-gold-line",
                  )}
                >
                  {gname(g)}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {selected && sel && (
          <section className="grid gap-4" aria-live="polite">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">{gname(sel)}</h2>
                {sel.summary && <p className="mt-1 max-w-3xl text-sm text-text-body">{t(sel.summary)}</p>}
              </div>
              <Link to="/governorates/$id" params={{ id: sel.slug }} className="min-h-11 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-primary-foreground">
                {t("Open governorate page")}
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Block heading="Heritage sites" items={selected.heritage} to="/heritage-sites" />
              <Block heading="Museums" items={selected.museums} to="/museums" />
              <Block heading="Famous places" items={selected.places} to={`/governorates/${sel.slug}`} />
            </div>
            {selected.culture.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-navy">{t("Local culture")}</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selected.culture.map((c) => <CultureCard key={c.id} r={c} />)}
                </ul>
              </div>
            )}
            <Link to="/egypt-through-time" className="text-sm font-semibold text-navy underline">{t("Eras of this region — Egypt Through Time")} ›</Link>
          </section>
        )}

        <section className="grid gap-4">
          <h2 className="font-display text-xl font-bold text-navy">{t("Egyptians abroad & more")}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROOTS_TOOLS.map((c) => (
              <li key={c.title} className="flex">
                {c.to ? (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static paths
                  <Link to={c.to as any} className="flex w-full flex-col gap-1 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-gold-line">
                    <span className="text-base font-semibold text-navy">{t(c.title)}</span>
                    <span className="text-xs text-text-body">{t(c.body)}</span>
                  </Link>
                ) : (
                  <div className="flex w-full flex-col gap-1 rounded-2xl border border-dashed border-border bg-bg-alt p-4">
                    <span className="w-fit rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy">{t("Planned")}</span>
                    <span className="text-base font-semibold text-navy">{t(c.title)}</span>
                    <span className="text-xs text-text-body">{t(c.body)}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <div className="rounded-[10px] border border-info/25 bg-bg-notice p-4 text-xs leading-relaxed text-navy" role="note">
          <p lang="en" dir="ltr">Governorate information is drawn from existing EGYPTORA pages. EGYPTORA is an independent private platform, not a governmental body.</p>
          <p lang="ar" dir="rtl" className="mt-2">معلومات المحافظات مأخوذة من صفحات إيجبتورا الحالية. إيجبتورا منصة خاصة مستقلة وليست جهة حكومية.</p>
        </div>
      </main>
    </MilShell>
  );
}
