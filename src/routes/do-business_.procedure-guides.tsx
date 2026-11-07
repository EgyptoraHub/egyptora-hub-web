import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { TradeGuidesPage, TradeError, TradeUnavailable } from "@/components/trade/TradePages";
import { procedureGuidesQuery } from "@/lib/trade.functions";
import { validateGuideSearch } from "@/lib/trade-public";

const title = "Procedure Guides — Do Business in Egypt | Egyptora Hub";
const description = "Official procedure guides compiled from the competent authorities. أدلة الإجراءات الرسمية من الجهات المختصة.";

// With zero public guides this route behaves like any missing page.
export const Route = createFileRoute("/do-business_/procedure-guides")({
  validateSearch: validateGuideSearch,
  loader: async ({ context }) => {
    const guides = await context.queryClient.ensureQueryData(procedureGuidesQuery);
    if (guides.length === 0) throw notFound();
    return guides;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/do-business/procedure-guides", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: TradeError,
  notFoundComponent: TradeUnavailable,
  component: Page,
});

function Page() {
  return <TradeGuidesPage search={Route.useSearch()} />;
}
