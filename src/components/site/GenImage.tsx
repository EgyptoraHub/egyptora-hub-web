import { useI18n } from "@/i18n";
import { altFor, getGeneratedImage } from "@/lib/generated-images";
import { cn } from "@/lib/utils";

/** Renders one AI-generated image from the central map; renders nothing when missing or hidden. */
export function GenImage({
  k, className, priority = false, sizes = "(min-width:1024px) 33vw, 100vw", decorative = false, aiBadge = false,
}: { k: string | null | undefined; className?: string; priority?: boolean; sizes?: string; decorative?: boolean; aiBadge?: boolean }) {
  const { lang } = useI18n();
  const img = getGeneratedImage(k);
  if (!img) return null;
  const el = (
    <img
      src={img.src}
      width={img.width}
      height={img.height}
      alt={decorative ? "" : altFor(img, lang)}
      aria-hidden={decorative || undefined}
      sizes={sizes}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      {...(priority ? { fetchPriority: "high" as const } : {})}
      className={cn("object-cover", className)}
    />
  );
  if (!aiBadge) return el;
  return (
    <span className="relative block">
      {el}
      <span className="absolute bottom-2 start-2 rounded-full bg-navy/85 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
        {lang === "ar" ? "صورة توضيحية بالذكاء الاصطناعي" : "Illustrative AI image"}
      </span>
    </span>
  );
}

/** 21:9 banner strip used at the top of hub pages. */
export function GenBanner({ k }: { k: string }) {
  return <GenImage k={k} priority sizes="100vw" className="aspect-[21/9] max-h-72 w-full rounded-2xl" />;
}
