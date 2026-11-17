import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFeatureFlags } from "@/lib/groundwork.functions";
import { EDUCATION_PHASE2_FLAGS } from "@/lib/education-validation";
import { useI18n } from "@/i18n";
const labels: Record<typeof EDUCATION_PHASE2_FLAGS[number],string> = {education_admissions_applications:"Admissions applications",education_transfers:"Transfers",education_student_records:"Student records",education_parent_access:"Parent access",education_credential_wallet:"Credential wallet",education_certificate_verification:"Certificate verification",education_jobs_matching:"Jobs matching",education_employer_verification:"Employer verification",education_scholarship_applications:"Scholarship applications",education_labs_booking:"Labs booking",education_research_submissions:"Research submissions",education_investment_applications:"Investment applications",education_case_management:"Case management",education_governorate_dashboards:"Governorate dashboards",education_mobile_app:"Mobile app section"};
export function EducationPhase2Flags(){const {t}=useI18n();const load=useServerFn(getFeatureFlags);const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;load().then(result=>{if(active&&result.authorized)setReady(true);}).catch(()=>{});return()=>{active=false;};},[load]);
 if(!ready)return null;return <section className="mt-8 border-t border-border pt-6"><h2 className="text-lg font-semibold text-foreground">{t("Education Phase 2 (infrastructure only)")}</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{EDUCATION_PHASE2_FLAGS.map(flag=><li key={flag} className="flex items-center gap-3 text-sm text-foreground"><input type="checkbox" disabled checked={false} aria-label={t(labels[flag])}/><span>{t(labels[flag])}</span><span className="ms-auto text-muted-foreground">{t("Disabled")} · {t("Phase 2")}</span></li>)}</ul></section>;
}
