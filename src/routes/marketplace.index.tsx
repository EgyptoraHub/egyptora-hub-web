import { createFileRoute } from "@tanstack/react-router";
import { simpleHead } from "@/components/site/SimplePage";
import { SITE } from "@/config/site";
import { MilShell } from "@/components/military/MilitaryUI";
import { innerWrap, cardGrid, PhotoCard } from "@/components/layout/InnerPage";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { MARKETPLACE_CARDS } from "@/data/marketplace-index";

const title = "Made in Egypt Marketplace — Crafts, Cotton & Heritage Fashion | Egyptora Hub";
const description = "Four Made in Egypt collections: Wear Egypt, Handmade Crafts, Egyptian Cotton and Local Producers — verified makers and workshops.";

export const Route = createFileRoute("/marketplace/")({
  head: () => simpleHead("/marketplace", title, description, SITE.url),
  component: MarketplaceIndex,
});

function MarketplaceIndex() {
  const { t } = useI18n();
  return (
    <MilShell crumbs={[{ label: t("Made in Egypt Marketplace") }]} title={t("Made in Egypt Marketplace")} subtitle={t(description)}>
      <main className={cn(innerWrap, "py-8")}>
        <div className={cardGrid}>
          {MARKETPLACE_CARDS.map((c) => <PhotoCard key={c.to} c={c} h="h-36" />)}
        </div>
      </main>
    </MilShell>
  );
}
