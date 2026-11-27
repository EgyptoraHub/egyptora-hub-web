import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { JusticeHub, JusticeError } from "@/components/justice/JusticePages";
import { JUSTICE_INTRO } from "@/lib/justice-public";
export const Route = createFileRoute("/justice")({loader:async()=>{if(linkGatedOff("/justice",await fetchNavAvailability()))throw notFound();},head:()=>simpleHead("/justice","Justice & Legal Services Guide | Egyptora Hub",JUSTICE_INTRO,SITE.url),component:JusticeHub,errorComponent:JusticeError});
