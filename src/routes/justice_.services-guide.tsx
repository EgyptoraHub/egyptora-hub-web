import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { JusticeServicesGuide, JusticeError } from "@/components/justice/JusticePages";
import { justiceGuidesQuery } from "@/lib/justice.functions";
export const Route = createFileRoute("/justice_/services-guide")({loader:async({context})=>{if(linkGatedOff("/justice/services-guide",await fetchNavAvailability()))throw notFound();await context.queryClient.ensureQueryData(justiceGuidesQuery);},head:()=>simpleHead("/justice/services-guide","Official services guide — Justice & Legal Services Guide | Egyptora Hub","Official Egyptian justice-related portals and services, from official sources.",SITE.url),component:JusticeServicesGuide,errorComponent:JusticeError});
