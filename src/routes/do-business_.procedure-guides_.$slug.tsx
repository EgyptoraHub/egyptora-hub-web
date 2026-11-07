import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { TradeGuideDetail, TradeError, TradeUnavailable } from "@/components/trade/TradePages";
import { procedureGuideQuery } from "@/lib/trade.functions";

export const Route = createFileRoute("/do-business_/procedure-guides_/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(procedureGuideQuery(params.slug));
    if (!data.guide) throw notFound();
    return data.guide;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead(`/do-business/procedure-guides/${loaderData.slug}`, `${loaderData.title_en} — Procedure Guide | Egyptora Hub`, (loaderData.summary_en ?? `${loaderData.title_en} procedure guide from official sources.`).slice(0, 160), SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: TradeError,
  notFoundComponent: TradeUnavailable,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <TradeGuideDetail slug={slug} />;
}
