/**
 * Prompt 36 Stage 3: page texts added by Prompts 31–35 that were missing in the extra languages.
 * Machine-translated draft — NOT reviewed by native speakers. Exported for review with
 * `bun scripts/i18n-export.ts` (every key here is listed as machine_translated).
 * Existing dictionary entries take precedence over these.
 */
import type { Dict } from "./dictionary";

type Row = [ar: string, fr: string, de: string, es: string, it: string, ru: string, zh: string, hi: string];

const ROWS: Record<string, Row> = {
  "Key moments": ["لحظات رئيسية", "Moments clés", "Schlüsselmomente", "Momentos clave", "Momenti chiave", "Ключевые моменты", "关键时刻", "मुख्य क्षण"],
  "Call police 122": ["اتصل بالشرطة 122", "Appeler la police 122", "Polizei anrufen 122", "Llamar a la policía 122", "Chiama la polizia 122", "Вызвать полицию 122", "拨打警察电话 122", "पुलिस को कॉल करें 122"],
  "Call ambulance 123": ["اتصل بالإسعاف 123", "Appeler une ambulance 123", "Krankenwagen rufen 123", "Llamar a una ambulancia 123", "Chiama l'ambulanza 123", "Вызвать скорую 123", "拨打急救电话 123", "एम्बुलेंस को कॉल करें 123"],
  "results": ["نتائج", "résultats", "Ergebnisse", "resultados", "risultati", "результатов", "条结果", "परिणाम"],
  "Linked records": ["السجلات المرتبطة", "Fiches liées", "Verknüpfte Einträge", "Registros vinculados", "Schede collegate", "Связанные записи", "关联记录", "जुड़े हुए रिकॉर्ड"],
  "flag": ["علم", "drapeau", "Flagge", "bandera", "bandiera", "флаг", "旗帜", "ध्वज"],
  "Protected Areas": ["المحميات الطبيعية", "Aires protégées", "Schutzgebiete", "Áreas protegidas", "Aree protette", "Охраняемые территории", "自然保护区", "संरक्षित क्षेत्र"],
  "Egypt's declared protected areas, each with its official source.": ["المحميات الطبيعية المعلنة في مصر، لكل منها مصدرها الرسمي.", "Les aires protégées déclarées d'Égypte, chacune avec sa source officielle.", "Ägyptens ausgewiesene Schutzgebiete, jeweils mit offizieller Quelle.", "Las áreas protegidas declaradas de Egipto, cada una con su fuente oficial.", "Le aree protette dichiarate dell'Egitto, ciascuna con la sua fonte ufficiale.", "Объявленные охраняемые территории Египта, каждая с официальным источником.", "埃及已宣布的自然保护区，均附官方来源。", "मिस्र के घोषित संरक्षित क्षेत्र, प्रत्येक अपने आधिकारिक स्रोत के साथ।"],
  "Declared": ["سنة الإعلان", "Déclarée", "Ausgewiesen", "Declarada", "Dichiarata", "Объявлена", "宣布年份", "घोषित"],
  "Source": ["المصدر", "Source", "Quelle", "Fuente", "Fonte", "Источник", "来源", "स्रोत"],
  "destinations": ["وجهات", "destinations", "Reiseziele", "destinos", "destinazioni", "направлений", "个目的地", "गंतव्य"],
  "Police": ["الشرطة", "Police", "Polizei", "Policía", "Polizia", "Полиция", "警察", "पुलिस"],
  "Ambulance": ["الإسعاف", "Ambulance", "Krankenwagen", "Ambulancia", "Ambulanza", "Скорая помощь", "救护车", "एम्बुलेंस"],
  "opportunities": ["فرص", "opportunités", "Chancen", "oportunidades", "opportunità", "возможностей", "个机会", "अवसर"],
  "sectors": ["قطاعات", "secteurs", "Sektoren", "sectores", "settori", "секторов", "个行业", "क्षेत्र"],
  "Zone type": ["نوع المنطقة", "Type de zone", "Zonentyp", "Tipo de zona", "Tipo di zona", "Тип зоны", "区域类型", "क्षेत्र का प्रकार"],
  "All zone types": ["كل أنواع المناطق", "Tous les types de zones", "Alle Zonentypen", "Todos los tipos de zona", "Tutti i tipi di zona", "Все типы зон", "所有区域类型", "सभी क्षेत्र प्रकार"],
  "No zones match these filters.": ["لا توجد مناطق تطابق هذه الفلاتر.", "Aucune zone ne correspond à ces filtres.", "Keine Zonen entsprechen diesen Filtern.", "Ninguna zona coincide con estos filtros.", "Nessuna zona corrisponde a questi filtri.", "Нет зон, соответствующих этим фильтрам.", "没有符合这些筛选条件的区域。", "इन फ़िल्टरों से कोई क्षेत्र मेल नहीं खाता।"],
  "Listed under": ["مدرجة ضمن", "Classée sous", "Geführt unter", "Incluida en", "Elencata sotto", "Относится к", "隶属于", "के अंतर्गत सूचीबद्ध"],
  "Managing body": ["الجهة المديرة", "Organisme gestionnaire", "Verwaltende Stelle", "Organismo gestor", "Ente gestore", "Управляющий орган", "管理机构", "प्रबंधन निकाय"],
  "Facts": ["حقائق", "Faits", "Fakten", "Datos", "Fatti", "Факты", "事实", "तथ्य"],
  "Public free zone": ["منطقة حرة عامة", "Zone franche publique", "Öffentliche Freizone", "Zona franca pública", "Zona franca pubblica", "Государственная свободная зона", "公共自由区", "सार्वजनिक मुक्त क्षेत्र"],
  "SCZone industrial zone": ["منطقة صناعية بالمنطقة الاقتصادية لقناة السويس", "Zone industrielle SCZone", "SCZone-Industriezone", "Zona industrial SCZone", "Zona industriale SCZone", "Промышленная зона SCZone", "苏伊士运河经济区工业区", "SCZone औद्योगिक क्षेत्र"],
  "Industrial zone": ["منطقة صناعية", "Zone industrielle", "Industriezone", "Zona industrial", "Zona industriale", "Промышленная зона", "工业区", "औद्योगिक क्षेत्र"],
};


