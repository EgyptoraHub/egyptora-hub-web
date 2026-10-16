import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_LANG, LANGUAGES, type LangCode } from "./languages";
import { dictionaries } from "./dictionary";

const STORAGE_KEY = "egyptora-hub:lang";

type I18nValue = {
  lang: LangCode;
  dir: "ltr" | "rtl";
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

const LANG_COOKIE = "egyptora_lang";

export function isLangCode(v: unknown): v is LangCode {
  return typeof v === "string" && LANGUAGES.some((l) => l.code === v);
}

export function dirFor(lang: LangCode): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";
}

function writeLangCookie(lang: LangCode) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export function I18nProvider({
  children,
  initialLang = DEFAULT_LANG,
}: {
  children: ReactNode;
  /** Language resolved on the server from the cookie, so the first paint is already correct. */
  initialLang?: LangCode;
}) {
  const [lang, setLangState] = useState<LangCode>(initialLang);

  // Older visitors only have localStorage: adopt it and mirror it into the cookie.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLangCode(stored)) {
      if (stored !== initialLang) setLangState(stored);
      writeLangCookie(stored);
    }
  }, [initialLang]);

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    try {
      writeLangCookie(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — preference is session-only */
    }
  }, []);

  const t = useCallback(
    (key: string) => {
      const hit = dictionaries[lang]?.[key];
      if (hit === undefined && import.meta.env.DEV && lang !== "en" && typeof window !== "undefined") {
        // Dev-only coverage audit: collect untranslated keys seen at runtime.
        const w = window as unknown as { __i18nMissing?: Set<string> };
        (w.__i18nMissing ??= new Set()).add(key);
      }
      return hit ?? key;
    },
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, dir, setLang, t }), [lang, dir, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

export { LANGUAGES };
export type { LangCode };
