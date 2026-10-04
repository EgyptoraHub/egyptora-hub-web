import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import {
  AppsCategoryNotFound, AppsError, AppsLoading, EgyptAppsDirectory, appsSearchSchema, loadEgyptApps,
} from "@/components/site/EgyptApps";

export const Route = createFileRoute("/egypt-apps_/$category")({
  validateSearch: (s) => appsSearchSchema.parse(s),
  loader: async ({ params }) => {
    const data = await loadEgyptApps();
    const category = data.categories.find((c) => c.slug === params.category);
    if (!category || !data.apps.some((a) => a.category_id === category.id)) throw notFound();
    return { ...data, category };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Category not found | Egyptora Hub" }, { name: "robots", content: "noindex" }] };
    const name = loaderData.category.name_en;
    return simpleHead(
      `/egypt-apps/${params.category}`,
      `${name} Apps in Egypt | Egyptora Hub`,
      `Egyptian ${name.toLowerCase()} mobile apps with official Google Play, App Store and website links.`,
      SITE.url,
    );
  },
  pendingComponent: AppsLoading,
  errorComponent: () => <AppsError />,
  notFoundComponent: () => <AppsCategoryNotFound />,
  component: Page,
});

function Page() {
  const { categories, apps, category } = Route.useLoaderData();
  const search = Route.useSearch();
  return <EgyptAppsDirectory categories={categories} apps={apps} search={search} category={category} />;
}
