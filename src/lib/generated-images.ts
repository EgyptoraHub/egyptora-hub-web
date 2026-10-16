/**
 * Central map of the AI-generated illustrative images in src/assets/generated/.
 * Dimensions and English alt come from images-map.csv; Arabic alt is written here.
 * Pages read images only through getGeneratedImage(). `hidden` images await owner approval and never render.
 */
const FILES = import.meta.glob("/src/assets/generated/*.webp", { eager: true, import: "default" }) as Record<string, string>;

type Meta = { type: string; width: number; height: number; en: string; ar: string; hidden?: boolean };
export type GeneratedImage = { key: string; src: string; type: string; width: number; height: number; alt: { en: string; ar: string }; hidden: boolean };

const META: Record<string, Meta> = {
  "banner-egypt-through-time": { type: "banner", width: 2000, height: 889, en: "Ancient Egyptian temple colonnade at golden hour", ar: "أعمدة معبد مصري قديم وقت الغروب الذهبي" },
  "banner-military-history": { type: "banner", width: 2000, height: 889, en: "Ancient fortress and relief wall at dusk", ar: "قلعة قديمة وجدار نقوش عند الغسق" },
  "banner-eco-nature": { type: "banner", width: 2000, height: 889, en: "Protected coastline on the Red Sea", ar: "ساحل محمي على البحر الأحمر" },
  "banner-free-zones": { type: "banner", width: 2000, height: 889, en: "Container port in an Egyptian free zone", ar: "ميناء حاويات في منطقة حرة مصرية" },
  "banner-industrial-zones": { type: "banner", width: 2000, height: 889, en: "Industrial park in Egypt", ar: "مجمع صناعي في مصر" },
  "banner-experiences-beaches": { type: "banner", width: 2000, height: 889, en: "Red Sea beach", ar: "شاطئ على البحر الأحمر" },
  "banner-experiences-desert": { type: "banner", width: 2000, height: 889, en: "Desert dunes at sunset", ar: "كثبان صحراوية عند الغروب" },
  "banner-experiences-nile-cruises": { type: "banner", width: 2000, height: 889, en: "Nile cruise at Aswan", ar: "رحلة نيلية في أسوان" },
  "card-diving-red-sea": { type: "card", width: 1200, height: 800, en: "Diver over a Red Sea coral reef", ar: "غواص فوق شعاب مرجانية في البحر الأحمر" },
  "card-nile-cruise-aswan": { type: "card", width: 1200, height: 800, en: "Nile cruise ship at Aswan", ar: "سفينة نيلية في أسوان" },
  "card-new-capital": { type: "card", width: 1200, height: 800, en: "Modern skyline of the New Administrative Capital", ar: "أفق العاصمة الإدارية الجديدة" },
  "card-marsa-alam": { type: "card", width: 1200, height: 800, en: "Marsa Alam coast", ar: "ساحل مرسى علم" },
  "card-ain-sokhna-port": { type: "card", width: 1200, height: 800, en: "Container terminal at Ain Sokhna", ar: "محطة حاويات في العين السخنة" },
  "card-benban-solar": { type: "card", width: 1200, height: 800, en: "Solar panels in the desert at Aswan", ar: "ألواح شمسية في صحراء أسوان" },
  "card-infrastructure-suez": { type: "card", width: 1200, height: 800, en: "Ship passing through the Suez Canal", ar: "سفينة تعبر قناة السويس" },
  "card-industry-factory": { type: "card", width: 1200, height: 800, en: "Modern factory in an industrial zone", ar: "مصنع حديث في منطقة صناعية" },
  "card-hot-air-balloon-luxor": { type: "card", width: 1200, height: 800, en: "Hot air balloons over Luxor", ar: "مناطيد فوق الأقصر" },
  "card-felucca-nile": { type: "card", width: 1200, height: 800, en: "Felucca sailing on the Nile", ar: "فلوكة تبحر في النيل" },
  "card-live-individuals": { type: "card", width: 1200, height: 800, en: "Walking through downtown Cairo", ar: "تجول في وسط القاهرة" },
  "card-live-professionals": { type: "card", width: 1200, height: 800, en: "Modern office in New Cairo", ar: "مكتب حديث في القاهرة الجديدة" },
  "card-heritage-diaspora": { type: "card", width: 1200, height: 800, en: "Family heritage keepsakes on a table", ar: "مقتنيات تراث عائلي على طاولة" },
  "card-business-meeting": { type: "card", width: 1200, height: 800, en: "Investor meeting in a modern office", ar: "اجتماع مستثمرين في مكتب حديث" },
  "ill-financial-services": { type: "illustration", width: 640, height: 640, en: "Bank building with coins and an upward arrow", ar: "مبنى بنك مع عملات وسهم صاعد" },
  "ill-ict-innovation": { type: "illustration", width: 640, height: 640, en: "Chip, cloud and code brackets", ar: "شريحة وسحابة وأقواس برمجة" },
  "ill-licenses-permits": { type: "illustration", width: 640, height: 640, en: "Document with check mark and stamp", ar: "مستند بعلامة صح وختم" },
  "ill-investment-incentives": { type: "illustration", width: 640, height: 640, en: "Shield with percent sign and coins", ar: "درع بعلامة نسبة مئوية وعملات" },
  "ill-business-support": { type: "illustration", width: 640, height: 640, en: "Life ring with handshake", ar: "طوق نجاة مع مصافحة" },
  "ill-tenders-projects": { type: "illustration", width: 640, height: 640, en: "Gavel and blueprint roll", ar: "مطرقة مزاد ولفافة مخطط" },
  "ill-logistics": { type: "illustration", width: 640, height: 640, en: "Truck, container and ship", ar: "شاحنة وحاوية وسفينة" },
  "ill-residency-visas": { type: "illustration", width: 640, height: 640, en: "Passport with stamp and palm tree", ar: "جواز سفر بختم ونخلة" },
  "ill-work-employment": { type: "illustration", width: 640, height: 640, en: "Briefcase and laptop", ar: "حقيبة عمل وحاسوب محمول" },
  "ill-know-your-roots": { type: "illustration", width: 640, height: 640, en: "Family tree with a small egypt map", ar: "شجرة عائلة مع خريطة مصر صغيرة" },
  "ill-digital-car-license": { type: "illustration", width: 640, height: 640, en: "Car with a document and checkmark", ar: "سيارة مع مستند وعلامة صح" },
  "ill-digital-payments": { type: "illustration", width: 640, height: 640, en: "Receipt with a payment card", ar: "إيصال مع بطاقة دفع" },
  "ill-digital-id": { type: "illustration", width: 640, height: 640, en: "Id card with fingerprint", ar: "بطاقة هوية مع بصمة" },
  "ill-egypt-apps": { type: "illustration", width: 640, height: 640, en: "Smartphone with app tiles", ar: "هاتف ذكي بأيقونات تطبيقات" },
  "ill-global-network": { type: "illustration", width: 640, height: 640, en: "Globe with connection lines (195 countries), no country names", ar: "كرة أرضية بخطوط اتصال" },
  "ill-healthcare": { type: "illustration", width: 640, height: 640, en: "Medical cross, stethoscope and building", ar: "صليب طبي وسماعة ومبنى" },
  "ill-education": { type: "illustration", width: 640, height: 640, en: "Graduation cap and open book", ar: "قبعة تخرج وكتاب مفتوح" },
  "ill-housing-real-estate": { type: "illustration", width: 640, height: 640, en: "Apartment building with a key", ar: "مبنى سكني مع مفتاح" },
  "ill-utilities-services": { type: "illustration", width: 640, height: 640, en: "Light bulb, water drop and flame", ar: "مصباح وقطرة ماء ولهب" },
  "ill-safety-security": { type: "illustration", width: 640, height: 640, en: "Shield with a check mark", ar: "درع بعلامة صح" },
  "eco-ras-mohammed": { type: "eco-card", width: 1200, height: 800, en: "Ras Mohammed rocky headland and coral coastline", ar: "رأس محمد وساحلها المرجاني" },
  "eco-white-desert": { type: "eco-card", width: 1200, height: 800, en: "White Desert chalk rock formations at sunset", ar: "تكوينات الصحراء البيضاء الطباشيرية عند الغروب" },
  "eco-wadi-el-hitan": { type: "eco-card", width: 1200, height: 800, en: "Wadi El Hitan fossil whale valley in the desert", ar: "وادي الحيتان وحفرياته في الصحراء" },
  "eco-saint-catherine": { type: "eco-card", width: 1200, height: 800, en: "Saint Catherine mountains, rugged granite peaks at dawn, no monastery details", ar: "جبال سانت كاترين الجرانيتية عند الفجر" },
  "eco-siwa": { type: "eco-card", width: 1200, height: 800, en: "Siwa oasis with palm groves and a salt lake", ar: "واحة سيوة بنخيلها وبحيرتها الملحية" },
  "eco-wadi-el-gemal": { type: "eco-card", width: 1200, height: 800, en: "Wadi El Gemal coast with mangroves and a turquoise bay", ar: "ساحل وادي الجمال بأشجار المانجروف وخليج فيروزي" },
  "eco-lake-qarun": { type: "eco-card", width: 1200, height: 800, en: "Lake Qarun at Fayoum with birds and reeds", ar: "بحيرة قارون بالفيوم مع طيور وبوص" },
  "eco-zaranik": { type: "eco-card", width: 1200, height: 800, en: "Lake Bardawil wetland with flamingos", ar: "بحيرة البردويل مع طيور الفلامنجو" },
  "eco-generic-marine": { type: "eco-card", width: 1200, height: 800, en: "Generic Red Sea underwater coral and fish scene", ar: "مشهد مرجاني وأسماك تحت مياه البحر الأحمر" },
  "eco-generic-desert": { type: "eco-card", width: 1200, height: 800, en: "Generic Egyptian desert landscape with rock formations", ar: "منظر صحراوي مصري بتكوينات صخرية" },
  "eco-generic-mountain": { type: "eco-card", width: 1200, height: 800, en: "Generic Sinai mountain landscape", ar: "منظر جبلي في سيناء" },
  "eco-generic-wetland": { type: "eco-card", width: 1200, height: 800, en: "Generic wetland with migratory birds", ar: "أرض رطبة مع طيور مهاجرة" },
  "eco-generic-island": { type: "eco-card", width: 1200, height: 800, en: "Generic small desert island with white sand and turquoise water", ar: "جزيرة صغيرة برمال بيضاء ومياه فيروزية" },
  "eco-generic-nile-island": { type: "eco-card", width: 1200, height: 800, en: "Generic Nile island with reeds and palms at sunrise", ar: "جزيرة نيلية ببوص ونخيل عند الشروق" },
  "zone-free-zone-port": { type: "zone-card", width: 1200, height: 800, en: "Port with containers and cranes, generic", ar: "ميناء بحاويات ورافعات" },
  "zone-industrial-park": { type: "zone-card", width: 1200, height: 800, en: "Industrial park with factories, generic", ar: "مجمع صناعي بمصانع" },
  "zone-logistics-warehouse": { type: "zone-card", width: 1200, height: 800, en: "Large modern logistics warehouse with trucks, no logos", ar: "مستودع لوجستي حديث مع شاحنات" },
  "zone-sczone-development": { type: "zone-card", width: 1200, height: 800, en: "Coastal development area of a special economic zone with roads and sea, generic", ar: "منطقة تنمية ساحلية بطرق وبحر" },
  "gov-ministry-building": { type: "gov-card", width: 1200, height: 800, en: "Generic neoclassical ministry building in cairo, no flags with emblems, no readable signs", ar: "مبنى وزاري كلاسيكي في القاهرة" },
  "gov-finance-building": { type: "gov-card", width: 1200, height: 800, en: "Generic modern financial institution tower in cairo, no logos", ar: "برج مؤسسة مالية حديث في القاهرة" },
  "gov-foreign-affairs": { type: "gov-card", width: 1200, height: 800, en: "Generic diplomatic building with a plain flagpole without emblem, cairo nile corniche", ar: "مبنى دبلوماسي على كورنيش النيل" },
  "gov-authority-office": { type: "gov-card", width: 1200, height: 800, en: "Generic modern government authority headquarters, glass and stone, no logos", ar: "مقر هيئة حكومية حديث" },
  "gov-administrative-capital": { type: "gov-card", width: 1200, height: 800, en: "Generic modern government complex in the new administrative capital, no emblems", ar: "مجمع حكومي في العاصمة الإدارية الجديدة" },
  "culture-cuisine-koshary": { type: "culture-card", width: 1200, height: 800, en: "Koshary", ar: "كشري" },
  "culture-cuisine-fiteer-meshaltet": { type: "culture-card", width: 1200, height: 800, en: "Fiteer meshaltet", ar: "فطير مشلتت" },
  "culture-cuisine-sayadeya-spiced-fish-and-rice": { type: "culture-card", width: 1200, height: 800, en: "Sayadeya (spiced fish and rice)", ar: "صيادية سمك وأرز" },
  "culture-cuisine-halawet-el-moulid-moulid-sweets": { type: "culture-card", width: 1200, height: 800, en: "Halawet el-Moulid (moulid sweets)", ar: "حلاوة المولد" },
  "culture-cuisine-fesikh-salted-fermented-mullet": { type: "culture-card", width: 1200, height: 800, en: "Fesikh (salted fermented mullet)", ar: "فسيخ" },
  "culture-cuisine-al-khnaini-roe-filled-fish": { type: "culture-card", width: 1200, height: 800, en: "Al-Khnaini (roe-filled fish)", ar: "الخنيني سمك محشو بالبطارخ" },
  "culture-cuisine-al-fatura-rosetta-fish-dish": { type: "culture-card", width: 1200, height: 800, en: "Al-Fatura (Rosetta fish dish)", ar: "الفطورة طبق سمك رشيدي" },
  "culture-cuisine-guava-sweets-and-juice": { type: "culture-card", width: 1200, height: 800, en: "Guava sweets and juice", ar: "حلويات وعصير الجوافة" },
  "culture-cuisine-mandi": { type: "culture-card", width: 1200, height: 800, en: "Mandi", ar: "مندي" },
  "culture-cuisine-bedouin-flatbread-arbood-shraak": { type: "culture-card", width: 1200, height: 800, en: "Bedouin flatbread (arbood / shraak)", ar: "خبز بدوي (عربود / شراك)" },
  "culture-cuisine-bedouin-tea-and-coffee": { type: "culture-card", width: 1200, height: 800, en: "Bedouin tea and coffee", ar: "شاي وقهوة بدوية" },
  "culture-cuisine-karkade-hibiscus-drink": { type: "culture-card", width: 1200, height: 800, en: "Karkade (hibiscus drink)", ar: "كركديه" },
  "culture-cuisine-tamarind-drink-tamr-hindi": { type: "culture-card", width: 1200, height: 800, en: "Tamarind drink (tamr hindi)", ar: "تمر هندي" },
  "culture-cuisine-aswan-dates": { type: "culture-card", width: 1200, height: 800, en: "Aswan dates", ar: "تمور أسوان" },
  "culture-cuisine-siwa-dates": { type: "culture-card", width: 1200, height: 800, en: "Siwa dates", ar: "تمور سيوة" },
  "culture-cuisine-siwa-olives-and-olive-oil": { type: "culture-card", width: 1200, height: 800, en: "Siwa olives and olive oil", ar: "زيتون وزيت زيتون سيوة" },
  "culture-cuisine-new-valley-dates-and-olives": { type: "culture-card", width: 1200, height: 800, en: "New Valley dates and olives", ar: "تمور وزيتون الوادي الجديد" },
  "culture-fashion-tulle-bi-telli-assiut-embroidery": { type: "culture-card", width: 1200, height: 800, en: "Tulle bi telli (Assiut embroidery)", ar: "تُل بالتلي (تطريز أسيوط)", hidden: true },
  "culture-fashion-bedouin-embroidered-dress-thob-north-sin": { type: "culture-card", width: 1200, height: 800, en: "Bedouin embroidered dress (thob), North Sinai", ar: "ثوب بدوي مطرز من شمال سيناء", hidden: true },
  "culture-fashion-bedouin-embroidered-dress-thob-south-sin": { type: "culture-card", width: 1200, height: 800, en: "Bedouin embroidered dress (thob), South Sinai", ar: "ثوب بدوي مطرز من جنوب سيناء", hidden: true },
  "culture-fashion-siwan-costume-and-embroidery": { type: "culture-card", width: 1200, height: 800, en: "Siwan costume and embroidery", ar: "زي وتطريز سيوي", hidden: true },
  "culture-fashion-akhmim-weaving": { type: "culture-card", width: 1200, height: 800, en: "Akhmim weaving", ar: "نسيج أخميم" },
  "culture-fashion-galabeya-jellabiya": { type: "culture-card", width: 1200, height: 800, en: "Galabeya (jellabiya)", ar: "جلابية" },
  "culture-jewelry-siwan-silver-jewelry": { type: "culture-card", width: 1200, height: 800, en: "Siwan silver jewelry", ar: "حلي فضية سيوية" },
  "culture-jewelry-bedouin-silver-jewelry-sinai": { type: "culture-card", width: 1200, height: 800, en: "Bedouin silver jewelry, Sinai", ar: "حلي فضية بدوية من سيناء" },
  "culture-jewelry-nubian-beadwork-and-jewelry": { type: "culture-card", width: 1200, height: 800, en: "Nubian beadwork and jewelry", ar: "خرز وحلي نوبية" },
  "culture-jewelry-mother-of-pearl-handicrafts-saqiat-al-mi": { type: "culture-card", width: 1200, height: 800, en: "Mother-of-pearl handicrafts (Saqiat Al-Minqadi)", ar: "مشغولات الصدف (ساقية المنقدي)" },
  "culture-jewelry-ababda-and-bisharin-silver-jewelry": { type: "culture-card", width: 1200, height: 800, en: "Ababda and Bisharin silver jewelry", ar: "حلي فضية للعبابدة والبشارية" },
  "ph-heritage-sites": { type: "placeholder", width: 900, height: 600, en: "Placeholder for heritage sites", ar: "صورة بديلة للمواقع التراثية" },
  "ph-offers": { type: "placeholder", width: 900, height: 600, en: "Placeholder for offers", ar: "صورة بديلة للعروض" },
  "ph-properties": { type: "placeholder", width: 900, height: 600, en: "Placeholder for properties", ar: "صورة بديلة للعقارات" },
  "ph-providers": { type: "placeholder", width: 900, height: 600, en: "Placeholder for providers", ar: "صورة بديلة لمقدمي الخدمات" },
  "ph-research-programs": { type: "placeholder", width: 900, height: 600, en: "Placeholder for research programs", ar: "صورة بديلة للبرامج البحثية" },
  "ph-museums": { type: "placeholder", width: 900, height: 600, en: "Placeholder for museums", ar: "صورة بديلة للمتاحف" },
  "ph-events": { type: "placeholder", width: 900, height: 600, en: "Placeholder for events", ar: "صورة بديلة للفعاليات" },
  "ph-investment-opportunities": { type: "placeholder", width: 900, height: 600, en: "Placeholder for investment opportunities", ar: "صورة بديلة لفرص الاستثمار" },
  "cover-business-guide": { type: "cover", width: 1024, height: 1536, en: "Cover of the Egypt Business Guide", ar: "غلاف دليل الأعمال في مصر" },
};

