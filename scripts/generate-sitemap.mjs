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
const dynamic = /\/military-history\/(records|figures)\/[^<]+<\/loc>/;
const kept = readFileSync(path, "utf8").split("\n").filter((l) => !dynamic.test(l) && !l.includes("</urlset>"));
while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();

const records = await slugs("military_records");
const figures = await slugs("military_figures");
const line = (p) => `  <url><loc>${BASE}/${p}</loc><changefreq>monthly</changefreq></url>`;
const out = [...kept, ...records.map((s) => line(`records/${s}`)), ...figures.map((s) => line(`figures/${s}`)), "</urlset>", ""].join("\n");
writeFileSync(path, out);
console.log(`sitemap.xml: ${records.length} record pages, ${figures.length} figure pages`);
