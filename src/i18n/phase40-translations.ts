/**
 * Prompt 40: labels renamed to sentence case / brand rule, plus missing Arabic event labels.
 * Machine-assisted draft for non-AR languages — not editorially verified. Existing entries take precedence.
 */
import type { Dict } from "./dictionary";

export const phase40: Record<"ar" | "fr" | "de" | "es" | "it" | "ru" | "zh" | "hi", Dict> = {
  ar: { "View all": "عرض الكل", "This page is not available": "هذه الصفحة غير متاحة", "Download the Egyptora Hub app": "نزّل تطبيق Egyptora Hub", Upcoming: "قادمة", Ticketed: "بتذاكر", "Maintenance Mode is ON — click to exit owner preview": "وضع الصيانة مفعّل — انقر للخروج من معاينة المالك", Properties: "العقارات المعروضة" },
  fr: { "View all": "Tout voir", "This page is not available": "Cette page n'est pas disponible", "Download the Egyptora Hub app": "Téléchargez l'application Egyptora Hub" },
  de: { "View all": "Alle anzeigen", "This page is not available": "Diese Seite ist nicht verfügbar", "Download the Egyptora Hub app": "Die Egyptora Hub App herunterladen" },
  es: { "View all": "Ver todo", "This page is not available": "Esta página no está disponible", "Download the Egyptora Hub app": "Descarga la aplicación Egyptora Hub" },
  it: { "View all": "Mostra tutto", "This page is not available": "Questa pagina non è disponibile", "Download the Egyptora Hub app": "Scarica l'app Egyptora Hub" },
  ru: { "View all": "Посмотреть всё", "This page is not available": "Эта страница недоступна", "Download the Egyptora Hub app": "Скачать приложение Egyptora Hub" },
  zh: { "View all": "查看全部", "This page is not available": "此页面不可用", "Download the Egyptora Hub app": "下载 Egyptora Hub 应用" },
  hi: { "View all": "सभी देखें", "This page is not available": "यह पृष्ठ उपलब्ध नहीं है", "Download the Egyptora Hub app": "Egyptora Hub ऐप डाउनलोड करें" },
};
