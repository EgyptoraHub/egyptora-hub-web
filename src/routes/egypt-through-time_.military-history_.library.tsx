import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { MilError, MilLoading, MilShell, RegisterNotice, SubNav, militaryCrumbs } from "@/components/military/MilitaryUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { loadMilitary, type MilSource } from "@/lib/military";

const title = "Library & References — Egypt's Military History | Egyptora Hub";
const description = "Primary, scholarly and institutional sources used in the EGYPTORA military history register.";

export const Route = createFileRoute("/egypt-through-time_/military-history_/library")({
  loader: () => loadMilitary(),
  head: () => simpleHead("/egypt-through-time/military-history/library", title, description, SITE.url),
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  component: Library,
});

const KINDS: { k: MilSource["kind"]; label: string }[] = [
  { k: "primary", label: "Primary sources" },
  { k: "scholarly", label: "Scholarly works" },
  { k: "institutional", label: "Institutional collections" },
];

function Library() {
  const { sources } = Route.useLoaderData();
  const { t } = useI18n();
  return (
    <MilShell crumbs={militaryCrumbs(t, [{ label: t("Library") }])} title={t("Library & references")}>
      <SubNav />
      <main className={cn(innerWrap, "grid grid-cols-[minmax(0,1fr)] gap-8 py-8")}>
        {sources.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-6 text-sm text-text-body">
            {t("The reference library is being compiled as part of the academic review and will appear here once sources are checked.")}
          </p>
        ) : (
          KINDS.filter(({ k }) => sources.some((s) => s.kind === k)).map(({ k, label }) => (
            <section key={k}>
              <h2 className="font-display text-xl font-bold text-navy">{t(label)}</h2>
              <ul className="mt-3 grid gap-2 text-sm text-text-body">
                {sources.filter((s) => s.kind === k).map((s) => (
                  <li key={s.id} className="rounded-xl border border-border bg-card p-4" dir="auto">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline">{s.title}</a>
                    ) : (
                      <span className="font-semibold text-navy">{s.title}</span>
                    )}
                    {[s.author, s.publisher, s.year].filter(Boolean).length > 0 && (
                      <span> — {[s.author, s.publisher, s.year].filter(Boolean).join(", ")}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
        <RegisterNotice />
      </main>
    </MilShell>
  );
}
