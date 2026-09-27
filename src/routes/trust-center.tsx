import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoCard, SimplePage, simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/trust-center")({
  head: () =>
    simpleHead(
      "/trust-center",
      "Trust Center | Egyptora Hub",
      "How Egyptora Hub approaches security, privacy, AI transparency, verification, data sources and partner disclosure.",
      SITE.url,
    ),
  component: TrustCenterPage,
});

const SECTIONS: { id: string; title: string; body: string; link?: { label: string; slug: string } }[] = [
  { id: "security", title: "Security", body: "Accounts use secure sign-in, and access to personal records is limited to the account owner and authorised staff. Detailed security practices will be published here." },
  { id: "privacy", title: "Privacy", body: "We collect only what is needed to run your account, trips and requests. Read the full privacy policy for details.", link: { label: "Privacy Policy", slug: "privacy" } },
  { id: "ai", title: "AI Transparency", body: "The EGYPTORA AI concierge is an automated assistant, not a human or a government official. Its answers are not legal, medical or investment advice.", link: { label: "AI Transparency Policy", slug: "ai-transparency" } },
  { id: "verification", title: "Verification", body: "Listings carry a status label showing whether their information is verified, pending review or demo content. Formal partner verification is planned." },
  { id: "data-sources", title: "Data Sources", body: "Content is compiled from official government portals, public sources and partners, and is labelled with its source where available. Photos are credited on the Photo Credits page." },
  { id: "partners", title: "Partner Disclosure", body: "Some listings and booking tools come from commercial partners, and we may earn a commission. Partner content is labelled as such." },
  { id: "cookies", title: "Cookies & Consent", body: "We use cookies needed to run the site and, with your consent, for analytics. You can review your choices at any time.", link: { label: "Cookie Policy", slug: "cookies" } },
  { id: "accessibility", title: "Accessibility", body: "We aim to make the platform usable for everyone, including screen-reader and keyboard users, in nine languages. Tell us if something doesn't work for you." },
  { id: "report", title: "Report a Concern", body: "Seen incorrect information, a security issue or misuse? Contact us and our team will review it." },
];

function TrustCenterPage() {
  const { t } = useI18n();
  return (
    <SimplePage
      title="Trust Center"
      intro="Egyptora Hub is an independent private-sector platform, not a government entity. This page explains how we handle your data, our content and our AI."
      placeholder
    >
      <nav className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-full border border-border px-3 py-1 text-xs text-navy hover:border-primary">
            {t(s.title)}
          </a>
        ))}
      </nav>
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <InfoCard key={s.id} id={s.id} title={s.title}>
            <p>{t(s.body)}</p>
            {s.link && (
              <Link to="/legal/$slug" params={{ slug: s.link.slug }} className="font-semibold text-primary hover:underline">
                {t(s.link.label)} →
              </Link>
            )}
            {s.id === "data-sources" && (
              <Link to="/photo-credits" className="font-semibold text-primary hover:underline">{t("Photo Credits")} →</Link>
            )}
            {s.id === "report" && (
              <Link to="/contact" className="font-semibold text-primary hover:underline">{t("Contact us")} →</Link>
            )}
          </InfoCard>
        ))}
      </div>
    </SimplePage>
  );
}
