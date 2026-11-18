import { ExternalLink } from "lucide-react";
import { useI18n } from "@/i18n";
import { researchText } from "@/lib/research-programs";

/** Official source + "Last verified" line for a research programme. Renders nothing without a source. */
export function ResearchSourceLine({ name, nameAr, url, verified }: { name: string | null; nameAr: string | null; url: string | null; verified: string | null }) {
  const { t, lang } = useI18n();
  if (!url) return null;
  const label = researchText(lang, name, nameAr) ?? url;
  return (
    <p className="mt-3 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
      <span>{t("Source:")}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 max-w-full items-center gap-1 font-medium text-gold-text underline [overflow-wrap:anywhere] hover:text-foreground">
        {label}
        <ExternalLink className="size-3 shrink-0" aria-hidden />
      </a>
      {verified && (
        <span className="whitespace-nowrap">
          · {t("Last verified")} <span dir="ltr">{verified}</span>
        </span>
      )}
    </p>
  );
}
