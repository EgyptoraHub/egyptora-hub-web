import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { TradeSectorsPage, TradeError, TradeUnavailable } from "@/components/trade/TradePages";
import { tradeSectorsQuery } from "@/lib/trade.functions";
import { validateSectorSearch } from "@/lib/trade-public";

const title = "Industry & Agriculture in Egypt — Sectors | Egyptora Hub";
const description = "Industry, agriculture and trade service sectors in Egypt, compiled from official sources. قطاعات الصناعة والزراعة والخدمات التجارية في مصر من مصادر رسمية.";

// With zero public records this route behaves like any missing page.
export const Route = createFileRoute("/do-business_/industry-agriculture")({
  validateSearch: validateSectorSearch,
  loader: async ({ context }) => {
    const sectors = await context.queryClient.ensureQueryData(tradeSectorsQuery);
    if (sectors.length === 0) throw notFound();
    return sectors;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/do-business/industry-agriculture", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: TradeError,
  notFoundComponent: TradeUnavailable,
  component: Page,
});

function Page() {
  return <TradeSectorsPage search={Route.useSearch()} />;
}
