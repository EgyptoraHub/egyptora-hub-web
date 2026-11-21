import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { ShippingPlatformsPage, ShippingError, ShippingUnavailable } from "@/components/shipping/ShippingPages";
import { shippingPlatformsQuery } from "@/lib/shipping.functions";
import { validateShippingSearch, SHIPPING_INTRO } from "@/lib/shipping-public";
export const Route = createFileRoute("/do-business_/shipping-logistics_/platforms")({
 validateSearch: validateShippingSearch,
 loader: async ({context}) => { const rows = await context.queryClient.ensureQueryData(shippingPlatformsQuery); if (!rows.length) throw notFound(); return rows; },
 head: () => simpleHead("/do-business/shipping-logistics/platforms", "Official Shipping & Trade Websites | Egyptora Hub", SHIPPING_INTRO + " Official sources and verification dates. مواقع الشحن والتجارة الرسمية.", SITE.url),
 errorComponent: ShippingError, notFoundComponent: ShippingUnavailable, component: Page,
});
function Page() { return <ShippingPlatformsPage search={Route.useSearch()}/>; }
