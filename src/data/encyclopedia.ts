import dressGovernorates from "@/assets/generated/culture-fashion-galabeya-jellabiya.webp";
import dressState from "@/assets/generated/enc-formal-state-dress.webp";
import peopleAncient from "@/assets/generated/banner-egypt-through-time.webp";
import peopleModern from "@/assets/generated/card-live-individuals.webp";
import foodHeritage from "@/assets/generated/culture-cuisine-koshary.webp";
import craftsTextile from "@/assets/generated/culture-fashion-akhmim-weaving.webp";
import marketsTrade from "@/assets/generated/culture-cuisine-siwa-dates.webp";
import ruralFarming from "@/assets/generated/eco-generic-nile-island.webp";
import dailyLife from "@/assets/generated/card-live-individuals.webp";
import flagsEvolution from "@/assets/generated/ph-heritage-sites.webp";
import officialFlags from "@/assets/generated/ph-heritage-sites.webp";
import coatOfArms from "@/assets/generated/ph-heritage-sites.webp";
import eagleEmblems from "@/assets/generated/ph-heritage-sites.webp";
import anthems from "@/assets/generated/enc-anthems.webp";
import epicsRulers from "@/assets/generated/banner-egypt-through-time.webp";
import famousBattles from "@/assets/generated/banner-military-history.webp";
import peaceTreaties from "@/assets/generated/enc-peace-treaties.webp";
import empireMaps from "@/assets/generated/banner-military-history.webp";
import empireExtent from "@/assets/generated/banner-military-history.webp";
import provincesMap from "@/assets/generated/ill-know-your-roots.webp";
import regionsStrip from "@/assets/generated/eco-generic-desert.webp";
import genomeTimeline from "@/assets/generated/enc-genome-dna.webp";
import genomeContinuity from "@/assets/generated/enc-research-lab.webp";
import filmVision from "@/assets/generated/enc-film-studio.webp";
import filmEras from "@/assets/generated/enc-film-projector.webp";
import filmJourney from "@/assets/generated/enc-film-cinema.webp";

export type EncPlate = {
  image: string;
  alt: string;
  caption: string;
  note: string;
  /** Rendered wide (full column) when true. */
  wide?: boolean;
};

export type EncChapter = {
  id: string;
  eyebrow: string;
  title: string;
  tagline: string;
  story: string;
  cover: string;
  stats: { value: string; label: string }[];
  plates: EncPlate[];
  api: string;
};

