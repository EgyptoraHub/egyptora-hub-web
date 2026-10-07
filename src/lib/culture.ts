import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import encFood from "@/assets/enc/food-heritage.jpg";
import encDress from "@/assets/enc/dress-governorates.jpg";
import encCrafts from "@/assets/enc/crafts-textile.jpg";

/* Public data layer for "Live Like an Egyptian".
 * Every query names its columns; internal_notes and access_level are never requested
 * (anon/authenticated have no column grant on them). Row visibility (active + reviewed)
 * is enforced by the database policies. */

export const BASE = "/live-like-an-egyptian";
export type DbSection = "cuisine" | "fashion" | "jewelry_accessories";
export type UrlSection = "cuisine" | "fashion" | "jewelry-accessories";
export type ReviewStatus = "needs_check" | "editorial_reviewed" | "verified";

export type SectionConfig = {
  url: UrlSection;
  db: DbSection;
  titleEn: string;
  titleAr: string;
  descEn: string;
  /** governorates column(s) summarised in the "By governorate" block, in priority order */
  govColumns: ("famous_food" | "cuisine" | "famous_clothing" | "crafts")[];
  encyclopedia: { anchor: "food" | "dress" | "crafts"; label: string; img: string };
  marketplace?: { to: "/marketplace/wear-egypt" | "/marketplace/handmade-crafts"; label: string };
  categories: string[];
  /** which detail fact applies */
  materialField: "ingredients" | "materials";
};

/** Hub/section config. Add a future section (e.g. "Where to find it") by appending here. */
export const SECTIONS: SectionConfig[] = [
  {
    url: "cuisine",
    db: "cuisine",
    titleEn: "Egyptian Cuisine",
    titleAr: "المطبخ المصري",
    descEn: "Dishes, street food, sweets and drinks — and where they come from.",
    govColumns: ["famous_food", "cuisine"],
    encyclopedia: { anchor: "food", label: "Food heritage", img: encFood },
    categories: ["main_dish", "street_food", "sweet", "drink", "breakfast", "soup_stew", "bread_pastry"],
    materialField: "ingredients",
  },
  {
    url: "fashion",
    db: "fashion",
    titleEn: "Traditional Fashion",
    titleAr: "الأزياء التقليدية",
    descEn: "Regional dress, embroidery and garments for everyday life and occasions.",
    govColumns: ["famous_clothing"],
    encyclopedia: { anchor: "dress", label: "Dress & textiles", img: encDress },
    marketplace: { to: "/marketplace/wear-egypt", label: "Wear Egypt marketplace" },
    categories: ["women", "men", "children", "wedding_occasion", "everyday", "accessories_headwear"],
    materialField: "materials",
  },
  {
    url: "jewelry-accessories",
    db: "jewelry_accessories",
    titleEn: "Jewelry & Accessories",
    titleAr: "الحلي والإكسسوارات",
    descEn: "Silver, gold, beads, amulets and headwear from Egypt's regions.",
    govColumns: ["crafts"],
    encyclopedia: { anchor: "crafts", label: "Crafts", img: encCrafts },
    marketplace: { to: "/marketplace/handmade-crafts", label: "Handmade Crafts marketplace" },
    categories: ["silver", "gold", "beads_stones", "amulets", "headwear", "craft_object"],
    materialField: "materials",
  },
];

export const sectionByUrl = (s: string) => SECTIONS.find((x) => x.url === s);
export const sectionByDb = (s: string) => SECTIONS.find((x) => x.db === s);

export const CATEGORY_LABEL: Record<string, string> = {
  main_dish: "Main dishes", street_food: "Street food", sweet: "Sweets", drink: "Drinks", breakfast: "Breakfast",
  soup_stew: "Soups & stews", bread_pastry: "Bread & pastry",
  women: "Women", men: "Men", children: "Children", wedding_occasion: "Weddings & occasions", everyday: "Everyday",
  accessories_headwear: "Accessories & headwear",
  silver: "Silver", gold: "Gold", beads_stones: "Beads & stones", amulets: "Amulets", headwear: "Headwear", craft_object: "Craft objects",
};
export const categoryLabel = (c: string | null) => (c ? CATEGORY_LABEL[c] ?? c.replace(/_/g, " ") : "");

export type CultureItem = {
  id: string;
  slug: string;
  section: DbSection;
  category: string | null;
  name_ar: string | null;
  name_en: string | null;
  governorate_id: string | null;
  region_ar: string | null;
  region_en: string | null;
  summary_ar: string | null;
  summary_en: string | null;
  story_ar: string | null;
  story_en: string | null;
  origin_note_ar: string | null;
  origin_note_en: string | null;
  ingredients_ar: string | null;
  ingredients_en: string | null;
  materials_ar: string | null;
  materials_en: string | null;
  occasion_ar: string | null;
  occasion_en: string | null;
  video_url: string | null;
  marketplace_collection: "wear-egypt" | "handmade-crafts" | null;
  review_status: ReviewStatus;
  last_verified_at: string | null;
  is_featured: boolean;
  sort_order: number;
};

export type CultureMedia = {
  id: string;
  kind: "image" | "video";
  url: string;
  caption_ar: string | null;
  caption_en: string | null;
  institution: string | null;
  rights_statement: string;
  origin_type: "photo" | "archival" | "illustration" | "editorial_reconstruction";
};

export const ITEM_COLS =
  "id, slug, section, category, name_ar, name_en, governorate_id, region_ar, region_en, summary_ar, summary_en, story_ar, story_en, origin_note_ar, origin_note_en, ingredients_ar, ingredients_en, materials_ar, materials_en, occasion_ar, occasion_en, video_url, marketplace_collection, review_status, last_verified_at, is_featured, sort_order";
