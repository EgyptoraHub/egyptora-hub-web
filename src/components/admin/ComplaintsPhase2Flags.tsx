import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFeatureFlags } from "@/lib/groundwork.functions";
import { COMPLAINTS_PHASE2_FLAGS } from "@/lib/complaints-validation";
import { useI18n } from "@/i18n";
const labels: Record<typeof COMPLAINTS_PHASE2_FLAGS[number],string> = {complaints_intake:"Complaint intake",complaints_tracking:"Case tracking",complaints_integrity_channel:"Integrity channel",complaints_agency_console:"Agency console",complaints_evidence_upload:"Evidence upload",complaints_ai_triage:"AI triage",complaints_public_metrics:"Public metrics",complaints_mobile_app:"Mobile app section"};
export function ComplaintsPhase2Flags(){const {t}=useI18n();const load=useServerFn(getFeatureFlags);const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;load().then(result=>{if(active&&result.authorized)setReady(true);}).catch(()=>{});return()=>{active=false;};},[load]);
 if(!ready)return null;return <section className="mt-8 border-t border-border pt-6"><h2 className="text-lg font-semibold text-foreground">{t("Complaints Phase 2 (infrastructure only)")}</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{COMPLAINTS_PHASE2_FLAGS.map(flag=><li key={flag} className="flex items-center gap-3 text-sm text-foreground"><input type="checkbox" disabled checked={false} aria-label={t(labels[flag])}/><span>{t(labels[flag])}</span><span className="ms-auto text-muted-foreground">{t("Disabled")} · {t("Phase 2")}</span></li>)}</ul></section>;
}
