/**
 * Lists UI texts on the Prompt 24–27 pages that still fall back to English, per language.
 * Run: bun scripts/i18n-missing.ts   (add --json to print the missing keys)
 */
import { readFileSync } from "fs";
import { dictionaries } from "../src/i18n/dictionary";

export const PAGES: Record<string, string[]> = {
  "emergency-numbers": ["src/routes/emergency-numbers.tsx"],
  "egypt-apps": ["src/routes/egypt-apps.tsx", "src/routes/egypt-apps_.$category.tsx", "src/components/site/EgyptApps.tsx"],
  "egypt-through-time + military": [
    "src/routes/egypt-through-time.tsx", "src/routes/egypt-through-time_.military-history.tsx",
    "src/routes/egypt-through-time_.military-history_.records.tsx", "src/routes/egypt-through-time_.military-history_.records_.$slug.tsx",
    "src/routes/egypt-through-time_.military-history_.timeline.tsx", "src/routes/egypt-through-time_.military-history_.map.tsx",
    "src/routes/egypt-through-time_.military-history_.figures.tsx", "src/routes/egypt-through-time_.military-history_.library.tsx",
    "src/components/military/MilitaryUI.tsx",
  ],
  "live-like-an-egyptian": [
    "src/routes/live-like-an-egyptian.tsx", "src/routes/live-like-an-egyptian_.$section.tsx",
    "src/routes/live-like-an-egyptian_.$section_.$slug.tsx", "src/components/culture/CultureUI.tsx",
  ],
  "know-your-roots": ["src/routes/know-your-roots.tsx"],
  "traveler-stories": ["src/routes/traveler-stories.tsx", "src/routes/traveler-stories_.$id.tsx", "src/components/site/StoryReportButton.tsx"],
};
const LANGS = ["fr", "de", "es", "it", "ru", "zh", "hi"] as const;
const all = new Set<string>();
for (const [page, files] of Object.entries(PAGES)) {
  const keys = new Set<string>();
  for (const f of files) {
    try { for (const m of readFileSync(f, "utf8").matchAll(/\bt\(\s*"([^"]+)"/g)) keys.add(m[1]!); } catch { /* file moved */ }
  }
  keys.forEach((k) => all.add(k));
  console.log([page, `${keys.size} texts`, ...LANGS.map((l) => `${l}:${[...keys].filter((k) => !(dictionaries as any)[l][k]).length}`)].join(" | "));
}
const missing = [...all].filter((k) => LANGS.some((l) => !(dictionaries as any)[l][k]));
console.log(`TOTAL distinct texts still missing in at least one language: ${missing.length}`);
if (process.argv.includes("--json")) console.log(JSON.stringify(missing));
