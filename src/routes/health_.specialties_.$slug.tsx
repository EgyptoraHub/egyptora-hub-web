import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthSpecialties } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";
import { healthQuery } from "@/lib/health.functions";
export const Route = createFileRoute("/health_/specialties_/$slug")({
  loader: async ({ context, params }) => { const data = await context.queryClient.ensureQueryData(healthQuery); if (!data.specialties.some((s) => s.slug === params.slug)) throw notFound(); return data.specialties.find((s) => s.slug === params.slug); },
  head: () => simpleHead("/health/specialties/$slug", "Healthcare specialty — Egyptora Hub", "Specialty overview and active facilities with this specialty.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthSpecialties slug={Route.useParams().slug} />; }
