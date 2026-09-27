import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { useState, type ComponentType, type SVGProps } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/egyptora-hub-logo.png.asset.json";
import { Container } from "@/components/site/Primitives";
import { useI18n } from "@/i18n";
import { SITE, mailto } from "@/config/site";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.4-.9-2.4-3.4ZM14.2 5.9c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.7-1.3Z" />
    </svg>
  );
}

function GooglePlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l.1.1 9.3-9.3v-.2L3.6 2.3Zm11.1 6.5L5.5 3.5l8.4 8.4.8-.8.9-.9-1-.9.1-.5Zm.9 3.9-.9-.9-8.4 8.4 9.2-5.3.1-2.2Zm3.9-2.9-2.6-1.5-1.1 1.1 1.6 1.6-1.6 1.6 1.1 1.1 2.6-1.5c.8-.4.8-1.6 0-2.4Z" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.5 3c.3 2.1 1.6 3.6 3.7 3.9v2.5c-1.4.1-2.7-.3-3.9-1.1v5.4c0 3.6-2.6 5.9-5.7 5.9-3 0-5.6-2.4-5.6-5.6 0-3.4 2.9-6 6.4-5.5v2.7c-.4-.1-.8-.2-1.2-.2-1.6 0-2.9 1.3-2.9 3s1.3 3 2.9 3c1.6 0 3-1.2 3-2.9V3h3.3Z" />
    </svg>
  );
}

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.5 3h3l-6.6 7.5L21.8 21h-6l-4.7-6.1L5.7 21H2.6l7-8L2.4 3h6.2l4.2 5.6L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z" />
    </svg>
  );
}

/** Social order is fixed by the brand brief. LinkedIn has no official page yet. */
const socials: { label: string; href?: string; Icon: IconType }[] = [
  { label: "Facebook", href: SITE.social.facebook, Icon: Facebook },
  { label: "Instagram", href: SITE.social.instagram, Icon: Instagram },
  { label: "LinkedIn", Icon: Linkedin },
  { label: "YouTube", href: SITE.social.youtube, Icon: Youtube },
  { label: "X (Twitter)", href: SITE.social.x, Icon: XIcon },
  { label: "TikTok", href: SITE.social.tiktok, Icon: TikTokIcon },
];

type FLink = { label: string; to?: string; href?: string; soon?: boolean };

const exploreLinks: FLink[] = [
  { label: "Explore Egypt", to: "/explore-egypt" },
  { label: "27 Governorates", to: "/governorates" },
  { label: "Visit Egypt", to: "/visit-egypt" },
  { label: "Live in Egypt", to: "/live-in-egypt" },
  { label: "Invest in Egypt", to: "/invest-in-egypt" },
  { label: "Do Business", to: "/do-business" },
  { label: "Government Directory", to: "/government-directory" },
];

/** Deep links into real pages that sit under the main menu sections. */
const discoverLinks: FLink[] = [
  { label: "Visual Encyclopedia", to: "/encyclopedia" },
  { label: "Heritage Sites", to: "/heritage-sites" },
  { label: "Museums & Galleries", to: "/museums" },
  { label: "Events & Festivals", to: "/events" },
  { label: "Real Estate", to: "/real-estate" },
  { label: "Investment Opportunities", to: "/investment-opportunities" },
  { label: "Digital Government Services", to: "/government-directory/digital-services" },
];

const aboutLinks: FLink[] = [
  { label: "About Egyptora", to: "/legal" },
  { label: "Our Mission", to: "/our-mission" },
  { label: "Vision & Values", to: "/vision-values" },
  { label: "Contact Us", to: "/contact" },
  { label: "FAQ", to: "/faq" },
  { label: "Become a Partner", to: "/become-a-partner" },
  { label: "Press & Media", href: mailto("Egyptora Hub — Press & Media") },
];

const legalLinks: FLink[] = [
  { label: "Terms of Use", to: "/legal/terms" },
  { label: "Privacy Policy", to: "/legal/privacy" },
  { label: "Legal Disclaimer", to: "/legal/disclaimer" },
  { label: "Cookie Policy", to: "/legal/cookies" },
  { label: "Accessibility", to: "/legal/accessibility" },
  { label: "Consent Centre", to: "/legal/consent" },
  { label: "Report an Issue", to: "/legal/incident-reporting" },
  { label: "Complaints & Disputes", to: "/legal/complaints-disputes" },
  { label: "Safety Policy", to: "/legal/safety" },
  { label: "AI Transparency", to: "/legal/ai-transparency" },
  { label: "Data Protection", to: "/legal/data-protection" },
  { label: "Trust Center", to: "/trust-center" },
  { label: "Photo Credits", to: "/photo-credits" },
];

