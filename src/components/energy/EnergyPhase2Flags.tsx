import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFeatureFlags } from "@/lib/groundwork.functions";
import { ENERGY_PHASE2_FLAGS } from "@/lib/energy-validation";
import { useI18n } from "@/i18n";
export function EnergyPhase2Flags() {
 const {t}=useI18n();const load=useServerFn(getFeatureFlags);const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;load().then(result=>{if(active&&result.authorized)setReady(true);}).catch(()=>{});return()=>{active=false;};},[load]);
 if(!ready)return null;
 return <section className="mt-8 border-t border-border pt-6"><h2 className="text-lg font-semibold text-foreground">{t("Energy Phase 2 (infrastructure only)")}</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{ENERGY_PHASE2_FLAGS.map(flag=><li key={flag} className="flex min-w-0 items-center gap-3 text-sm text-foreground"><input type="checkbox" disabled checked={false} aria-label={flag}/><span className="break-words">{flag}</span><span className="ms-auto shrink-0 text-muted-foreground">{t("Disabled")} · {t("Phase 2")}</span></li>)}</ul></section>;
}
