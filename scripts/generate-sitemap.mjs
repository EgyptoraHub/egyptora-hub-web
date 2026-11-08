#!/usr/bin/env node
// Builds public/sitemap.xml from scratch on every run (no hand-edited lines are kept, so
// nothing can be duplicated or silently stripped).
// - Static public pages come from the STATIC list below.
// - Detail pages are read from the database with the PUBLIC (anon) key, so only rows
//   visitors can see are listed. Gated pages (zones, eco & nature) appear only when they
//   have at least one public record.
// - Account, auth, search, admin, API and internal pages are never listed.
// Run after publishing/hiding records:  npm run sitemap
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
);
const URL_ = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Canonical host: the one in src/config/site.ts (also used by robots.txt).
const ROOT = readFileSync(new URL("../src/config/site.ts", import.meta.url), "utf8").match(/url:\s*"([^"]+)"/)[1];

async function q(path) {
  const r = await fetch(`${URL_}/rest/v1/${path}`, { headers: { apikey: KEY } });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

const STATIC = [
  "/", "/explore-egypt", "/live-in-egypt", "/invest-in-egypt", "/do-business", "/visit-egypt",
  "/visit-egypt/travel-and-tourism", "/visit-egypt/e-visa",
  "/government-directory", "/government-directory/digital-services", "/emergency-numbers", "/egypt-apps",
  "/governorates", "/countries", "/heritage-sites", "/museums", "/events", "/offers", "/properties",
  "/providers", "/products", "/investment-opportunities", "/research-programs", "/real-estate",
  "/egyptian-heritage-worldwide", "/encyclopedia", "/know-your-roots", "/traveler-stories",
  "/experiences/beaches", "/experiences/desert", "/experiences/nile-cruises",
  "/egypt-through-time", "/egypt-through-time/military-history",
  ...["records", "timeline", "map", "figures", "library"].map((p) => `/egypt-through-time/military-history/${p}`),
  "/live-like-an-egyptian", "/live-like-an-egyptian/cuisine", "/live-like-an-egyptian/fashion", "/live-like-an-egyptian/jewelry-accessories",
  "/marketplace", "/marketplace/wear-egypt", "/marketplace/egyptian-cotton", "/marketplace/handmade-crafts", "/marketplace/local-producers",
  "/partners", "/become-a-partner", "/our-mission", "/vision-values", "/faq", "/trust-center", "/contact",
  "/photo-credits", "/legal",
  "/health", "/health/find-care", "/health/specialties",
  ...["home-care", "rehabilitation", "mental-health", "mother-child", "chronic-care"].map((t) => `/health/services/${t}`),
  ...["blood-donation", "medical-travel", "insurance", "official-websites", "apps", "projects-research", "support"].map((p) => `/health/${p}`),
];

// Legal documents and governorates come from the site's own data files.
const legalSrc = readFileSync(new URL("../src/data/legal.ts", import.meta.url), "utf8");
const legal = [...legalSrc.matchAll(/doc\(\s*\d+,\s*"([a-z0-9-]+)"/g)].map((m) => `/legal/${m[1]}`);
const govSrc = readFileSync(new URL("../src/data/governorates.ts", import.meta.url), "utf8");
const governorates = [...govSrc.matchAll(/^ {4}id: "([a-z-]+)"/gm)].map((m) => `/governorates/${m[1]}`);

// Military: merged child records have no standalone page (they redirect), so they are never listed.
const records = (await q("military_records?select=slug&is_active=eq.true&merged_into_record_id=is.null&order=slug")).map((x) => `/egypt-through-time/military-history/records/${x.slug}`);
const figures = (await q("military_figures?select=slug&is_active=eq.true&order=slug")).map((x) => `/egypt-through-time/military-history/figures/${x.slug}`);
const culture = (await q("culture_items?select=section,slug&is_active=eq.true&order=slug")).map((c) => `/live-like-an-egyptian/${c.section.replace(/_/g, "-")}/${c.slug}`);
const stories = (await q("traveller_stories?select=id&order=id")).map((x) => `/traveler-stories/${x.id}`);

// Egypt Apps categories: real underscore slugs, only when the category has at least one visible app (else the page 404s).
const cats = await q("app_categories?select=id,slug&is_active=eq.true&order=slug");
const appCats = new Set((await q("egypt_apps?select=category_id&is_active=eq.true")).map((a) => a.category_id));
const apps = cats.filter((c) => appCats.has(c.id)).map((c) => `/egypt-apps/${c.slug}`);

// Gated pages.
const gated = [];
const zoneTypes = new Set((await q("economic_zones?select=zone_type")).map((z) => z.zone_type));
if (zoneTypes.has("industrial_zone")) gated.push("/do-business/industrial-zones");
if ([...zoneTypes].some((t) => t !== "industrial_zone")) gated.push("/do-business/free-zones");
if ((await q("protected_areas?select=id&limit=1")).length > 0) gated.push("/experiences/eco-nature");

// Trade, Industry & Agriculture: list pages only while they have public rows; detail pages per active reviewed row.
// The anon key already enforces the visibility rules, so these queries only ever return public records.
const tradeSectors = (await q("trade_sectors?select=slug&is_active=eq.true&order=slug")).filter((x) => x.slug).map((x) => `/do-business/industry-agriculture/${x.slug}`);
const tradeCountries = (await q("trade_country_profiles?select=slug&is_active=eq.true&order=slug")).filter((x) => x.slug).map((x) => `/do-business/world-gateway/${x.slug}`);
const tradeGuides = (await q("procedure_guides?select=slug&is_active=eq.true&order=slug")).filter((x) => x.slug).map((x) => `/do-business/procedure-guides/${x.slug}`);
if (tradeSectors.length > 0) gated.push("/do-business/industry-agriculture");
if (tradeCountries.length > 0) gated.push("/do-business/world-gateway");
if (tradeGuides.length > 0) gated.push("/do-business/procedure-guides");
if (tradeSectors.length + tradeCountries.length + tradeGuides.length > 0) gated.push("/do-business/trade-inquiry");

// Complaints & Government Services Guide: hub + static guide only while public sectors exist;
// sector pages only when the sector has at least one public channel. The anon key enforces the visibility rules.
const complaintSectors = (await q("complaint_sectors?select=slug&is_active=eq.true&order=slug")).filter((x) => x.slug);
const complaintChannelSectors = new Set((await q("complaint_channels?select=sector_slug&is_active=eq.true")).map((c) => c.sector_slug));
// `other-unknown-authority` redirects to the static guide page, so it is never listed.
const complaintPages = complaintSectors
  .filter((s) => s.slug !== "other-unknown-authority" && complaintChannelSectors.has(s.slug))
  .map((s) => `/government-directory/complaints/${s.slug}`);
if (complaintSectors.length > 0) gated.push("/government-directory/complaints", "/government-directory/complaints/unknown-authority");

const healthFacilities = (await q("health_facilities?select=slug&is_active=eq.true&order=slug")).filter((x) => x.slug).map((x) => `/health/find-care/${x.slug}`);
const healthSpecialties = (await q("health_specialties?select=slug&is_active=eq.true&order=slug")).filter((x) => x.slug).map((x) => `/health/specialties/${x.slug}`);

const all = [...new Set([...STATIC, ...legal, ...governorates, ...apps, ...gated, ...records, ...figures, ...culture, ...stories, ...healthFacilities, ...healthSpecialties, ...tradeSectors, ...tradeCountries, ...tradeGuides, ...complaintPages])];
const out = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...all.map((p) => `  <url><loc>${ROOT}${p === "/" ? "/" : p}</loc><changefreq>monthly</changefreq></url>`),
  "</urlset>",
  "",
].join("\n");
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), out);
console.log(`sitemap.xml: ${all.length} URLs on ${ROOT} — static ${STATIC.length}, legal ${legal.length}, governorates ${governorates.length}, app categories ${apps.length}, gated ${gated.length} (${gated.join(", ") || "none"}), military records ${records.length}, figures ${figures.length}, culture ${culture.length}, stories ${stories.length}`);
