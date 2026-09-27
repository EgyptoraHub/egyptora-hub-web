import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SimplePage, simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

/** Experience collections backed by real `destinations.category` tags only. */
const TYPES = {
  beaches: {
    title: "Beaches & Water Sports",
    intro: "Coastal destinations along the Red Sea and Mediterranean.",
    categories: ["coast"],
    note: null as string | null,
  },
  desert: {
    title: "Desert Safari & Adventure",
    intro: "Desert landscapes and oases across Egypt's Western Desert and Sinai.",
    categories: ["desert", "oasis"],
    note: null as string | null,
  },
  "nile-cruises": {
    title: "Nile Cruises",
    intro: "Nile destinations to explore by river.",
    categories: ["nile"],
    note: "This is a small starting list — more Nile destinations will be added over time. Cruise booking is not available yet.",
  },
} as const;

type TypeKey = keyof typeof TYPES;

type Row = { id: string; name: string; category: string; summary: string | null; images: string[] | null; governorate_slug: string | null };

export const Route = createFileRoute("/experiences/$type")({
  loader: async ({ params }) => {
    const cfg = TYPES[params.type as TypeKey];
    if (!cfg) throw notFound();
    const { data } = await supabase
      .from("destinations")
      .select("id, name, category, summary, images, governorate_slug")
      .in("category", [...cfg.categories])
      .order("name");
    return { type: params.type as TypeKey, rows: (data ?? []) as Row[] };
  },
  head: ({ params }) => {
    const cfg = TYPES[params.type as TypeKey];
    if (!cfg) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const title = `${cfg.title} in Egypt | Egyptora Hub`;
    return simpleHead(`/experiences/${params.type}`, title, cfg.intro, SITE.url);
  },
  component: ExperiencePage,
});

function ExperiencePage() {
  const { type, rows } = Route.useLoaderData();
  const cfg = TYPES[type];
  const { t } = useI18n();
  return (
    <SimplePage title={cfg.title} intro={cfg.intro}>
      {cfg.note && (
        <p className="mb-6 rounded-lg border border-border bg-bg-band px-4 py-3 text-sm text-text-body">{t(cfg.note)}</p>
      )}
      <p className="mb-4 text-sm text-muted-foreground">{rows.length} {t("destinations")}</p>
      {rows.length === 0 ? (
        <p className="text-text-body">{t("No destinations are published here yet.")}</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((d) => {
            const img = d.images?.[0];
            const body = (
              <article className="flex h-full flex-col overflow-hidden rounded-[10px] border border-border bg-card shadow-sm">
                {img ? (
                  <img src={img} alt={d.name} loading="lazy" className="h-40 w-full object-cover" />
                ) : (
                  <div className="grid h-40 place-items-center bg-muted"><MapPin className="size-8 text-navy/40" /></div>
                )}
                <div className="p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-shell-gold">{t(d.category)}</span>
                  <h2 className="mt-1 font-display text-lg font-bold text-navy">{t(d.name)}</h2>
                  {d.summary && <p className="mt-1 line-clamp-3 text-sm text-text-body">{t(d.summary)}</p>}
                </div>
              </article>
            );
            return d.governorate_slug ? (
              <Link key={d.id} to="/governorates/$id" params={{ id: d.governorate_slug }} className="block">{body}</Link>
            ) : (
              <div key={d.id}>{body}</div>
            );
          })}
        </div>
      )}
    </SimplePage>
  );
}
