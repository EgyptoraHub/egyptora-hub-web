import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthDirectory } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";
import { healthQuery } from "@/lib/health.functions";
import { validateHealthSearch } from "@/lib/health-public";
export const Route = createFileRoute("/health_/find-care")({
  validateSearch: validateHealthSearch,
  loader: ({ context }) => context.queryClient.ensureQueryData(healthQuery),
  head: () => simpleHead("/health/find-care", "Find Care — Egyptora Hub", "Browse active healthcare facilities in Egypt by location, specialty and facility type.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthDirectory search={Route.useSearch()} />; }
