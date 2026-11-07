import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { TradeCountriesPage, TradeError, TradeUnavailable } from "@/components/trade/TradePages";
import { tradeCountriesQuery } from "@/lib/trade.functions";
import { validateCountrySearch } from "@/lib/trade-public";

const title = "World Gateway — Country Profiles | Egyptora Hub";
const description = "Country trade profiles compiled from official sources. Information only — no implied agreement, supplier or export permission. ملفات الدول التجارية من مصادر رسمية.";

// With zero public profiles this route behaves like any missing page.
export const Route = createFileRoute("/do-business_/world-gateway")({
  validateSearch: validateCountrySearch,
  loader: async ({ context }) => {
    const countries = await context.queryClient.ensureQueryData(tradeCountriesQuery);
    if (countries.length === 0) throw notFound();
    return countries;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/do-business/world-gateway", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: TradeError,
  notFoundComponent: TradeUnavailable,
  component: Page,
});

function Page() {
  return <TradeCountriesPage search={Route.useSearch()} />;
}
