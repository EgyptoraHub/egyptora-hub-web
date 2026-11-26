import { it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const home = read("../routes/index.tsx");
const doBusiness = read("../routes/do-business.tsx");

it("home page no longer renders the wide Energy entry banner", () => {
  assert.equal(home.includes("EnergyEntryCard"), false);
});

it("home Do Business block still carries the Energy Materials card", () => {
  assert.match(home, /title: "Energy Materials"[\s\S]*?to: "\/energy-materials"[\s\S]*?gate: "energy_materials"/);
});

it("Do Business page still renders the Energy entry card", () => {
  assert.match(doBusiness, /<EnergyEntryCard\s*\/>/);
});
