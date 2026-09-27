import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { InfoCard, SimplePage, simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

const PORTAL = "https://visa2egypt.gov.eg/eVisa/Home";
const LAST_VERIFIED = "27 September 2026";

export const Route = createFileRoute("/visit-egypt_/e-visa")({
  head: () =>
    simpleHead(
      "/visit-egypt/e-visa",
      "Egypt e-Visa: How to Apply | Egyptora Hub",
      "How the official Egypt e-Visa works — steps, entry requirements and fees, with a direct link to the official government portal.",
      SITE.url,
    ),
  component: EVisaPage,
});

const STEPS = [
  "Create an account on the official Egypt e-Visa Portal and confirm your registration.",
  "Sign in, select Apply Now and choose the visa type.",
  "Fill in the application form and pay by Visa, MasterCard or another debit card.",
  "Wait for approval by email, then download and print your e-Visa.",
  "Present the printed e-Visa to the immigration officer at your port of entry.",
];

const REQUIREMENTS = [
  "Passport valid for at least 6 months from your arrival date",
  "Printed e-Visa",
  "Travel itinerary",
  "Hotel bookings or details of places you will visit (tourists)",
  "Supporting letter for business or family visits (e.g. invitation letter)",
];

function EVisaPage() {
  const { t } = useI18n();
  return (
    <SimplePage
      title="Egypt e-Visa"
      intro="Citizens of many countries can apply for an Egyptian tourist visa online through the official portal run by the Ministry of Interior."
      banner={
        <div className="sticky top-0 z-30 border-b border-border bg-muted">
          <p className="mx-auto flex max-w-[1280px] items-center gap-2 px-4 py-2 text-xs font-medium text-navy lg:px-8">
            <ShieldAlert className="size-4 shrink-0" />
            {t("EGYPTORA-HUB is an independent private-sector platform — it does not issue visas or make visa decisions.")}
          </p>
        </div>
      }
    >
      <a
        href={PORTAL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground"
      >
        {t("Apply on Official Egypt e-Visa Portal")} <ExternalLink className="size-4" />
      </a>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <InfoCard title="How to apply">
          <ol className="list-decimal space-y-1 ps-5">
            {STEPS.map((s) => <li key={s}>{t(s)}</li>)}
          </ol>
        </InfoCard>
        <InfoCard title="Entry requirements (on arrival)">
          <ul className="list-disc space-y-1 ps-5">
            {REQUIREMENTS.map((s) => <li key={s}>{t(s)}</li>)}
          </ul>
        </InfoCard>
        <InfoCard title="Visa types and fees">
          <p>{t("Tourist visa, single entry: USD 30")}</p>
          <p>{t("Tourist visa, multiple entries: USD 65")}</p>
          <p className="text-xs text-muted-foreground">{t("Fees are set by the Egyptian authorities and may change — always confirm on the official portal.")}</p>
        </InfoCard>
        <InfoCard title="Who can apply?">
          <p>{t("Eligible nationalities are listed on the official portal. Egyptian port authorities may refuse entry to an e-Visa holder, as with any visa.")}</p>
        </InfoCard>
      </div>
      <p className="mt-6 inline-block rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">
        {t("Official source")}: visa2egypt.gov.eg · {t("Last verified")}: {LAST_VERIFIED}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        {t("This page is informational only. We never ask for passport or visa-application details — apply only on the official portal.")}
      </p>
    </SimplePage>
  );
}
