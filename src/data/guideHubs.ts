/**
 * "Coming soon" Wave 1 guide hubs. Each hub is assembled ONLY from public data that already exists:
 * emergency numbers (by category slug), Egypt Apps (by category slug) and Government Directory entries
 * (by exact entity name). No facts are written here beyond short, neutral intros.
 */
export type GuideParent = "live-in-egypt" | "do-business";

export type GuideHub = {
  slug: string;
  parent: GuideParent;
  navLabel: string;
  title: { en: string; ar: string };
  intro: { en: string; ar: string };
  emergencyCategories: string[];
  appCategories: string[];
  /** Exact `government_entities.entity_name_en` values. */
  government: string[];
  related: { label: string; labelAr: string; to: string }[];
};

const R = {
  evisa: { label: "Egypt e-Visa", labelAr: "التأشيرة الإلكترونية لمصر", to: "/visit-egypt/e-visa" },
  countries: { label: "Countries & travel routes", labelAr: "الدول ومسارات السفر", to: "/countries" },
  gov: { label: "Government Directory", labelAr: "دليل الجهات الحكومية", to: "/government-directory" },
  digital: { label: "Digital Government Services", labelAr: "الخدمات الحكومية الرقمية", to: "/government-directory/digital-services" },
  emergency: { label: "Emergency & Quick Numbers", labelAr: "أرقام الطوارئ والأرقام السريعة", to: "/emergency-numbers" },
  apps: { label: "Egypt Apps", labelAr: "تطبيقات مصر", to: "/egypt-apps" },
  invest: { label: "Invest in Egypt", labelAr: "استثمر في مصر", to: "/invest-in-egypt" },
  opps: { label: "Investment Opportunities", labelAr: "الفرص الاستثمارية", to: "/investment-opportunities" },
  business: { label: "Do Business", labelAr: "ممارسة الأعمال", to: "/do-business" },
  providers: { label: "Business Support", labelAr: "دعم الأعمال", to: "/providers" },
  legal: { label: "Regulations & Laws", labelAr: "اللوائح والقوانين", to: "/legal" },
  live: { label: "Live in Egypt", labelAr: "العيش في مصر", to: "/live-in-egypt" },
  research: { label: "Education & Schools", labelAr: "التعليم والمدارس", to: "/research-programs" },
};

