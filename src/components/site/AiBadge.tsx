import { useI18n } from "@/i18n";
import { needsAiBadge } from "@/lib/generated-images";
import { cn } from "@/lib/utils";

/** The one "Illustrative AI image" badge. Place inside a `relative` image box; renders nothing for credited photos, ill-* and ph-* images. */
export function AiBadge({ src, force = false, className }: { src?: string | null; force?: boolean; className?: string }) {
  const { lang } = useI18n();
  if (!force && !needsAiBadge(src)) return null;
  return (
    <span className={cn("pointer-events-none absolute bottom-2 start-2 z-10 rounded-full bg-navy/85 px-2 py-0.5 text-2xs font-semibold text-primary-foreground", className)}>
      {lang === "ar" ? "صورة توضيحية بالذكاء الاصطناعي" : "Illustrative AI image"}
    </span>
  );
}
