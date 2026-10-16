import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceSection } from "@/components/site/MarketplaceSection";
import { marketplacePageBySlug } from "@/data/marketplace";
import { loadCollectionProducts } from "@/lib/marketplace-products";
import { SITE } from "@/config/site";
import { useLocalizedRows } from "@/lib/localized-content";

const title = "Handmade Crafts — artisans, workshops & studios | Egyptora Hub";
const description =
  "Egyptian handmade crafts: pottery, alabaster, copper, papyrus and woodwork from verified artisans and workshops you can visit.";

export const Route = createFileRoute("/marketplace/handmade-crafts")({
  loader: async () => ({ products: await loadCollectionProducts("handmade-crafts") }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/marketplace/handmade-crafts` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-banner.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/marketplace/handmade-crafts` }],
  }),
  component: HandmadeCraftsPage,
});

function HandmadeCraftsPage() {
  const { products: productsSource } = Route.useLoaderData();
  const products = useLocalizedRows("products", productsSource);
  return <MarketplaceSection page={marketplacePageBySlug["handmade-crafts"]} products={products} />;
}
