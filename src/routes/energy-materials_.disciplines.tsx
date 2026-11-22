import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { EnergyDisciplines, EnergyError } from "@/components/energy/EnergyPages";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
export const Route = createFileRoute("/energy-materials_/disciplines")({loader:async ()=>{const avail=await fetchNavAvailability();if(linkGatedOff("/energy-materials/disciplines",avail))throw notFound();},head:()=>simpleHead("/energy-materials/disciplines","Engineering disciplines and categories — Energy Materials | Egyptora Hub","Illustrative energy and industrial categories, not a product catalogue.",SITE.url),component:EnergyDisciplines,errorComponent:EnergyError});
