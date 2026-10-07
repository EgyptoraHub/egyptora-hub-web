/** The four existing marketplace pages; descriptions are those pages' own intro text. */
import wearImg from "@/assets/mkt-wear-hero.jpg";
import craftsImg from "@/assets/mkt-crafts-1.jpg";
import cottonImg from "@/assets/mkt-cotton-2.jpg";
import producersImg from "@/assets/market-crafts.jpg";

export const MARKETPLACE_CARDS = [
  { title: "Wear Egypt", desc: "Wear Egypt: tulle-bi-telli embroidery, Siwan and Bedouin needlework, silver and gold filigree jewellery from verified makers.", img: wearImg, to: "/marketplace/wear-egypt" },
  { title: "Handmade Crafts", desc: "Egyptian handmade crafts: pottery, alabaster, copper, papyrus and woodwork from verified artisans and workshops you can visit.", img: craftsImg, to: "/marketplace/handmade-crafts" },
  { title: "Egyptian Cotton", desc: "Discover Egyptian cotton: Giza long-staple varieties, certified mills, bespoke tailoring and Delta cotton trails you can book as a visitor.", img: cottonImg, to: "/marketplace/egyptian-cotton" },
  { title: "Local Producers", desc: "Meet Egypt's local producers: palm and reed workshops, boat builders, furniture makers and cooperatives across the governorates.", img: producersImg, to: "/marketplace/local-producers" },
];
