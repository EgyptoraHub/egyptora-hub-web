import { useId, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Cog, Recycle, Zap, Send, Landmark } from "lucide-react";
import { SimplePage } from "@/components/site/SimplePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { useNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { ENERGY_CATEGORIES, ENERGY_LABELS, ENERGY_LATER, ENERGY_INTRO, ENERGY_NOTICE, ENERGY_FORM_NOTICE, ENERGY_CONSENT, ENERGY_STANDARDS } from "@/lib/energy-public";
import { ENERGY_DISCIPLINES, ENERGY_ROLES, energyInterestSchema } from "@/lib/energy-validation";
import { energyBodiesQuery, submitEnergyInterest } from "@/lib/energy.functions";
import { safeHealthUrl } from "@/lib/health-public";
import { sourceUrlWarning } from "@/lib/protected-areas";
import { formatLanguages } from "@/lib/format-languages";
import { energyBodyTypeLabel } from "@/i18n/energy-translations";

export function EnergyEntryCard() {
 const {t} = useI18n(); const avail = useNavAvailability();
 if(linkGatedOff("/energy-materials",avail)) return null;
 return <Link to="/energy-materials" className="group flex min-w-0 items-center gap-5 rounded-lg border border-gold-line bg-bg-notice p-6 transition-colors hover:bg-chip-active"><Zap className="size-9 shrink-0 text-gold-text"/><div className="min-w-0 flex-1"><h2 className="font-display text-2xl font-bold text-navy">{t("Energy Materials")}</h2><p className="mt-2 text-sm text-text-body">{t("Informational pages and company expressions of interest. This section is under development.")}</p></div><ArrowRight className="size-6 shrink-0 text-navy rtl:rotate-180"/></Link>;
}
export function EnergyShell({title, children, hub=false}: {title:string;children:ReactNode;hub?:boolean}) {
 const {t}=useI18n();
 return <SimplePage title={title} trail={hub ? [] : [{label:"Energy Materials",to:"/energy-materials"}]} {...(hub ? {intro:ENERGY_INTRO} : {})}>
 <aside className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm font-semibold leading-relaxed text-navy">{t(ENERGY_NOTICE)}</aside>
 <div className="mt-8 space-y-8">{children}</div>
 <div className="mt-10 border-t border-border pt-5"><Link to="/legal/$slug" params={{slug:"energy-materials-disclaimer"}} className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline">{t("Energy Materials Disclaimer")} · {t("Draft disclaimer")}</Link></div>
 </SimplePage>;
}
export function EnergyHub() {
 const {t}=useI18n();
 return <EnergyShell title="Energy Materials" hub>
 <div className="grid gap-5 md:grid-cols-2">{[{title:"Engineering Materials",body:"Sourcing of piping, valves, pumps, electrical, instrumentation and telecom materials for projects.",Icon:Cog},{title:"Circular Materials",body:"Surplus, reuse and recycling of industrial materials, with attention to safe handling.",Icon:Recycle}].map(({title,body,Icon})=><Link key={title} to="/energy-materials/disciplines" className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-6 hover:border-gold-line"><Icon className="size-9 text-gold-text"/><h2 className="mt-4 font-display text-2xl font-bold text-navy">{t(title)}</h2><p className="mt-3 flex-1 leading-relaxed text-text-body">{t(body)}</p><span className="mt-6 inline-flex items-center gap-2 font-semibold text-navy">{t("Open")}<ArrowRight className="size-4 rtl:rotate-180"/></span></Link>)}</div>
 <div className="grid gap-8 border-y border-border py-6 md:grid-cols-2"><section><h2 className="font-display text-xl font-semibold text-navy">{t("What is available today")}</h2><ul className="mt-3 space-y-2">{([{to:"/energy-materials/disciplines",label:"Engineering disciplines and categories"},{to:"/energy-materials/official-bodies",label:"Official bodies"},{to:"/energy-materials/partner-interest",label:"Founding-partner interest"}] as const).map(item=><li key={item.to}><Link to={item.to} className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline">{t(item.label)}<ArrowRight className="size-4 rtl:rotate-180"/></Link></li>)}</ul></section><section><h2 className="font-display text-xl font-semibold text-navy">{t("Coming later")} · {t("Not available")}</h2><ul className="mt-4 grid gap-2 text-sm text-text-body sm:grid-cols-2">{ENERGY_LATER.map(label=><li key={label}>{t(label)}</li>)}</ul></section></div>
 </EnergyShell>;
}
export function EnergyDisciplines() {const {t}=useI18n();return <EnergyShell title="Engineering disciplines and categories"><p className="text-text-body">{t("Illustrative categories, not a product catalogue.")}</p><div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">{ENERGY_DISCIPLINES.map(key=><section key={key} className="min-w-0 border-t border-border pt-5"><h2 className="font-display text-xl font-bold text-navy">{t(ENERGY_LABELS[key])}</h2><ul className="mt-3 list-inside list-disc space-y-2 text-text-body">{ENERGY_CATEGORIES[key].map(item=><li key={item}>{t(item)}</li>)}</ul>{key==="circular"&&<p className="mt-4 text-sm font-semibold text-navy">{t("Hazardous waste is regulated and is never treated as ordinary scrap.")}</p>}</section>)}</div><p className="border-t border-border pt-5 text-sm leading-relaxed text-text-body">{t(ENERGY_STANDARDS)}</p></EnergyShell>;}
export function EnergyOfficialBodies() {
 const {t,lang}=useI18n();const {data}=useSuspenseQuery(energyBodiesQuery);
 return <EnergyShell title="Official bodies">{!data.length ? <div className="flex items-center gap-4 border-y border-border py-10 text-navy"><Landmark className="size-8 shrink-0 text-gold-text"/><p>{t("Official sources are being verified")}</p></div> : <ul className="grid gap-5 md:grid-cols-2">{data.map(body=>{const official=safeHealthUrl(body.official_url);const source=safeHealthUrl(body.source_url);const warning=source?sourceUrlWarning(source):null;return <li key={body.id} className="min-w-0 rounded-lg border border-border bg-card p-5"><h2 className="font-display text-xl font-semibold text-navy" dir="auto">{lang==="ar"?body.name_ar:body.name_en}</h2><p className="mt-1 text-sm font-semibold text-gold-text" dir="auto">{energyBodyTypeLabel(body.body_type,lang)}</p><p className="mt-2 text-text-body" dir="auto">{lang==="ar"?(body.summary_ar||body.summary_en):body.summary_en}</p><p className="mt-2 text-sm text-text-body">{formatLanguages(body.languages,lang)}</p><div className="mt-3 flex flex-wrap gap-4">{official&&<a href={official} target="_blank" rel="noopener noreferrer" className="min-h-11 font-semibold text-navy underline">{t("Official website")}</a>}{source&&<a href={source} target="_blank" rel="noopener noreferrer" className="min-h-11 font-semibold text-navy underline">{t("Source")}: {lang==="ar"?(body.source_name_ar||body.source_name):body.source_name}</a>}</div>{warning&&<p className="text-xs text-text-body">{t(warning)}</p>}{body.verified_on&&<p className="text-xs text-text-body">{t("Last verified:")} <bdi>{body.verified_on}</bdi></p>}</li>;})}</ul>}</EnergyShell>;
}
export function EnergyPartnerInterest() {
 const {t}=useI18n();const id=useId();const submit=useServerFn(submitEnergyInterest);const [pending,setPending]=useState(false);const [state,setState]=useState<"success"|"error"|"invalid"|null>(null);
 return <EnergyShell title="Founding-partner interest"><p className="max-w-3xl leading-relaxed text-text-body">{t(ENERGY_FORM_NOTICE)}</p>{state==="success" ? <div role="status" className="border-s-4 border-gold-line bg-bg-notice p-5 text-navy">{t("Your expression of interest has been received. It creates no obligation or promise of service.")}<Button className="mt-4 block min-h-11" variant="outline" onClick={()=>setState(null)}>{t("Send another")}</Button></div> : <form aria-label={t("Founding-partner interest")} className="grid max-w-3xl gap-5" onSubmit={async e=>{e.preventDefault();setState(null);const fd=new FormData(e.currentTarget);const str=(key:string)=>String(fd.get(key)??"");const parsed=energyInterestSchema.safeParse({company_name:str("company_name"),country:str("country"),company_role:str("company_role"),disciplines:fd.getAll("disciplines"),contact_name:str("contact_name"),contact_email:str("contact_email"),message:str("message"),consent_given:fd.get("consent_given")==="on",website:str("website")});if(!parsed.success){setState("invalid");return;}setPending(true);try{const result=await submit({data:parsed.data});setState(result.ok?"success":"error");}catch{setState("error");}finally{setPending(false);}}}>
 <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden"/>
 <div className="grid gap-5 sm:grid-cols-2">{[{key:"company_name",label:"Company name",max:200},{key:"country",label:"Country",max:100},{key:"contact_name",label:"Contact name",max:100},{key:"contact_email",label:"Contact email",max:255}].map(field=><label key={field.key} htmlFor={`${id}-${field.key}`} className="grid min-w-0 gap-2 text-sm font-semibold text-navy">{t(field.label)}<Input className="min-h-11" id={`${id}-${field.key}`} name={field.key} required maxLength={field.max} type={field.key==="contact_email"?"email":"text"} dir={field.key==="contact_email"?"ltr":"auto"}/></label>)}</div>
 <label htmlFor={`${id}-role`} className="grid min-w-0 gap-2 text-sm font-semibold text-navy">{t("Company role")}<select id={`${id}-role`} name="company_role" className="min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-foreground">{ENERGY_ROLES.map(role=><option key={role} value={role}>{t(role)}</option>)}</select></label>
 <fieldset><legend className="text-sm font-semibold text-navy">{t("Disciplines")}</legend><div className="mt-2 grid gap-x-6 sm:grid-cols-2">{ENERGY_DISCIPLINES.map(key=><label key={key} className="flex min-h-11 items-center gap-3 text-sm text-navy"><input type="checkbox" name="disciplines" value={key} className="size-5 shrink-0 accent-primary"/>{t(ENERGY_LABELS[key])}</label>)}</div></fieldset>
 <label htmlFor={`${id}-message`} className="grid gap-2 text-sm font-semibold text-navy">{t("Message")}<Textarea id={`${id}-message`} name="message" required maxLength={1000} rows={5} dir="auto"/><span className="text-xs font-normal text-text-body">{t("Maximum characters:")} 1000</span></label>
 <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed text-navy"><input type="checkbox" name="consent_given" required className="mt-1 size-5 shrink-0 accent-primary"/>{t(ENERGY_CONSENT)}</label>
 {state&&<p role="alert" className="text-sm text-destructive">{t(state==="invalid"?"Please check the fields, message length and consent.":"Your request could not be saved. Please try again shortly.")}</p>}
 <Button type="submit" disabled={pending} className="min-h-11 justify-self-start"><Send className="size-4"/>{t(pending?"Sending…":"Send request")}</Button>
 </form>}</EnergyShell>;
}
export function EnergyError(){const {t}=useI18n();return <EnergyShell title="Energy Materials"><p role="alert">{t("Energy information is temporarily unavailable.")}</p></EnergyShell>;}
