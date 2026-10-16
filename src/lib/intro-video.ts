/**
 * Home page platform intro video.
 *
 * TO PUBLISH: set `youtubeId` to the YouTube video ID (e.g. "dQw4w9WgXcQ").
 * That is the only step needed — while it is "" the section renders nothing.
 * Copy is translated through the i18n dictionaries (phase40-translations.ts).
 */
export const INTRO_VIDEO = {
  youtubeId: "",
  /** Optional poster; falls back to the YouTube thumbnail. */
  posterSrc: undefined as string | undefined,
  /** Set true if the video itself is AI-generated (shows a disclosure line). */
  aiGeneratedVideo: false,
  title: { en: "Meet Egyptora Hub", ar: "تعرّف على Egyptora Hub" },
  subtitle: {
    en: "A one-minute introduction to Egypt's all-in-one platform",
    ar: "مقدمة في دقيقة واحدة عن منصة مصر الشاملة",
  },
  aria: { en: "Play the platform introduction video", ar: "تشغيل فيديو التعريف بالمنصة" },
};
