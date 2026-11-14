import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFeatureFlags } from "@/lib/groundwork.functions";
import { MOBILITY_PHASE2_FLAGS } from "@/lib/mobility-validation";
import { useI18n } from "@/i18n";
const labels: Record<typeof MOBILITY_PHASE2_FLAGS[number],string> = {mobility_marketplace_listings:"Marketplace listings",mobility_rfq:"Requests for quotation",mobility_rental_operations:"Rental operations",mobility_contracts_esignature:"Contracts & e-signature",mobility_payments_escrow:"Payments & escrow",mobility_financed_asset_settlement:"Financed asset settlement",mobility_inspection_booking:"Inspection booking",mobility_vehicle_tracking:"Vehicle tracking",mobility_roadside_dispatch:"Roadside dispatch",mobility_tenders_auctions:"Tenders & auctions",mobility_gov_asset_gateway:"Government asset gateway",mobility_taxi_registry:"Taxi registry",mobility_mobile_app:"Mobile app section"};
export function MobilityPhase2Flags(){const {t}=useI18n();const load=useServerFn(getFeatureFlags);const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;load().then(result=>{if(active&&result.authorized)setReady(true);}).catch(()=>{});return()=>{active=false;};},[load]);
 if(!ready)return null;return <section className="mt-8 border-t border-border pt-6"><h2 className="text-lg font-semibold text-foreground">{t("Mobility & Industrial Phase 2 (infrastructure only)")}</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{MOBILITY_PHASE2_FLAGS.map(flag=><li key={flag} className="flex items-center gap-3 text-sm text-foreground"><input type="checkbox" disabled checked={false} aria-label={t(labels[flag])}/><span>{t(labels[flag])}</span><span className="ms-auto text-muted-foreground">{t("Disabled")} · {t("Phase 2")}</span></li>)}</ul></section>;
}
