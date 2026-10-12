/**
 * Exports every machine-translated UI text (Prompt 29 batch + Prompt 36 batch) for native-speaker review.
 * Run: bun scripts/i18n-export.ts [outDir]   → translation-review.csv + machine_translated_<lang>.txt
 */
import { mkdirSync, writeFileSync } from "fs";
import { dictionaries } from "../src/i18n/dictionary";
import { phase1Fr, phase1De, phase1Es, phase1It, phase1Ru, phase1Zh, phase1Hi } from "../src/i18n/phase1-translations";
import { PHASE36_KEYS } from "../src/i18n/phase36-translations";

const out = process.argv[2] ?? "translation-export";
mkdirSync(out, { recursive: true });
const p1: Record<string, Record<string, string>> = { fr: phase1Fr, de: phase1De, es: phase1Es, it: phase1It, ru: phase1Ru, zh: phase1Zh, hi: phase1Hi };
const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
const rows = ["language,key,batch,english_source,current_translation"];
for (const lang of ["ar", "fr", "de", "es", "it", "ru", "zh", "hi"]) {
  const dict = (dictionaries as Record<string, Record<string, string>>)[lang]!;
  const keys = new Map<string, string>();
  for (const k of Object.keys(p1[lang] ?? {})) keys.set(k, "prompt29");
  for (const k of PHASE36_KEYS) if (!keys.has(k)) keys.set(k, "prompt36");
  for (const [k, batch] of keys) rows.push([lang, k, batch, k, dict[k] ?? ""].map(esc).join(","));
  writeFileSync(`${out}/machine_translated_${lang}.txt`, [...keys.keys()].join("\n") + "\n");
}
writeFileSync(`${out}/translation-review.csv`, "\uFEFF" + rows.join("\n"));
console.log(`${rows.length - 1} rows → ${out}/translation-review.csv`);
