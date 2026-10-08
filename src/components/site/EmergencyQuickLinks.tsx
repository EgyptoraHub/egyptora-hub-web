import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/** Small "Emergency & Quick Numbers" link with tap-to-call buttons for police (122) and ambulance (123). */
export function EmergencyQuickLinks({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-card p-3 text-sm", className)}>
      <Phone className="size-4 text-navy" aria-hidden="true" />
      <Link to="/emergency-numbers" className="font-semibold text-navy underline">{t("Emergency & Quick Numbers")}</Link>
      <a href="tel:122" className="rounded-full border border-navy px-3 py-1 text-xs font-semibold text-navy" dir="ltr">{t("Police")} 122</a>
      <a href="tel:123" className="rounded-full border border-navy px-3 py-1 text-xs font-semibold text-navy" dir="ltr">{t("Ambulance")} 123</a>
    </div>
  );
}