export const encChapters: EncChapter[] = [
  {
    id: "dress",
    eyebrow: "People & dress",
    title: "Egyptian dress across the 27 governorates",
    tagline: "What a country wears is the shortest way to read it",
    story:
      "From the embroidered Siwan gowns of the Western Desert to the indigo galabeyas of the Delta, Egyptian dress is a living map. Each governorate keeps its own stitch, colour code and headwrap — patterns that travelled with caravans, harvests and weddings for centuries. This chapter lays the whole republic side by side so a visitor can see, in one glance, how Cairo, Sinai, Nubia and the coast dress differently while sharing one thread.",
    cover: dressGovernorates,
    stats: [
      { value: "27", label: "Governorate dress families" },
      { value: "15", label: "Documented eras of costume" },
      { value: "5", label: "Regional embroidery schools" },
    ],
    plates: [
      {
        image: dressGovernorates,
        alt: "Traditional Egyptian dress of all 27 governorates",
        caption: "The dress atlas",
        note: "Cities, villages, hamlets and kufur — every governorate with its own everyday and festive dress.",
        wide: true,
      },
      {
        image: peopleAncient,
        alt: "Egyptian dress from pre-dynastic to Fatimid periods",
        caption: "From pre-dynastic to Fatimid",
        note: "Linen kilts, pleated New Kingdom robes, Coptic tunics and early Islamic layers, era by era.",
        wide: true,
      },
      {
        image: peopleModern,
        alt: "Egyptian dress from Ayyubid to modern Egypt",
        caption: "From Ayyubid to today",
        note: "Mamluk silks, Ottoman kaftans, tarboush-era tailoring and the contemporary Egyptian street.",
        wide: true,
      },
      {
        image: dressState,
        alt: "Official and government dress in Egypt through the ages",
        caption: "The dress of the state",
        note: "How authority dressed itself — from pharaonic regalia to Khedivial uniforms and modern protocol.",
      },
    ],
    api: "PLANNED · /api/heritage/dress",
  },
  {
    id: "food",
    eyebrow: "Food & drink",
    title: "The Egyptian table, ancient and living",
    tagline: "Bread was invented here — and never left the table",
    story:
      "Egyptians have been baking, brewing and pickling on the same riverbank for five thousand years. Ful and taameya open the morning, molokhia and mahshi hold the family lunch, and hibiscus, sugarcane and mint tea close the night. The plates below trace the line from ancient jars and clay pitchers to the street classics visitors queue for today — a cuisine that never needed reinvention because it never stopped being cooked.",
    cover: foodHeritage,
    stats: [
      { value: "5,000", label: "Years of continuous recipes" },
      { value: "4", label: "Food families: ancient, popular, modern, drinks" },
      { value: "27", label: "Regional kitchens to taste" },
    ],
    plates: [
      {
        image: foodHeritage,
        alt: "Ancient, popular and modern Egyptian food and drinks",
        caption: "Ancient, popular & modern",
        note: "Ancient dishes, street classics, contemporary plates and the old and new drinks beside them.",
        wide: true,
      },
    ],
    api: "PLANNED · /api/experiences/food",
  },
  {
    id: "symbols",
    eyebrow: "Flags & state symbols",
    title: "Egyptian flags, emblems and anthems",
    tagline: "One identity, redrawn but never broken",
    story:
      "Every flag Egypt has raised tells you who was standing on the riverbank that century. The crescent of the Khedivate, the tricolour of 1952, the two stars of the United Arab Republic, the Eagle of Saladin still on the mast today — read in sequence, they are a national autobiography in cloth. Beside them stand the coats of arms, the official flags of the state's institutions, and the anthems Egyptians have sung from *Salam Li Misr* to *Bilady, Bilady, Bilady*.",
    cover: flagsEvolution,
    stats: [
      { value: "9", label: "Flags of the modern state" },
      { value: "5", label: "Eagles & coats of arms" },
      { value: "6", label: "National anthems & songs" },
    ],
    plates: [
      {
        image: flagsEvolution,
        alt: "Evolution of the Egyptian flag through the ages",
        caption: "Evolution of the flag",
        note: "From the Ottoman era to the present tricolour, with the story behind each change.",
        wide: true,
      },
      {
        image: officialFlags,
        alt: "Official flags of the Egyptian state",
        caption: "Flags of the state",
        note: "State, presidential, armed forces, navy, air force and governorate flags.",
      },
      {
        image: coatOfArms,
        alt: "The Egyptian coat of arms through the ages",
        caption: "The coat of arms",
        note: "Kingdom crown and lions, the UAR shield, and the Eagle of Saladin in use today.",
      },
      {
        image: eagleEmblems,
        alt: "The Eagle of Saladin and Egyptian state emblems",
        caption: "The eagle line",
        note: "Muhammad Ali's emblem, the Khedivial eagle, the Kingdom's eagle and the modern republic.",
      },
      {
        image: anthems,
        alt: "Egyptian national anthems and official songs through history",
        caption: "Anthems & national songs",
        note: "Lyricists, composers and the moment each anthem entered national memory.",
        wide: true,
      },
    ],
    api: "PLANNED · /api/heritage/symbols",
  },
  {
    id: "epics",
    eyebrow: "Epics & defence",
    title: "Epics of Egypt through the ages",
    tagline: "A land that built a civilisation, defended it, and still does",
    story:
      "Megiddo, Qadesh, Hattin, Ain Jalut, Damietta, October 1973 — the same valley, the same instinct. Egyptian history is not a chain of conquests but a long record of protection: of trade routes, of a river, of a way of life. This chapter sets the rulers, the famous battles, the shifting scope of influence and the peace treaties Egypt signed side by side, so the story reads as strategy rather than spectacle.",
    cover: epicsRulers,
    stats: [
      { value: "14", label: "Eras of rulers documented" },
      { value: "14", label: "Decisive battles mapped" },
      { value: "10", label: "Peace treaties involving Egypt" },
    ],
    plates: [
      {
        image: epicsRulers,
        alt: "Rulers and defenders of Egypt through the ages",
        caption: "Rulers & defenders",
        note: "Each era with the wars it fought and the achievements it left behind.",
        wide: true,
      },
      {
        image: famousBattles,
        alt: "Famous battles fought by Egyptian armies",
        caption: "Famous battles",
        note: "From Megiddo and Actium to Ain Jalut, Tel El Kebir and the October War.",
        wide: true,
      },
      {
        image: empireMaps,
        alt: "Maps of the Egyptian empire at its greatest extent",
        caption: "Scope of influence",
        note: "Old Kingdom, New Kingdom, Thutmose III and Ramesses II — the reach of the state.",
      },
      {
        image: empireExtent,
        alt: "The Egyptian empire at its greatest extent",
        caption: "The empire at its peak",
        note: "From the Fourth Cataract to the Euphrates: military, political and cultural projection.",
      },
      {
        image: peaceTreaties,
        alt: "Peace treaties involving Egypt through history",
        caption: "Treaties of peace",
        note: "Kadesh, Amasya, London, Rhodes, Camp David — Egypt at the negotiating table.",
        wide: true,
      },
    ],
    api: "REAL · live eras + rulers",
  },
  {
    id: "provinces",
    eyebrow: "Geography & provinces",
    title: "Provinces & districts across every era",
    tagline: "The administrative memory of the Nile Valley",
    story:
      "Long before the 27 governorates, Egypt was 42 nomes, then Roman provinces, then Coptic bishoprics, then Islamic wilayat and Mamluk iqta'. The borders moved; the logic never did — the river organises the country. Read the ancient province map next to today's administrative divisions and the continuity becomes obvious: the same clusters of settlement, the same corridors, the same names surviving in modern towns.",
    cover: provincesMap,
    stats: [
      { value: "42", label: "Ptolemaic nome districts" },
      { value: "24", label: "Ancient provinces on the map" },
      { value: "27", label: "Modern governorates" },
    ],
    plates: [
      {
        image: provincesMap,
        alt: "Map of Egyptian provinces in ancient times",
        caption: "Provinces in ancient times",
        note: "Upper and Lower Egypt with their numbered nomes — an approximate map of historical divisions.",
      },
      {
        image: regionsStrip,
        alt: "Cultural and geographic regions of Egypt",
        caption: "Cultural regions",
        note: "Delta, Greater Cairo, North Coast, Canal, Sinai, Middle and Upper Egypt, Nubia, deserts and Red Sea.",
        wide: true,
      },
    ],
    api: "REAL · /api/search (governorates)",
  },
  {
    id: "crafts",
    eyebrow: "Crafts & daily life",
    title: "Trades, markets and the rhythm of the day",
    tagline: "The workshop is the oldest museum in Egypt",
    story:
      "Copper hammered in the same alleys since the Mamluks, looms still threaded by hand, spice sacks opened at dawn, fields worked at the pace of the flood. Egypt's crafts are not heritage displays — they are working businesses you can visit, commission from and buy. This chapter opens the workshops, the souks, the farms and the ordinary street so travellers can plan a day inside the real economy of the country.",
    cover: craftsTextile,
    stats: [
      { value: "27", label: "Governorates with active crafts" },
      { value: "100+", label: "Documented trades & professions" },
      { value: "Daily", label: "Workshops open to visitors" },
    ],
    plates: [
      {
        image: craftsTextile,
        alt: "Egyptian tailoring, textiles and handmade crafts",
        caption: "Tailoring & handmade crafts",
        note: "Weaving, tailoring, metalwork and inlay — the ateliers behind Made in Egypt.",
      },
      {
        image: marketsTrade,
        alt: "Egyptian markets and trade",
        caption: "Markets & trade",
        note: "Historic souks and covered bazaars where the country still does business face to face.",
      },
      {
        image: ruralFarming,
        alt: "Egyptian agriculture and rural life",
        caption: "Farming & rural Egypt",
        note: "Fields, canals and river work — the oldest continuous agriculture on earth.",
      },
      {
        image: dailyLife,
        alt: "Aspects of Egyptian life through the ages",
        caption: "Aspects of life",
        note: "Streets, cafés, corniches and skylines — Egypt as it is lived today.",
        wide: true,
      },
    ],
    api: "PLANNED · /api/marketplace/crafts",
  },
  {
    id: "genome",
    eyebrow: "Science & continuity",
    title: "The genetic map of Egyptians",
    tagline: "Science proves what history already knew",
    story:
      "In 2025 the first complete genome of an Old Kingdom individual — around 4,500 years old — was sequenced and published. It confirmed what the language, the crafts and the faces already suggested: modern Egyptians carry substantial genetic continuity with the ancient population of the valley, with natural admixture over millennia of trade and conquest. The Egyptian Reference Genome Project now targets 25,000 genomes and a national genome centre.",
    cover: genomeTimeline,
    stats: [
      { value: "1,024", label: "Whole genomes from 21 governorates" },
      { value: "~17M", label: "Novel genetic variants recorded" },
      { value: "25,000", label: "Genomes targeted next phase" },
    ],
    plates: [
      {
        image: genomeTimeline,
        alt: "Timeline of human genetics discoveries and Egyptian genome studies",
        caption: "Timeline of discovery",
        note: "From Miescher in 1869 to the first complete Old Kingdom genome and the national genome centre.",
        wide: true,
      },
      {
        image: genomeContinuity,
        alt: "Population continuity of Egyptians through time",
        caption: "Population continuity",
        note: "Major genetic components across ancient, Roman, Islamic and modern periods.",
      },
    ],
    api: "PLANNED · /api/research/genome",
  },
  {
    id: "film",
    eyebrow: "Film & screen tourism",
    title: "Egypt through the ages, told to the world",
    tagline: "Inspiring cinema, living history, thriving tourism",
    story:
      "Every era in this encyclopedia is a script waiting for a camera. Egyptora Hub's film desk exists to turn documented history into world-class Egyptian films, series and animation — shot in Egypt, produced by Egyptian talent, distributed globally. For investors it is a pipeline: studios, locations, post-production, training and film tourism. For visitors it is a reason to stand where the scene was shot.",
    cover: filmVision,
    stats: [
      { value: "11", label: "Eras ready for production" },
      { value: "5", label: "Development sectors" },
      { value: "Global", label: "Platform distribution" },
    ],
    plates: [
      {
        image: filmVision,
        alt: "Egypt Through the Ages film and series vision",
        caption: "The vision",
        note: "Films and series based on true events, with historical accuracy reviewed by experts.",
        wide: true,
      },
      {
        image: filmEras,
        alt: "Film eras from prehistoric Egypt to modern Egypt",
        caption: "Endless stories",
        note: "Prehistoric, Old Kingdom, New Kingdom, Greco-Roman, Coptic, Islamic, Mamluk and modern Egypt.",
        wide: true,
      },
      {
        image: filmJourney,
        alt: "The filmmaking journey from research to global distribution",
        caption: "The filmmaking journey",
        note: "Research, script, design, filming, VFX, editing and global distribution.",
        wide: true,
      },
    ],
    api: "PLANNED · /api/film/projects",
  },
];

export const encChapterById = Object.fromEntries(
  encChapters.map((c) => [c.id, c]),
) as Record<string, EncChapter>;
