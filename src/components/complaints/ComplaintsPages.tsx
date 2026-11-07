import { useState, type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Phone, Globe2, Smartphone, MessageCircle, ShieldAlert, AlertTriangle, LifeBuoy, ClipboardList } from "lucide-react";
import { SimplePage } from "@/components/site/SimplePage";
import { EmptyState } from "@/components/site/EmptyState";
import { Badge } from "@/components/site/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { safeHealthUrl } from "@/lib/health-public";
import { sourceUrlWarning } from "@/lib/protected-areas";
import { sourceDateText, sourceNameFor } from "@/lib/trade-public";
import { complaintSectorsQuery, complaintSectorQuery, unifiedChannelQuery, type ComplaintChannel } from "@/lib/complaints.functions";
import { COMPLAINT_FAMILY_LABELS, CHANNEL_TYPE_LABELS, UNKNOWN_AUTHORITY_SECTOR, WHAT_TO_PREPARE, complaintTextFor, type ComplaintsSearch } from "@/lib/complaints-public";
import { COMPLAINT_FAMILIES } from "@/lib/complaints-validation";
import { cn } from "@/lib/utils";

const TRAIL = [{ label: "Government Directory", to: "/government-directory" }];

function ComplaintExternal({ url, children, source = false }: { url: string | null | undefined; children: ReactNode; source?: boolean }) {
  const { t } = useI18n();
  const safe = safeHealthUrl(url);
  if (!safe) return null;
  const warning = source ? sourceUrlWarning(safe) : null;
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2">
      <a className="hit-44 min-h-11 inline-flex break-words font-semibold text-navy underline" href={safe} target="_blank" rel="noopener noreferrer">{children}</a>
      {warning && <span className="text-xs text-text-body">{t(warning)}</span>}
    </span>
  );
}

/** "Source: <name> · <link> · Last verified: <date>" — items render only when present, separators only between items. */
function SourceLine({ name, nameAr, url, date }: { name: string | null; nameAr?: string | null; url: string | null; date: string | null }) {
  const { t, lang } = useI18n();
  const verified = sourceDateText(date);
  const sourceName = sourceNameFor(lang, name, nameAr);
  const verifiedText = verified ? `${t("Last verified:")} ${new Date(verified).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", { timeZone: "UTC" })}` : null;
  return (
    <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-text-body">
      <span>{t("Source:")}</span>
      {sourceName && <span dir="auto">{sourceName}</span>}
      <span className="inline-flex items-baseline gap-2 whitespace-nowrap">{sourceName && <span aria-hidden="true">·</span>}<ComplaintExternal url={url} source>{t("Source")}</ComplaintExternal></span>
      {verifiedText && <span className="whitespace-nowrap"><span aria-hidden="true">· </span>{verifiedText}</span>}
    </p>
  );
}

/** The Phase 1 banner: Egyptora never receives, stores, forwards or tracks complaints. */
function NoIntakeBanner() {
  const { t } = useI18n();
  return (
    <aside className="border-s-4 border-gold-line bg-bg-notice p-4 text-sm leading-relaxed text-navy">
      <p className="font-semibold">{t("Egyptora does not receive complaints. This guide points you to the official channels.")}</p>
      <p className="mt-1">{t("Egyptora Hub is an independent private platform, not a government body.")}</p>
    </aside>
  );
}

/** Short disclaimer with a link to the full draft legal document — shown at the bottom of every guide page. */
export function ComplaintsDisclaimer() {
  const { t } = useI18n();
  return (
    <aside className="my-6 border-s-4 border-gold-line bg-bg-notice p-4 text-sm leading-relaxed text-navy">
      <p>{t("Channel details can change; always confirm on the official website or hotline. Nothing here is legal advice, and listing a channel does not mean the authority endorses Egyptora.")}</p>
      <p>
        <Link className="hit-44 min-h-11 inline-flex font-semibold underline" to="/legal/$slug" params={{ slug: "complaints-guide-disclaimer" }}>{t("Read the full disclaimer")}</Link>
      </p>
    </aside>
  );
}

function EmergencyStrip() {
  const { t } = useI18n();
  return (
    <p className="rounded-[10px] border border-border bg-bg-band p-4 text-sm text-navy">
      <LifeBuoy className="me-2 inline size-4 text-gold-text" aria-hidden />
      {t("In immediate danger? Use the official")} <Link className="hit-44 min-h-11 inline-flex font-semibold underline" to="/emergency-numbers">{t("emergency numbers")}</Link>.
    </p>
  );
}

