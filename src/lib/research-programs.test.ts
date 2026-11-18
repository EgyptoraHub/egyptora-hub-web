import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateResearchProgram, researchProgramVisible, researchText } from "@/lib/research-programs";

const ok = { source_url: "https://www.asu.edu.eg/343/page", last_verified_at: "2026-11-18", review_status: "editorial_reviewed", is_active: true };

describe("research programme validation (Prompt 57)", () => {
  it("accepts a sourced, dated, reviewed active row", () => assert.deepEqual(validateResearchProgram(ok, "2026-11-18"), []));
  it("rejects activation without a source URL", () => assert.ok(validateResearchProgram({ ...ok, source_url: null }, "2026-11-18").length > 0));
  it("rejects activation without a verification date", () => assert.ok(validateResearchProgram({ ...ok, last_verified_at: null }, "2026-11-18").length > 0));
  it("rejects activation while needs_check", () => assert.ok(validateResearchProgram({ ...ok, review_status: "needs_check" }, "2026-11-18").length > 0));
  it("rejects a PDF source", () => assert.ok(validateResearchProgram({ ...ok, source_url: "https://x.edu.eg/a.PDF" }, "2026-11-18").length > 0));
  it("rejects a future verification date", () => assert.ok(validateResearchProgram({ ...ok, last_verified_at: "2026-11-19" }, "2026-11-18").length > 0));
  it("public visibility needs active and reviewed", () => {
    assert.equal(researchProgramVisible({ is_active: true, review_status: "editorial_reviewed" }), true);
    assert.equal(researchProgramVisible({ is_active: true, review_status: "verified" }), true);
    assert.equal(researchProgramVisible({ is_active: true, review_status: "needs_check" }), false);
    assert.equal(researchProgramVisible({ is_active: false, review_status: "editorial_reviewed" }), false);
  });
  it("uses Arabic only when present", () => {
    assert.equal(researchText("ar", "PhD", "دكتوراه"), "دكتوراه");
    assert.equal(researchText("ar", "PhD", ""), "PhD");
    assert.equal(researchText("en", "PhD", "دكتوراه"), "PhD");
  });
  it("Prompt 57 CSV: 12 Ain Shams rows, Cairo slug, all pass import validation", () => {
    const lines = readFileSync("docs/prompt-57-data/research_programs_real.csv", "utf8").trim().split("\n");
    assert.equal(lines.length, 13);
    for (const l of lines.slice(1)) {
      assert.ok(l.includes('"cairo"') && !l.includes("__CAIRO__"));
      assert.ok(l.includes('"https://www.asu.edu.eg/343/page","2026-11-18"'));
      assert.deepEqual(validateResearchProgram({ source_url: "https://www.asu.edu.eg/343/page", last_verified_at: "2026-11-18" }, "2026-11-18"), []);
    }
  });
});
