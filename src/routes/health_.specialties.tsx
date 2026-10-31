import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthSpecialties } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";
import { healthQuery } from "@/lib/health.functions";
export const Route = createFileRoute("/health_/specialties")({
  loader: ({ context }) => context.queryClient.ensureQueryData(healthQuery),
  head: () => simpleHead("/health/specialties", "Healthcare Specialties — Egyptora Hub", "Browse active healthcare specialties and facilities in Egypt.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthSpecialties />; }
