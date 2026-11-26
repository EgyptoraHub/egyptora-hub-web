import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { govDirectoryChips as chips } from "@/lib/gov-directory-chips";

describe("Government Directory chip order (Prompt 50f)", () => {
  it("key entry points come right after All Entities, rest keep relative order", () => {
    assert.deepEqual(
      chips.map((c) => c.label),
      [
        "All Entities",
        "Emergency & Quick Numbers",
        "Complaints & Services Guide",
        "Egypt Apps",
        "Egyptora Community",
        "Ministries",
        "Regulatory Bodies",
        "Related Entities",
        "Governorates",
        "Public Services",
        "Economic Authorities",
        "Judicial Bodies",
        "Diplomatic Missions",
        "Educational Institutions",
      ],
    );
  });

  it("Complaints chip keeps its gate, hideIfGatedOff and link", () => {
    const c = chips.find((x) => x.label === "Complaints & Services Guide");
    assert.ok(c);
    assert.equal(c.gate, "complaint_sectors");
    assert.equal(c.hideIfGatedOff, true);
    assert.equal(c.to, "/government-directory/complaints");
    assert.equal(c.hint, "Where to file a complaint: official channels by sector.");
  });

  it("only Egyptora Community was added (14 chips, unique labels)", () => {
    assert.equal(chips.length, 14);
    assert.equal(new Set(chips.map((c) => c.label)).size, 14);
  });

  it("Egyptora Community chip follows Egypt Apps, is not first, and links to /community", () => {
    const i = chips.findIndex((x) => x.label === "Egyptora Community");
    assert.equal(chips[i - 1]?.label, "Egypt Apps");
    assert.ok(i > 0);
    assert.equal(chips[i]?.to, "/community");
    assert.equal(chips[i]?.gate, "community");
  });
});
