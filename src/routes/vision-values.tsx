import { createFileRoute } from "@tanstack/react-router";
import { InfoCard, SimplePage, simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/vision-values")({
  head: () => simpleHead("/vision-values", "Vision & Values | Egyptora Hub", "The vision and values that guide Egyptora Hub: accuracy, transparency, accessibility and partnership.", SITE.url),
  component: Page,
});

const VALUES = [
  ["Accuracy", "We prefer official sources and say clearly when information is unverified."],
  ["Transparency", "We label partner content, AI answers and demo data honestly."],
  ["Accessibility", "Everything Egypt, available to everyone, in their own language."],
  ["Partnership", "We work with local businesses and communities across all 27 governorates."],
];

function Page() {
  const { t } = useI18n();
  return (
    <SimplePage title="Vision & Values" intro="Our vision: Egypt's most trusted digital gateway for visitors, residents and investors worldwide." placeholder>
      <div className="grid gap-4 md:grid-cols-2">
        {VALUES.map(([title, body]) => (
          <InfoCard key={title} title={title}><p>{t(body)}</p></InfoCard>
        ))}
      </div>
    </SimplePage>
  );
}
