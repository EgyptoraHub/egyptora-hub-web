import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { ComplaintsHubPage, ComplaintsError, ComplaintsUnavailable } from "@/components/complaints/ComplaintsPages";
import { complaintSectorsQuery } from "@/lib/complaints.functions";
import { validateComplaintsSearch } from "@/lib/complaints-public";

const title = "Complaints & Government Services Guide | Egyptora Hub";
const description = "Find the official Egyptian complaint channel for your issue, by sector. Egyptora does not receive complaints — this guide points to the official channels. دليل قنوات الشكاوى الرسمية في مصر حسب القطاع.";

// With zero public sectors this route behaves like any missing page.
export const Route = createFileRoute("/government-directory_/complaints")({
  validateSearch: validateComplaintsSearch,
  loader: async ({ context }) => {
    const sectors = await context.queryClient.ensureQueryData(complaintSectorsQuery);
    if (sectors.length === 0) throw notFound();
    return sectors;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/government-directory/complaints", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: ComplaintsError,
  notFoundComponent: ComplaintsUnavailable,
  component: Page,
});

function Page() {
  return <ComplaintsHubPage search={Route.useSearch()} />;
}
