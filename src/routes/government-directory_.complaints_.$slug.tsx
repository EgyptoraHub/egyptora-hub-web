import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { ComplaintSectorDetail, ComplaintsError, ComplaintsUnavailable } from "@/components/complaints/ComplaintsPages";
import { complaintSectorQuery } from "@/lib/complaints.functions";
import { UNKNOWN_AUTHORITY_SECTOR } from "@/lib/complaints-public";

// "Other / I do not know the authority" is the guide page, never a normal sector page.
export const Route = createFileRoute("/government-directory_/complaints_/$slug")({
  loader: async ({ context, params }) => {
    if (params.slug === UNKNOWN_AUTHORITY_SECTOR) throw redirect({ to: "/government-directory/complaints/unknown-authority" });
    const detail = await context.queryClient.ensureQueryData(complaintSectorQuery(params.slug));
    if (!detail.sector) throw notFound();
    return detail;
  },
  head: ({ loaderData }) => {
    if (!loaderData?.sector) return { meta: [{ title: "Page not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    const s = loaderData.sector;
    const head = simpleHead(`/government-directory/complaints/${s.slug}`, `${s.name_en} — Official Complaint Channels | Egyptora Hub`, `${s.scope_en ?? s.name_en}. القنوات الرسمية للشكاوى: ${s.name_ar}.`, SITE.url);
    // Sectors without a verified public channel stay out of search indexes.
    if (loaderData.channels.length === 0) head.meta.push({ name: "robots", content: "noindex" });
    return head;
  },
  errorComponent: ComplaintsError,
  notFoundComponent: ComplaintsUnavailable,
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <ComplaintSectorDetail slug={slug} />;
}
