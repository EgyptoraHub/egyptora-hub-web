import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFeatureFlags } from "@/lib/groundwork.functions";
import { TRADE_PHASE2_FLAGS } from "@/lib/trade-validation";
import { useI18n } from "@/i18n";
const labels: Record<typeof TRADE_PHASE2_FLAGS[number],string> = {trade_supplier_directory:"Supplier directory",trade_rfq:"Requests for quotation",trade_offer_comparison:"Offer comparison",trade_data_room:"Data room",trade_e_signing:"Electronic signing",trade_ai_matching:"AI matching",trade_observatory:"Trade observatory"};
export function TradePhase2Flags(){const {t}=useI18n();const load=useServerFn(getFeatureFlags);const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;load().then(result=>{if(active&&result.authorized)setReady(true);}).catch(()=>{});return()=>{active=false;};},[load]);
 if(!ready)return null;return <section className="mt-8 border-t border-border pt-6"><h2 className="text-lg font-semibold text-foreground">{t("Trade, Industry & Agriculture")}</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{TRADE_PHASE2_FLAGS.map(flag=><li key={flag} className="flex items-center gap-3 text-sm text-foreground"><input type="checkbox" disabled checked={false} aria-label={t(labels[flag])}/><span>{t(labels[flag])}</span><span className="ms-auto text-muted-foreground">{t("Disabled")} · {t("Phase 2")}</span></li>)}</ul></section>;
}
