import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, ShoppingBag } from "lucide-react";
import { Section, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import {
  BackLink,
  ChipList,
  DetailNotFound,
  DetailShell,
  Fact,
  FactGrid,
  ImageStrip,
} from "@/components/site/DetailPrimitives";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { SaveButton } from "@/components/site/SaveButton";
import { RequestBookingButton } from "@/lib/trip-actions";
import { useLocalizedRow } from "@/lib/localized-content";

type Product = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  category: string | null;
  price_egp: number | null;
  maker: string | null;
  summary: string | null;
  description: string | null;
  images: string[] | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

export const Route = createFileRoute("/products_/$id")({
  loader: async ({ params }) => {
    let product: Product | null = null;
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, slug, name, governorate_slug, category, price_egp, maker, summary, description, images, tags, governance_status",
        )
        .eq("id", params.id)
        .maybeSingle();

      if (error) {
        console.error(`[products.$id] failed to load ${params.id}:`, error.message);
      } else {
        product = (data as Product | null) ?? null;
      }
    } catch (err) {
      console.error(`[products.$id] unexpected error loading ${params.id}:`, err);
    }

    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable | Egyptora Hub" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} | Egyptora Hub`;
    const description = (product.summary ?? product.description ?? product.name).slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE.url}/products/${product.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE.url}/products/${product.id}` }],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductDetailPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function ProductNotFound() {
  const { t } = useI18n();
  return <DetailNotFound backTo="/products" backLabel={t("Back to crafts & products")} />;
}

function ProductDetailPage() {
  const { product: productSource } = Route.useLoaderData();
  const product = useLocalizedRow("products", productSource);
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <DetailShell>
      <Section className="py-10 lg:py-14">
        <BackLink to="/products" label={t("Back to crafts & products")} />

        <GovernanceBanner status={product.governance_status} className="mt-5" />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2.5 font-display text-3xl text-foreground lg:text-4xl">
            <ShoppingBag className="size-6 shrink-0 text-gold-text" />
            {t(product.name)}
          </h1>
          <SourceBadge status="DEMO" />
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4 text-gold-text" />
          <Link
            to="/governorates/$id"
            params={{ id: product.governorate_slug }}
            className="hover:text-gold-text"
          >
            {t(govName(product.governorate_slug))}
          </Link>
          {product.category && (
            <>
              {" · "}
              {t(product.category)}
            </>
          )}
        </p>

        <ImageStrip images={product.images} alt={product.name} />

        {product.summary && (
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/85">
            {t(product.summary)}
          </p>
        )}
        {product.description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t(product.description)}
          </p>
        )}

        <FactGrid>
          <Fact label={t("Category")} value={product.category ? t(product.category) : null} />
          <Fact
            label={t("Price")}
            value={
              product.price_egp !== null
                ? `${product.price_egp.toLocaleString(locale, { maximumFractionDigits: 0 })} ${lang === "ar" ? "ج.م" : "EGP"}`
                : null
            }
          />
          <Fact label={t("Maker")} value={product.maker ? t(product.maker) : null} />
          <Fact label={t("Governorate")} value={t(govName(product.governorate_slug))} />
        </FactGrid>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <RequestBookingButton
            itemType="product"
            itemId={product.id}
            itemName={product.name}
            amount={product.price_egp}
            currency="egp"
          />
          <SaveButton
            itemType="product"
            itemId={product.id}
            itemName={product.name}
            itemImage={product.images?.[0] ?? null}
          />
        </div>

        <ChipList label={t("Tags")} items={product.tags} />
      </Section>
    </DetailShell>
  );
}