const CARD_COLS = "id, slug, section, category, name_ar, name_en, governorate_id, region_ar, region_en, summary_ar, summary_en, ingredients_ar, ingredients_en, materials_ar, materials_en, review_status, last_verified_at, is_featured, sort_order";
const MEDIA_COLS = "id, kind, url, caption_ar, caption_en, institution, rights_statement, origin_type";

export type GovLite = { id: string; slug: string; name: string; name_ar: string };
export type GovSummary = GovLite & { values: string[] };

const sortItems = (a: CultureItem, b: CultureItem) =>
  Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order || (a.name_en || a.name_ar || "").localeCompare(b.name_en || b.name_ar || "");

/** Visible-row counts per section for hub cards. */
export async function loadSectionCounts(): Promise<Record<DbSection, number>> {
  const { data, error } = await supabase.from("culture_items").select("section");
  if (error) throw new Error("Could not load culture sections");
  const out: Record<DbSection, number> = { cuisine: 0, fashion: 0, jewelry_accessories: 0 };
  for (const r of (data ?? []) as { section: DbSection }[]) out[r.section] = (out[r.section] ?? 0) + 1;
  return out;
}

export async function loadGovernoratesLite(): Promise<GovLite[]> {
  const { data } = await supabase.from("governorates").select("id, slug, name, name_ar").order("name");
  return (data ?? []) as GovLite[];
}

/** Section list: visible items + governorate summaries read from the existing public governorates columns. */
export async function loadSection(cfg: SectionConfig) {
  const [items, govs] = await Promise.all([
    supabase.from("culture_items").select(CARD_COLS).eq("section", cfg.db),
    supabase.from("governorates").select(`id, slug, name, name_ar, ${cfg.govColumns.join(", ")}`).order("name"),
  ]);
  if (items.error) throw new Error("Could not load this collection");
  const governorates = ((govs.data ?? []) as unknown as (GovLite & Record<string, string[] | null>)[]).map((g) => {
    const col = cfg.govColumns.find((c) => (g[c] ?? []).some((v) => v?.trim()));
    return { id: g.id, slug: g.slug, name: g.name, name_ar: g.name_ar, values: col ? (g[col] ?? []).filter((v) => v?.trim()) : [] };
  });
  return {
    items: ((items.data ?? []) as unknown as CultureItem[]).sort(sortItems),
    governorates,
  };
}

export async function loadItem(cfg: SectionConfig, slug: string) {
  const { data, error } = await supabase.from("culture_items").select(ITEM_COLS).eq("section", cfg.db).eq("slug", slug).maybeSingle();
  if (error) throw new Error("Could not load this item");
  if (!data) return null;
  const item = data as unknown as CultureItem;
  const [media, related, govs] = await Promise.all([
    supabase.from("culture_media").select(MEDIA_COLS).eq("item_id", item.id),
    supabase.from("culture_items").select(CARD_COLS).eq("section", cfg.db).neq("id", item.id).limit(60),
    supabase.from("governorates").select("id, slug, name, name_ar").order("name"),
  ]);
  const rel = ((related.data ?? []) as unknown as CultureItem[])
    .filter((r) => (item.governorate_id ? r.governorate_id === item.governorate_id : true))
    .sort(sortItems)
    .slice(0, 6);
  return {
    item,
    media: ((media.data ?? []) as CultureMedia[]).filter((m) => !!m.institution?.trim() && !!m.rights_statement?.trim()),
    related: rel,
    governorates: (govs.data ?? []) as GovLite[],
  };
}

/** Up to 6 visible items for a governorate page; [] hides the block. */
export async function loadGovernorateCulture(govSlug: string): Promise<CultureItem[]> {
  const { data } = await supabase.from("culture_items").select(CARD_COLS).eq("governorate_id", `gov-${govSlug}`).limit(30);
  return ((data ?? []) as unknown as CultureItem[]).sort(sortItems).slice(0, 6);
}

/** Accent/diacritic-insensitive; Arabic alef/ya/ta-marbuta variants unified. */
export function normalize(s: string | null | undefined): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[-–—_'’.,:;()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesQuery(r: CultureItem, q: string | undefined): boolean {
  const needle = normalize(q);
  if (!needle) return true;
  const hay = normalize(
    [r.name_en, r.name_ar, r.region_en, r.region_ar, r.ingredients_en, r.ingredients_ar, r.materials_en, r.materials_ar].join(" | "),
  );
  return needle.split(" ").every((w) => hay.includes(w));
}

export const itemNameEn = (r: Pick<CultureItem, "name_en" | "name_ar">) => r.name_en?.trim() || r.name_ar || "";

/** "1 item" / "2 items"; Arabic plural forms. Other languages use the English rule. */
export function itemCount(n: number, lang: string): string {
  if (lang === "ar") {
    const r = new Intl.PluralRules("ar").select(n);
    const num = n.toLocaleString("ar-EG");
    if (r === "zero") return `${num} عنصر`;
    if (r === "one") return "عنصر واحد";
    if (r === "two") return "عنصران";
    if (r === "few") return `${num} عناصر`;
    return `${num} عنصرًا`;
  }
  return `${n} ${n === 1 ? "item" : "items"}`;
}

/** YouTube/Vimeo only, rendered via privacy-enhanced embeds. */
export function videoEmbed(url: string | null): string | null {
  if (!url || !url.startsWith("https://")) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").filter(Boolean).pop();
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?dnt=1` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export const sectionSearchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
  gov: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});
export type SectionSearch = z.infer<typeof sectionSearchSchema>;
