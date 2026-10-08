import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Shield } from "lucide-react";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { MilShell } from "@/components/military/MilitaryUI";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { innerWrap, cardGrid, PhotoCard } from "@/components/layout/InnerPage";
import { encChapters as chapters } from "@/data/encyclopedia";

const title = "Egypt Through Time | Egyptora Hub";
const description = "Explore Egypt's eras, rulers and military history in one place — an independent editorial guide.";

export const Route = createFileRoute("/egypt-through-time")({
  head: () => simpleHead("/egypt-through-time", title, description, SITE.url),
  component: Hub,
});

/** Encyclopedia chapters promoted here; the genome chapter is deliberately excluded until reviewed. */
const ENC_CHAPTERS = ["food", "dress", "crafts", "epics", "provinces", "symbols", "film"];

/** Cards link only to pages that exist today. */
const CARDS = [
  { to: "/encyclopedia", Icon: Crown, label: "Eras & Rulers", body: "Egypt's eras and the rulers documented for each, in the visual encyclopedia." },
  { to: "/egypt-through-time/military-history", Icon: Shield, label: "Military History", body: "An editorial register of battles, campaigns and operations, organised by era and under academic review." },
] as const;

function Hub() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const cards = CARDS.filter((c) => !needle || `${t(c.label)} ${t(c.body)} ${c.label}`.toLowerCase().includes(needle));
  return (
    <MilShell
      crumbs={[{ label: t("Egypt Through Time") }]}
      title={t("Egypt Through Time")}
      subtitle={t("Eras, rulers and military history — sections of an independent editorial guide to Egypt's past.")}
      search={{ value: q, onChange: setQ, placeholder: t("Search sections") }}
    >
      <main className={cn(innerWrap, "py-10")}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ to, Icon, label, body }) => (
            <li key={to} className="flex">
              <Link to={to} className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-gold-line">
                <Icon className="size-8 text-navy" aria-hidden="true" />
                <span className="font-display text-xl font-bold text-navy">{t(label)}</span>
                <span className="text-sm text-text-body">{t(body)}</span>
              </Link>
            </li>
          ))}
        </ul>
        {cards.length === 0 && <p className="text-sm text-text-body">{t("No sections match your search.")}</p>}

        <section className="mt-10 grid gap-4">
          <h2 className="font-display text-xl font-bold text-navy">{t("From the Visual Encyclopedia")}</h2>
          <div className={cardGrid}>
            {ENC_CHAPTERS.map((id) => chapters.find((c) => c.id === id))
              .filter((c): c is (typeof chapters)[number] => !!c)
              .map((c) => <PhotoCard key={c.id} c={{ title: c.title, img: c.cover, to: `/encyclopedia#${c.id}` }} />)}
          </div>
        </section>

        <div className="mt-10 grid max-w-xl gap-1 rounded-2xl border border-dashed border-border bg-bg-alt p-5">
          <span className="w-fit rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy">{t("Planned")}</span>
          <h2 className="text-base font-semibold text-navy">{t("Learning for schools and students")}</h2>
          <p className="text-sm text-text-body">{t("Future educational programmes, video lessons and downloadable materials. Some may be paid.")}</p>
        </div>
      </main>
    </MilShell>
  );
}
