import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { chipHiddenByGate } from "./nav-availability";
import { isFlatMobileNavEntry, mainNav } from "../data/navigation";

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

  it("keeps Official Directory first among the five sub-items", () => {
    const gov = mainNav.find((e) => e.label === "Government Directory");
    assert.deepEqual(
      gov?.items?.map((i) => i.label),
      [
        "Official Directory",
        "Digital Government Services",
        "Complaints & Services Guide",
        "Emergency & Quick Numbers",
        "Egypt Apps",
      ],
    );
  });

  it("treats entries without sub-items as flat", () => {
    assert.equal(isFlatMobileNavEntry({ label: "X", to: "/x" }), true);
  });
});
