import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
const expect = (value: unknown) => ({ toBe: (expected: unknown) => assert.equal(value, expected), toBeNull: () => assert.equal(value, null), not: { toBeNull: () => assert.notEqual(value, null) } });
import { healthActivationError, healthReportSchema, healthInquirySchema, validateHealthValues } from "./health-validation";

describe("healthcare foundation rules", () => {
  test("activation requires source and verification date", () => {
    expect(healthActivationError({ is_active: true, source_url: "https://example.eg" })).not.toBeNull();
    expect(healthActivationError({ is_active: true, source_url: "https://example.eg", last_verified_at: "2026-10-01" })).toBeNull();
  });
  test("licensing cannot borrow accreditation evidence", () => {
    expect(healthActivationError({ license_status: "licensed", accreditation_source_url: "https://example.eg", last_verified_at: "2026-10-01" })).not.toBeNull();
  });
  test("accreditation cannot borrow licensing evidence", () => {
    expect(healthActivationError({ accreditation_status: "accredited", license_source_url: "https://example.eg", last_verified_at: "2026-10-01" })).not.toBeNull();
  });
  test("reports allow 1000 characters, reject 1001", () => {
    expect(healthReportSchema.safeParse({ kind: "other", message: "x".repeat(1000) }).success).toBe(true);
    expect(healthReportSchema.safeParse({ kind: "other", message: "x".repeat(1001) }).success).toBe(false);
  });
  const inquiry = { type: "partner", full_name: "Test", email: "test@example.com", country: "Egypt", preferred_language: "en", message: "x".repeat(1500), consent: true };
  test("inquiries allow 1500 characters, reject 1501", () => {
    expect(healthInquirySchema.safeParse(inquiry).success).toBe(true);
    expect(healthInquirySchema.safeParse({ ...inquiry, message: "x".repeat(1501) }).success).toBe(false);
  });
  test("inquiry consent must be true", () => {
    expect(healthInquirySchema.safeParse({ ...inquiry, consent: false }).success).toBe(false);
  });
  test("official website must use https", () => {
    expect(validateHealthValues("health_facilities", { official_website: "http://example.eg" }, true)).not.toBeNull();
    expect(validateHealthValues("health_facilities", { official_website: "https://example.eg" }, true)).toBeNull();
  });
});