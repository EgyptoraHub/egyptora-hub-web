import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import credits from "@/data/photo-credits.json";
import { useI18n } from "@/i18n";
import { GENERATED_IMAGES } from "@/lib/generated-images";


const AI_GROUPS: { type: string; en: string; ar: string }[] = [
  { type: "banner", en: "Banners", ar: "اللافتات" },
  { type: "era-card", en: "Historical eras (illustrative landscapes)", ar: "الحقب التاريخية (مناظر توضيحية)" },
  { type: "card", en: "Cards (encyclopedia, marketplace, entertainment, offers, museums and more)", ar: "البطاقات (الموسوعة، السوق، الترفيه، العروض، المتاحف وغيرها)" },
  { type: "illustration", en: "Icons & illustrations", ar: "الأيقونات والرسوم" },
  { type: "eco-card", en: "Nature", ar: "الطبيعة" },
  { type: "zone-card", en: "Zones", ar: "المناطق الاقتصادية" },
  { type: "gov-card", en: "Government", ar: "الجهات الحكومية" },
  { type: "culture-card", en: "Culture", ar: "الثقافة" },
  { type: "placeholder", en: "Placeholders", ar: "الصور البديلة" },
  { type: "cover", en: "Covers", ar: "الأغلفة" },
];

type Credit = { title: string; page: string; license: string; author: string };

export const Route = createFileRoute("/photo-credits")({
  head: () => ({
    meta: [
      { title: "Photo Credits — Egyptora Hub" },
      { name: "description", content: "Sources, authors and licences for the photographs used across Egyptora Hub." },
      { property: "og:title", content: "Photo Credits — Egyptora Hub" },
      { property: "og:description", content: "Sources, authors and licences for the photographs used across Egyptora Hub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PhotoCredits,
});

function PhotoCredits() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const L = (en: string, a: string) => (ar ? a : en);
  const credited = credits as Record<string, Credit>;
  const rows = Object.entries(credited).filter(([path]) => !path.includes("vision-2030")).map(([, c]) => c);
  const aiAll = Object.values(GENERATED_IMAGES);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section>
        <SectionHeader
          title="Photo Credits"
          description={L(
            "This site uses two kinds of images: AI-generated illustrative images made for Egyptora Hub, and third-party images credited individually below. Logos remain the property of their owners.",
            "يستخدم الموقع نوعين من الصور: صور توضيحية مولّدة بالذكاء الاصطناعي لمنصة إيجيبتورا هب، وصور من أطراف أخرى مذكور مصدر كل منها أدناه. الشعارات ملك لأصحابها.",
          )}
        />
        <section className="mb-8 rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-lg font-bold text-navy">{L("AI-generated illustrative images", "صور توضيحية مولّدة بالذكاء الاصطناعي")}</h2>
          <p className="mt-1 text-sm text-text-body">{L("Illustrative images generated with AI for Egyptora Hub; they do not depict real events, people or exact locations.", "صور توضيحية مولّدة بالذكاء الاصطناعي لمنصة إيجيبتورا هب؛ لا تصوّر أحداثًا أو أشخاصًا أو مواقع حقيقية بدقة.")}</p>
          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {AI_GROUPS.map((g) => (
              <li key={g.type} className="flex justify-between gap-2 border-b border-border py-1">
                <span className="text-navy">{ar ? g.ar : g.en} ({aiAll.filter((i) => i.type === g.type).length})</span>
                <span className="text-xs font-semibold text-shell-gold">{L("AI-generated", "مولّدة بالذكاء الاصطناعي")}</span>
              </li>
            ))}
          </ul>
        </section>
        <h2 className="mb-3 font-display text-lg font-bold text-navy">{L("Third-party images", "صور من أطراف أخرى")}</h2>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {rows.map((c) => (
            <li key={c.page} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <a href={c.page} target="_blank" rel="noreferrer noopener" className="font-medium text-navy hover:text-shell-gold">
                {c.title.replace(/^File:/, "").replace(/\.\w+$/, "")}
              </a>
              <span className="text-xs text-muted-foreground">
                {c.author ? `${c.author} · ` : ""}
                {c.license} · {t("Wikimedia Commons")}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-8 rounded-xl border border-border bg-bg-alt p-4 text-sm text-text-body">
          {L("All images on Egyptora Hub are either AI-generated illustrations (listed by group) or carry the credit shown below.", "كل الصور على إيجيبتورا هب إما رسوم توضيحية مولّدة بالذكاء الاصطناعي (مذكورة حسب المجموعة) أو تحمل نسبة المصدر الموضحة أدناه.")}
        </p>
      </Section>
      <SiteFooter />
    </div>
  );
}
