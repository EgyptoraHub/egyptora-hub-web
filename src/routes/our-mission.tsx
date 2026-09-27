import { createFileRoute } from "@tanstack/react-router";
import { InfoCard, SimplePage, simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/our-mission")({
  head: () => simpleHead("/our-mission", "Our Mission | Egyptora Hub", "Why Egyptora Hub exists: one trusted place to discover, visit, live, invest and do business in Egypt.", SITE.url),
  component: Page,
});

function Page() {
  const { t } = useI18n();
  return (
    <SimplePage title="Our Mission" intro="To make Egypt easy to discover, visit, live in and invest in — from one trusted hub." placeholder>
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard title="One hub"><p>{t("Travel, heritage, investment, real estate and government information brought together in one place, in nine languages.")}</p></InfoCard>
        <InfoCard title="Trusted information"><p>{t("We link to official sources and label every listing with its verification status.")}</p></InfoCard>
        <InfoCard title="Egypt's digital future"><p>{t("A private platform supporting Egypt's digital future, aligned with the goals of Egypt Vision 2030.")}</p></InfoCard>
      </div>
    </SimplePage>
  );
}
