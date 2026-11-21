import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFeatureFlags } from "@/lib/groundwork.functions";
import { SHIPPING_PHASE2_FLAGS } from "@/lib/shipping-validation";
import { useI18n } from "@/i18n";
const labels = Object.fromEntries(SHIPPING_PHASE2_FLAGS.map(flag => [flag, flag.replace(/^shipping_/, "").replace(/_/g, " ")])) as Record<typeof SHIPPING_PHASE2_FLAGS[number], string>;
export function ShippingPhase2Flags(){const {t}=useI18n();const load=useServerFn(getFeatureFlags);const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;load().then(result=>{if(active&&result.authorized)setReady(true);}).catch(()=>{});return()=>{active=false;};},[load]);
 if(!ready)return null;return <section className="mt-8 border-t border-border pt-6"><h2 className="text-lg font-semibold text-foreground">{t("Shipping Phase 2 (infrastructure only)")}</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{SHIPPING_PHASE2_FLAGS.map(flag=><li key={flag} className="flex items-center gap-3 text-sm text-foreground"><input type="checkbox" disabled checked={false} aria-label={t(labels[flag])}/><span>{t(labels[flag])}</span><span className="ms-auto text-muted-foreground">{t("Disabled")} · {t("Phase 2")}</span></li>)}</ul></section>;
}