/** Static bilingual "What to prepare" checklist + the never-share warning. */
function WhatToPrepare() {
  const { t } = useI18n();
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold text-navy">{t("What to prepare")}</h2>
      <ul className="list-disc space-y-1 ps-6 text-sm leading-relaxed text-text-body">
        {WHAT_TO_PREPARE.map((item) => <li key={item}>{t(item)}</li>)}
      </ul>
      <p className="mt-4 flex items-start gap-2 rounded-[10px] border border-border bg-bg-notice p-4 text-sm font-semibold text-navy">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold-text" aria-hidden />
        {t("Never share ID numbers, bank-card numbers or passwords with anyone offering to handle complaints for you.")}
      </p>
    </section>
  );
}

export function ComplaintsShell({ title, intro, trail, children }: { title: string; intro?: string; trail?: { label: string; to: string }[]; children: ReactNode }) {
  return (
    <SimplePage title={title} {...(intro ? { intro } : {})} trail={[...TRAIL, ...(trail ?? [])]}>
      <div className="space-y-8">{children}</div>
    </SimplePage>
  );
}

export function ComplaintsUnavailable() {
  const { t } = useI18n();
  return (
    <ComplaintsShell title="Complaints & Services Guide">
      <div className="py-10 text-center">
        <ShieldAlert className="mx-auto mb-3 size-8 text-gold-text" />
        <p className="font-display text-xl font-semibold text-navy">{t("This section is being prepared")}</p>
        <p className="mt-2 text-sm text-text-body">{t("This page is unavailable or is still being verified.")}</p>
      </div>
    </ComplaintsShell>
  );
}

export function ComplaintsError() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <ComplaintsShell title="Complaints & Services Guide">
      <p role="alert">{t("Complaints guide information is temporarily unavailable.")}</p>
      <Button className="min-h-11" onClick={() => void router.invalidate()}>{t("Try again")}</Button>
    </ComplaintsShell>
  );
}

/* ---------------- Hub ---------------- */

