import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { EducationPlatformsPage, EducationError, EducationUnavailable } from "@/components/education/EducationPages";
import { educationPlatformsQuery } from "@/lib/education.functions";
import { validateEducationSearch } from "@/lib/education-public";

const title = "Official Learning Platforms in Egypt | Egyptora Hub";
const description = "Official Egyptian learning platforms with operator, official link, source and verification date. منصات التعلم الرسمية في مصر.";

// With zero public platforms this route behaves like any missing page.
export const Route = createFileRoute("/education_/platforms")({
  validateSearch: validateEducationSearch,
  loader: async ({ context }) => {
    const rows = await context.queryClient.ensureQueryData(educationPlatformsQuery);
    if (rows.length === 0) throw notFound();
    return rows;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/education/platforms", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: EducationError,
  notFoundComponent: EducationUnavailable,
  component: Page,
});

function Page() {
  return <EducationPlatformsPage search={Route.useSearch()} />;
}
