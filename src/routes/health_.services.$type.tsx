import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthService } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";
import { healthQuery } from "@/lib/health.functions";
import { servicePages } from "@/lib/health-public";
export const Route = createFileRoute("/health_/services/$type")({
  loader: async ({ context, params }) => { if (!servicePages[params.type]) throw notFound(); await context.queryClient.ensureQueryData(healthQuery); return servicePages[params.type]; },
  head: ({ params, loaderData }) => simpleHead(`/health/services/${encodeURIComponent(params.type)}`, `${loaderData?.title ?? "Unavailable service"} — Egyptora Hub`, loaderData?.body || "Public healthcare service information.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthService type={Route.useParams().type} />; }
