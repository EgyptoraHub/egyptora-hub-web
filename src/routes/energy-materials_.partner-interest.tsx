import { createFileRoute, notFound } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { EnergyPartnerInterest, EnergyError } from "@/components/energy/EnergyPages";
import { fetchNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
export const Route = createFileRoute("/energy-materials_/partner-interest")({loader:async ()=>{const avail=await fetchNavAvailability();if(linkGatedOff("/energy-materials/partner-interest",avail))throw notFound();},head:()=>simpleHead("/energy-materials/partner-interest","Founding-partner interest — Energy Materials | Egyptora Hub","Company expressions of interest for Energy Materials, with consent and no obligation or promise of service.",SITE.url),component:EnergyPartnerInterest,errorComponent:EnergyError});
