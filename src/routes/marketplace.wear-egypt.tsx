import { createFileRoute } from "@tanstack/react-router";
import { MarketplaceSection } from "@/components/site/MarketplaceSection";
import { marketplacePageBySlug } from "@/data/marketplace";
import { loadCollectionProducts } from "@/lib/marketplace-products";
import { SITE } from "@/config/site";
import { useLocalizedRows } from "@/lib/localized-content";

const title = "Wear Egypt — embroidery, jewellery & heritage fashion | Egyptora Hub";
const description =
  "Wear Egypt: tulle-bi-telli embroidery, Siwan and Bedouin needlework, silver and gold filigree jewellery from verified makers.";

export const Route = createFileRoute("/marketplace/wear-egypt")({
  loader: async () => ({ products: await loadCollectionProducts("wear-egypt") }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/marketplace/wear-egypt` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-banner.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/marketplace/wear-egypt` }],
  }),
  component: WearEgyptPage,
});

function WearEgyptPage() {
  const { products: productsSource } = Route.useLoaderData();
  const products = useLocalizedRows("products", productsSource);
  return <MarketplaceSection page={marketplacePageBySlug["wear-egypt"]} products={products} />;
}
