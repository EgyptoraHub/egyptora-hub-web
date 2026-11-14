import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LINK_SOURCES } from "@/lib/data-audit.functions";

describe("Data audit source-link coverage (Prompt 52)", () => {
  it("includes complaint_channels.source_url with bilingual labels", () => {
    const e = LINK_SOURCES.find((s) => s.table === "complaint_channels");
    assert.deepEqual(e, { table: "complaint_channels", field: "source_url", nameCol: "label_en", nameCol2: "label_ar" });
  });
});
