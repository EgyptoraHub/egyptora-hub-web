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
        "Justice & Legal Services Guide",
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

  it("15 chips with unique labels (Community, then Justice added)", () => {
    assert.equal(chips.length, 15);
    assert.equal(new Set(chips.map((c) => c.label)).size, 15);
  });

  it("Egyptora Community chip follows Egypt Apps, is not first, and links to /community", () => {
    const i = chips.findIndex((x) => x.label === "Egyptora Community");
    assert.equal(chips[i - 1]?.label, "Egypt Apps");
    assert.ok(i > 0);
    assert.equal(chips[i]?.to, "/community");
    assert.equal(chips[i]?.gate, "community");
  });
  it("Justice chip follows Egyptora Community, is not first, and links to /justice", () => {
    const i = chips.findIndex((x) => x.label === "Justice & Legal Services Guide");
    assert.ok(i > 0);
    assert.equal(chips[i - 1]?.label, "Egyptora Community");
    assert.equal(chips[i]?.to, "/justice");
    assert.equal(chips[i]?.gate, "justice");
  });
});
