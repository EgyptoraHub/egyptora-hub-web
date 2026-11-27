import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { chipHiddenByGate } from "./nav-availability";
import { isFlatMobileNavEntry, isHiddenNavLeaf, mainNav } from "../data/navigation";

describe("chipHiddenByGate", () => {
  it("hides a hideIfGatedOff chip when its gate has no public record", () => {
    assert.equal(chipHiddenByGate({ gate: "complaint_sectors", hideIfGatedOff: true }, {}), true);
    assert.equal(chipHiddenByGate({ gate: "complaint_sectors", hideIfGatedOff: true }, { complaint_sectors: false }), true);
  });

  it("shows a hideIfGatedOff chip when its gate has a public record", () => {
    assert.equal(chipHiddenByGate({ gate: "complaint_sectors", hideIfGatedOff: true }, { complaint_sectors: true }), false);
  });

  it("never hides chips without hideIfGatedOff (they keep the Coming soon behaviour)", () => {
    assert.equal(chipHiddenByGate({ gate: "complaint_sectors" }, {}), false);
    assert.equal(chipHiddenByGate({}, {}), false);
  });
});

describe("isFlatMobileNavEntry", () => {
  it("does not treat Government Directory as flat (it expands like other sections)", () => {
    const gov = mainNav.find((e) => e.label === "Government Directory");
    assert.ok(gov, "Government Directory entry exists");
    assert.equal(isFlatMobileNavEntry(gov), false);
  });

  it("keeps Official Directory first among the six sub-items", () => {
    const gov = mainNav.find((e) => e.label === "Government Directory");
    assert.deepEqual(
      gov?.items?.map((i) => i.label),
      [
        "Official Directory",
        "Digital Government Services",
        "Complaints & Services Guide",
        "Egyptora Community",
        "Justice & Legal Services Guide",
        "Emergency & Quick Numbers",
        "Egypt Apps",
      ],
    );
  });

  it("Egyptora Community menu item links /community with the community gate, no soon", () => {
    const item = mainNav.find((e) => e.label === "Government Directory")?.items?.find((i) => i.label === "Egyptora Community");
    assert.equal(item?.to, "/community");
    assert.equal(item?.gate, "community");
    assert.equal(item?.soon, undefined);
    assert.equal(isHiddenNavLeaf(item!, { community: false }), true);
    assert.equal(isHiddenNavLeaf(item!, { community: true }), false);
  });

  it("Justice menu item follows Egyptora Community, links /justice with the justice gate, no soon", () => {
    const items = mainNav.find((e) => e.label === "Government Directory")?.items ?? [];
    const i = items.findIndex((x) => x.label === "Justice & Legal Services Guide");
    assert.equal(items[i - 1]?.label, "Egyptora Community");
    const item = items[i]!;
    assert.equal(item.to, "/justice");
    assert.equal(item.gate, "justice");
    assert.equal(item.soon, undefined);
    assert.equal(isHiddenNavLeaf(item, { justice: false }), true);
    assert.equal(isHiddenNavLeaf(item, { justice: true }), false);
  });

  it("treats entries without sub-items as flat", () => {
    assert.equal(isFlatMobileNavEntry({ label: "X", to: "/x" }), true);
  });
});

describe("Energy Materials navigation", () => {
  it("links Energy Materials second in Do Business with its existing gate and no soon placeholder", () => {
    const items = mainNav.find(e => e.label === "Do Business")?.items;
    assert.equal(items?.[0]?.label, "All Business Services");
    assert.deepEqual(items?.[1], { label: "Energy Materials", to: "/energy-materials", gate: "energy_materials" });
  });

  it("hides the Energy menu item when unavailable and shows it only when the gate is on", () => {
    const item = mainNav.find(e => e.label === "Do Business")?.items?.find(i => i.label === "Energy Materials");
    assert.ok(item);
    assert.equal(isHiddenNavLeaf(item, {}), true);
    assert.equal(isHiddenNavLeaf(item, { energy_materials: false }), true);
    assert.equal(isHiddenNavLeaf(item, { energy_materials: true }), false);
  });

  it("preserves the nine top-level menu entries", () => {
    assert.deepEqual(mainNav.map(e => e.label), ["Home", "Explore Egypt", "Live in Egypt", "Healthcare & Medical Services", "Invest in Egypt", "Do Business", "Visit Egypt", "Government Directory", "About"]);
  });
});
