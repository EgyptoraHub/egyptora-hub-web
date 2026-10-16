import { GenImage } from "@/components/site/GenImage";
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Anchor,
  Banknote,
  Building,
  Building2,
  Compass,
  FileText,
  HardHat,
  Home,
  Hotel,
  Landmark,
  LayoutGrid,
  MapPin,
  MapPinned,
  Palmtree,
  Ruler,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  BlockHeader,
  CategoryTabs,
  ExploreGrid,
  FeaturedRow,
  HeroSearch,
  PageTemplate,
  type CategoryTab,
  type ExploreItem,
} from "@/components/layout/PageTemplate";
import {
  SidebarContactCard,
  SidebarLinkCard,
  SidebarPromoCard,
} from "@/components/layout/SidebarWidgets";
import { SourceBadge } from "@/components/site/Primitives";
import { GovernanceBanner, type GovernanceStatus } from "@/components/site/GovernanceBanner";
import heroImage from "@/assets/sector-realestate.jpg";
import { governorates } from "@/data/governorates";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useLocalizedRows } from "@/lib/localized-content";

type Property = {
  id: string;
  slug: string;
  name: string;
  governorate_slug: string;
  property_type: string | null;
  price_usd: number | null;
  area_m2: number | null;
  city: string | null;
  summary: string | null;
  tags: string[] | null;
  governance_status: GovernanceStatus;
};

const title = "Real Estate in Egypt | Egyptora Hub";
const description =
  "Browse residential and commercial properties across Egypt's governorates — homes, apartments and land for those looking to live or invest in Egypt.";

export const Route = createFileRoute("/properties")({
  loader: async () => {
    let properties: Property[] = [];
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, slug, name, governorate_slug, property_type, price_usd, area_m2, city, summary, tags, governance_status",
        )
        .eq("moderation_state", "PUBLISHED")
        .order("name");
      if (error) console.error("[properties] failed to load properties:", error.message);
      else properties = (data ?? []) as Property[];
    } catch (err) {
      console.error("[properties] unexpected error:", err);
    }
    return { properties };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/properties` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/properties` }],
  }),
  component: PropertiesPage,
});

const govName = (slug: string) => governorates.find((g) => g.id === slug)?.name ?? slug;

const formatPrice = (usd: number | null, lang: string) =>
  usd === null
    ? null
    : `$${usd.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", { maximumFractionDigits: 0 })}`;

/** Tabs backed by a real `property_type` value, plus reference categories that
 *  have no column behind them yet and therefore show an honest empty state. */
const tabs: CategoryTab[] = [
  { id: "ALL", label: "All Real Estate", labelAr: "جميع العقارات", icon: LayoutGrid },
  { id: "RESIDENTIAL", label: "Residential", labelAr: "سكني", icon: Home },
  { id: "COMMERCIAL", label: "Commercial", labelAr: "تجاري", icon: Building2 },
  { id: "OFFICE", label: "Offices", labelAr: "مكاتب", icon: Building },
  { id: "LAND", label: "Land & Plots", labelAr: "أراضٍ وقطع", icon: MapPinned },
  { id: "HOTEL_APARTMENT", label: "Hotel Apartments", labelAr: "شقق فندقية", icon: Hotel },
  { id: "HOSPITALITY", label: "Tourist & Resort", labelAr: "سياحي", icon: Palmtree },
  { id: "NEW_CITIES", label: "New Cities", labelAr: "المدن الجديدة", icon: Sparkles, soon: true },
  { id: "COASTAL", label: "Coastal Properties", labelAr: "ساحلي", icon: Anchor, soon: true },
  {
    id: "GOV_PROJECTS",
    label: "Government Projects",
    labelAr: "مشروعات حكومية",
    icon: Landmark,
    soon: true,
  },
  { id: "DEVELOPERS", label: "Developers", labelAr: "المطورون", icon: HardHat, soon: true },
  {
    id: "FINANCING",
    label: "Financing & Mortgages",
    labelAr: "التمويل العقاري",
    icon: Banknote,
    soon: true,
  },
];

const lifestyleItems: ExploreItem[] = [
  { label: "Family Living", labelAr: "سكن عائلي", icon: Home, soon: true },
  { label: "Luxury Living", labelAr: "حياة فاخرة", icon: Sparkles, soon: true },
  { label: "Beachfront", labelAr: "على الساحل", icon: Anchor, soon: true },
  { label: "Investment", labelAr: "فرص استثمارية", icon: TrendingUp, to: "/investment-opportunities" },
  { label: "Retirement", labelAr: "التقاعد", icon: ShieldCheck, soon: true },
  { label: "Student Housing", labelAr: "سكن الطلاب", icon: Compass, soon: true },
  { label: "Vacation Homes", labelAr: "منازل الإجازات", icon: Palmtree, soon: true },
  { label: "Explore governorates", labelAr: "المحافظات", icon: MapPin, to: "/government-directory" },
];

const additionalServices: ExploreItem[] = [
  { label: "Legal Support", labelAr: "دعم قانوني", icon: Scale, to: "/legal" },
  { label: "Property Valuation", labelAr: "تقييم عقاري", icon: FileText, soon: true },
  { label: "Financing Options", labelAr: "خيارات التمويل", icon: Banknote, soon: true },
  { label: "Trusted Developers", labelAr: "مطورون موثوقون", icon: HardHat, soon: true },
  { label: "Property Management", labelAr: "إدارة العقارات", icon: Building2, soon: true },
  { label: "Relocation Support", labelAr: "دعم الانتقال", icon: Truck, to: "/providers" },
];

