import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { UnknownAuthorityPage, ComplaintsError, ComplaintsUnavailable } from "@/components/complaints/ComplaintsPages";
import { complaintSectorsQuery, unifiedChannelQuery } from "@/lib/complaints.functions";

const title = "Not Sure Who to Contact? — Complaints Guide | Egyptora Hub";
const description = "A short guide to finding the right official Egyptian complaint channel when you do not know which authority handles your issue. لا تعرف الجهة المختصة؟ دليل قصير للوصول إلى القناة الرسمية المناسبة.";

// Static guide — no input fields, nothing stored. Gated like the hub: with zero public sectors it behaves like a missing page.
export const Route = createFileRoute("/government-directory_/complaints_/unknown-authority")({
  loader: async ({ context }) => {
    const [sectors] = await Promise.all([
      context.queryClient.ensureQueryData(complaintSectorsQuery),
      context.queryClient.ensureQueryData(unifiedChannelQuery),
    ]);
    if (sectors.length === 0) throw notFound();
    return sectors;
  },
  head: ({ loaderData }) =>
    loaderData
      ? simpleHead("/government-directory/complaints/unknown-authority", title, description, SITE.url)
      : { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  errorComponent: ComplaintsError,
  notFoundComponent: ComplaintsUnavailable,
  component: UnknownAuthorityPage,
});