export const GUIDE_HUBS: GuideHub[] = [
  {
    slug: "residency-visas",
    parent: "live-in-egypt",
    navLabel: "Residency & Visas",
    title: { en: "Residency & Visas", ar: "الإقامة والتأشيرات" },
    intro: {
      en: "Where to start for visas and residency in Egypt: the official e-Visa information page, country pages and the government bodies that handle these matters.",
      ar: "نقطة البداية للتأشيرات والإقامة في مصر: صفحة معلومات التأشيرة الإلكترونية الرسمية وصفحات الدول والجهات الحكومية المختصة.",
    },
    emergencyCategories: [],
    appCategories: [],
    government: ["Ministry of Interior", "Ministry of Foreign Affairs, International Cooperation and Egyptians Abroad"],
    related: [R.evisa, R.countries, R.gov, R.live],
  },
  {
    slug: "healthcare",
    parent: "live-in-egypt",
    navLabel: "Healthcare & Medical Services",
    title: { en: "Healthcare & Medical Services", ar: "الرعاية الصحية والخدمات الطبية" },
    intro: {
      en: "Health hotlines, health apps and the official health bodies listed on Egyptora Hub.",
      ar: "الخطوط الساخنة الصحية والتطبيقات الصحية والجهات الصحية الرسمية المدرجة في إيجيبتورا هب.",
    },
    emergencyCategories: ["health"],
    appCategories: ["health"],
    government: ["Ministry of Health and Population", "General Authority for Healthcare Accreditation and Regulation (GAHAR)"],
    related: [R.emergency, R.apps, R.gov],
  },
  {
    slug: "safety-security",
    parent: "live-in-egypt",
    navLabel: "Safety & Security",
    title: { en: "Safety & Security", ar: "السلامة والأمن" },
    intro: {
      en: "Emergency and tourist-help numbers, plus the official bodies responsible for security and for citizens and visitors abroad.",
      ar: "أرقام الطوارئ ومساعدة السائحين، والجهات الرسمية المسؤولة عن الأمن وعن المواطنين والزوار في الخارج.",
    },
    emergencyCategories: ["emergency", "tourism"],
    appCategories: [],
    government: ["Ministry of Interior", "Ministry of Foreign Affairs, International Cooperation and Egyptians Abroad"],
    related: [R.emergency, R.evisa, R.gov],
  },
  {
    slug: "transportation",
    parent: "live-in-egypt",
    navLabel: "Transportation & Mobility",
    title: { en: "Transportation & Mobility", ar: "النقل والتنقل" },
    intro: {
      en: "Transport hotlines, mobility apps and the official transport bodies listed on Egyptora Hub.",
      ar: "الخطوط الساخنة للنقل وتطبيقات التنقل والجهات الرسمية للنقل المدرجة في إيجيبتورا هب.",
    },
    emergencyCategories: ["transport"],
    appCategories: ["transport"],
    government: ["Ministry of Transport", "Ministry of Civil Aviation"],
    related: [R.apps, R.emergency, R.gov],
  },
  {
    slug: "utilities-services",
    parent: "live-in-egypt",
    navLabel: "Utilities & Services",
    title: { en: "Utilities & Services", ar: "المرافق والخدمات" },
    intro: {
      en: "Electricity, water, gas and telecom hotlines, bill-payment and service apps, and the bodies that oversee them.",
      ar: "الخطوط الساخنة للكهرباء والمياه والغاز والاتصالات، وتطبيقات دفع الفواتير والخدمات، والجهات المشرفة عليها.",
    },
    emergencyCategories: ["utilities", "telecom"],
    appCategories: ["utilities", "telecom"],
    government: [
      "Ministry of Electricity and Renewable Energy",
      "Ministry of Housing, Utilities and Urban Communities",
      "Ministry of Water Resources and Irrigation",
      "Ministry of Petroleum and Mineral Resources",
      "Ministry of Communications and Information Technology",
      "National Telecom Regulatory Authority (NTRA)",
    ],
    related: [R.apps, R.emergency, R.digital],
  },
  {
    slug: "work-employment",
    parent: "live-in-egypt",
    navLabel: "Work & Employment",
    title: { en: "Work & Employment", ar: "العمل والتوظيف" },
    intro: {
      en: "Job and social-insurance apps and the official bodies for labour and social affairs, with links to business and investment pages.",
      ar: "تطبيقات الوظائف والتأمينات الاجتماعية والجهات الرسمية المعنية بالعمل والشؤون الاجتماعية، مع روابط لصفحات الأعمال والاستثمار.",
    },
    emergencyCategories: [],
    appCategories: ["jobs", "social_insurance_tax"],
    government: ["Ministry of Labour", "Ministry of Social Solidarity"],
    related: [R.business, R.invest, R.gov],
  },
  {
    slug: "licenses-permits",
    parent: "do-business",
    navLabel: "Licenses & Permits",
    title: { en: "Licenses & Permits", ar: "التراخيص والتصاريح" },
    intro: {
      en: "Government service and legal apps and the official bodies involved in business licensing, trade and customs.",
      ar: "تطبيقات الخدمات الحكومية والقانونية والجهات الرسمية المعنية بتراخيص الأعمال والتجارة والجمارك.",
    },
    emergencyCategories: [],
    appCategories: ["government_services", "justice_legal"],
    government: [
      "General Authority for Investment and Free Zones (GAFI)",
      "Ministry of Trade and Industry",
      "Egyptian Customs Authority",
      "Ministry of Local Development",
      "New Urban Communities Authority (NUCA)",
    ],
    related: [R.opps, R.business, R.legal, R.digital],
  },
  {
    slug: "start-a-business",
    parent: "do-business",
    navLabel: "Start a Business",
    title: { en: "Start a Business", ar: "ابدأ نشاطك التجاري" },
    intro: {
      en: "The official investment, tax and trade bodies, plus tax and banking apps, to start from when setting up a company in Egypt.",
      ar: "الجهات الرسمية للاستثمار والضرائب والتجارة، مع تطبيقات الضرائب والخدمات المصرفية، كنقطة بداية لتأسيس شركة في مصر.",
    },
    emergencyCategories: [],
    appCategories: ["social_insurance_tax", "banking_payments"],
    government: [
      "General Authority for Investment and Free Zones (GAFI)",
      "Ministry of Investment and Foreign Trade",
      "Egyptian Tax Authority",
      "Financial Regulatory Authority (FRA)",
      "Federation of Egyptian Chambers of Commerce",
      "Federation of Egyptian Industries (FEI)",
    ],
    related: [R.opps, R.invest, R.providers, R.business],
  },
];

export const guideHub = (parent: GuideParent, slug: string) =>
  GUIDE_HUBS.find((h) => h.parent === parent && h.slug === slug);

export const guideHubPath = (h: GuideHub) => `/${h.parent}/${h.slug}`;
