import { it } from "node:test";
import assert from "node:assert/strict";
import { doBusinessChips } from "@/data/do-business-chips";

it("Do Business keeps Business Overview current and links Energy Materials second", () => {
  assert.equal(doBusinessChips[0]?.label, "Business Overview");
  assert.equal(doBusinessChips[0]?.to, undefined);
  assert.equal(doBusinessChips[1]?.label, "Energy Materials");
  assert.equal(doBusinessChips[1]?.to, "/energy-materials");
  assert.equal(doBusinessChips[1]?.gate, "energy_materials");
});