export function ComplaintsHubPage({ search }: { search: ComplaintsSearch }) {
  const { data: sectors } = useSuspenseQuery(complaintSectorsQuery);
  const { t, lang } = useI18n();
  const [q, setQ] = useState(search.q);
  const [family, setFamily] = useState(search.family);
  const known = sectors.filter((s) => s.slug !== UNKNOWN_AUTHORITY_SECTOR);
  const term = q.trim().toLowerCase();
  const rows = known.filter((s) => {
    if (family && s.family !== family) return false;
    if (!term) return true;
    return [s.name_en, s.name_ar, s.scope_en, s.scope_ar].some((v) => (v ?? "").toLowerCase().includes(term));
  });
  return (
    <ComplaintsShell title="Complaints & Services Guide" intro="Find the official channel that handles your issue, by sector.">
      <NoIntakeBanner />
      <EmergencyStrip />
      <div className="grid max-w-2xl gap-3">
        <label className="grid gap-1 text-sm text-navy">
          {t("Search sectors")}
          <Input value={q} onChange={(e) => setQ(e.target.value)} className="min-h-11" dir="auto" maxLength={200} placeholder={t("Type a keyword, e.g. water, passport, prices")} />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("Filter by family")}>
          <button type="button" onClick={() => setFamily("")} className={cn("hit-44 inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold", family === "" ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy")}>{t("All families")}</button>
          {COMPLAINT_FAMILIES.map((f) => (
            <button key={f} type="button" onClick={() => setFamily(family === f ? "" : f)} className={cn("hit-44 inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold", family === f ? "border-navy bg-navy text-primary-foreground" : "border-border bg-card text-navy")}>{t(COMPLAINT_FAMILY_LABELS[f])}</button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState text="No sector matches your search." Icon={ClipboardList} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((s) => (
            <article key={s.id} className="flex h-full min-w-0 flex-col rounded-lg border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-navy" dir="auto">{lang === "ar" ? s.name_ar : s.name_en}</h2>
                {s.notice_type === "sensitive" && <Badge>{t("Sensitive")}</Badge>}
                {s.notice_type === "emergency" && <Badge>{t("Emergency")}</Badge>}
              </div>
              <p className="text-sm text-text-body">{t(COMPLAINT_FAMILY_LABELS[s.family as keyof typeof COMPLAINT_FAMILY_LABELS] ?? s.family)}</p>
              {complaintTextFor(lang, s.scope_en, s.scope_ar) && <p className="mt-2 line-clamp-3 text-sm text-text-body" dir="auto">{complaintTextFor(lang, s.scope_en, s.scope_ar)}</p>}
              <Link to="/government-directory/complaints/$slug" params={{ slug: s.slug }} className="hit-44 mt-auto inline-flex min-h-11 items-center gap-1 pt-2 text-sm font-semibold text-navy underline">
                {t("View official channels")} <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </article>
          ))}
        </div>
      )}
      <section className="rounded-[10px] border border-border bg-bg-band p-5 text-center">
        <h2 className="font-display text-lg font-bold text-navy">{t("Not sure who to contact?")}</h2>
        <p className="mt-1 text-sm text-text-body">{t("A short guide to finding the right official channel, step by step.")}</p>
        <div className="mt-3">
          <Link to="/government-directory/complaints/unknown-authority" className="hit-44 inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold-cta px-5 text-sm font-semibold text-gold-foreground">
            {t("Open the guide")} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
      <ComplaintsDisclaimer />
    </ComplaintsShell>
  );
}

/* ---------------- Sector detail ---------------- */

const CHANNEL_ICONS = { hotline: Phone, website: Globe2, app: Smartphone, whatsapp: MessageCircle } as const;

function ChannelCard({ c }: { c: ComplaintChannel }) {
  const { t, lang } = useI18n();
  const Icon = CHANNEL_ICONS[c.channel_type as keyof typeof CHANNEL_ICONS] ?? Globe2;
  const authority = complaintTextFor(lang, c.authority_name_en, c.authority_name_ar);
  const label = complaintTextFor(lang, c.label_en, c.label_ar);
  const hours = complaintTextFor(lang, c.hours_en, c.hours_ar);
  const handles = complaintTextFor(lang, c.handles_en, c.handles_ar);
  const isHotline = c.channel_type === "hotline";
  const safe = isHotline ? null : safeHealthUrl(c.channel_value);
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-gold-text" aria-hidden />
        <h3 className="font-display text-lg font-semibold text-navy" dir="auto">{authority}</h3>
      </div>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-text-body">{t(CHANNEL_TYPE_LABELS[c.channel_type as keyof typeof CHANNEL_TYPE_LABELS] ?? c.channel_type)}</p>
      {label && <p className="mt-2 text-sm text-text-body" dir="auto">{label}</p>}
      <div className="mt-2 text-sm">
        {isHotline ? (
          <a className="hit-44 inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline" href={`tel:${c.channel_value.replace(/[^+0-9]/g, "")}`} dir="ltr">{c.channel_value}</a>
        ) : safe ? (
          <a className="hit-44 inline-flex min-h-11 items-center gap-2 break-words font-semibold text-navy underline" href={safe} target="_blank" rel="noopener noreferrer" dir="ltr">{safe}</a>
        ) : null}
      </div>
      {hours && <p className="mt-1 text-sm text-text-body" dir="auto"><span className="font-semibold text-navy">{t("Hours:")}</span> {hours}</p>}
      {handles && <p className="mt-1 text-sm text-text-body" dir="auto"><span className="font-semibold text-navy">{t("Handles:")}</span> {handles}</p>}
      <SourceLine name={c.source_name} nameAr={c.source_name_ar} url={c.source_url} date={c.last_verified_at} />
    </article>
  );
}

