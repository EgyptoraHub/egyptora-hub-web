import { describe, expect, test } from "bun:test";
import { chips } from "@/routes/government-directory";

describe("Government Directory chip order (Prompt 50f)", () => {
  test("key entry points come right after All Entities, rest keep relative order", () => {
    expect(chips.map((c) => c.label)).toEqual([
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
    ]);
  });

  test("Complaints chip keeps its gate, hideIfGatedOff and link", () => {
    const c = chips.find((x) => x.label === "Complaints & Services Guide");
    expect(c).toBeDefined();
    expect(c?.gate).toBe("complaint_sectors");
    expect(c?.hideIfGatedOff).toBe(true);
    expect(c?.to).toBe("/government-directory/complaints");
    expect(c?.hint).toBe("Where to file a complaint: official channels by sector.");
  });

  test("no chip was added, removed or renamed (13 chips, unique labels)", () => {
    expect(chips).toHaveLength(13);
    expect(new Set(chips.map((c) => c.label)).size).toBe(13);
  });
});
