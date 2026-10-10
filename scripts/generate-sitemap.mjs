#!/usr/bin/env node
// Regenerates the dynamic Military History entries in public/sitemap.xml.
// Static pages are kept as-is; record/figure detail URLs are rebuilt from the
// database using the PUBLIC (anon) key, so only rows visitors can see are listed.
// Run after publishing/hiding records:  node scripts/generate-sitemap.mjs
import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
);
const URL_ = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const BASE = "https://egyptora-hub.com/egypt-through-time/military-history";

async function slugs(table) {
  const r = await fetch(`${URL_}/rest/v1/${table}?select=slug&is_active=eq.true&order=slug`, { headers: { apikey: KEY } });
  if (!r.ok) throw new Error(`${table}: ${r.status} ${await r.text()}`);
  return (await r.json()).map((x) => x.slug);
}

const path = new URL("../public/sitemap.xml", import.meta.url);
const dynamic = /(\/live-in-egypt\/[^<]+|\/do-business\/[^<]+|\/know-your-roots|\/traveler-stories[^<]*|\/military-history\/(records|figures)\/[^<]+|\/live-like-an-egyptian[^<]*)<\/loc>/;
const kept = readFileSync(path, "utf8").split("\n").filter((l) => !dynamic.test(l) && !l.includes("</urlset>"));
while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();

const records = await slugs("military_records");
const figures = await slugs("military_figures");
const cr = await fetch(`${URL_}/rest/v1/culture_items?select=section,slug&is_active=eq.true&order=slug`, { headers: { apikey: KEY } });
if (!cr.ok) throw new Error(`culture_items: ${cr.status}`);
const culture = await cr.json();
const SITE = "https://egyptora-hub.com/live-like-an-egyptian";
const sec = (s) => s.replace(/_/g, "-");
const cultureLines = [SITE, `${SITE}/cuisine`, `${SITE}/fashion`, `${SITE}/jewelry-accessories`, ...culture.map((c) => `${SITE}/${sec(c.section)}/${c.slug}`)]
  .map((u) => `  <url><loc>${u}</loc><changefreq>monthly</changefreq></url>`);
const sr = await fetch(`${URL_}/rest/v1/traveller_stories?select=id&order=id`, { headers: { apikey: KEY } });
if (!sr.ok) throw new Error(`traveller_stories: ${sr.status}`);
const stories = await sr.json();
const ROOT = "https://egyptora-hub.com";
const extraLines = [`${ROOT}/know-your-roots`, `${ROOT}/traveler-stories`, ...stories.map((x) => `${ROOT}/traveler-stories/${x.id}`)]
  .map((u) => `  <url><loc>${u}</loc><changefreq>monthly</changefreq></url>`);
// Zone pages are listed only when they have at least one public record (otherwise they return not-found).
const zr = await fetch(`${URL_}/rest/v1/economic_zones?select=zone_type`, { headers: { apikey: KEY } });
if (!zr.ok) throw new Error(`economic_zones: ${zr.status}`);
const zoneTypes = new Set((await zr.json()).map((z) => z.zone_type));
if (zoneTypes.has("industrial_zone")) extraLines.push(`  <url><loc>${ROOT}/do-business/industrial-zones</loc><changefreq>monthly</changefreq></url>`);
if ([...zoneTypes].some((t) => t !== "industrial_zone")) extraLines.push(`  <url><loc>${ROOT}/do-business/free-zones</loc><changefreq>monthly</changefreq></url>`);
const line = (p) => `  <url><loc>${BASE}/${p}</loc><changefreq>monthly</changefreq></url>`;
const out = [...kept, ...records.map((s) => line(`records/${s}`)), ...figures.map((s) => line(`figures/${s}`)), ...cultureLines, ...extraLines, "</urlset>", ""].join("\n");
writeFileSync(path, out);
console.log(`sitemap.xml: ${records.length} record pages, ${figures.length} figure pages, ${culture.length} culture item pages (+4 culture hub/section pages), ${stories.length} visible tourist experiences`);
