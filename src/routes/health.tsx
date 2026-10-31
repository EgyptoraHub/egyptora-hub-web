import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthHub } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";
import { healthQuery } from "@/lib/health.functions";
export const Route = createFileRoute("/health")({
  loader: ({ context }) => context.queryClient.ensureQueryData(healthQuery),
  head: () => simpleHead("/health", "Healthcare & Medical Services — Egyptora Hub", "Independent public healthcare information, facilities, specialties and official links in Egypt.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthHub />; }
