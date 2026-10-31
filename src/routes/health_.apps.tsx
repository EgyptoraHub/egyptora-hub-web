import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthResources } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";
import { healthResourcesQuery } from "@/lib/health.functions";
export const Route = createFileRoute("/health_/apps")({
  validateSearch: (s) => ({ q: typeof s["q"] === "string" ? s["q"] : "" }),
  loader: ({ context }) => context.queryClient.ensureQueryData(healthResourcesQuery),
  head: () => simpleHead("/health/apps", "Health Apps — Egyptora Hub", "Healthcare resources and official links from the existing Egyptian directories.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthResources kind="apps" q={Route.useSearch().q} />; }
