import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { HealthBloodDonation } from "@/components/health/HealthPages";
import { HealthError, HealthUnavailable } from "@/components/health/HealthShared";
import { healthQuery, healthResourcesQuery } from "@/lib/health.functions";
export const Route = createFileRoute("/health_/blood-donation")({
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(healthQuery), context.queryClient.ensureQueryData(healthResourcesQuery)]),
  head: () => simpleHead("/health/blood-donation", "Blood Donation — Egyptora Hub", "Active blood donation centres and upcoming health campaigns; eligibility is decided by medical staff.", SITE.url),
  errorComponent: HealthError,
  notFoundComponent: HealthUnavailable,
  component: Page,
});
function Page() { return <HealthBloodDonation />; }
