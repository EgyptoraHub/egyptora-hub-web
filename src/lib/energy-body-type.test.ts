import { it } from "node:test";
import assert from "node:assert/strict";
import { energyBodyTypeLabel } from "../i18n/energy-translations";

it("maps known body type keys in English", () => {
  assert.equal(energyBodyTypeLabel("ministry", "en"), "Ministry");
  assert.equal(energyBodyTypeLabel("holding_company", "en"), "Holding company");
  assert.equal(energyBodyTypeLabel("authority", "en"), "Authority");
  assert.equal(energyBodyTypeLabel("standards_body", "en"), "Standards body");
});
it("maps known body type keys in Arabic", () => {
  assert.equal(energyBodyTypeLabel("ministry", "ar"), "وزارة");
  assert.equal(energyBodyTypeLabel("holding_company", "ar"), "شركة قابضة");
  assert.equal(energyBodyTypeLabel("authority", "ar"), "هيئة");
  assert.equal(energyBodyTypeLabel("standards_body", "ar"), "جهة مواصفات");
});
it("shows unknown body type keys unchanged", () => {
  assert.equal(energyBodyTypeLabel("regulator_x", "en"), "regulator_x");
  assert.equal(energyBodyTypeLabel("constructor", "ar"), "constructor");
});
