import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { JusticeServiceAreas, JusticeError } from "@/components/justice/JusticePages";
export const Route = createFileRoute("/justice_/service-areas")({loader:async()=>{if(linkGatedOff("/justice/service-areas",await fetchNavAvailability()))throw notFound();},head:()=>simpleHead("/justice/service-areas","Service areas — Justice & Legal Services Guide | Egyptora Hub","Where to start, by type of need. Illustrative areas, not a directory.",SITE.url),component:JusticeServiceAreas,errorComponent:JusticeError});
