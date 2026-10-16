import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Apple, Chrome, Info, Loader2, Lock, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { useI18n } from "@/i18n";
import { SITE } from "@/config/site";
import logo from "@/assets/egyptora-hub-logo.png.asset.json";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { consumeAfterAuth } from "@/lib/after-auth";
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABEL } from "@/lib/account-types";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Create your Egyptora Hub account — Sign up or sign in" },
      {
        name: "description",
        content:
          "Join Egyptora Hub with Google, Apple, or your email and WhatsApp number to manage trips, live booking status and Egyptora Hub Pass rewards.",
      },
      { property: "og:title", content: "Create your Egyptora Hub account" },
      {
        property: "og:description",
        content: "One account for trips, live status, rewards and 24/7 traveller support in Egypt.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { property: "og:url", content: `${SITE.url}/auth` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE.url}/og-banner.jpg` },
      { name: "twitter:image", content: `${SITE.url}/og-banner.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/auth` }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAuth();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: "",
    accountType: "individual",
  });
  const [socialNotice, setSocialNotice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmEmailNotice, setConfirmEmailNotice] = useState(false);

  // Already signed in? Skip the form entirely — this page is only for signed-out visitors.
  useEffect(() => {
    if (!sessionLoading && user) {
      const back = consumeAfterAuth();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime path saved before sign-in
      void navigate({ to: (back ?? "/account") as any });
    }
  }, [sessionLoading, user, navigate]);

  async function signInWithProvider(provider: "google" | "apple") {
    setErrorMsg(null);
    setSocialNotice(false);
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setErrorMsg(result.error.message ?? t("Something went wrong. Please try again."));
        return;
      }
      if (result.redirected) return;
      // Tokens received and the session is set — continue into the app.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime path saved before sign-in
      await navigate({ to: (consumeAfterAuth() ?? "/account") as any });
    } catch (err) {
      console.error("[auth] social sign-in failed", provider, err);
      setErrorMsg(t("Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setConfirmEmailNotice(false);
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.name,
              whatsapp: form.whatsapp,
              account_type: form.accountType,
            },
            ...(typeof window !== "undefined"
              ? { emailRedirectTo: `${window.location.origin}/account` }
              : {}),
          },
        });
        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime path saved before sign-in
          await navigate({ to: (consumeAfterAuth() ?? "/account") as any });
        } else {
          // Email confirmation is required before a session is issued.
          setConfirmEmailNotice(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime path saved before sign-in
          await navigate({ to: (consumeAfterAuth() ?? "/account") as any });
        }
      }
    } catch (err) {
      console.error("[auth] unexpected error during", mode, err);
      setErrorMsg(t("Something went wrong. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden border-e border-gold-line/40 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,oklch(0.3_0.06_85/0.55),transparent_60%),radial-gradient(circle_at_75%_80%,oklch(0.28_0.05_250/0.6),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo.url} alt={`${SITE.name} logo`} className="size-12 rounded-full ring-1 ring-gold-line" />
            <span className="font-display text-lg tracking-[0.22em] text-foreground">
              EGYPTORA <span className="text-gold">HUB</span>
            </span>
          </Link>
          <div className="max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold/80">
              {t("One account, all of Egypt")}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-foreground">
              {t("Your trips, rewards and live support in one place")}
            </h1>
            <ul className="mt-8 grid gap-3 text-sm text-muted-foreground">
              {[
                "Live status for every booking",
                "Egyptora Hub Pass points and partner benefits",
                "24/7 emergency assistance during your trip",
                "Rate past journeys and unlock member pricing",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
                  {t(line)}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">{t("100% secure & trusted")}</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 lg:px-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <img src={logo.url} alt={`${SITE.name} logo`} className="size-10 rounded-full ring-1 ring-gold-line" />
            <span className="font-display text-base tracking-[0.2em] text-foreground">
              EGYPTORA <span className="text-gold">HUB</span>
            </span>
          </Link>

          <div className="mb-7 grid grid-cols-2 gap-1 rounded-full border border-border bg-card/60 p-1">
            {(["signup", "signin"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  mode === m ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(m === "signup" ? "Create account" : "Sign in")}
              </button>
            ))}
          </div>

          <h2 className="font-display text-2xl text-foreground">
            {t(mode === "signup" ? "Create your Egyptora Hub account" : "Welcome back")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Continue with a social account or use your email and WhatsApp number.")}
          </p>

          <div className="mt-6 grid gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void signInWithProvider("google")}
              className="flex h-12 items-center justify-center gap-3 rounded-xl border border-border bg-card/70 text-sm font-medium text-foreground transition-colors hover:border-gold-line disabled:opacity-60"
            >
              <Chrome className="size-4 text-gold" />
              {t("Continue with Google")}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void signInWithProvider("apple")}
              className="flex h-12 items-center justify-center gap-3 rounded-xl border border-border bg-card/70 text-sm font-medium text-foreground transition-colors hover:border-gold-line disabled:opacity-60"
            >
              <Apple className="size-4 text-gold" />
              {t("Continue with Apple")}
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {t("or")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="grid gap-3">
            {mode === "signup" && (
              <Field icon={User} label={t("Full name")}>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("Full name")}
                  className="h-12 w-full bg-transparent pe-4 ps-11 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </Field>
            )}
            {mode === "signup" && (
              <fieldset className="grid gap-2">
                <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t("Account type")}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {ACCOUNT_TYPES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={form.accountType === value}
                      onClick={() => setForm({ ...form, accountType: value })}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-xs font-medium transition-colors",
                        form.accountType === value
                          ? "border-gold-line bg-gold-soft text-gold"
                          : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t(ACCOUNT_TYPE_LABEL[value])}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            <Field icon={Mail} label={t("Email address")}>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={t("Email address")}
                className="h-12 w-full bg-transparent pe-4 ps-11 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </Field>
            {mode === "signup" && (
              <Field icon={Phone} label={t("WhatsApp number")}>
                <input
                  required
                  type="tel"
                  dir="ltr"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder={t("+20 1x xxx xxxx")}
                  className="h-12 w-full bg-transparent pe-4 ps-11 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </Field>
            )}
            <Field icon={Lock} label={t("Password")}>
              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t("Password")}
                className="h-12 w-full bg-transparent pe-4 ps-11 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-gold text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {t(mode === "signup" ? "Create account" : "Sign in")}
            </button>
          </form>

          {errorMsg && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-hot/40 bg-hot/10 px-4 py-3 text-xs text-hot">
              <Info className="size-4 shrink-0" />
              {errorMsg}
            </p>
          )}

          {confirmEmailNotice && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-gold-line/50 bg-gold-soft px-4 py-3 text-xs text-gold">
              <Info className="size-4 shrink-0" />
              {t("Check your inbox to confirm your email, then sign in.")}
            </p>
          )}

          {socialNotice && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-gold-line/50 bg-gold-soft px-4 py-3 text-xs text-gold">
              <Info className="size-4 shrink-0" />
              {t("Social sign-in isn't live yet — please use email and password.")}
            </p>
          )}

          <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
            {t("By continuing you agree to the Egyptora Hub terms and privacy policy.")}
          </p>
          <p className="mt-4 text-center text-sm">
            <Link to="/" className="text-gold underline">
              {t("Back to the national gateway")}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label aria-label={label} className="relative flex items-center rounded-xl border border-border bg-card/60 focus-within:border-gold-line">
      <Icon className="pointer-events-none absolute start-4 size-4 text-muted-foreground" />
      {children}
    </label>
  );
}
