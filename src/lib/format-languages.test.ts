import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatLanguages } from "./format-languages";

describe("platform language names", () => {
  it("formats Arabic and English names in English", () => {
    assert.equal(formatLanguages("ar,en", "en"), "Arabic, English");
    assert.equal(formatLanguages("ar", "en"), "Arabic");
    assert.equal(formatLanguages("en", "en"), "English");
  });
  it("formats Arabic names with an Arabic comma", () => {
    assert.equal(formatLanguages("ar,en", "ar"), "العربية، الإنجليزية");
    assert.equal(formatLanguages("ar", "ar"), "العربية");
    assert.equal(formatLanguages("en", "ar"), "الإنجليزية");
  });
  it("preserves unknown codes and uses English fallback", () => {
    assert.equal(formatLanguages(" ar, en, fr ", "ar"), "العربية، الإنجليزية، fr");
    assert.equal(formatLanguages("ar,en,fr", "fr"), "Arabic, English, fr");
  });
  it("returns nothing for empty values", () => {
    for (const value of [null, undefined, "", " , "]) assert.equal(formatLanguages(value, "ar"), undefined);
  });
});