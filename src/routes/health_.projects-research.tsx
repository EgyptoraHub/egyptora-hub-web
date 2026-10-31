import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthProjects } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";

export const Route = createFileRoute("/health_/projects-research")({
  head: () => simpleHead("/health/projects-research", "Healthcare Projects & Research — Egyptora Hub", "Existing research and investment links with administrative partnership and research inquiries.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthProjects />; }
