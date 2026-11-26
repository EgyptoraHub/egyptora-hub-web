import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { CommunityInstitutionTypes, CommunityError } from "@/components/community/CommunityPages";
export const Route = createFileRoute("/community_/institution-types")({loader:async()=>{if(linkGatedOff("/community/institution-types",await fetchNavAvailability()))throw notFound();},head:()=>simpleHead("/community/institution-types","Institution types — Egyptora Community | Egyptora Hub","Illustrative categories of institutions in Egypt, not a directory.",SITE.url),component:CommunityInstitutionTypes,errorComponent:CommunityError});
