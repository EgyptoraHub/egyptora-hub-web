import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasHealthEvidence, healthResourceMatcher, publicHealthInquirySchema, publicHealthReportSchema, safeHealthUrl } from "./health-public";
describe("public healthcare rules", () => {
  it("license and accreditation labels require all three evidence fields", () => {
    assert.equal(hasHealthEvidence("licensed", null, "2026-10-01"), false);
    assert.equal(hasHealthEvidence(null, "https://example.eg", "2026-10-01"), false);
    assert.equal(hasHealthEvidence("licensed", "https://example.eg", null), false);
    assert.equal(hasHealthEvidence("licensed", "https://example.eg", "2026-10-01"), true);
  });
  const inquiry = { type: "medical_travel", full_name: "Test", email: "test@example.com", country: "Egypt", preferred_language: "en", message: "x".repeat(1500), consent: true };
  it("inquiry messages allow 1500 and reject 1501 characters", () => { assert.equal(publicHealthInquirySchema.safeParse(inquiry).success, true); assert.equal(publicHealthInquirySchema.safeParse({ ...inquiry, message: "x".repeat(1501) }).success, false); });
  it("inquiries require consent", () => { assert.equal(publicHealthInquirySchema.safeParse({ ...inquiry, consent: false }).success, false); });
  it("pending or negative statuses never become licensed or accredited labels", () => { assert.equal(hasHealthEvidence("pending", "https://example.eg", "2026-10-01", "licensed"), false); assert.equal(hasHealthEvidence("not_accredited", "https://example.eg", "2026-10-01", "accredited"), false); assert.equal(hasHealthEvidence("accredited", "https://example.eg", "2026-10-01", "accredited"), true); });
  it("reports require consent", () => { assert.equal(publicHealthReportSchema.safeParse({ kind: "wrong_info", message: "Listing error", consent: false }).success, false); assert.equal(publicHealthReportSchema.safeParse({ kind: "wrong_info", message: "Listing error", consent: true }).success, true); });
  it("visitors cannot set moderation status", () => { assert.equal(publicHealthInquirySchema.safeParse({ ...inquiry, status: "resolved" }).success, false); });
  it("external links reject executable protocols", () => { assert.equal(safeHealthUrl("javascript:alert(1)"), null); });
  it("resource pages show only health-matching rows — no fallback to unrelated entities", () => {
    const match = healthResourceMatcher("health");
    assert.equal(match("Ministry of Health", "وزارة الصحة", "Health", "صحة", "Public health authority"), true);
    assert.equal(match("Egyptian Drug Authority", null, "Health", null, "medicines and دواء"), true);
    assert.equal(match("Presidency", "رئاسة الجمهورية", "Executive", "تنفيذي", "Head of state"), false);
    assert.equal(match("Ministry of Finance", null, "Finance", null, "Budget and taxes"), false);
  });
  it("insurance page matches insurance terms only", () => {
    const match = healthResourceMatcher("insurance");
    assert.equal(match("General Authority for Health Insurance", "الهيئة العامة للتأمين الصحي", null, null, null), true);
    assert.equal(match("Ministry of Health", "وزارة الصحة", "Health", "صحة", null), false);
  });
  it("no match means an empty result set, never all rows", () => {
    const match = healthResourceMatcher("health");
    const rows = [{ n: "Cabinet" }, { n: "State Information Service" }];
    assert.deepEqual(rows.filter((r) => match(r.n)), []);
  });
  it("Arabic whole-token matching accepts genuine health rows with prefixes and articles", () => {
    const match = healthResourceMatcher("health");
    assert.equal(match("وزارة الصحة والسكان"), true);
    assert.equal(match("هيئة التأمين الصحي الشامل"), true);
    assert.equal(match("بنك الدم"), true);
    assert.equal(match("التبرع بالدم"), true);
    assert.equal(match("مستشفيات الجامعة"), true);
    assert.equal(match("بالدم", "للتأمين", "بالمستشفى"), true);
  });
  it("English word-boundary matching accepts genuine health rows and stem suffixes", () => {
    const match = healthResourceMatcher("health");
    assert.equal(match("Ministry of Health"), true);
    assert.equal(match("Health Insurance Authority"), true);
    assert.equal(match("Hospitals directory"), true);
    assert.equal(match("Clinics and pharmaceutical services"), true);
  });
  it("short Arabic terms never match inside ordinary words", () => {
    const match = healthResourceMatcher("health");
    assert.equal(match("الخدمات الحكومية الرقمية"), false);
    assert.equal(match("مقدمة الخدمة"), false);
    assert.equal(match("الطبيعة والمحميات"), false);
    assert.equal(match("مطبعة"), false);
    assert.equal(match("وزارة الاتصالات وتكنولوجيا المعلومات"), false);
  });
  it("English health terms never match inside unrelated words or rows", () => {
    const match = healthResourceMatcher("health");
    assert.equal(match("Digital government services"), false);
    assert.equal(match("State Information Service"), false);
  });
});
