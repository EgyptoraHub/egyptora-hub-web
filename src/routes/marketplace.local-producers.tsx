import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceSection } from "@/components/site/MarketplaceSection";
import { marketplacePageBySlug } from "@/data/marketplace";
import { loadCollectionProducts } from "@/lib/marketplace-products";
import { SITE } from "@/config/site";
import { useLocalizedRows } from "@/lib/localized-content";

const title = "Local Producers — cooperatives, farms & workshops | Egyptora Hub";
const description =
  "Meet Egypt's local producers: palm and reed workshops, boat builders, furniture makers and cooperatives across the governorates.";

export const Route = createFileRoute("/marketplace/local-producers")({
  loader: async () => ({ products: await loadCollectionProducts("local-producers") }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/marketplace/local-producers` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-banner.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/marketplace/local-producers` }],
  }),
  component: LocalProducersPage,
});

function LocalProducersPage() {
  const { products: productsSource } = Route.useLoaderData();
  const products = useLocalizedRows("products", productsSource);
  return <MarketplaceSection page={marketplacePageBySlug["local-producers"]} products={products} />;
}
