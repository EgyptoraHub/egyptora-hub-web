import { createFileRoute, Link } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { MilError, MilLoading, MilShell, RegisterNotice, SubNav, militaryCrumbs, useBi } from "@/components/military/MilitaryUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { loadMilitary } from "@/lib/military";

const title = "Historical Figures in Egypt's Military History | Egyptora Hub";
const description = "Rulers and commanders linked to records in the EGYPTORA military history register.";

export const Route = createFileRoute("/egypt-through-time_/military-history_/figures")({
  loader: () => loadMilitary(),
  head: () => simpleHead("/egypt-through-time/military-history/figures", title, description, SITE.url),
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  component: Figures,
});

function Figures() {
  const { figures, eras } = Route.useLoaderData();
  const { t } = useI18n();
  const bi = useBi();
  return (
    <MilShell crumbs={militaryCrumbs(t, [{ label: t("Historical figures") }])} title={t("Historical figures")}>
      <SubNav />
      <main className={cn(innerWrap, "grid grid-cols-[minmax(0,1fr)] gap-6 py-8")}>
        {figures.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-6 text-sm text-text-body">
            {t("Profiles of historical figures are under academic review and will be published here once checked.")}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {figures.map((f) => {
              const era = eras.find((e) => e.id === f.era_id);
              return (
                <li key={f.id} className="flex">
                  <Link
                    to="/egypt-through-time/military-history/figures/$slug"
                    params={{ slug: f.slug }}
                    className="flex w-full flex-col gap-1 rounded-2xl border border-border bg-card p-4 hover:border-gold-line"
                  >
                    <span className="text-base font-semibold text-navy" dir="auto">{bi(f, "name")}</span>
                    {bi(f, "role") && <span className="text-xs text-text-body" dir="auto">{bi(f, "role")}</span>}
                    {era && <span className="text-xs text-text-body" dir="auto">{bi(era, "name")}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <RegisterNotice />
      </main>
    </MilShell>
  );
}
