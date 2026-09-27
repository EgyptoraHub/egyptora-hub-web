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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);

  // Read the stored preference after hydration to avoid SSR mismatches.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) setLangState(stored);
  }, []);

  const dir = LANGUAGES.find((l) => l.code === lang)?.dir ?? "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    try {
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
