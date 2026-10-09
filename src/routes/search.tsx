import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmartLink, NavyBadge, innerWrap } from "@/components/layout/InnerPage";
import { askConcierge } from "@/components/layout/MainNav";
import { staticSearchIndex, type SearchEntry } from "@/data/search-index.generated";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

const title = "Search | Egyptora Hub";
const description = "Search destinations, investment, living, business, government services and real estate across Egyptora Hub.";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q: string } => ({
    q: typeof search["q"] === "string" ? search["q"] : search["q"] != null ? String(search["q"]) : "",
  }),
  loader: async () => {
    const gov: SearchEntry[] = [];
    try {
      const { data } = await supabase
        .from("government_entities")
        .select("entity_name_en, entity_name_ar, description_en, category_en, official_url")
        .order("sort_order");
      for (const e of data ?? []) {
        gov.push({
          title: e.entity_name_en,
          desc: [e.entity_name_ar, e.description_en].filter(Boolean).join(" — "),
          tag: e.category_en,
          to: e.official_url || "/government-directory#all-entities",
          category: "Government Services",
          page: "/government-directory",
        });
      }
    } catch (err) {
      console.error("[search] government entities failed:", err);
    }
    return { gov };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/search` }],
  }),
  component: SearchPage,
});

const ORDER = ["Destinations", "Travel & Tourism", "Investment", "Business", "Living in Egypt", "Government Services", "Digital Services", "Real Estate", "Home"];

function score(e: SearchEntry, terms: string[]) {
  const t = e.title.toLowerCase();
  const rest = `${e.desc} ${e.tag} ${e.category}`.toLowerCase();
  let s = 0;
  for (const term of terms) {
    if (t.includes(term)) s += 3;
    else if (rest.includes(term)) s += 1;
    else return 0;
  }
  return s;
}

function SearchPage() {
  const { q } = Route.useSearch();
  const { gov } = Route.useLoaderData();
  const { t } = useI18n();
  const navigate = useNavigate({ from: "/search" });
  const [input, setInput] = useState(q);

  const groups = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter((x) => x.length > 1);
    if (!terms.length) return [];
    const map = new Map<string, { e: SearchEntry; s: number }[]>();
    const seen = new Set<string>();
    for (const e of [...staticSearchIndex, ...gov]) {
      const s = score(e, terms);
      const key = `${e.title}|${e.to}`;
      if (!s || seen.has(key)) continue;
      seen.add(key);
      const list = map.get(e.category) ?? [];
      list.push({ e, s });
      map.set(e.category, list);
    }
    return [...map.entries()]
      .sort((a, b) => ORDER.indexOf(a[0]) - ORDER.indexOf(b[0]))
      .map(([cat, list]) => ({ cat, items: list.sort((a, b) => b.s - a.s).map((x) => x.e) }));
  }, [q, gov]);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className={`${innerWrap} py-10`}>
        <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
          {q ? <>{t("Search Results for")} “{q}”</> : t("Search")}
        </h1>
        {q ? <p className="mt-2 text-sm text-text-body">{total} {t("results")}</p> : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ search: { q: input.trim() } });
          }}
          className="mt-5 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm"
        >
          <Search className="ms-3 size-4 shrink-0 text-text-body" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("What are you looking for in Egypt?")}
            aria-label={t("Search")}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-navy outline-none placeholder:text-text-body"
          />
          <button type="submit" className="shrink-0 rounded-full bg-gold-cta px-5 py-2 text-sm font-semibold text-primary-foreground">
            {t("Search")}
          </button>
        </form>

        {groups.length === 0 ? (
          <div className="mt-10 rounded-[10px] border border-border bg-bg-band p-8 text-center">
            <p className="font-display text-xl font-bold text-navy">
              {q ? t("No results found") : t("Type something to search the whole site")}
            </p>
            <p className="mt-2 text-sm text-text-body">{t("Can't find what you're looking for?")}</p>
            <button
              type="button"
              onClick={() => askConcierge(q)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold-cta px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Sparkles className="size-4" /> {t("Ask our AI Concierge")} <ArrowRight className="size-4 rtl:rotate-180" />
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-10">
            {groups.map((g) => (
              <section key={g.cat}>
                <div className="mb-4 flex items-center gap-3 border-b border-border pb-2">
                  <h2 className="font-display text-xl font-bold text-navy">{t(g.cat)}</h2>
                  <span className="text-xs text-text-body">{g.items.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {g.items.map((e) => (
                    <SmartLink
                      key={`${e.title}|${e.to}`}
                      to={e.to}
                      className="group flex items-start gap-3 rounded-[10px] border border-border bg-card p-4 shadow-sm transition-colors hover:border-shell-gold"
                    >
                      <span className="grid min-w-0 flex-1 gap-1.5">
                        {e.tag ? <span><NavyBadge>{t(e.tag)}</NavyBadge></span> : null}
                        <span className="font-display text-base font-bold text-navy">{t(e.title)}</span>
                        {e.desc ? <span className="line-clamp-2 text-xs text-text-body">{t(e.desc)}</span> : null}
                      </span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gold-cta text-primary-foreground">
                        <ArrowRight className="size-4 rtl:rotate-180" />
                      </span>
                    </SmartLink>
                  ))}
                </div>
              </section>
            ))}
            <p className="text-sm text-text-body">
              {t("Can't find what you're looking for?")}{" "}
              <button type="button" onClick={() => askConcierge(q)} className="font-semibold text-shell-gold underline">
                {t("Ask our AI Concierge")} →
              </button>
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
