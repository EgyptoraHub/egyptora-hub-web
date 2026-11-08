import { describe, expect, test } from "bun:test";
import { chipHiddenByGate } from "./nav-availability";

describe("chipHiddenByGate", () => {
  test("hides a hideIfGatedOff chip when its gate has no public record", () => {
    expect(chipHiddenByGate({ gate: "complaint_sectors", hideIfGatedOff: true }, {})).toBe(true);
    expect(chipHiddenByGate({ gate: "complaint_sectors", hideIfGatedOff: true }, { complaint_sectors: false })).toBe(true);
  });

  test("shows a hideIfGatedOff chip when its gate has a public record", () => {
    expect(chipHiddenByGate({ gate: "complaint_sectors", hideIfGatedOff: true }, { complaint_sectors: true })).toBe(false);
  });

  test("never hides chips without hideIfGatedOff (they keep the Coming soon behaviour)", () => {
    expect(chipHiddenByGate({ gate: "complaint_sectors" }, {})).toBe(false);
    expect(chipHiddenByGate({}, {})).toBe(false);
  });
});
