import { createFileRoute, notFound } from "@tanstack/react-router";
import { guideHub } from "@/data/guideHubs";
import { GuideHubPage, guideHubHead, loadGuideHub } from "@/components/site/GuideHubPage";

export const Route = createFileRoute("/live-in-egypt_/$guide")({
  loader: async ({ params }) => {
    const hub = guideHub("live-in-egypt", params.guide);
    if (!hub) throw notFound();
    return { hub, data: await loadGuideHub(hub) };
  },
  head: ({ loaderData }) =>
    loaderData ? guideHubHead(loaderData.hub) : { meta: [{ title: "Not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] },
  component: Page,
});

function Page() {
  const { hub, data } = Route.useLoaderData();
  return <GuideHubPage hub={hub} data={data} />;
}
