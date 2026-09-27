import { createFileRoute, Link } from "@tanstack/react-router";
import { SimplePage, simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/faq")({
  head: () => simpleHead("/faq", "FAQ | Egyptora Hub", "Answers to common questions about Egyptora Hub, bookings, the AI concierge, visas and partnerships.", SITE.url),
  component: Page,
});

const FAQ: [string, string][] = [
  ["Is Egyptora Hub a government website?", "No. Egyptora Hub is an independent private-sector platform. We link to official government sources but do not act on behalf of any authority."],
  ["Can I apply for an Egyptian visa here?", "No. We explain the process and link to the official Egypt e-Visa portal, where applications are made."],
  ["Who answers in the chat?", "EGYPTORA AI, an automated assistant. It can make mistakes, so check important details with official sources."],
  ["Are bookings live?", "Payments currently run in test mode. Travel search widgets are provided by partners."],
  ["How do I list my business?", "Apply through the Become a Partner page and our team will contact you."],
];

function Page() {
  const { t } = useI18n();
  return (
    <SimplePage title="Frequently Asked Questions" placeholder>
      <div className="max-w-3xl divide-y divide-border rounded-2xl border border-border bg-card">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group p-5">
            <summary className="cursor-pointer font-semibold text-navy">{t(q)}</summary>
            <p className="mt-2 text-sm text-text-body">{t(a)}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-sm text-text-body">
        {t("Still have a question?")} <Link to="/contact" className="font-semibold text-primary hover:underline">{t("Contact us")}</Link>
      </p>
    </SimplePage>
  );
}
