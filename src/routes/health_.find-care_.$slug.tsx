import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthFacilityPage } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";
import { healthQuery } from "@/lib/health.functions";
export const Route = createFileRoute("/health_/find-care_/$slug")({
  loader: async ({ context, params }) => { const data = await context.queryClient.ensureQueryData(healthQuery); if (!data.facilities.some((f) => f.slug === params.slug)) throw notFound(); return data.facilities.find((f) => f.slug === params.slug); },
  head: () => simpleHead("/health/find-care/$slug", "Healthcare facility — Egyptora Hub", "Facility contact details, services and documented sources.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthFacilityPage slug={Route.useParams().slug} />; }
