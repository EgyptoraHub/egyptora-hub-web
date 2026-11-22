import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { EnergyHub, EnergyError } from "@/components/energy/EnergyPages";
import { ENERGY_INTRO } from "@/lib/energy-public";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
export const Route = createFileRoute("/energy-materials")({ loader:async()=>{if(linkGatedOff("/energy-materials",await fetchNavAvailability()))throw notFound();}, head:()=>simpleHead("/energy-materials","Energy Materials | Egyptora Hub",ENERGY_INTRO,SITE.url),component:EnergyHub,errorComponent:EnergyError });
