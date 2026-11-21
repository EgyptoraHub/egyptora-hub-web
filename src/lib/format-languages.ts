/** Display platform language codes without changing stored values; other UI languages use English fallback. */
export function formatLanguages(value: string | null | undefined, lang: string): string | undefined {
  const codes = value?.split(",").map(code => code.trim()).filter(Boolean) ?? [];
  if (!codes.length) return undefined;
  const names: Record<string, string> = lang === "ar"
    ? { ar: "العربية", en: "الإنجليزية" }
    : { ar: "Arabic", en: "English" };
  return codes.map(code => names[code] ?? code).join(lang === "ar" ? "، " : ", ");
}