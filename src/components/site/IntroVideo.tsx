import { useState } from "react";
import { Play } from "lucide-react";
import { INTRO_VIDEO } from "@/lib/intro-video";
import { AiBadge } from "@/components/site/AiBadge";
import { useI18n } from "@/i18n";

/** Click-to-load YouTube facade. Renders nothing while no video ID is configured. */
export function IntroVideo({ youtubeId = INTRO_VIDEO.youtubeId }: { youtubeId?: string }) {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);
  if (!youtubeId) return null;
  const id = encodeURIComponent(youtubeId);
  const poster = INTRO_VIDEO.posterSrc ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const title = t(INTRO_VIDEO.title.en);

  return (
    <section className="mx-auto w-full max-w-[960px] px-4 py-10 text-start lg:px-0">
      <h2 className="font-display text-2xl font-bold text-navy sm:text-[28px]">{title}</h2>
      <p className="mt-1 text-sm text-text-body">{t(INTRO_VIDEO.subtitle.en)}</p>
      <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-navy">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={title}
            className="absolute inset-0 size-full"
          />
        ) : (
          <>
            <img src={poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            {INTRO_VIDEO.posterSrc && <AiBadge src={INTRO_VIDEO.posterSrc} />}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={t(INTRO_VIDEO.aria.en)}
              className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-navy shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              <Play className="size-7 translate-x-0.5 fill-current" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      {INTRO_VIDEO.aiGeneratedVideo && <p className="mt-2 text-xs text-text-body">{t("This video was generated with AI.")}</p>}
    </section>
  );
}
