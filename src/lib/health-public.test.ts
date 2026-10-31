import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasHealthEvidence, publicHealthInquirySchema, publicHealthReportSchema, safeHealthUrl } from "./health-public";
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
});
