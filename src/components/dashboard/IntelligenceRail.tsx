import { BarChart3, Globe2, Star, TrendingUp, Users } from "lucide-react";
import worldDots from "@/assets/generated/ill-global-network.webp";
import { SourceBadge } from "@/components/site/Primitives";
import { useI18n } from "@/i18n";
import {
  monthlyVisitors,
  topCountries,
  topGovernorates,
  trendingExperiences,
  visitorPurpose,
} from "@/data/site";

const donutColors = [
  "var(--gold)",
  "var(--info)",
  "var(--success)",
  "var(--muted-foreground)",
];

function Donut() {
  const { t } = useI18n();
  let acc = 0;
  const stops = visitorPurpose
    .map((slice, i) => {
      const start = acc;
      acc += slice.value;
      return `${donutColors[i]} ${start}% ${acc}%`;
    })
    .join(", ");

  return (
    <div
      className="relative size-28 shrink-0 rounded-full"
      style={{ background: `conic-gradient(${stops})` }}
      role="img"
      aria-label={t("Visitors by purpose")}
    >
      <div className="absolute inset-[22%] grid place-items-center rounded-full bg-card text-center">
        <span className="text-[11px] leading-tight text-muted-foreground">
          1.25M
          <br />
          {t("visitors")}
        </span>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
  badge = "DEMO" as const,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: "DEMO" | "SIMULATED" | "PLANNED";
}) {
  const { t } = useI18n();
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
      <header className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h3 className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/85">
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{t(title)}</span>
        </h3>
        <SourceBadge status={badge} />
      </header>
      {children}
    </section>
  );
}

export function IntelligenceRail() {
  const { t } = useI18n();
  return (
    <aside className="grid gap-4">
      <Panel title="Egypt at a glance" icon={<Globe2 className="size-3.5" />}>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <img
            src={worldDots}
            alt={t("Illustrative world map of visitor origins")}
            loading="lazy"
            width={1024}
            height={512}
            className="h-32 w-full object-cover opacity-90"
          />
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { k: "Today", v: "45,678" },
            { k: "This month", v: "1.25M" },
            { k: "Top origin", v: "Saudi Arabia" },
          ].map((s) => (
            <div key={s.k} className="rounded-lg border border-border/60 bg-surface-2 px-2 py-2.5">
              <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{t(s.k)}</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-foreground">{s.v}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title="Visitor statistics" icon={<BarChart3 className="size-3.5" />}>
        <div className="flex items-center gap-4">
          <Donut />
          <ul className="min-w-0 flex-1 grid gap-1.5">
            {visitorPurpose.map((s, i) => (
              <li key={s.label} className="flex items-center gap-2 text-xs">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: donutColors[i] }}
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{t(s.label)}</span>
                <span className="shrink-0 font-semibold text-foreground">{s.value}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {t("Monthly visitors")}
          </p>
          <div className="flex h-24 items-end gap-2">
            {monthlyVisitors.map((m, i) => (
              <div key={m.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                <div
                  className={
                    i === monthlyVisitors.length - 1
                      ? "w-full rounded-t bg-gold"
                      : "w-full rounded-t bg-muted-foreground/35"
                  }
                  style={{ height: `${m.value}%` }}
                />
                <span className="text-[9px] text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Top origin markets" icon={<Users className="size-3.5" />}>
        <ul className="grid gap-2.5">
          {topCountries.map((c) => (
            <li key={c.name} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
              <span className="shrink-0 text-base">{c.flag}</span>
              <span className="min-w-0">
                <span className="block truncate text-xs text-foreground">{t(c.name)}</span>
                <span className="mt-1 block h-1.5 w-full rounded-full bg-surface-2">
                  <span
                    className="block h-1.5 rounded-full bg-gold"
                    style={{ width: `${(c.share / 18) * 100}%` }}
                  />
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">{c.share}%</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Top governorates" icon={<TrendingUp className="size-3.5" />}>
        <div className="flex h-28 items-end gap-2">
          {topGovernorates.map((g) => (
            <div key={g.name} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-gold/40 to-gold"
                style={{ height: `${g.value}%` }}
              />
              <span className="w-full truncate text-center text-[9px] text-muted-foreground">
                {t(g.name)}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Trending experiences" icon={<Star className="size-3.5" />}>
        <ul className="grid gap-3">
          {trendingExperiences.map((x, i) => (
            <li key={x.name} className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3">
              <span className="shrink-0 font-display text-sm text-gold">{i + 1}</span>
              <img
                src={x.image}
                alt={x.name}
                loading="lazy"
                width={64}
                height={48}
                className="size-12 shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-xs text-foreground">{x.name}</span>
                <span className="block text-[10px] text-muted-foreground">
                  ★ {x.rating} ({x.reviews})
                </span>
              </span>
              <span className="shrink-0 text-right text-xs">
                <span className="block text-[9px] uppercase text-muted-foreground">{t("From")}</span>
                <span className="font-semibold text-gold">{x.from}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </aside>
  );
}
