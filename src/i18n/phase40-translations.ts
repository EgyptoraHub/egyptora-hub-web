/**
 * Prompt 40: labels renamed to sentence case / brand rule, plus missing Arabic event labels.
 * Machine-assisted draft for non-AR languages — not editorially verified. Existing entries take precedence.
 */
import type { Dict } from "./dictionary";

export const phase40: Record<"ar" | "fr" | "de" | "es" | "it" | "ru" | "zh" | "hi", Dict> = {
  ar: { "More options": "مزيد من الخيارات", 'Meet Egyptora Hub': "تعرّف على Egyptora Hub", "A one-minute introduction to Egypt's all-in-one platform": "مقدمة في دقيقة واحدة عن منصة مصر الشاملة", 'Play the platform introduction video': "تشغيل فيديو التعريف بالمنصة", 'This video was generated with AI.': "هذا الفيديو مُنشأ بالذكاء الاصطناعي.", "View all": "عرض الكل", "This page is not available": "هذه الصفحة غير متاحة", "Download the Egyptora Hub app": "نزّل تطبيق Egyptora Hub", Upcoming: "قادمة", Ticketed: "بتذاكر", Properties: "العقارات المعروضة" },
  fr: { "More options": "Plus d'options", 'Meet Egyptora Hub': "Découvrez Egyptora Hub", "A one-minute introduction to Egypt's all-in-one platform": "Une présentation d'une minute de la plateforme tout-en-un de l'Égypte", 'Play the platform introduction video': "Lire la vidéo de présentation", 'This video was generated with AI.': "Cette vidéo a été générée par IA.", "View all": "Tout voir", "This page is not available": "Cette page n'est pas disponible", "Download the Egyptora Hub app": "Téléchargez l'application Egyptora Hub" },
  de: { "More options": "Weitere Optionen", 'Meet Egyptora Hub': "Lernen Sie Egyptora Hub kennen", "A one-minute introduction to Egypt's all-in-one platform": "Eine einminütige Einführung in Ägyptens All-in-One-Plattform", 'Play the platform introduction video': "Einführungsvideo abspielen", 'This video was generated with AI.': "Dieses Video wurde mit KI erstellt.", "View all": "Alle anzeigen", "This page is not available": "Diese Seite ist nicht verfügbar", "Download the Egyptora Hub app": "Die Egyptora Hub App herunterladen" },
  es: { "More options": "Más opciones", 'Meet Egyptora Hub': "Conoce Egyptora Hub", "A one-minute introduction to Egypt's all-in-one platform": "Una introducción de un minuto a la plataforma integral de Egipto", 'Play the platform introduction video': "Reproducir el vídeo de presentación", 'This video was generated with AI.': "Este vídeo fue generado con IA.", "View all": "Ver todo", "This page is not available": "Esta página no está disponible", "Download the Egyptora Hub app": "Descarga la aplicación Egyptora Hub" },
  it: { "More options": "Altre opzioni", 'Meet Egyptora Hub': "Scopri Egyptora Hub", "A one-minute introduction to Egypt's all-in-one platform": "Un'introduzione di un minuto alla piattaforma completa dell'Egitto", 'Play the platform introduction video': "Riproduci il video di presentazione", 'This video was generated with AI.': "Questo video è stato generato con l'IA.", "View all": "Mostra tutto", "This page is not available": "Questa pagina non è disponibile", "Download the Egyptora Hub app": "Scarica l'app Egyptora Hub" },
  ru: { "More options": "Другие параметры", 'Meet Egyptora Hub': "Знакомьтесь: Egyptora Hub", "A one-minute introduction to Egypt's all-in-one platform": "Минутное знакомство с универсальной платформой Египта", 'Play the platform introduction video': "Воспроизвести вводное видео", 'This video was generated with AI.': "Это видео создано с помощью ИИ.", "View all": "Посмотреть всё", "This page is not available": "Эта страница недоступна", "Download the Egyptora Hub app": "Скачать приложение Egyptora Hub" },
  zh: { "More options": "更多选项", 'Meet Egyptora Hub': "认识 Egyptora Hub", "A one-minute introduction to Egypt's all-in-one platform": "一分钟了解埃及一站式平台", 'Play the platform introduction video': "播放平台介绍视频", 'This video was generated with AI.': "本视频由人工智能生成。", "View all": "查看全部", "This page is not available": "此页面不可用", "Download the Egyptora Hub app": "下载 Egyptora Hub 应用" },
  hi: { "More options": "और विकल्प", 'Meet Egyptora Hub': "Egyptora Hub से मिलिए", "A one-minute introduction to Egypt's all-in-one platform": "मिस्र के ऑल-इन-वन प्लेटफ़ॉर्म का एक मिनट का परिचय", 'Play the platform introduction video': "परिचय वीडियो चलाएँ", 'This video was generated with AI.': "यह वीडियो AI द्वारा बनाया गया है।", "View all": "सभी देखें", "This page is not available": "यह पृष्ठ उपलब्ध नहीं है", "Download the Egyptora Hub app": "Egyptora Hub ऐप डाउनलोड करें" },
};

// Maintenance labels: machine-assisted drafts, following the existing translation merge.
const maintenanceLabels = ["Preview — the public site is closed", "Close the site to the public?", "Open the site to the public?", "The change could not be saved."];
const maintenanceTranslations = {
  ar: ["معاينة — الموقع مغلق أمام الجمهور", "هل تريد إغلاق الموقع أمام الجمهور؟", "هل تريد فتح الموقع للجمهور؟", "تعذّر حفظ التغيير."],
  fr: ["Aperçu — le site public est fermé", "Fermer le site au public ?", "Ouvrir le site au public ?", "La modification n’a pas pu être enregistrée."],
  de: ["Vorschau — die öffentliche Website ist geschlossen", "Die Website für die Öffentlichkeit schließen?", "Die Website für die Öffentlichkeit öffnen?", "Die Änderung konnte nicht gespeichert werden."],
  es: ["Vista previa — el sitio público está cerrado", "¿Cerrar el sitio al público?", "¿Abrir el sitio al público?", "No se pudo guardar el cambio."],
  it: ["Anteprima — il sito pubblico è chiuso", "Chiudere il sito al pubblico?", "Aprire il sito al pubblico?", "Impossibile salvare la modifica."],
  ru: ["Предпросмотр — публичный сайт закрыт", "Закрыть сайт для посетителей?", "Открыть сайт для посетителей?", "Не удалось сохранить изменение."],
  zh: ["预览 — 公众网站已关闭", "是否向公众关闭网站？", "是否向公众开放网站？", "无法保存更改。"],
  hi: ["पूर्वावलोकन — सार्वजनिक साइट बंद है", "साइट को जनता के लिए बंद करें?", "साइट को जनता के लिए खोलें?", "बदलाव सहेजा नहीं जा सका।"],
};
for (const language of Object.keys(maintenanceTranslations) as Array<keyof typeof maintenanceTranslations>) {
  maintenanceLabels.forEach((label, index) => {
    const value = maintenanceTranslations[language][index];
    if (value) phase40[language][label] = value;
  });
}
