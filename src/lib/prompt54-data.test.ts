import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseTradeCsv } from "./trade-import";

function records(file: string) {
  const [header, ...rows] = parseTradeCsv(readFileSync(new URL(`../../docs/prompt-54-data/${file}`, import.meta.url), "utf8"));
  if (!header) throw new Error("Missing CSV header");
  return rows.map(row => Object.fromEntries(header.map((key, i) => [key, row[i]])));
}

test("Prompt 54 publishes only GOEIC's sourced EGP 2,500 fee and no processing times", () => {
  const guides = records("procedure_guides_mobility.csv");
  assert.equal(guides.length, 4);
  const goeic = guides.find(g => g.slug === "goeic-producer-registration-visual-inspection");
  assert.ok(goeic);
  assert.equal(goeic.published_fee_text, "EGP 2,500 for the services (Article 94 producer registration)");
  assert.equal(goeic.fee_source_url, "https://www.goeic.gov.eg/ar/services-and-activities/industrial-and-non-industrial-imports/industrial-imports");
  for (const guide of guides) {
    assert.equal(guide.published_processing_time_text ?? "", "");
    if (guide !== goeic) {
      assert.equal(guide.published_fee_text, "");
      assert.equal(guide.published_fee_text_ar, "");
      assert.equal(guide.fee_source_url, "");
    }
  }
});

test("Prompt 54 supplies exactly four ordered GOEIC steps with the approved fee", () => {
  const steps = records("procedure_steps_goeic_producer_registration.csv");
  assert.deepEqual(steps.map(s => Number(s.step_no)), [1, 2, 3, 4]);
  for (const step of steps) assert.equal(step.guide_slug, "goeic-producer-registration-visual-inspection");
  assert.equal(steps[3]?.description_en, "Pay EGP 2,500 for the services.");
});