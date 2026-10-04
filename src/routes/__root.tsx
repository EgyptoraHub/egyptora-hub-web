import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { GA_MEASUREMENT_ID, GA_INLINE_SNIPPET, trackPageView } from "../lib/analytics";
import { SITE } from "../config/site";
import { I18nProvider, useI18n } from "../i18n";
import { CurrencyProvider } from "../i18n/currency";
import { FloatingConcierge } from "../components/site/FloatingConcierge";
import { Toaster } from "../components/ui/sonner";
import { MaintenanceGate } from "../components/site/MaintenanceGate";

function NotFoundComponent() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-gold-line bg-card/60 p-8 text-center backdrop-blur sm:p-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/80">
          {SITE.name} — 404
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {t("This page is off the map")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t(
            "The page you are looking for does not exist, has moved, or is not part of this phase of the platform yet.",
          )}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            {t("Back to the gateway")}
          </Link>
          <Link
            to="/encyclopedia"
            className="inline-flex items-center justify-center rounded-full border border-gold-line px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold-soft"
          >
            {t("Explore Egypt")}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("Contact us")}
          </Link>
        </div>
        <p className="mt-8 text-[11px] text-muted-foreground/70" dir="ltr">
          {SITE.url.replace(/^https?:\/\//, "")}
        </p>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const { t } = useI18n();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("This page didn't load")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Something went wrong on our end. You can try refreshing or head back home.")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("Try again")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("Go home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${SITE.name} — ${SITE.tagline}` },
      {
        name: "description",
        content:
          "Egyptora Hub is a unified digital gateway to Egypt: destinations, heritage, culture, events and investment in one platform.",
      },
      { name: "author", content: SITE.name },
      { property: "og:site_name", content: SITE.name },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE.url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "32x32" },
      { rel: "icon", href: "/logo-512.png", type: "image/png", sizes: "512x512" },
      { rel: "apple-touch-icon", href: "/logo-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lora:wght@400..700&family=Inter:wght@300..700&family=Noto+Naskh+Arabic:wght@400..700&family=IBM+Plex+Sans+Arabic:wght@300;400;600&display=swap",
      },
    ],
    scripts: [
      ...(GA_MEASUREMENT_ID
        ? [
            {
              src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
              async: true,
            },
            { children: GA_INLINE_SNIPPET },
          ]
        : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: SITE.name,
              url: SITE.url,
              email: SITE.email,
              slogan: SITE.tagline,
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  contactType: "customer support",
                  email: SITE.email,
                  availableLanguage: ["en", "ar"],
                },
              ],
            },
            {
              "@type": "WebSite",
              name: SITE.name,
              url: SITE.url,
              inLanguage: ["en", "ar"],
              publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);


  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
          <MaintenanceGate>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
            <FloatingConcierge />
            <Toaster position="top-center" richColors />
          </MaintenanceGate>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}
