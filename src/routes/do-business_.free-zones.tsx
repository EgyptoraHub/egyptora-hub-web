import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { loadZonePage } from "@/lib/economic-zones";
import { EconomicZonesPage } from "@/components/site/EconomicZones";

const title = "Free Zones in Egypt — Directory | Egyptora Hub";
const description = "Public free zones and SCZone industrial zones in Egypt with official sources. المناطق الحرة في مصر مع المصادر الرسمية.";

// Not linked from the menu yet. With zero public records it behaves like any missing page.
export const Route = createFileRoute("/do-business_/free-zones")({
  loader: async () => {
    const data = await loadZonePage("free");
    if (data.zones.length === 0) throw notFound();
    return data;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/do-business/free-zones", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const d = Route.useLoaderData();
  return <EconomicZonesPage page="free" {...d} />;
}
