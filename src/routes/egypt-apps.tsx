import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { AppsError, AppsLoading, EgyptAppsDirectory, appsSearchSchema, loadEgyptApps } from "@/components/site/EgyptApps";

const title = "Egypt Apps Directory — Government & Service Apps | Egyptora Hub";
const description =
  "Directory of Egyptian government and key service mobile apps with direct links to Google Play, the App Store and official websites.";

export const Route = createFileRoute("/egypt-apps")({
  validateSearch: (s) => appsSearchSchema.parse(s),
  loader: () => loadEgyptApps(),
  head: () => simpleHead("/egypt-apps", title, description, SITE.url),
  pendingComponent: AppsLoading,
  errorComponent: () => <AppsError />,
  component: Page,
});

function Page() {
  const { categories, apps } = Route.useLoaderData();
  const search = Route.useSearch();
  return <EgyptAppsDirectory categories={categories} apps={apps} search={search} />;
}
