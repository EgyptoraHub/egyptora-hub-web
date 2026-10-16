import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LANGUAGES, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("Language")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border text-muted-foreground transition-colors hover:border-gold-line hover:text-foreground",
          compact ? "px-2.5 py-1.5 text-2xs" : "px-3 py-2 text-xs",
        )}
      >
        <Globe className="size-4 shrink-0" />
        <span className="font-medium uppercase">{current.code}</span>
        <ChevronDown className="size-3.5 shrink-0 opacity-70" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="fixed inset-x-3 top-[4.5rem] z-50 max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-[var(--shadow-card)] sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:max-h-[70vh] sm:w-52"
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-accent",
                  l.code === lang ? "text-gold-text" : "text-popover-foreground",
                )}
              >
                <span aria-hidden="true">{l.flag}</span>
                <span className="min-w-0 flex-1 truncate">{l.native}</span>
                {l.code === lang && <Check className="size-4 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
