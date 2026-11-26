import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { CommunityAuthorityGuide, CommunityError } from "@/components/community/CommunityPages";
import { communityGuidesQuery } from "@/lib/community.functions";
export const Route = createFileRoute("/community_/authority-guide")({loader:async({context})=>{if(linkGatedOff("/community/authority-guide",await fetchNavAvailability()))throw notFound();await context.queryClient.ensureQueryData(communityGuidesQuery);},head:()=>simpleHead("/community/authority-guide","Competent authority guide — Egyptora Community | Egyptora Hub","Which official body is responsible for which topic, from official sources.",SITE.url),component:CommunityAuthorityGuide,errorComponent:CommunityError});
