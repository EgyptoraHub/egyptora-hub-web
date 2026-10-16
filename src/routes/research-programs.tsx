import { GenImage } from "@/components/site/GenImage";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRows } from "@/lib/localized-content";

type ResearchProgram = {
  id: string;
  slug: string;
  name: string;
  university: string | null;
  field: string | null;
  degree: string | null;
  governorate_slug: string | null;
  summary: string | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

const title = "Research Programs in Egypt — universities & fields of study | Egyptora Hub";
const description =
  "Research programmes and degrees offered by Egyptian universities, by field of study and governorate.";

export const Route = createFileRoute("/research-programs")({
  loader: async () => {
    // Wrapped in try/catch on purpose: a *thrown* exception from the client (a network
    // failure, a cold Supabase connection) is not caught by only checking `error`, and
    // would crash the whole route to the generic "This page didn't load" error boundary
    // instead of just rendering with an empty list.
    let programs: ResearchProgram[] = [];
    try {
      const { data, error } = await supabase
        .from("research_programs")
        .select(
          "id, slug, name, university, field, degree, governorate_slug, summary, tags, governance_status",
        )
        .order("name");

      if (error) {
        console.error("[research-programs] failed to load research_programs:", error.message);
      } else {
        programs = (data ?? []) as ResearchProgram[];
      }
    } catch (err) {
      console.error("[research-programs] unexpected error loading research_programs:", err);
    }
    return { programs };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/research-programs` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/research-programs` }],
  }),
  component: ResearchProgramsPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function ResearchProgramsPage() {
  const { programs: programsSource } = Route.useLoaderData();
  const programs = useLocalizedRows("research_programs", programsSource);
  const { t } = useI18n();
  const [field, setField] = useState<string | null>(null);

  const fields = useMemo(
    () => Array.from(new Set(programs.map((p) => p.field).filter((v): v is string => !!v))).sort(),
    [programs],
  );
  const filtered = field ? programs.filter((p) => p.field === field) : programs;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Discover Egypt"
          title="Research programs"
          description="Research programmes and degrees offered by Egyptian universities, by field of study and governorate."
        />

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setField(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              field === null
                ? "border-gold-line bg-gold-soft text-gold-text"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
            )}
          >
            {t("All fields")}
          </button>
          {fields.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setField(f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                field === f
                  ? "border-gold-line bg-gold-soft text-gold-text"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
              )}
            >
              {t(f)}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((program) => (
              <article
                key={program.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
              >
                <GovernanceBanner status={program.governance_status} className="mb-3" />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                    <GraduationCap className="size-4 shrink-0 text-gold-text" />
                    <Link
                      to="/research-programs/$id"
                      params={{ id: program.id }}
                      className="transition-colors hover:text-gold-text"
                    >
                      {t(program.name)}
                    </Link>
                  </h2>
                  <SourceBadge status="DEMO" />
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  {program.university && t(program.university)}
                  {program.governorate_slug && (
                    <>
                      {program.university && " · "}
                      <MapPin className="size-3.5 text-gold-text" />
                      <Link
                        to="/governorates/$id"
                        params={{ id: program.governorate_slug }}
                        className="hover:text-gold-text"
                      >
                        {t(govName(program.governorate_slug))}
                      </Link>
                    </>
                  )}
                </p>

                {program.degree && (
                  <p className="mt-3 text-sm font-medium text-foreground">{t(program.degree)}</p>
                )}

                {program.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(program.summary)}
                  </p>
                )}

                {program.tags && program.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {program.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gold-line/60 bg-gold-soft px-2 py-0.5 text-2xs text-gold-text"
                      >
                        {t(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            <GenImage k="ph-research-programs" sizes="240px" className="mx-auto mb-3 block w-full max-w-[240px] rounded-xl" />
            {t("No research programs match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
