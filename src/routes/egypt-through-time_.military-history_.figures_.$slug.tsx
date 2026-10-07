import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE } from "@/config/site";
import {
  MilError, MilLoading, MilNotFound, MilShell, RecordCard, RegisterNotice, SubNav, militaryCrumbs, useBi,
} from "@/components/military/MilitaryUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { loadFigureRecords, loadMilitary } from "@/lib/military";

export const Route = createFileRoute("/egypt-through-time_/military-history_/figures_/$slug")({
  loader: async ({ params }) => {
    const data = await loadMilitary();
    const figure = data.figures.find((f) => f.slug === params.slug);
    if (!figure) throw notFound();
    const recordIds = await loadFigureRecords(figure.id);
    return { ...data, figure, recordIds };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Figure not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.figure.name_en} — Egypt's Military History | Egyptora Hub`;
    const description = `${loaderData.figure.name_en}: profile and linked records in the EGYPTORA military history register.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `${SITE.url}/egypt-through-time/military-history/figures/${params.slug}` },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  notFoundComponent: () => <MilNotFound />,
  component: Figure,
});

function Figure() {
  const { figure: f, eras, records, recordIds } = Route.useLoaderData();
  const { t } = useI18n();
  const bi = useBi();
  const era = eras.find((e) => e.id === f.era_id);
  const linked = records.filter((r) => recordIds.includes(r.id));
  return (
    <MilShell
      crumbs={militaryCrumbs(t, [{ label: t("Historical figures"), to: "/egypt-through-time/military-history/figures" }, { label: bi(f, "name") }])}
      title={bi(f, "name")}
      subtitle={[bi(f, "role"), bi(f, "years_label"), era ? bi(era, "name") : ""].filter(Boolean).join(" · ")}
    >
      <SubNav />
      <main className={cn(innerWrap, "grid grid-cols-[minmax(0,1fr)] gap-6 py-8")}>
        {bi(f, "bio") && <p className="max-w-3xl text-sm leading-relaxed text-text-body" dir="auto">{bi(f, "bio")}</p>}
        {linked.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-bold text-navy">{t("Linked records")}</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {linked.map((r) => <RecordCard key={r.id} r={r} era={eras.find((e) => e.id === r.era_id)} />)}
            </ul>
          </section>
        )}
        <RegisterNotice />
      </main>
    </MilShell>
  );
}
