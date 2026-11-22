import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { EnergyOfficialBodies, EnergyError } from "@/components/energy/EnergyPages";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { energyBodiesQuery } from "@/lib/energy.functions";
export const Route = createFileRoute("/energy-materials_/official-bodies")({loader:async ({context})=>{const avail=await fetchNavAvailability();if(linkGatedOff("/energy-materials/official-bodies",avail))throw notFound();await context.queryClient.ensureQueryData(energyBodiesQuery);},head:()=>simpleHead("/energy-materials/official-bodies","Official bodies — Energy Materials | Egyptora Hub","Energy Materials official sources are being verified.",SITE.url),component:EnergyOfficialBodies,errorComponent:EnergyError});
