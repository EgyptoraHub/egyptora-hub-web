import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { TradeInquiryPage, TradeError, TradeUnavailable } from "@/components/trade/TradePages";
import { tradeCountsQuery } from "@/lib/trade.functions";
import { tradeGateOpen } from "@/lib/trade-public";

const title = "Trade Inquiry — Egyptora Hub";
const description = "Send an administrative inquiry about sourcing, exports or procedures. استفسار إداري عن التوريد أو التصدير أو الإجراءات.";

// The form exists only while at least one trade section has public records.
export const Route = createFileRoute("/do-business_/trade-inquiry")({
  loader: async ({ context }) => {
    const counts = await context.queryClient.ensureQueryData(tradeCountsQuery);
    if (!tradeGateOpen(counts.sectors + counts.countries + counts.guides)) throw notFound();
    return counts;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/do-business/trade-inquiry", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: TradeError,
  notFoundComponent: TradeUnavailable,
  component: TradeInquiryPage,
});
