import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { RealEstatePlatformsPage, RealEstateError, RealEstateUnavailable } from "@/components/real-estate/RealEstatePages";
import { realEstatePlatformsQuery } from "@/lib/real-estate.functions";
import { validateRealEstateSearch } from "@/lib/real-estate-public";

const title = "Official Property Platforms in Egypt | Egyptora Hub";
const description = "Official Egyptian property platforms with operator, official link, source and verification date. منصات العقارات الرسمية في مصر.";

// With zero public platforms this route behaves like any missing page.
export const Route = createFileRoute("/real-estate_/platforms")({
  validateSearch: validateRealEstateSearch,
  loader: async ({ context }) => {
    const rows = await context.queryClient.ensureQueryData(realEstatePlatformsQuery);
    if (rows.length === 0) throw notFound();
    return rows;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/real-estate/platforms", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: RealEstateError,
  notFoundComponent: RealEstateUnavailable,
  component: Page,
});

function Page() {
  return <RealEstatePlatformsPage search={Route.useSearch()} />;
}
