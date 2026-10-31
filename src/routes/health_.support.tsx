import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthSupport } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";

export const Route = createFileRoute("/health_/support")({
  head: () => simpleHead("/health/support", "Healthcare Support — Egyptora Hub", "Report directory errors and find official emergency and complaint channels.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthSupport />; }
