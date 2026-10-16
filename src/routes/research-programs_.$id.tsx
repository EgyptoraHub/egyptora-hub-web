import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GraduationCap, MapPin } from "lucide-react";
import { Section, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import {
  BackLink,
  ChipList,
  DetailNotFound,
  DetailShell,
  Fact,
  FactGrid,
  ImageStrip,
} from "@/components/site/DetailPrimitives";
import { governorates } from "@/data/governorates";
import { SaveButton } from "@/components/site/SaveButton";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useLocalizedRow } from "@/lib/localized-content";

type ResearchProgram = {
  id: string;
  slug: string;
  name: string;
  university: string | null;
  governorate_slug: string | null;
  field: string | null;
  degree: string | null;
  languages: string[] | null;
  summary: string | null;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/research-programs_/$id")({
  loader: async ({ params }) => {
    // Wrapped in try/catch on purpose: a thrown exception (network failure, cold
    // connection) would otherwise crash the route to the generic error boundary.
    let program: ResearchProgram | null = null;
    try {
      const { data, error } = await supabase
        .from("research_programs")
        .select(
          "id, slug, name, university, governorate_slug, field, degree, languages, summary, description, images, tags, governance_status",
        )
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(`[research-programs.$id] failed to load ${params.id}:`, error.message);
      } else {
        program = (data as ResearchProgram | null) ?? null;
      }
    } catch (err) {
      console.error(`[research-programs.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!program) throw notFound();
    return { program };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Research programme unavailable | Egyptora Hub" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { program } = loaderData;
    const title = `${program.name} | Egyptora Hub`;
    const description = (program.summary ?? program.description ?? program.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/research-programs/${program.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/research-programs/${program.id}` }],
    };
  },
  notFoundComponent: ResearchProgramNotFound,
  component: ResearchProgramDetailPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function ResearchProgramNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/research-programs" backLabel={t("Back to research programs")} />;
}

function ResearchProgramDetailPage() {
  const { program: programSource } = Route.useLoaderData();
  const program = useLocalizedRow("research_programs", programSource);
  const { t } = useI18n();

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/research-programs" label={t("Back to research programs")} />

        <GovernanceBanner status={program.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <GraduationCap className="size-6 shrink-0 text-gold-text" />
            {t(program.name)}
          </h1>
          <SourceBadge status="DEMO" />
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {program.university && t(program.university)}
          {program.governorate_slug && (
            <>
              {program.university && " · "}
              <MapPin className="size-4 text-gold-text" />
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

        <ImageStrip images={program.images} alt={program.name} />

        <SaveButton
          className="mt-6"
          itemType="research_program"
          itemId={program.id}
          itemName={program.name}
          itemImage={program.images?.[0] ?? null}
        />

        {program.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(program.summary)}
          </p>
        )}
        {program.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(program.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("University")} value={program.university ? t(program.university) : null} />
          <Fact label={t("Field")} value={program.field ? t(program.field) : null} />
          <Fact label={t("Degree")} value={program.degree ? t(program.degree) : null} />
          <Fact
            label={t("Governorate")}
            value={program.governorate_slug ? t(govName(program.governorate_slug)) : null}
          />
        </FactGrid>

        <ChipList label={t("Languages")} items={program.languages} />
        <ChipList label={t("Tags")} items={program.tags} />
      </Section>
    </DetailShell>
  );
}
