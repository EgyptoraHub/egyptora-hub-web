import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tradeGateOpen, sourceDateText, showPublishedBlock, isRawMaterialKind, validateSectorSearch, validateCountrySearch, validateGuideSearch } from "./trade-public";

describe("trade public page rules", () => {
  it("zero public rows keep the section gated (inert nav / notFound)", () => {
    assert.equal(tradeGateOpen(0), false);
    assert.equal(tradeGateOpen(null), false);
    assert.equal(tradeGateOpen(undefined), false);
    assert.equal(tradeGateOpen(1), true);
    assert.equal(tradeGateOpen(15), true);
  });
  it("the last-verified label is hidden when the date is empty or invalid", () => {
    assert.equal(sourceDateText(null), null);
    assert.equal(sourceDateText(undefined), null);
    assert.equal(sourceDateText(""), null);
    assert.equal(sourceDateText("   "), null);
    assert.equal(sourceDateText("not-a-date"), null);
    assert.equal(sourceDateText("2026-10-01"), "2026-10-01");
  });
  it("published fee/time blocks render only with both text and their own source link", () => {
    assert.equal(showPublishedBlock(null, null), false);
    assert.equal(showPublishedBlock("Official fee", null), false);
    assert.equal(showPublishedBlock("Official fee", ""), false);
    assert.equal(showPublishedBlock("", "https://example.gov.eg"), false);
    assert.equal(showPublishedBlock("  ", "https://example.gov.eg"), false);
    assert.equal(showPublishedBlock("Official fee", "https://example.gov.eg"), true);
  });
  it("commodities split raw materials from manufactured goods and services", () => {
    assert.equal(isRawMaterialKind("raw_material"), true);
    assert.equal(isRawMaterialKind("agricultural"), true);
    assert.equal(isRawMaterialKind("manufactured"), false);
    assert.equal(isRawMaterialKind("service"), false);
    assert.equal(isRawMaterialKind("technology"), false);
  });
  it("search validators default to empty filters", () => {
    assert.deepEqual(validateSectorSearch({}), { group: "" });
    assert.deepEqual(validateCountrySearch({}), { q: "", region: "" });
    assert.deepEqual(validateGuideSearch({}), { activity: "" });
    assert.deepEqual(validateSectorSearch({ group: "industry" }), { group: "industry" });
  });
});
