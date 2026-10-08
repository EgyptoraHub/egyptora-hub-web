import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Globe, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/contact.functions";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Section, SectionHeader } from "@/components/site/Primitives";
import { SITE, mailto } from "@/config/site";
import { useI18n } from "@/i18n";

const title = "Contact Egyptora Hub — Talk to the platform team";
const description =
  "Reach the Egyptora Hub team about travel, heritage content, partnerships, investment enquiries and press. Email info@egyptora-hub.com.";

export const Route = createFileRoute("/contact")({
  validateSearch: (s: Record<string, unknown>): { topic?: string } =>
    typeof s["topic"] === "string" ? { topic: s["topic"] } : {},
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE.url}/contact` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-image.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-image.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/contact` }],
  }),
  component: Contact,
});

const topics: { label: string; subject: string; address?: string }[] = [
  { label: "General enquiry", subject: "Egyptora Hub — general enquiry" },
  { label: "Partnerships", subject: "Egyptora Hub — partnership enquiry" },
  { label: "Investment", subject: "Egyptora Hub — investment enquiry" },
  {
    label: "Press & media",
    subject: "Egyptora Hub — press enquiry",
    address: SITE.marketingEmail,
  },
  {
    label: "Marketing & advertising",
    subject: "Egyptora Hub — marketing enquiry",
    address: SITE.marketingEmail,
  },
  { label: "Content correction", subject: "Egyptora Hub — content correction" },
  { label: "Report an issue", subject: "Egyptora Hub — report an issue" },
  { label: "Share a tourist experience", subject: "Egyptora Hub — tourist experience" },
];


function Contact() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Section>
          <SectionHeader
            eyebrow={t("Contact")}
            title={t("Talk to the Egyptora Hub team")}
            description={t("One address handles every enquiry while the platform is in build. We reply from the same team that maintains the content.")}
          />
          <ContactForm />

          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("Or email us directly")}
          </p>

          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-gold-line bg-card p-7">
              <Mail className="size-5 text-gold" />
              <a
                href={mailto("Egyptora Hub — general enquiry")}
                className="mt-4 block font-display text-2xl text-foreground hover:text-gold"
                dir="ltr"
              >
                {SITE.email}
              </a>
              <p className="mt-3 text-sm text-muted-foreground">
                {t("Marketing & press")}:{" "}
                <a
                  href={mailto("Egyptora Hub — marketing enquiry", SITE.marketingEmail)}
                  className="text-gold hover:text-foreground"
                  dir="ltr"
                >
                  {SITE.marketingEmail}
                </a>
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="size-4 text-gold" />
                <span dir="ltr">{SITE.domain}</span>
              </p>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                {t("No phone line or office address is published yet. We will add them here once they are confirmed rather than list placeholders.")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <a
                  key={topic.label}
                  href={mailto(topic.subject, topic.address ?? SITE.email)}
                  className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-gold-line"
                >
                  <div className="text-sm font-semibold text-foreground">{t(topic.label)}</div>
                  <div className="mt-1 text-xs text-muted-foreground" dir="ltr">
                    {topic.address ?? SITE.email}
                  </div>
                </a>
              ))}

            </div>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

const FIELD =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold-line";

function ContactForm() {
  const { t } = useI18n();
  const send = useServerFn(submitContactMessage);
  const { topic: preset } = Route.useSearch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: topics.find((x) => x.label === preset)?.label ?? topics[0]?.label ?? "General enquiry",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setError(null);
    setSending(true);
    try {
      const result = await send({ data: form });
      if (!result.ok) {
        setError(t(result.error ?? "We couldn't send your message. Please try again."));
        return;
      }
      setSent(true);
      setForm({ ...form, name: "", email: "", message: "" });
      toast.success(t("Thanks — your message has reached us."));
    } catch (err) {
      console.error("[contact] submit failed:", err);
      setError(t("We couldn't send your message. Please try again."));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-gold-line bg-gold-soft p-7">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold" />
        <div>
          <p className="font-display text-xl text-foreground">{t("Message sent")}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("Thanks for getting in touch — our team will reply to you by email.")}
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-4 rounded-full border border-gold-line px-4 py-2 text-xs font-semibold text-gold"
          >
            {t("Send another message")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="mb-8 grid gap-4 rounded-2xl border border-border bg-card p-7"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs text-muted-foreground">{t("Your name")}</span>
          <input
            className={FIELD}
            value={form.name}
            maxLength={120}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs text-muted-foreground">{t("Email address")}</span>
          <input
            className={FIELD}
            dir="ltr"
            type="email"
            value={form.email}
            maxLength={255}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="text-xs text-muted-foreground">{t("Topic")}</span>
        <select
          className={FIELD}
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        >
          {topics.map((topic) => (
            <option key={topic.label} value={topic.label}>
              {t(topic.label)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="text-xs text-muted-foreground">{t("Message")}</span>
        <textarea
          className={FIELD}
          rows={5}
          maxLength={4000}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>

      {error && <p className="text-sm text-hot">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {t("Send message")}
      </button>
    </form>
  );
}
