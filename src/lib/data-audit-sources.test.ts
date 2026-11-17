import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LINK_SOURCES } from "@/lib/data-audit.functions";

describe("Data audit source-link coverage (Prompt 52)", () => {
  it("includes complaint_channels.source_url with bilingual labels", () => {
    const e = LINK_SOURCES.find((s) => s.table === "complaint_channels");
    assert.deepEqual(e, { table: "complaint_channels", field: "source_url", nameCol: "label_en", nameCol2: "label_ar" });
  });
  it("includes all four education_platforms link fields (Prompt 55)", () => {
    const fields = LINK_SOURCES.filter((s) => s.table === "education_platforms").map((s) => s.field).sort();
    assert.deepEqual(fields, ["accreditation_source_url", "fee_source_url", "official_url", "source_url"]);
  });
});
