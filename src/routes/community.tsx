import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { CommunityHub, CommunityError } from "@/components/community/CommunityPages";
import { COMMUNITY_INTRO } from "@/lib/community-public";
export const Route = createFileRoute("/community")({loader:async()=>{if(linkGatedOff("/community",await fetchNavAvailability()))throw notFound();},head:()=>simpleHead("/community","Egyptora Community | Egyptora Hub",COMMUNITY_INTRO,SITE.url),component:CommunityHub,errorComponent:CommunityError});
