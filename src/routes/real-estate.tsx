import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/inner/realestate-hero.jpg";
import { InnerPage } from "@/components/layout/InnerPage";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { realEstateHubQuery } from "@/lib/real-estate.functions";
import { PropertyNotice, PropertyHubCards, RealEstateError } from "@/components/real-estate/RealEstatePages";
export const Route = createFileRoute("/real-estate")({
 loader: ({context}) => context.queryClient.ensureQueryData(realEstateHubQuery),
 head: () => simpleHead("/real-estate", "Real Estate & Property Information | Egyptora Hub", "Official Egyptian property platforms and registration guides, with sources and verification dates. Informational only. معلومات العقارات والمصادر الرسمية.", SITE.url),
 errorComponent: RealEstateError,
 component: RealEstate,
});
function RealEstate() { return <InnerPage pageName="Real Estate & Property" hero={{image:hero,title:"Real Estate & Property",subtitle:"Official property platforms and registration guides",body:"Property information from official Egyptian sources.",placeholder:"",tagline:[],replaceSearch:<span/>}} chips={[]} showMore={false} notice={<PropertyNotice/>}><PropertyHubCards/></InnerPage>; }
