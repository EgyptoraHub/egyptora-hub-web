import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { CommunityPartnerInterest, CommunityError } from "@/components/community/CommunityPages";
export const Route = createFileRoute("/community_/partner-interest")({loader:async()=>{if(linkGatedOff("/community/partner-interest",await fetchNavAvailability()))throw notFound();},head:()=>simpleHead("/community/partner-interest","Institution interest form — Egyptora Community | Egyptora Hub","Institutions can express interest in this planned platform, with consent and no obligation or promise of service.",SITE.url),component:CommunityPartnerInterest,errorComponent:CommunityError});