const linkCls = "text-[13px] leading-snug text-foreground/75 transition-colors hover:text-shell-gold";

function FooterLink({ link }: { link: FLink }) {
  const { t } = useI18n();
  if (link.to)
    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- static route paths
      <Link to={link.to as any} className={linkCls}>
        {t(link.label)}
      </Link>
    );
  if (link.href)
    return (
      <a href={link.href} className={linkCls}>
        {t(link.label)}
      </a>
    );
  return (
    <span className="inline-flex items-center gap-2 text-sm text-foreground/50">
      {t(link.label)}
      <span className="rounded border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
        {t("Coming soon")}
      </span>
    </span>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="border-b border-shell-gold/30 pb-3 font-display text-[15px] font-semibold tracking-wide text-shell-gold">{children}</h3>;
}

function Newsletter() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  return (
    <div>
      <ColumnTitle>{t("Stay Connected")}</ColumnTitle>
      <p className="mt-4 text-sm text-foreground/75">{t("Subscribe to our updates")}</p>
      <form
        className="mt-3 flex max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.trim()) return;
          window.location.href = `${mailto("Newsletter subscription")}&body=${encodeURIComponent(
            `Please subscribe this address to Egyptora Hub updates: ${email.trim()}`,
          )}`;
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("Your email address")}
          aria-label={t("Your email address")}
          className="min-w-0 flex-1 rounded-lg bg-primary-foreground px-3 py-2.5 text-sm text-navy outline-none placeholder:text-text-body"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-gold-cta px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("Subscribe")}
        </button>
      </form>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-shell-gold">
        {t("Download the app")}
      </p>
      <ul className="mt-3 flex items-center gap-3">
        {[
          { label: "App Store", Icon: AppleIcon },
          { label: "Google Play", Icon: GooglePlayIcon },
        ].map(({ label, Icon }) => (
          <li key={label}>
            <span
              title={t(label)}
              aria-label={t(label)}
              className="grid size-11 place-items-center rounded-full border border-shell-gold/60 text-shell-gold"
            >
              <Icon className="size-5" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="on-dark bg-navy-deep text-foreground">
      <Container className="py-14">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.5fr_1fr_1.15fr_1fr_1.15fr_1.4fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logo.url}
                alt={`${SITE.name} logo`}
                width={44}
                height={44}
                className="size-11 rounded-full ring-1 ring-gold-line"
              />
              <span>
                <span className="block whitespace-nowrap font-display text-base tracking-[0.18em] text-foreground">
                  EGYPTORA <span className="text-shell-gold">HUB</span>
                </span>
                <span className="block whitespace-nowrap text-[10px] tracking-[0.08em] text-foreground/70">
                  {t(SITE.tagline)}
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground/75">
              {t(
                "A private platform connecting the world to Egypt's opportunities, people and possibilities.",
              )}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={label}
                      title={label}
                      className="grid size-9 place-items-center rounded-full border border-foreground/70 text-foreground transition-colors hover:border-shell-gold hover:text-shell-gold"
                    >
                      <Icon className="size-4" />
                    </a>
                  ) : (
                    <span
                      aria-label={`${label} — ${t("Coming soon")}`}
                      title={`${label} — ${t("Coming soon")}`}
                      className="grid size-9 place-items-center rounded-full border border-foreground/40 text-foreground/50"
                    >
                      <Icon className="size-4" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>{t("Explore")}</ColumnTitle>
            <ul className="mt-4 space-y-2.5">
              {exploreLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>{t("Discover")}</ColumnTitle>
            <ul className="mt-4 space-y-2.5">
              {discoverLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>{t("About")}</ColumnTitle>
            <ul className="mt-4 space-y-2.5">
              {aboutLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>{t("Legal & Compliance")}</ColumnTitle>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </div>

          <Newsletter />
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="pt-5 text-xs text-foreground/70">
          <p>{t("Egyptora Hub is an independent private-sector platform. It is not a government entity and does not act on behalf of any Egyptian authority.")}</p>
        </Container>
        <Container className="flex flex-col gap-2 py-5 text-xs text-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.parentCompany}. {t("All rights reserved.")}
          </p>
          <p>
            {t("A Private Platform")} | {t("Your Gateway to Egypt")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
