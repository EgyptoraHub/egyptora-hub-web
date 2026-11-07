import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tradeGateOpen, sourceDateText, sourceNameFor, tradeTextFor, showPublishedBlock, isRawMaterialKind, cardSourceItems, documentTableColumns, validateSectorSearch, validateCountrySearch, validateGuideSearch } from "./trade-public";

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
  it("Arabic pages prefer the Arabic source name and fall back to the English one", () => {
    assert.equal(sourceNameFor("ar", "Ministry of Trade", "وزارة التجارة"), "وزارة التجارة");
    assert.equal(sourceNameFor("ar", "Ministry of Trade", null), "Ministry of Trade");
    assert.equal(sourceNameFor("ar", "Ministry of Trade", "  "), "Ministry of Trade");
  });
  it("English and other languages never show the Arabic source name", () => {
    assert.equal(sourceNameFor("en", "Ministry of Trade", "وزارة التجارة"), "Ministry of Trade");
    assert.equal(sourceNameFor("fr", "Ministry of Trade", "وزارة التجارة"), "Ministry of Trade");
    assert.equal(sourceNameFor("en", null, "وزارة التجارة"), null);
    assert.equal(sourceNameFor("en", "", ""), null);
  });
  it("Arabic pages prefer the Arabic fee/time text and fall back to the default", () => {
    assert.equal(tradeTextFor("ar", "15 working days", "15 يوم عمل"), "15 يوم عمل");
    assert.equal(tradeTextFor("ar", "15 working days", null), "15 working days");
    assert.equal(tradeTextFor("ar", "15 working days", "  "), "15 working days");
    assert.equal(tradeTextFor("ar", null, null), null);
  });
  it("English and other languages never show the Arabic fee/time text", () => {
    assert.equal(tradeTextFor("en", "15 working days", "15 يوم عمل"), "15 working days");
    assert.equal(tradeTextFor("fr", "15 working days", "15 يوم عمل"), "15 working days");
    assert.equal(tradeTextFor("en", null, "15 يوم عمل"), null);
    assert.equal(tradeTextFor("en", "", ""), null);
  });
  it("card source rows keep separators only between present items", () => {
    assert.deepEqual(cardSourceItems(["Source", "Last verified: 01/10/2026"]), ["Source", "Last verified: 01/10/2026"]);
    assert.deepEqual(cardSourceItems(["Source", null]), ["Source"]);
    assert.deepEqual(cardSourceItems([null, "Last verified: 01/10/2026"]), ["Last verified: 01/10/2026"]);
    assert.deepEqual(cardSourceItems(["  ", undefined]), []);
  });
  it("document table hides columns that are empty for every document of the guide", () => {
    assert.deepEqual(documentTableColumns([{ issuing_source_en: null, issuing_source_ar: null, official_url: null }]), { showIssuingSource: false, showOfficialLink: false });
    assert.deepEqual(documentTableColumns([{ issuing_source_en: "  ", issuing_source_ar: null, official_url: "https://example.gov.eg" }]), { showIssuingSource: false, showOfficialLink: true });
    assert.deepEqual(documentTableColumns([{ issuing_source_en: null, issuing_source_ar: "جهة الإصدار", official_url: null }]), { showIssuingSource: true, showOfficialLink: false });
    assert.deepEqual(documentTableColumns([{ issuing_source_en: "Authority", official_url: "https://example.gov.eg" }]), { showIssuingSource: true, showOfficialLink: true });
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