export function ComplaintSectorDetail({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(complaintSectorQuery(slug));
  const { t, lang } = useI18n();
  const s = data.sector;
  if (!s) return null;
  const name = complaintTextFor(lang, s.name_en, s.name_ar) ?? s.name_en;
  const scope = complaintTextFor(lang, s.scope_en, s.scope_ar);
  return (
    <ComplaintsShell title={name} trail={[{ label: "Complaints & Services Guide", to: "/government-directory/complaints" }]}>
      <NoIntakeBanner />
      {s.notice_type === "emergency" && (
        <p className="rounded-[10px] border border-border bg-bg-band p-4 text-sm font-semibold text-navy">
          <LifeBuoy className="me-2 inline size-4 text-gold-text" aria-hidden />
          {t("If there is immediate danger, call the official emergency numbers first.")} <Link className="hit-44 min-h-11 inline-flex font-semibold underline" to="/emergency-numbers">{t("Emergency & Quick Numbers")}</Link>
        </p>
      )}
      {s.notice_type === "sensitive" && (
        <p className="rounded-[10px] border border-border bg-bg-notice p-4 text-sm leading-relaxed text-navy">
          {t("Egyptora does not receive reports or allegations. Do not post accusations against named people publicly. A report is not a finding. Use the official channels below.")}
        </p>
      )}
      <p className="text-sm text-text-body">{t(COMPLAINT_FAMILY_LABELS[s.family as keyof typeof COMPLAINT_FAMILY_LABELS] ?? s.family)}</p>
      {scope && <p className="leading-relaxed text-text-body" dir="auto">{scope}</p>}
      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-navy">{t("Official channels")}</h2>
        {data.channels.length === 0 ? (
          <EmptyState text="Official channels are being verified." Icon={ClipboardList} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.channels.map((c) => <ChannelCard key={c.id} c={c} />)}
          </div>
        )}
      </section>
      <WhatToPrepare />
      <ComplaintsDisclaimer />
    </ComplaintsShell>
  );
}

/* ---------------- Unknown-authority guide (static, nothing stored) ---------------- */

export function UnknownAuthorityPage() {
  const { data: sectors } = useSuspenseQuery(complaintSectorsQuery);
  const { data: unified } = useSuspenseQuery(unifiedChannelQuery);
  const { t, lang } = useI18n();
  const unifiedLabel = unified ? complaintTextFor(lang, unified.authority_name_en, unified.authority_name_ar) : null;
  const unifiedSafe = unified && unified.channel_type !== "hotline" ? safeHealthUrl(unified.channel_value) : null;
  return (
    <ComplaintsShell title="Not sure who to contact?" intro="A short guide to finding the right official channel. Nothing you read here is stored, and there are no forms on this page." trail={[{ label: "Complaints & Services Guide", to: "/government-directory/complaints" }]}>
      <NoIntakeBanner />
      <ol className="space-y-4">
        {[
          { title: "Note what happened", body: "Write down what happened, where, when, and which service or person it concerns." },
          { title: "Browse the sectors", body: "Browse the sectors by family or search by keyword to find the authority that handles your issue." },
          { title: "Still unclear?", body: "If it is still unclear, use the official unified government complaints channel." },
          { title: "In danger?", body: "If there is immediate danger, use the official emergency numbers first." },
        ].map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-lg border border-border bg-card p-5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-cta font-display text-sm font-bold text-gold-foreground" aria-hidden>{i + 1}</span>
            <div>
              <h2 className="font-display text-lg font-semibold text-navy">{t(step.title)}</h2>
              <p className="mt-1 text-sm leading-relaxed text-text-body">{t(step.body)}</p>
              {i === 1 && (
                <Link to="/government-directory/complaints" search={{ q: "", family: "" }} className="hit-44 mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy underline">
                  {t("Browse all sectors")} <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              )}
              {i === 2 && unified && (
                <div className="mt-2 rounded-lg border border-border bg-bg-band p-4 text-sm">
                  <p className="font-semibold text-navy" dir="auto">{unifiedLabel}</p>
                  {unified.channel_type === "hotline" ? (
                    <a className="hit-44 mt-1 inline-flex min-h-11 items-center gap-2 font-semibold text-navy underline" href={`tel:${unified.channel_value.replace(/[^+0-9]/g, "")}`} dir="ltr">{unified.channel_value}</a>
                  ) : unifiedSafe ? (
                    <a className="hit-44 mt-1 inline-flex min-h-11 items-center gap-2 break-words font-semibold text-navy underline" href={unifiedSafe} target="_blank" rel="noopener noreferrer" dir="ltr">{unifiedSafe}</a>
                  ) : null}
                  <SourceLine name={unified.source_name} nameAr={unified.source_name_ar} url={unified.source_url} date={unified.last_verified_at} />
                </div>
              )}
              {i === 3 && (
                <Link to="/emergency-numbers" className="hit-44 mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy underline">
                  {t("Emergency & Quick Numbers")} <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
      <WhatToPrepare />
      <ComplaintsDisclaimer />
    </ComplaintsShell>
  );
}
