import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { loadZonePage } from "@/lib/economic-zones";
import { EconomicZonesPage } from "@/components/site/EconomicZones";

const title = "Industrial Zones in Egypt — Directory | Egyptora Hub";
const description = "Industrial zones in Egypt with managing bodies and official sources. المناطق الصناعية في مصر مع جهات الإدارة والمصادر الرسمية.";

// Not linked from the menu yet. With zero public records it behaves like any missing page.
export const Route = createFileRoute("/do-business_/industrial-zones")({
  loader: async () => {
    const data = await loadZonePage("industrial");
    if (data.zones.length === 0) throw notFound();
    return data;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/do-business/industrial-zones", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const d = Route.useLoaderData();
  return <EconomicZonesPage page="industrial" {...d} />;
}
