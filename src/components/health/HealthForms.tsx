import { useId, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n, LANGUAGES } from "@/i18n";
import { publicHealthInquirySchema, publicHealthReportSchema } from "@/lib/health-public";
import { submitHealthInquiry, submitHealthReport } from "@/lib/health.functions";

export function HealthForm({ type, facilityId }: { type: "medical_travel" | "partner" | "research" | "report"; facilityId?: string }) {
  const { t, lang } = useI18n(); const id = useId(); const inquiry = useServerFn(submitHealthInquiry); const report = useServerFn(submitHealthReport);
  const [pending, setPending] = useState(false); const [state, setState] = useState<"success" | "error" | "invalid" | null>(null);
  const isReport = type === "report"; const max = isReport ? 1000 : 1500;
  if (state === "success") return <div role="status" className="border-s-4 border-gold-line bg-bg-notice p-5 text-navy">{t(isReport ? "Your listing report has been received." : "Your inquiry has been received. An administrator will respond.")}<Button className="ms-3 min-h-11" variant="outline" onClick={() => setState(null)}>{t("Send another")}</Button></div>;
  return <form className="grid max-w-3xl gap-4" aria-label={t(isReport ? "Report an error in a listing" : type === "partner" ? "Partnership inquiry" : type === "research" ? "Research inquiry" : "Medical travel inquiry")} onSubmit={async (e) => {
    e.preventDefault(); setState(null); const fd = new FormData(e.currentTarget); const str = (key: string) => String(fd.get(key) ?? "");
    const raw = isReport ? { facility_id: facilityId ?? null, kind: str("kind"), message: str("message"), contact_email: str("email") || null, consent: fd.get("consent") === "on" } : { type, full_name: str("full_name"), email: str("email"), country: str("country"), preferred_language: str("preferred_language"), message: str("message"), consent: fd.get("consent") === "on" };
    setPending(true); try { if (isReport) { const parsed = publicHealthReportSchema.safeParse(raw); if (!parsed.success) { setState("invalid"); return; } const res = await report({ data: parsed.data }); setState(res.ok ? "success" : "error"); } else { const parsed = publicHealthInquirySchema.safeParse(raw); if (!parsed.success) { setState("invalid"); return; } const res = await inquiry({ data: parsed.data }); setState(res.ok ? "success" : "error"); } } catch { setState("error"); } finally { setPending(false); }
  }}>
    <p className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm font-semibold text-navy">{t("Do not include medical information, diagnoses, reports or personal health details.")}</p>
    {!isReport && <label htmlFor={`${id}-name`} className="grid gap-1 text-sm text-navy">{t("Full name")}<Input className="min-h-11" id={`${id}-name`} name="full_name" required maxLength={100} autoComplete="name" dir="auto" /></label>}
    <label htmlFor={`${id}-email`} className="grid gap-1 text-sm text-navy">{t(isReport ? "Email (optional)" : "Email")}<Input className="min-h-11" id={`${id}-email`} name="email" type="email" required={!isReport} maxLength={255} autoComplete="email" dir="ltr" /></label>
    {!isReport && <><label htmlFor={`${id}-country`} className="grid gap-1 text-sm text-navy">{t("Country")}<Input className="min-h-11" id={`${id}-country`} name="country" required maxLength={100} dir="auto" /></label><label htmlFor={`${id}-language`} className="grid gap-1 text-sm text-navy">{t("Preferred language")}<select id={`${id}-language`} name="preferred_language" defaultValue={lang} className="min-h-11 rounded-md border border-input bg-background px-3">{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}</select></label></>}
    {isReport && <label htmlFor={`${id}-kind`} className="grid gap-1 text-sm text-navy">{t("Type of listing error")}<select id={`${id}-kind`} name="kind" className="min-h-11 rounded-md border border-input bg-background px-3">{[["wrong_info", "Incorrect information"], ["closed", "Facility closed"], ["link_broken", "Broken link"], ["other", "Other"]].map(([value, label]) => <option value={value} key={value}>{t(label ?? "")}</option>)}</select></label>}
    <label htmlFor={`${id}-message`} className="grid gap-1 text-sm text-navy">{t("Message")}<Textarea id={`${id}-message`} name="message" required maxLength={max} rows={5} dir="auto" /><span className="text-xs text-text-body">{t("Maximum characters:")} {max}</span></label>
    <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed text-navy"><input className="mt-1 size-5 shrink-0 accent-primary" type="checkbox" name="consent" required />{t("I consent to Egyptora Hub using these contact details to respond to this administrative request.")}</label>
    {state && <p role="alert" className="text-sm text-destructive">{t(state === "invalid" ? "Please check the fields, message length and consent." : "Your request could not be saved. Please try again.")}</p>}
    <Button type="submit" className="min-h-11 justify-self-start" disabled={pending}><Send />{t(pending ? "Sending…" : "Send request")}</Button>
  </form>;
}
