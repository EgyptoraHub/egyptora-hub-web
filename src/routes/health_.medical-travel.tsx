import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthMedicalTravel } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";

export const Route = createFileRoute("/health_/medical-travel")({
  head: () => simpleHead("/health/medical-travel", "Medical Travel — Egyptora Hub", "Informational coordination journey and administrative inquiry; no medical records or service promises.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthMedicalTravel />; }
