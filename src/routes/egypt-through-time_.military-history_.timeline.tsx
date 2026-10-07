import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { MilError, MilLoading, MilShell, RecordCard, RegisterNotice, SubNav, militaryCrumbs, useBi } from "@/components/military/MilitaryUI";
import { innerWrap } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { loadMilitary, recordCount } from "@/lib/military";

const title = "Military History Timeline by Era | Egyptora Hub";
const description = "Fifteen eras of Egypt's military history on one timeline, with the published register records for each era.";

export const Route = createFileRoute("/egypt-through-time_/military-history_/timeline")({
  validateSearch: (s) => z.object({ era: z.string().optional() }).parse(s),
  loader: () => loadMilitary(),
  head: () => simpleHead("/egypt-through-time/military-history/timeline", title, description, SITE.url),
  pendingComponent: MilLoading,
  errorComponent: () => <MilError />,
  component: Timeline,
});

function Timeline() {
  const { eras, records } = Route.useLoaderData();
  const { era: eraSlug } = Route.useSearch();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const bi = useBi();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = eras.find((e) => e.slug === eraSlug) ?? eras[0];
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of records) m.set(r.era_id, (m.get(r.era_id) ?? 0) + 1);
    return m;
  }, [records]);
  const pick = (slug: string) => void navigate({ to: ".", search: { era: slug }, replace: true, resetScroll: false });

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const rtl = lang === "ar";
    let next = i;
    if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) next = Math.min(eras.length - 1, i + 1);
    else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) next = Math.max(0, i - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = eras.length - 1;
    else return;
    e.preventDefault();
    tabs.current[next]?.focus();
    pick(eras[next]!.slug);
  };

  const list = selected ? records.filter((r) => r.era_id === selected.id).sort((a, b) => a.register_no - b.register_no) : [];

  return (
    <MilShell crumbs={militaryCrumbs(t, [{ label: t("Timeline") }])} title={t("Timeline of eras")}>
      <SubNav />
      <main className={cn(innerWrap, "grid grid-cols-[minmax(0,1fr)] gap-8 py-8")}>
        <div role="tablist" aria-label={t("Eras")} className="relative flex gap-0 overflow-x-auto pb-3">
          <div className="pointer-events-none absolute inset-x-0 top-[22px] h-0.5 bg-border" aria-hidden="true" />
          {eras.map((e, i) => {
            const active = e.id === selected?.id;
            return (
              <button
                key={e.id}
                ref={(el) => { tabs.current[i] = el; }}
                role="tab"
                id={`tab-${e.slug}`}
                aria-selected={active}
                aria-controls="era-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => pick(e.slug)}
                onKeyDown={(ev) => onKey(ev, i)}
                className="relative flex w-40 shrink-0 flex-col items-center gap-2 px-2 text-center focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "z-10 grid size-11 place-items-center rounded-full border-2 text-sm font-bold",
                    active ? "border-navy bg-navy text-primary-foreground" : "border-border bg-background text-navy",
                  )}
                >
                  {e.number.toLocaleString(lang === "ar" ? "ar-EG" : "en")}
                </span>
                <span className={cn("line-clamp-2 text-xs font-semibold", active ? "text-navy" : "text-text-body")} dir="auto">{bi(e, "name")}</span>
                <span className="text-[11px] text-text-body" dir="auto">{bi(e, "start_label")}</span>
              </button>
            );
          })}
        </div>

        {selected && (
          <section id="era-panel" role="tabpanel" aria-labelledby={`tab-${selected.slug}`} className="grid gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy" dir="auto">{bi(selected, "name")}</h2>
              <p className="mt-1 text-sm text-text-body" dir="auto">{bi(selected, "start_label")} · {recordCount(counts.get(selected.id) ?? 0, lang)}</p>
              {bi(selected, "rulers") && (
                <p className="mt-3 text-sm text-text-body" dir="auto"><span className="font-semibold text-navy">{t("Rulers")}: </span>{bi(selected, "rulers")}</p>
              )}
              {bi(selected, "key_leadership") && (
                <p className="mt-1 text-sm text-text-body" dir="auto"><span className="font-semibold text-navy">{t("Key leadership")}: </span>{bi(selected, "key_leadership")}</p>
              )}
              {bi(selected, "intro") && <p className="mt-3 text-sm text-text-body" dir="auto">{bi(selected, "intro")}</p>}
            </div>
            {list.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card p-6 text-sm text-text-body">{t("No records from this era have been published yet.")}</p>
            ) : (
              <ol className="grid gap-3 border-s-2 border-border ps-4">
                {list.map((r) => <RecordCard key={r.id} r={r} />)}
              </ol>
            )}
          </section>
        )}
        <RegisterNotice />
      </main>
    </MilShell>
  );
}
