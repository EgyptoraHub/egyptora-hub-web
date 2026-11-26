import { useId, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, Landmark, Send, Users, ClipboardList } from "lucide-react";
import { SimplePage } from "@/components/site/SimplePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { useNavAvailability } from "@/lib/nav-availability";
import { linkGatedOff } from "@/lib/path-gates";
import { COMMUNITY_CARDS, COMMUNITY_CONCEPT, COMMUNITY_CONSENT, COMMUNITY_DESCRIPTOR, COMMUNITY_ENDOWMENT_NOTE, COMMUNITY_FORM_NOTICE, COMMUNITY_INTRO, COMMUNITY_LATER, COMMUNITY_LEGAL_NOTE, COMMUNITY_NOTICE, COMMUNITY_OFFICIAL_LINE, COMMUNITY_TYPES, COMMUNITY_TYPES_NOTE } from "@/lib/community-public";
import { COMMUNITY_INTERESTS, COMMUNITY_ORG_TYPES, communityInterestSchema } from "@/lib/community-validation";
import { communityGuidesQuery, submitCommunityInterest } from "@/lib/community.functions";
import { safeHealthUrl } from "@/lib/health-public";
import { sourceUrlWarning } from "@/lib/protected-areas";
import { formatLanguages } from "@/lib/format-languages";
import { communityInstitutionTypeLabel, communityInterestLabel, communityOrgTypeLabel } from "@/i18n/community-translations";

const GD = { label: "Government Directory", to: "/government-directory" };
const ICONS = [Building2, Landmark, ClipboardList] as const;

export function CommunityShell({ title, children, hub = false }: { title: string; children: ReactNode; hub?: boolean }) {
  const { t } = useI18n();
  return (
    <SimplePage title={title} trail={hub ? [GD] : [GD, { label: "Egyptora Community", to: "/community" }]} {...(hub ? { intro: COMMUNITY_INTRO } : {})}>
      {hub && <p className="-mt-2 mb-4 font-semibold text-gold-text">{t(COMMUNITY_DESCRIPTOR)}</p>}
      <aside className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm font-semibold leading-relaxed text-navy">{t(COMMUNITY_NOTICE)}</aside>
      <div className="mt-8 space-y-8">{children}</div>
      <div className="mt-10 space-y-2 border-t border-border pt-5">
        <p className="text-sm text-text-body">{t(COMMUNITY_CONCEPT)}</p>
        <Link to="/legal/$slug" params={{ slug: "community-hub-disclaimer" }} className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline">{t("Egyptora Community Disclaimer")} · {t("Draft disclaimer")}</Link>
      </div>
    </SimplePage>
  );
}

export function CommunityEntryCard() {
  const { t } = useI18n(); const avail = useNavAvailability();
  if (linkGatedOff("/community", avail)) return null;
  return <Link to="/community" className="group flex min-w-0 items-center gap-5 rounded-lg border border-gold-line bg-bg-notice p-6 transition-colors hover:bg-chip-active"><Users className="size-9 shrink-0 text-gold-text" /><div className="min-w-0 flex-1"><h2 className="font-display text-2xl font-bold text-navy">{t("Egyptora Community")}</h2><p className="mt-2 text-sm text-text-body">{t(COMMUNITY_DESCRIPTOR)} · {t("This section is under development.")}</p></div><ArrowRight className="size-6 shrink-0 text-navy rtl:rotate-180" /></Link>;
}

