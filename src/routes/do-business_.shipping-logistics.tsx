import { createFileRoute, notFound } from "@tanstack/react-router";
import hero from "@/assets/trade-suez.jpg";
import { InnerPage } from "@/components/layout/InnerPage";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { shippingPlatformsQuery } from "@/lib/shipping.functions";
import { SHIPPING_INTRO } from "@/lib/shipping-public";
import { ShippingNotice, ShippingHubCards, ShippingError, ShippingUnavailable } from "@/components/shipping/ShippingPages";
export const Route = createFileRoute("/do-business_/shipping-logistics")({
 loader: async ({context}) => { const rows = await context.queryClient.ensureQueryData(shippingPlatformsQuery); if (!rows.length) throw notFound(); return rows; },
 head: () => simpleHead("/do-business/shipping-logistics", "Shipping & Logistics in Egypt | Egyptora Hub", SHIPPING_INTRO + " Informational only. الشحن والخدمات اللوجستية في مصر.", SITE.url),
 errorComponent: ShippingError, notFoundComponent: ShippingUnavailable, component: Hub,
});
function Hub() { return <InnerPage pageName="Shipping & Logistics" parent={{label:"Do Business",to:"/do-business"}} hero={{image:hero,title:"Shipping & Logistics",subtitle:SHIPPING_INTRO,body:"",placeholder:"",tagline:[],replaceSearch:<span/>}} chips={[]} showMore={false} notice={<ShippingNotice/>}><ShippingHubCards/></InnerPage>; }
