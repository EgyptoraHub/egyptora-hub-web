import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader, SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLocalizedRows } from "@/lib/localized-content";

type Product = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  category: string | null;
  price_egp: number | null;
  maker: string | null;
  summary: string | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

const title = "Egyptian Crafts & Products Marketplace | Egyptora Hub";
const description =
  "Handmade crafts, textiles and local products from artisans across Egypt's 27 governorates.";

export const Route = createFileRoute("/products")({
  loader: async () => {
    let products: Product[] = [];
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, slug, name, governorate_slug, category, price_egp, maker, summary, tags, governance_status",
        )
        .order("name");

      if (error) {
        console.error("[products] failed to load products:", error.message);
      } else {
        products = (data ?? []) as Product[];
      }
    } catch (err) {
      console.error("[products] unexpected error loading products:", err);
    }
    return { products };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/products` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/products` }],
  }),
  component: ProductsPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

function formatEgp(egp: number | null, lang: string) {
  if (egp === null) return null;
  return `${egp.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 })} ${lang === "ar" ? "ج.م" : "EGP"}`;
}

function ProductsPage() {
  const { products: productsSource } = Route.useLoaderData();
  const products = useLocalizedRows("products", productsSource);
  const { t, lang } = useI18n();
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category).filter((v): v is string => !!v))).sort(),
    [products],
  );
  const filtered = category ? products.filter((p) => p.category === category) : products;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          eyebrow="Crafts & products marketplace"
          title="Crafts & products marketplace"
          description="Handmade crafts, textiles and local products from artisans across Egypt's 27 governorates."
        />

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              category === null
                ? "border-gold-line bg-gold-soft text-gold-text"
                : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
            )}
          >
            {t("All categories")}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                category === c
                  ? "border-gold-line bg-gold-soft text-gold-text"
                  : "border-border/60 text-muted-foreground hover:border-gold-line hover:text-gold-text",
              )}
            >
              {t(c)}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-gold-line"
              >
                <GovernanceBanner status={product.governance_status} className="mb-3" />
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-display text-base text-foreground">
                    <ShoppingBag className="size-4 shrink-0 text-gold-text" />
                    <Link
                      to="/products/$id"
                      params={{ id: product.id }}
                      className="transition-colors hover:text-gold-text"
                    >
                      {t(product.name)}
                    </Link>
                  </h2>
                  <SourceBadge status="DEMO" />
                </div>

                <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-gold-text" />
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

                {product.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(product.summary)}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-foreground/85">
                  {product.price_egp !== null && (
                    <span className="text-gold-text">{formatEgp(product.price_egp, lang)}</span>
                  )}
                  {product.maker && <span>{t(product.maker)}</span>}
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {product.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gold-line/60 bg-gold-soft px-2 py-0.5 text-2xs text-gold-text"
                      >
                        {t(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            {t("No products match this filter yet.")}
          </p>
        )}
      </Section>
      <SiteFooter />
    </div>
  );
}