export function CommunityHub() {
  const { t } = useI18n();
  return (
    <CommunityShell title="Egyptora Community" hub>
      <div className="grid gap-5 md:grid-cols-3">
        {COMMUNITY_CARDS.map((c, i) => { const Icon = ICONS[i] ?? Users; return (
          <Link key={c.to} to={c.to} className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-6 hover:border-gold-line">
            <Icon className="size-9 text-gold-text" />
            <h2 className="mt-4 font-display text-xl font-bold text-navy">{t(c.title)}</h2>
            <p className="mt-3 flex-1 leading-relaxed text-text-body">{t(c.body)}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-navy">{t("Open")}<ArrowRight className="size-4 rtl:rotate-180" /></span>
          </Link>); })}
      </div>
      <div className="grid gap-8 border-y border-border py-6 md:grid-cols-2">
        <section><h2 className="font-display text-xl font-semibold text-navy">{t("What is available today")}</h2>
          <ul className="mt-3 space-y-2">{COMMUNITY_CARDS.map(c => <li key={c.to}><Link to={c.to} className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline">{t(c.title)}<ArrowRight className="size-4 rtl:rotate-180" /></Link></li>)}</ul></section>
        <section><h2 className="font-display text-xl font-semibold text-navy">{t("Coming later")} · {t("Not available")}</h2>
          <ul className="mt-4 grid gap-2 text-sm text-text-body sm:grid-cols-2">{COMMUNITY_LATER.map(l => <li key={l}>{t(l)}</li>)}</ul></section>
      </div>
      <section>
        <p className="max-w-3xl leading-relaxed text-text-body">{t(COMMUNITY_OFFICIAL_LINE)}</p>
        <div className="mt-3 flex flex-wrap gap-x-6">
          <Link to="/government-directory/complaints" search={{ q: "", family: "" }} className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline">{t("Complaints & Services Guide")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
          <Link to="/government-directory" className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline">{t("Official Directory")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
        </div>
      </section>
    </CommunityShell>
  );
}

export function CommunityInstitutionTypes() {
  const { t } = useI18n();
  return (
    <CommunityShell title="Institution types">
      <p className="text-text-body">{t(COMMUNITY_TYPES_NOTE)}</p>
      <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2">{COMMUNITY_TYPES.map(c => <li key={c.title} className="min-w-0 border-t border-border pt-4"><h2 className="font-display text-xl font-bold text-navy">{t(c.title)}</h2><p className="mt-2 text-text-body">{t(c.body)}</p></li>)}</ul>
      <div className="space-y-3 border-t border-border pt-5 text-sm leading-relaxed text-text-body"><p>{t(COMMUNITY_LEGAL_NOTE)}</p><p>{t(COMMUNITY_ENDOWMENT_NOTE)}</p></div>
    </CommunityShell>
  );
}

export function CommunityAuthorityGuide() {
  const { t, lang } = useI18n();
  const { data } = useSuspenseQuery(communityGuidesQuery);
  return (
    <CommunityShell title="Competent authority guide">
      {!data.length ? (
        <div className="flex items-center gap-4 border-y border-border py-10 text-navy"><Landmark className="size-8 shrink-0 text-gold-text" /><p>{t("Official sources are being verified")}</p></div>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">{data.map(g => { const official = safeHealthUrl(g.official_url); const source = safeHealthUrl(g.source_url); const warning = source ? sourceUrlWarning(source) : null; const body = lang === "ar" ? (g.competent_body_name_ar || g.competent_body_name_en) : g.competent_body_name_en; return (
          <li key={g.id} className="min-w-0 rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-xl font-semibold text-navy" dir="auto">{lang === "ar" ? g.topic_ar : g.topic_en}</h2>
            <p className="mt-1 text-sm font-semibold text-gold-text">{communityInstitutionTypeLabel(g.institution_type, lang)}</p>
            {body && <p className="mt-2 text-text-body" dir="auto">{t("Competent body:")} {body}</p>}
            <p className="mt-2 text-text-body" dir="auto">{lang === "ar" ? (g.summary_ar || g.summary_en) : g.summary_en}</p>
            <p className="mt-2 text-sm text-text-body">{formatLanguages(g.languages, lang)}</p>
            <div className="mt-3 flex flex-wrap gap-4">{official && <a href={official} target="_blank" rel="noopener noreferrer" className="min-h-11 font-semibold text-navy underline">{t("Official website")}</a>}{source && <a href={source} target="_blank" rel="noopener noreferrer" className="min-h-11 font-semibold text-navy underline">{t("Source")}: {lang === "ar" ? (g.source_name_ar || g.source_name) : g.source_name}</a>}</div>
            {warning && <p className="text-xs text-text-body">{t(warning)}</p>}
            {g.verified_on && <p className="text-xs text-text-body">{t("Last verified:")} <bdi>{g.verified_on}</bdi></p>}
          </li>); })}</ul>
      )}
    </CommunityShell>
  );
}

function Req({ children }: { children: ReactNode }) { return <span>{children}<span aria-hidden="true"> *</span></span>; }

