import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { loadProtectedAreas, PROTECTED_PATH } from "@/lib/protected-areas";
import { ProtectedAreasPage } from "@/components/site/ProtectedAreas";

const title = "Protected Areas in Egypt — Eco & Nature | Egyptora Hub";
const description = "Egypt's declared protected areas with declaration year, area and official source. المحميات الطبيعية في مصر مع المصدر الرسمي.";

// Menu item stays "Coming soon". With zero public records this behaves like any missing page.
export const Route = createFileRoute("/experiences/eco-nature")({
  loader: async () => {
    const data = await loadProtectedAreas();
    if (data.areas.length === 0) throw notFound();
    return data;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead(PROTECTED_PATH, title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const d = Route.useLoaderData();
  return <ProtectedAreasPage {...d} />;
}
