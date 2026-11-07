import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { TradeSectorDetail, TradeError, TradeUnavailable } from "@/components/trade/TradePages";
import { tradeSectorsQuery } from "@/lib/trade.functions";

export const Route = createFileRoute("/do-business_/industry-agriculture_/$slug")({
  loader: async ({ params, context }) => {
    const sectors = await context.queryClient.ensureQueryData(tradeSectorsQuery);
    const sector = sectors.find((s) => s.slug === params.slug);
    if (!sector) throw notFound();
    return sector;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead(`/do-business/industry-agriculture/${loaderData.slug}`, `${loaderData.name_en} — Industry & Agriculture | Egyptora Hub`, (loaderData.scope_en ?? `${loaderData.name_en} sector information from official sources.`).slice(0, 160), SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: TradeError,
  notFoundComponent: TradeUnavailable,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <TradeSectorDetail slug={slug} />;
}