export function CommunityPartnerInterest() {
  const { t, lang } = useI18n();
  const id = useId();
  const submit = useServerFn(submitCommunityInterest);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<"success" | "error" | "invalid" | null>(null);
  return (
    <CommunityShell title="Institution interest form">
      <p className="max-w-3xl leading-relaxed text-text-body">{t(COMMUNITY_FORM_NOTICE)}</p>
      {state === "success" ? (
        <div role="status" className="border-s-4 border-gold-line bg-bg-notice p-5 text-navy">
          {t("Your expression of interest has been received. It creates no obligation or promise of service.")}
          <Button className="mt-4 block min-h-11" variant="outline" onClick={() => setState(null)}>{t("Send another")}</Button>
        </div>
      ) : (<>
        <p className="text-sm text-text-body">{t("Fields marked * are required.")}</p>
        <form aria-label={t("Institution interest form")} className="grid max-w-3xl gap-5" onSubmit={async e => {
          e.preventDefault(); setState(null);
          const fd = new FormData(e.currentTarget); const str = (k: string) => String(fd.get(k) ?? "");
          const parsed = communityInterestSchema.safeParse({ organisation_name: str("organisation_name"), country: str("country"), organisation_type: str("organisation_type"), interests: fd.getAll("interests"), contact_name: str("contact_name"), contact_email: str("contact_email"), message: str("message"), consent_given: fd.get("consent_given") === "on", website: str("website") });
          if (!parsed.success) { setState("invalid"); return; }
          setPending(true);
          try { const r = await submit({ data: parsed.data }); setState(r.ok ? "success" : "error"); } catch { setState("error"); } finally { setPending(false); }
        }}>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <div className="grid gap-5 sm:grid-cols-2">
            {[{ key: "organisation_name", label: "Organisation name", max: 200 }, { key: "country", label: "Country", max: 100 }, { key: "contact_name", label: "Contact name", max: 100 }, { key: "contact_email", label: "Contact email", max: 255 }].map(f => (
              <label key={f.key} htmlFor={`${id}-${f.key}`} className="grid min-w-0 gap-2 text-sm font-semibold text-navy">
                <Req>{t(f.label)}</Req>
                <Input className="min-h-11" id={`${id}-${f.key}`} name={f.key} required aria-required="true" maxLength={f.max} type={f.key === "contact_email" ? "email" : "text"} dir={f.key === "contact_email" ? "ltr" : "auto"} />
              </label>))}
          </div>
          <label htmlFor={`${id}-type`} className="grid min-w-0 gap-2 text-sm font-semibold text-navy">
            <Req>{t("Organisation type")}</Req>
            <select id={`${id}-type`} name="organisation_type" required aria-required="true" className="min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-foreground">
              {COMMUNITY_ORG_TYPES.map(o => <option key={o} value={o}>{communityOrgTypeLabel(o, lang)}</option>)}
            </select>
          </label>
          <fieldset aria-required="true">
            <legend className="text-sm font-semibold text-navy"><Req>{t("Interests")}</Req></legend>
            <div className="mt-2 grid gap-x-6 sm:grid-cols-2">{COMMUNITY_INTERESTS.map(k => <label key={k} className="flex min-h-11 items-center gap-3 text-sm text-navy"><input type="checkbox" name="interests" value={k} className="size-5 shrink-0 accent-primary" />{communityInterestLabel(k, lang)}</label>)}</div>
          </fieldset>
          <label htmlFor={`${id}-message`} className="grid gap-2 text-sm font-semibold text-navy">
            <Req>{t("Message")}</Req>
            <Textarea id={`${id}-message`} name="message" required aria-required="true" maxLength={1000} rows={5} dir="auto" />
            <span className="text-xs font-normal text-text-body">{t("Maximum characters:")} 1000</span>
          </label>
          <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed text-navy">
            <input type="checkbox" name="consent_given" required aria-required="true" className="mt-1 size-5 shrink-0 accent-primary" />
            <Req>{t(COMMUNITY_CONSENT)}</Req>
          </label>
          {state && <p role="alert" className="text-sm text-destructive">{t(state === "invalid" ? "Please check the fields, message length and consent." : "Your request could not be saved. Please try again shortly.")}</p>}
          <Button type="submit" disabled={pending} className="min-h-11 justify-self-start"><Send className="size-4" />{t(pending ? "Sending…" : "Send request")}</Button>
        </form>
      </>)}
    </CommunityShell>
  );
}

export function CommunityError() { const { t } = useI18n(); return <CommunityShell title="Egyptora Community"><p role="alert">{t("Community information is temporarily unavailable.")}</p></CommunityShell>; }
