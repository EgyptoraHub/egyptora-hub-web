import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { TradeCountryDetail, TradeError, TradeUnavailable } from "@/components/trade/TradePages";
import { tradeCountryQuery } from "@/lib/trade.functions";

export const Route = createFileRoute("/do-business_/world-gateway_/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(tradeCountryQuery(params.slug));
    if (!data.profile) throw notFound();
    return data.profile;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead(`/do-business/world-gateway/${loaderData.slug}`, `${loaderData.name_en} — Country Profile | Egyptora Hub`, (loaderData.summary_en ?? `${loaderData.name_en} country trade profile from official sources.`).slice(0, 160), SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: TradeError,
  notFoundComponent: TradeUnavailable,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <TradeCountryDetail slug={slug} />;
}
