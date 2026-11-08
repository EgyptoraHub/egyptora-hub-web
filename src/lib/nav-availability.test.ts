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