/** Labels translated indirectly (type/outcome/category maps) — machine draft, Prompt 36 Stage 4. */
export const PHASE36_EXTRA: Record<string, Partial<Record<string, string>>> = {
 "Tourist Experiences": {
  "fr": "Expériences touristiques",
  "de": "Touristische Erlebnisse",
  "es": "Experiencias turísticas",
  "it": "Esperienze turistiche",
  "ru": "Впечатления туристов",
  "zh": "游客体验",
  "hi": "पर्यटक अनुभव"
 },
 "Stories, reviews and videos from real trips across Egypt.": {
  "fr": "Récits, avis et vidéos de voyages réels à travers l'Égypte.",
  "de": "Geschichten, Bewertungen und Videos von echten Reisen durch Ägypten.",
  "es": "Historias, reseñas y vídeos de viajes reales por todo Egipto.",
  "it": "Storie, recensioni e video di viaggi reali in tutto l'Egitto.",
  "ru": "Рассказы, отзывы и видео из реальных поездок по Египту.",
  "zh": "来自埃及真实旅行的故事、评论和视频。",
  "hi": "पूरे मिस्र की वास्तविक यात्राओं की कहानियाँ, समीक्षाएँ और वीडियो।"
 },
 "Share a tourist experience": {
  "fr": "Partager une expérience touristique",
  "de": "Eine touristische Erfahrung teilen",
  "es": "Compartir una experiencia turística",
  "it": "Condividi un'esperienza turistica",
  "ru": "Поделиться впечатлениями туриста",
  "zh": "分享游客体验",
  "hi": "एक पर्यटक अनुभव साझा करें"
 },
 "Famous places": {
  "fr": "Lieux célèbres",
  "de": "Berühmte Orte",
  "es": "Lugares famosos",
  "it": "Luoghi famosi",
  "ru": "Знаменитые места",
  "zh": "著名地点",
  "hi": "प्रसिद्ध स्थान"
 },
 "Family roots tools": {
  "fr": "Outils pour les racines familiales",
  "de": "Werkzeuge für Familienwurzeln",
  "es": "Herramientas de raíces familiares",
  "it": "Strumenti per le radici familiari",
  "ru": "Инструменты для изучения семейных корней",
  "zh": "家族根源工具",
  "hi": "पारिवारिक जड़ों के उपकरण"
 },
 "Family tree, surname and place-name origins — planned for a later phase.": {
  "fr": "Arbre généalogique, origines des noms de famille et de lieux — prévu pour une phase ultérieure.",
  "de": "Stammbaum, Herkunft von Nachnamen und Ortsnamen – für eine spätere Phase geplant.",
  "es": "Árbol genealógico, orígenes de apellidos y topónimos — planeado для una fase posterior.",
  "it": "Albero genealogico, origini di cognomi e toponimi — pianificato per una fase successiva.",
  "ru": "Генеалогическое древо, происхождение фамилий и топонимов — запланировано на более поздний этап.",
  "zh": "家谱、姓氏和地名起源 — 计划在后期阶段推出。",
  "hi": "वंश वृक्ष, उपनाम और स्थान-नाम की उत्पत्ति — बाद के चरण के लिए योजनाबद्ध।"
 },
 "Egyptian objects and collections held in museums around the world.": {
  "fr": "Objets et collections égyptiens conservés dans les musées du monde entier.",
  "de": "Ägyptische Objekte und Sammlungen in Museen auf der ganzen Welt.",
  "es": "Objetos y colecciones egipcias en museos de todo el mundo.",
  "it": "Oggetti e collezioni egiziane conservati nei musei di tutto il mondo.",
  "ru": "Египетские артефакты и коллекции в музеях по всему миру.",
  "zh": "世界各地博物馆收藏的埃及文物和藏品。",
  "hi": "दुनिया भर के संग्रहालयों में रखी गई मिस्र की वस्तुएं और संग्रह।"
 },
 "Official bodies, including the ministry responsible for Egyptians abroad.": {
  "fr": "Organismes officiels, y compris le ministère chargé des Égyptiens à l'étranger.",
  "de": "Offizielle Stellen, einschließlich des für Ägypter im Ausland zuständigen Ministeriums.",
  "es": "Organismos oficiales, incluido el ministerio responsable de los egipcios en el extranjero.",
  "it": "Enti ufficiali, compreso il ministero responsabile per gli egiziani all'estero.",
  "ru": "Официальные органы, включая министерство, ответственное за египтян за рубежом.",
  "zh": "官方机构，包括负责海外埃及人事务的部门。",
  "hi": "आधिकारिक निकाय, जिसमें विदेश में रहने वाले मिस्रवासियों के लिए जिम्मेदार मंत्रालय भी शामिल है।"
 },
 "The eras and regions of Egyptian history.": {
  "fr": "Les époques et les régions de l'histoire égyptienne.",
  "de": "Die Epochen und Regionen der ägyptischen Geschichte.",
  "es": "Las eras y regiones de la historia de Egipto.",
  "it": "Le ere e le regioni della storia egiziana.",
  "ru": "Эпохи и регионы египетской истории.",
  "zh": "埃及历史的时代和地区。",
  "hi": "मिस्र के इतिहास के युग और क्षेत्र।"
 },
 "Explore the governorate your family comes from.": {
  "fr": "Explorez le gouvernorat d'où vient votre famille.",
  "de": "Erkunden Sie das Gouvernement, aus dem Ihre Familie stammt.",
  "es": "Explore la gobernación de la que procede su familia.",
  "it": "Esplora il governatorato da cui proviene la tua famiglia.",
  "ru": "Исследуйте мухафазу, откуда родом ваша семья.",
  "zh": "探索您家人来自的省份。",
  "hi": "उस प्रांत का अन्वेषण करें जहाँ से आपका परिवार आता है।"
 },
 "Egyptian Cuisine": {
  "fr": "Cuisine égyptienne",
  "de": "Ägyptische Küche",
  "es": "Cocina egipcia",
  "it": "Cucina egiziana",
  "ru": "Египетская кухня",
  "zh": "埃及美食",
  "hi": "मिस्र का भोजन"
 },
 "Traditional Fashion": {
  "fr": "Mode traditionnelle",
  "de": "Traditionelle Mode",
  "es": "Moda tradicional",
  "it": "Moda tradizionale",
  "ru": "Традиционная мода",
  "zh": "传统时尚",
  "hi": "पारंपरिक फैशन"
 },
 "Jewelry & Accessories": {
  "fr": "Bijoux & Accessoires",
  "de": "Schmuck & Accessoires",
  "es": "Joyería y accesorios",
  "it": "Gioielli e accessori",
  "ru": "Украшения и аксессуары",
  "zh": "珠宝与配饰",
  "hi": "आभूषण और सहायक उपकरण"
 },
 "Food & Cuisine": {
  "fr": "Nourriture & Cuisine",
  "de": "Essen & Küche",
  "es": "Comida y cocina",
  "it": "Cibo e cucina",
  "ru": "Еда и кухня",
  "zh": "食品与烹饪",
  "hi": "खाद्य और व्यंजन"
 },
 "Dishes, street food, sweets and drinks — and where they come from.": {
  "fr": "Plats, cuisine de rue, douceurs et boissons — et leurs origines.",
  "de": "Gerichte, Streetfood, Süßigkeiten und Getränke – und woher sie kommen.",
  "es": "Platos, comida callejera, dulces y bebidas, y de dónde provienen.",
  "it": "Piatti, cibo di strada, dolci e bevande — e da dove provengono.",
  "ru": "Блюда, уличная еда, сладости и напитки — и их происхождение.",
  "zh": "菜肴、街头小吃、甜点和饮料 — 以及它们的来源。",
  "hi": "व्यंजन, स्ट्रीट फूड, मिठाइयाँ और पेय — और वे कहाँ से आते हैं।"
 },
 "Regional dress, embroidery and garments for everyday life and occasions.": {
  "fr": "Costumes régionaux, broderies et vêtements pour la vie de tous les jours et les occasions spéciales.",
  "de": "Regionale Trachten, Stickereien und Kleidungsstücke für den Alltag und besondere Anlässe.",
  "es": "Vestimenta regional, bordados y prendas para la vida cotidiana y ocasiones especiales.",
  "it": "Abiti regionali, ricami e indumenti per la vita di tutti i giorni e le occasioni speciali.",
  "ru": "Региональная одежда, вышивка и предметы гардероба для повседневной жизни и особых случаев.",
  "zh": "日常生活和特殊场合的地区服饰、刺绣和服装。",
  "hi": "रोजमर्रा की जिंदगी और अवसरों के लिए क्षेत्रीय पोशाक, कढ़ाई और वस्त्र।"
 },
 "Silver, gold, beads, amulets and headwear from Egypt's regions.": {
  "fr": "Argent, or, perles, amulettes et coiffes des régions d'Égypte.",
  "de": "Silber, Gold, Perlen, Amulette und Kopfbedeckungen aus den Regionen Ägyptens.",
  "es": "Plata, oro, abalorios, amuletos y tocados de las regiones de Egipto.",
  "it": "Argento, oro, perle, amuleti e copricapi delle regioni d'Egitto.",
  "ru": "Серебро, золото, бусы, амулеты и головные уборы из регионов Египта.",
  "zh": "来自埃及各地区的银、金、珠子、护身符和头饰。",
  "hi": "मिस्र के क्षेत्रों से चांदी, सोना, मोती, ताबीज और सिर के गहने।"
 },
 "Read the encyclopedia chapter": {
  "fr": "Lire le chapitre de l'encyclopédie",
  "de": "Das Enzyklopädie-Kapitel lesen",
  "es": "Leer el capítulo de la enciclopedia",
  "it": "Leggi il capitolo dell'enciclopedia",
  "ru": "Прочитать главу энциклопедии",
  "zh": "阅读百科全书章节",
  "hi": "विश्वकोश का अध्याय पढ़ें"
 },
 "Food heritage": {
  "fr": "Patrimoine alimentaire",
  "de": "Kulinarisches Erbe",
  "es": "Patrimonio alimentario",
  "it": "Patrimonio alimentare",
  "ru": "Гастрономическое наследие",
  "zh": "饮食遗产",
  "hi": "खाद्य विरासत"
 },
 "Dress & textiles": {
  "fr": "Vêtements & textiles",
  "de": "Kleidung & Textilien",
  "es": "Vestimenta y textiles",
  "it": "Abbigliamento e tessuti",
  "ru": "Одежда и текстиль",
  "zh": "服装与纺织品",
  "hi": "पोशाक और वस्त्र"
 },
 "Crafts": {
  "fr": "Artisanat",
  "de": "Handwerk",
  "es": "Artesanía",
  "it": "Artigianato",
  "ru": "Ремесла",
  "zh": "手工艺品",
  "hi": "शिल्प"
 },
 "Wear Egypt marketplace": {
  "fr": "Marché Wear Egypt",
  "de": "Wear Egypt Marktplatz",
  "es": "Mercado Wear Egypt",
  "it": "Mercato Wear Egypt",
  "ru": "Торговая площадка Wear Egypt",
  "zh": "Wear Egypt 市场",
  "hi": "Wear Egypt मार्केटप्लेस"
 },
 "Handmade Crafts marketplace": {
  "fr": "Marché de l'artisanat fait main",
  "de": "Marktplatz für handgefertigtes Kunsthandwerk",
  "es": "Mercado de artesanía hecha a mano",
  "it": "Mercato di artigianato fatto a mano",
  "ru": "Торговая площадка изделий ручной работы",
  "zh": "手工艺品市场",
  "hi": "हस्तनिर्मित शिल्प बाज़ार"
 },
 "Traditional clothing": {
  "fr": "Vêtements traditionnels",
  "de": "Traditionelle Kleidung",
  "es": "Ropa tradicional",
  "it": "Abbigliamento tradizionale",
  "ru": "Традиционная одежда",
  "zh": "传统服装",
  "hi": "पारंपरिक कपड़े"
 },
 "Traditional crafts": {
  "fr": "Artisanat traditionnel",
  "de": "Traditionelles Handwerk",
  "es": "Artesanía tradicional",
  "it": "Artigianato tradizionale",
  "ru": "Традиционные ремесла",
  "zh": "传统工艺",
  "hi": "पारंपरिक शिल्प"
 },
 "Ingredients": {
  "fr": "Ingrédients",
  "de": "Zutaten",
  "es": "Ingredientes",
  "it": "Ingredienti",
  "ru": "Ингредиенты",
  "zh": "成分",
  "hi": "सामग्री"
 },
 "Materials": {
  "fr": "Matériaux",
  "de": "Materialien",
  "es": "Materiales",
  "it": "Materiali",
  "ru": "Материалы",
  "zh": "材料",
  "hi": "सामग्री"
 },
 "Summary": {
  "fr": "Résumé",
  "de": "Zusammenfassung",
  "es": "Resumen",
  "it": "Riepilogo",
  "ru": "Краткое содержание",
  "zh": "摘要",
  "hi": "सारांश"
 },
 "The story": {
  "fr": "L'histoire",
  "de": "Die Geschichte",
  "es": "La historia",
  "it": "La storia",
  "ru": "История",
  "zh": "故事",
  "hi": "कहानी"
 },
 "Origins": {
  "fr": "Origines",
  "de": "Ursprünge",
  "es": "Orígenes",
  "it": "Origini",
  "ru": "Происхождение",
  "zh": "起源",
  "hi": "उत्पत्ति"
 },
 "Photograph": {
  "fr": "Photographie",
  "de": "Fotografie",
  "es": "Fotografía",
  "it": "Fotografia",
  "ru": "Фотография",
  "zh": "照片",
  "hi": "तस्वीर"
 },
 "Archival image": {
  "fr": "Image d'archive",
  "de": "Archivbild",
  "es": "Imagen de archivo",
  "it": "Immagine d'archivio",
  "ru": "Архивное изображение",
  "zh": "档案图像",
  "hi": "अभिलेखीय छवि"
 },
 "Illustration": {
  "fr": "Illustration",
  "de": "Illustration",
  "es": "Ilustración",
  "it": "Illustrazione",
  "ru": "Иллюстрация",
  "zh": "插图",
  "hi": "चित्रण"
 },
 "Main dishes": {
  "fr": "Plats principaux",
  "de": "Hauptgerichte",
  "es": "Platos principales",
  "it": "Piatti principali",
  "ru": "Основные блюда",
  "zh": "主菜",
  "hi": "मुख्य व्यंजन"
 },
 "Street food": {
  "fr": "Cuisine de rue",
  "de": "Streetfood",
  "es": "Comida callejera",
  "it": "Cibo di strada",
  "ru": "Уличная еда",
  "zh": "街头小吃",
  "hi": "स्ट्रीट फूड"
 },
 "Sweets": {
  "fr": "Douceurs",
  "de": "Süßigkeiten",
  "es": "Dulces",
  "it": "Dolci",
  "ru": "Сладости",
  "zh": "甜点",
  "hi": "मिठाइयाँ"
 },
 "Drinks": {
  "fr": "Boissons",
  "de": "Getränke",
  "es": "Bebidas",
  "it": "Bevande",
  "ru": "Напитки",
  "zh": "饮料",
  "hi": "पेय पदार्थ"
 },
 "Breakfast": {
  "fr": "Petit-déjeuner",
  "de": "Frühstück",
  "es": "Desayuno",
  "it": "Colazione",
  "ru": "Завтрак",
  "zh": "早餐",
  "hi": "नाश्ता"
 },
 "Soups & stews": {
  "fr": "Soupes & ragoûts",
  "de": "Suppen & Eintöpfe",
  "es": "Sopas y guisos",
  "it": "Zuppe e stufati",
  "ru": "Супы и рагу",
  "zh": "汤和炖菜",
  "hi": "सूप और स्टू"
 },
 "Bread & pastry": {
  "fr": "Pain & pâtisserie",
  "de": "Brot & Gebäck",
  "es": "Pan y bollería",
  "it": "Pane e pasticceria",
  "ru": "Хлеб и выпечка",
  "zh": "面包和糕点",
  "hi": "ब्रेड और पेस्ट्री"
 },
 "Women": {
  "fr": "Femmes",
  "de": "Damen",
  "es": "Mujeres",
  "it": "Donna",
  "ru": "Женщинам",
  "zh": "女士",
  "hi": "महिलाएं"
 },
 "Men": {
  "fr": "Hommes",
  "de": "Herren",
  "es": "Hombres",
  "it": "Uomo",
  "ru": "Мужчинам",
  "zh": "男士",
  "hi": "पुरुष"
 },
 "Children": {
  "fr": "Enfants",
  "de": "Kinder",
  "es": "Niños",
  "it": "Bambini",
  "ru": "Детям",
  "zh": "儿童",
  "hi": "बच्चे"
 },
 "Weddings & occasions": {
  "fr": "Mariages & occasions",
  "de": "Hochzeiten & Anlässe",
  "es": "Bodas y ocasiones especiales",
  "it": "Matrimoni e occasioni",
  "ru": "Свадьбы и торжества",
  "zh": "婚礼与特殊场合",
  "hi": "शादियाँ और अवसर"
 },
 "Everyday": {
  "fr": "Quotidien",
  "de": "Alltag",
  "es": "Ropa de diario",
  "it": "Quotidiano",
  "ru": "Повседневная",
  "zh": "日常",
  "hi": "रोज़ाना"
 },
 "Accessories & headwear": {
  "fr": "Accessoires & coiffes",
  "de": "Accessoires & Kopfbedeckungen",
  "es": "Accesorios y tocados",
  "it": "Accessori e copricapi",
  "ru": "Аксессуары и головные уборы",
  "zh": "配饰与头饰",
  "hi": "सहायक उपकरण और सिर के गहने"
 },
 "Silver": {
  "fr": "Argent",
  "de": "Silber",
  "es": "Plata",
  "it": "Argento",
  "ru": "Серебро",
  "zh": "银",
  "hi": "चाँदी"
 },
 "Gold": {
  "fr": "Or",
  "de": "Gold",
  "es": "Oro",
  "it": "Oro",
  "ru": "Золото",
  "zh": "金",
  "hi": "सोना"
 },
 "Beads & stones": {
  "fr": "Perles & pierres",
  "de": "Perlen & Steine",
  "es": "Abalorios y piedras",
  "it": "Perle e pietre",
  "ru": "Бусы и камни",
  "zh": "珠子与宝石",
  "hi": "मोती और पत्थर"
 },
 "Amulets": {
  "fr": "Amulettes",
  "de": "Amulette",
  "es": "Amuletos",
  "it": "Amuleti",
  "ru": "Амулеты",
  "zh": "护身符",
  "hi": "ताबीज"
 },
 "Headwear": {
  "fr": "Coiffes",
  "de": "Kopfbedeckungen",
  "es": "Tocados",
  "it": "Copricapi",
  "ru": "Головные уборы",
  "zh": "头饰",
  "hi": "सिर के गहने"
 },
 "Craft objects": {
  "fr": "Objets d'artisanat",
  "de": "Kunsthandwerksobjekte",
  "es": "Objetos de artesanía",
  "it": "Oggetti di artigianato",
  "ru": "Ремесленные изделия",
  "zh": "手工艺品",
  "hi": "शिल्प वस्तुएं"
 },
 "Made in Egypt Marketplace — Crafts, Cotton & Heritage Fashion | Egyptora Hub": {
  "fr": "Marché Made in Egypt — Artisanat, Coton & Mode Patrimoniale | Egyptora Hub",
  "de": "Made in Egypt Marktplatz – Handwerk, Baumwolle & traditionelle Mode | Egyptora Hub",
  "es": "Mercado Made in Egypt — Artesanía, algodón y moda tradicional | Egyptora Hub",
  "it": "Mercato Made in Egypt — Artigianato, cotone e moda tradizionale | Egyptora Hub",
  "ru": "Торговая площадка «Сделано в Египте» — ремесла, хлопок и традиционная мода | Egyptora Hub",
  "zh": "埃及制造市场 — 手工艺品、棉花和传统时尚 | Egyptora Hub",
  "hi": "मेड इन इजिप्ट मार्केटप्लेस — शिल्प, कपास और विरासत फैशन | Egyptora Hub"
 },
 "Invasion": {
  "fr": "Invasion",
  "de": "Invasion",
  "es": "Invasión",
  "it": "Invasione",
  "ru": "Вторжение",
  "zh": "入侵",
  "hi": "आक्रमण"
 },
 "Revolt / resistance": {
  "fr": "Révolte / résistance",
  "de": "Aufstand / Widerstand",
  "es": "Revuelta / resistencia",
  "it": "Rivolta / resistenza",
  "ru": "Восстание / сопротивление",
  "zh": "反抗 / 抵抗",
  "hi": "विद्रोह / प्रतिरोध"
 },
 "Amphibious landing": {
  "fr": "Débarquement amphibie",
  "de": "Amphibische Landung",
  "es": "Desembarco anfibio",
  "it": "Sbarco anfibio",
  "ru": "Высадка морского десанта",
  "zh": "两栖登陆",
  "hi": "उभयचर लैंडिंग"
 },
 "Raid": {
  "fr": "Raid",
  "de": "Überfall",
  "es": "Incursión",
  "it": "Incursione",
  "ru": "Рейд",
  "zh": "突袭",
  "hi": "छापा"
 },
 "Battle": {
  "fr": "Bataille",
  "de": "Schlacht",
  "es": "Batalla",
  "it": "Battaglia",
  "ru": "Битва",
  "zh": "战役",
  "hi": "लड़ाई"
 },
 "War": {
  "fr": "Guerre",
  "de": "Krieg",
  "es": "Guerra",
  "it": "Guerra",
  "ru": "Война",
  "zh": "战争",
  "hi": "युद्ध"
 },
 "Campaign": {
  "fr": "Campagne",
  "de": "Feldzug",
  "es": "Campaña",
  "it": "Campagna",
  "ru": "Кампания",
  "zh": "战役",
  "hi": "अभियान"
 },
 "Siege": {
  "fr": "Siège",
  "de": "Belagerung",
  "es": "Asedio",
  "it": "Assedio",
  "ru": "Осада",
  "zh": "围攻",
  "hi": "घेराबंदी"
 },
 "Naval engagement": {
  "fr": "Engagement naval",
  "de": "Seegefecht",
  "es": "Combate naval",
  "it": "Scontro navale",
  "ru": "Морское сражение",
  "zh": "海战",
  "hi": "नौसैनिक संघर्ष"
 },
 "Air operation": {
  "fr": "Opération aérienne",
  "de": "Luftoperation",
  "es": "Operación aérea",
  "it": "Operazione aerea",
  "ru": "Воздушная операция",
  "zh": "空中行动",
  "hi": "हवाई ऑपरेशन"
 },
 "Operation": {
  "fr": "Opération",
  "de": "Operation",
  "es": "Operación",
  "it": "Operazione",
  "ru": "Операция",
  "zh": "行动",
  "hi": "ऑपरेशन"
 },
 "Defensive action": {
  "fr": "Action défensive",
  "de": "Verteidigungsaktion",
  "es": "Acción defensiva",
  "it": "Azione difensiva",
  "ru": "Оборонительное действие",
  "zh": "防御行动",
  "hi": "रक्षात्मक कार्रवाई"
 },
 "Conflict phase": {
  "fr": "Phase de conflit",
  "de": "Konfliktphase",
  "es": "Fase de conflicto",
  "it": "Fase di conflitto",
  "ru": "Фаза конфликта",
  "zh": "冲突阶段",
  "hi": "संघर्ष चरण"
 },
 "Other record": {
  "fr": "Autre enregistrement",
  "de": "Anderer Eintrag",
  "es": "Otro registro",
  "it": "Altra registrazione",
  "ru": "Другая запись",
  "zh": "其他记录",
  "hi": "अन्य रिकॉर्ड"
 },
 "Egyptian victory": {
  "fr": "Victoire égyptienne",
  "de": "Ägyptischer Sieg",
  "es": "Victoria egipcia",
  "it": "Vittoria egiziana",
  "ru": "Египетская победа",
  "zh": "埃及胜利",
  "hi": "मिस्र की जीत"
 },
 "Defeat": {
  "fr": "Défaite",
  "de": "Niederlage",
  "es": "Derrota",
  "it": "Sconfitta",
  "ru": "Поражение",
  "zh": "失败",
  "hi": "हार"
 },
 "Strategic withdrawal": {
  "fr": "Retrait stratégique",
  "de": "Strategischer Rückzug",
  "es": "Retirada estratégica",
  "it": "Ritiro strategico",
  "ru": "Стратегическое отступление",
  "zh": "战略性撤退",
  "hi": "रणनीतिक वापसी"
 },
 "Outcome disputed in scholarship": {
  "fr": "Résultat contesté dans la recherche académique",
  "de": "Ergebnis in der Wissenschaft umstritten",
  "es": "Resultado disputado en los círculos académicos",
  "it": "Esito controverso negli studi accademici",
  "ru": "Исход оспаривается в научной литературе",
  "zh": "学术界对结果存在争议",
  "hi": "विद्वानों के बीच परिणाम विवादित"
 },
 "Original artifact": {
  "fr": "Artefact original",
  "de": "Originalartefakt",
  "es": "Artefacto original",
  "it": "Manufatto originale",
  "ru": "Оригинальный артефакт",
  "zh": "原始文物",
  "hi": "मूल कलाकृति"
 },
 "Archival photograph": {
  "fr": "Photographie d'archive",
  "de": "Archivfotografie",
  "es": "Fotografía de archivo",
  "it": "Fotografia d'archivio",
  "ru": " Архивная фотография",
  "zh": "档案照片",
  "hi": "अभिलेखीय तस्वीर"
 },
 "Historical artwork": {
  "fr": "Œuvre d'art historique",
  "de": "Historisches Kunstwerk",
  "es": "Obra de arte histórica",
  "it": "Opera d'arte storica",
  "ru": "Историческое произведение искусства",
  "zh": "历史艺术品",
  "hi": "ऐतिहासिक कलाकृति"
 },
 "Primary sources": {
  "fr": "Sources primaires",
  "de": "Primärquellen",
  "es": "Fuentes primarias",
  "it": "Fonti primarie",
  "ru": "Первоисточники",
  "zh": "主要来源",
  "hi": "प्राथमिक स्रोत"
 },
 "Scholarly works": {
  "fr": "Ouvrages savants",
  "de": "Wissenschaftliche Werke",
  "es": "Obras académicas",
  "it": "Opere accademiche",
  "ru": "Научные труды",
  "zh": "学术著作",
  "hi": "विद्वानों के कार्य"
 },
 "Institutional collections": {
  "fr": "Collections institutionnelles",
  "de": "Institutionelle Sammlungen",
  "es": "Colecciones institucionales",
  "it": "Collezioni istituzionali",
  "ru": "Институциональные коллекции",
  "zh": "机构收藏",
  "hi": "संस्थागत संग्रह"
 },
 "Eras & Rulers": {
  "fr": "Époques & Souverains",
  "de": "Epochen & Herrscher",
  "es": "Eras y gobernantes",
  "it": "Ere e sovrani",
  "ru": "Эпохи и правители",
  "zh": "时代与统治者",
  "hi": "युग और शासक"
 },
 "Egypt's eras and the rulers documented for each, in the visual encyclopedia.": {
  "fr": "Les époques de l'Égypte et les souverains documentés pour chacune, dans l'encyclopédie visuelle.",
  "de": "Ägyptens Epochen und die für jede dokumentierten Herrscher in der visuellen Enzyklopädie.",
  "es": "Las eras de Egipto y los gobernantes documentados para cada una, en la enciclopedia visual.",
  "it": "Le ere dell'Egitto e i sovrani documentati per ciascuna, nell'enciclopedia visiva.",
  "ru": "Эпохи Египта и правители, задокументированные для каждой из них, в визуальной энциклопедии.",
  "zh": "视觉百科全书中记录的埃及各个时代及其统治者。",
  "hi": "मिस्र के युग और प्रत्येक के लिए प्रलेखित शासक, दृश्य विश्वकोश में।"
 },
 "An editorial register of battles, campaigns and operations, organised by era and under academic review.": {
  "fr": "Un registre éditorial des batailles, campagnes et opérations, organisé par époque et en cours de révision académique.",
  "de": "Ein redaktionelles Verzeichnis von Schlachten, Feldzügen und Operationen, nach Epochen geordnet und unter akademischer Überprüfung.",
  "es": "Un registro editorial de batallas, campañas y operaciones, organizado por era y bajo revisión académica.",
  "it": "Un registro editoriale di battaglie, campagne e operazioni, organizzato per epoca e sottoposto a revisione accademica.",
  "ru": "Редакционный реестр сражений, кампаний и операций, организованный по эпохам и проходящий научную экспертизу.",
  "zh": "按时代组织、经学术审查的战役、战事与军事行动编辑名录。",
  "hi": "युग के अनुसार व्यवस्थित और अकादमिक समीक्षा के तहत लड़ाइयों, अभियानों और ऑपरेशनों का एक संपादकीय रजिस्टर।"
 },
 "Government": {
  "fr": "Gouvernement",
  "de": "Regierung",
  "es": "Gobierno",
  "it": "Governo",
  "ru": "Правительство",
  "zh": "政府",
  "hi": "सरकार"
 },
 "Private": {
  "fr": "Privé",
  "de": "Privat",
  "es": "Privado",
  "it": "Privato",
  "ru": "Частный",
  "zh": "私营",
  "hi": "निजी"
 },
 "apps": {
  "fr": "applis",
  "de": "Apps",
  "es": "apps",
  "it": "app",
  "ru": "приложения",
  "zh": "应用",
  "hi": "ऐप्स"
 },
 "Official Directory": {
  "fr": "Annuaire officiel",
  "de": "Offizielles Verzeichnis",
  "es": "Directorio oficial",
  "it": "Elenco ufficiale",
  "ru": "Официальный справочник",
  "zh": "官方目录",
  "hi": "आधिकारिक निर्देशिका"
 },
 "Emergency categories": {
  "fr": "Catégories d'urgence",
  "de": "Notfallkategorien",
  "es": "Categorías de emergencia",
  "it": "Categorie di emergenza",
  "ru": "Категории экстренных ситуаций",
  "zh": "紧急情况类别",
  "hi": "आपातकालीन श्रेणियाँ"
 },
 "Emergency numbers": {
  "fr": "Numéros d'urgence",
  "de": "Notrufnummern",
  "es": "Números de emergencia",
  "it": "Numeri di emergenza",
  "ru": "Номера экстренных служб",
  "zh": "紧急电话号码",
  "hi": "आपातकालीन नंबर"
 },
 "Emergency number reports": {
  "fr": "Rapports sur les numéros d'urgence",
  "de": "Berichte über Notrufnummern",
  "es": "Informes de números de emergencia",
  "it": "Segnalazioni sui numeri di emergenza",
  "ru": "Отчеты о номерах экстренных служб",
  "zh": "紧急号码报告",
  "hi": "आपातकालीन नंबर रिपोर्ट"
 },
 "Legal & Compliance": {
  "fr": "Légal et conformité",
  "de": "Rechtliches & Compliance",
  "es": "Legal y cumplimiento",
  "it": "Legale e conformità",
  "ru": "Юридические вопросы и соответствие",
  "zh": "法律与合规",
  "hi": "कानूनी और अनुपालन"
 },
 "Records": {
  "fr": "Enregistrements",
  "de": "Aufzeichnungen",
  "es": "Registros",
  "it": "Registrazioni",
  "ru": "Записи",
  "zh": "记录",
  "hi": "रिकॉर्ड्स"
 }
};
/** Fixes wrong existing entries (zh/ru showed French). */
export const PHASE36_OVERRIDES: Record<string, Dict> = { zh: { "Legal & Compliance": "法律与合规" }, ru: { "Legal & Compliance": "Юридические вопросы и соответствие" } };
export const PHASE36_EXTRA_KEYS = Object.keys(PHASE36_EXTRA);
const LANGS = ["ar", "fr", "de", "es", "it", "ru", "zh", "hi"] as const;
const pick = (i: number): Dict => {
  const lang = LANGS[i]!;
  const extra = Object.fromEntries(Object.entries(PHASE36_EXTRA).filter(([, v]) => v[lang]).map(([k, v]) => [k, v[lang]!]));
  return { ...extra, ...Object.fromEntries(Object.entries(ROWS).map(([k, r]) => [k, r[i]!])) };
};
export const phase36 = { ar: pick(0), fr: pick(1), de: pick(2), es: pick(3), it: pick(4), ru: pick(5), zh: pick(6), hi: pick(7) };
/** Keys machine-translated in Prompt 36 (all languages listed above). */
export const PHASE36_KEYS = [...Object.keys(ROWS), ...Object.keys(PHASE36_EXTRA)];