function PropertyCard({ property }: { property: Property }) {
  const { t, lang } = useI18n();
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold-line">
      <GovernanceBanner status={property.governance_status} className="mb-3" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-base text-foreground">
          <Building className="size-4 shrink-0 text-gold-text" />
          <Link
            to="/properties/$id"
            params={{ id: property.id }}
            className="transition-colors hover:text-gold-text"
          >
            {t(property.name)}
          </Link>
        </h3>
        <SourceBadge status="DEMO" />
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="size-3.5 text-gold-text" />
        <Link
          to="/governorates/$id"
          params={{ id: property.governorate_slug }}
          className="hover:text-gold-text"
        >
          {t(govName(property.governorate_slug))}
        </Link>
        {property.city && (
          <>
            {" · "}
            {t(property.city)}
          </>
        )}
      </p>

      {property.summary && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(property.summary)}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-foreground/85">
        {property.price_usd !== null && (
          <span className="font-semibold text-gold-text">{formatPrice(property.price_usd, lang)}</span>
        )}
        {property.area_m2 !== null && (
          <span className="flex items-center gap-1">
            <Ruler className="size-3.5 text-gold-text" />
            {property.area_m2.toLocaleString()} m²
          </span>
        )}
      </div>

      {property.tags && property.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {property.tags.slice(0, 4).map((tag) => (
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
  );
}

function PropertiesPage() {
  const { properties: propertiesSource } = Route.useLoaderData();
  const properties = useLocalizedRows("properties", propertiesSource);
  const { t } = useI18n();
  const [active, setActive] = useState("ALL");

  const activeTab = tabs.find((tab) => tab.id === active);
  const filtered = useMemo(() => {
    if (active === "ALL") return properties;
            <GenImage k="ph-properties" sizes="240px" className="mx-auto mb-3 block w-full max-w-[240px] rounded-xl" />
    if (activeTab?.soon) return [];
    return properties.filter((p) => p.property_type === active);
  }, [properties, active, activeTab]);

  const featured = filtered.slice(0, 6);
  const rest = filtered.slice(6);

  return (
    <PageTemplate
      hero={
        <HeroSearch
          breadcrumb={[{ label: "Home", to: "/" }, { label: "Real Estate", to: "/real-estate" }, { label: "Properties" }]}
          title="Real Estate & Property"
          subtitle="Find. Invest. Live. Grow in Egypt."
          description="Discover real estate opportunities across Egypt, from vibrant cities to new communities. Your next chapter starts here."
          image={heroImage}
          imageAlt={t("Modern residential towers in Egypt at sunset")}
          placeholder="Search for a location, project, property type or developer..."
          sideNote={["Live", "Invest", "Belong", "Build your tomorrow"]}
        />
      }
      tabs={<CategoryTabs tabs={tabs} active={active} onSelect={setActive} />}
      sidebar={
        <>
          <SidebarLinkCard
            title="Search Egypt by governorate"
            description="Browse properties through the places they sit in."
            links={[
              { label: "Cairo", icon: MapPin, to: "/governorates/cairo" },
              { label: "Giza", icon: MapPin, to: "/governorates/giza" },
              { label: "Alexandria", icon: MapPin, to: "/governorates/alexandria" },
              { label: "Red Sea", icon: MapPin, to: "/governorates/red-sea" },
              { label: "South Sinai", icon: MapPin, to: "/governorates/south-sinai" },
              { label: "Luxor", icon: MapPin, to: "/governorates/luxor" },
            ]}
          />
          <SidebarPromoCard
            title="Why real estate in Egypt?"
            description="A gateway between Africa, the Middle East and Europe, with strong growth potential and government-backed new cities."
            stats={[
              { label: "Listings", value: String(properties.length) },
              { label: "Governorates", value: "27" },
              { label: "Sectors", value: "6" },
            ]}
            actionLabel="Explore investment opportunities"
            actionTo="/investment-opportunities"
          />
          <SidebarContactCard
            title="Talk to our team"
            description="Get personalised recommendations from our real estate contacts."
            actionLabel="Contact us"
            actionTo="/contact"
          />
        </>
      }
    >
      <section>
        <BlockHeader
          title="Featured Properties"
          description="Handpicked opportunities in Egypt's most desirable locations."
          actionLabel="View all properties"
          onAction={() => setActive("ALL")}
        />
        {featured.length > 0 ? (
          <FeaturedRow>
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </FeaturedRow>
        ) : (
          <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {activeTab?.soon
              ? t("This category is coming soon.")
              : t("No properties match this filter yet.")}
          </p>
        )}
      </section>

      {rest.length > 0 && (
        <section>
          <BlockHeader
            title="More listings"
            description="Every published listing in this category."
          />
          <FeaturedRow>
            {rest.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </FeaturedRow>
        </section>
      )}

      <section>
        <BlockHeader
          title="Explore by Lifestyle"
          description="Find the property that fits your lifestyle."
        />
        <ExploreGrid items={lifestyleItems} />
      </section>

      <section>
        <BlockHeader title="Additional Services" description="All the support you need in one place." />
        <ExploreGrid items={additionalServices} />
      </section>
    </PageTemplate>
  );
}
