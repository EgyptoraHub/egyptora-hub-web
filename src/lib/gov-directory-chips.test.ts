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

  it("no chip was added, removed or renamed (13 chips, unique labels)", () => {
    assert.equal(chips.length, 13);
    assert.equal(new Set(chips.map((c) => c.label)).size, 13);
  });
});