export const GENERATED_IMAGES: Record<string, GeneratedImage> = Object.fromEntries(
  Object.entries(META).flatMap(([key, m]) => {
    const src = FILES[`/src/assets/generated/${key}.webp`];
    return src ? [[key, { key, src, type: m.type, width: m.width, height: m.height, alt: { en: m.en, ar: m.ar }, hidden: !!m.hidden }]] : [];
  }),
);

/** Returns the image, or undefined when missing or awaiting approval. */
export function getGeneratedImage(key: string | null | undefined): GeneratedImage | undefined {
  const img = key ? GENERATED_IMAGES[key] : undefined;
  return img && !img.hidden ? img : undefined;
}

export const altFor = (img: GeneratedImage, lang: string) => (lang === "ar" ? img.alt.ar : img.alt.en);

/** Turns a record name into the slug part used in culture-* file names (truncated like the files). */
export function slugPart(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const BY_SRC: Record<string, GeneratedImage> = Object.fromEntries(Object.values(GENERATED_IMAGES).map((g) => [g.src, g]));

/** Finds the generated image behind an imported src URL (undefined for credited photos). */
export function generatedBySrc(src: string | null | undefined): GeneratedImage | undefined {
  return src ? BY_SRC[src] : undefined;
}

/** Alt text for any src: the generated image's own description when it is AI, else the given fallback. */
export function altForSrc(src: string | null | undefined, lang: string, fallback: string) {
  const g = generatedBySrc(src);
  return g ? altFor(g, lang) : fallback;
}

/** AI badge rule: every generated image except ill-* icon illustrations and ph-* empty-state placeholders. */
export function needsAiBadge(src: string | null | undefined) {
  const g = generatedBySrc(src);
  return !!g && !/^(ill|ph)-/.test(g.key);
}
