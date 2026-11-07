import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  COMPLAINTS_TABLES, COMPLAINTS_PHASE2_FLAGS, complaintsVisible, validateComplaintValues,
  complaintsImportState, complaintsForeignKeyError, complaintsMatchKey,
} from "./complaints-validation";
import { previewComplaintsCsv } from "./complaints-import";

const channel = {
  sector_slug: "industry",
  authority_name_en: "Industrial Development Authority",
  channel_type: "hotline",
  channel_value: "15222",
};

describe("complaints visibility rule", () => {
  it("inactive or needs_check rows are never public", () => {
    assert.equal(complaintsVisible({ is_active: false, review_status: "editorial_reviewed" }), false);
    assert.equal(complaintsVisible({ is_active: true, review_status: "needs_check" }), false);
    assert.equal(complaintsVisible({ is_active: true, review_status: "editorial_reviewed" }), true);
    assert.equal(complaintsVisible({ is_active: true, review_status: "verified" }), true);
  });
});

describe("complaint channel validation (mirrors the database trigger)", () => {
  it("activation is blocked without a source URL and verification date", () => {
    assert.match(validateComplaintValues("complaint_channels", { ...channel, is_active: true })!, /source URL and verification date/);
    assert.match(validateComplaintValues("complaint_channels", { ...channel, is_active: true, source_url: "https://www.ida.gov.eg" })!, /source URL and verification date/);
    assert.equal(validateComplaintValues("complaint_channels", { ...channel, is_active: true, source_url: "https://www.ida.gov.eg", last_verified_at: "2026-11-01" }), null);
  });
  it("PDF sources are rejected", () => {
    assert.match(validateComplaintValues("complaint_channels", { ...channel, source_url: "https://www.ida.gov.eg/file.pdf" })!, /PDF/);
  });
  it("bad hotline values are rejected", () => {
    assert.match(validateComplaintValues("complaint_channels", { ...channel, channel_value: "call us now" })!, /Hotline/);
    assert.match(validateComplaintValues("complaint_channels", { ...channel, channel_value: "12" })!, /Hotline/);
    assert.equal(validateComplaintValues("complaint_channels", { ...channel, channel_value: "+20 2 2792 0000" }), null);
  });
  it("website/app/whatsapp values must be HTTPS URLs; javascript: and data: are rejected", () => {
    assert.match(validateComplaintValues("complaint_channels", { ...channel, channel_type: "website", channel_value: "http://www.ida.gov.eg" })!, /HTTPS/);
    assert.match(validateComplaintValues("complaint_channels", { ...channel, channel_type: "app", channel_value: "javascript:alert(1)" })!, /Unsafe/);
    assert.match(validateComplaintValues("complaint_channels", { ...channel, channel_type: "whatsapp", channel_value: "data:text/html,x" })!, /Unsafe/);
    assert.equal(validateComplaintValues("complaint_channels", { ...channel, channel_type: "website", channel_value: "https://www.ida.gov.eg" }), null);
  });
  it("published hours/scope text requires the row's own source", () => {
    assert.match(validateComplaintValues("complaint_channels", { ...channel, hours_en: "Sun-Thu 9-5" })!, /requires the row source/);
    assert.equal(validateComplaintValues("complaint_channels", { ...channel, hours_ar: "٩-٥", source_url: "https://www.ida.gov.eg" }), null);
  });
  it("sectors are the editorial taxonomy: no source is required to activate them", () => {
    assert.equal(validateComplaintValues("complaint_sectors", { name_en: "Industry", name_ar: "الصناعة", family: "trade_finance", is_active: true, review_status: "editorial_reviewed" }), null);
  });
});

describe("complaints CSV import", () => {
  it("new rows are forced needs_check + inactive; updates never touch visibility", () => {
    assert.deepEqual(complaintsImportState({ name_en: "X", is_active: true, review_status: "verified" }, false), { name_en: "X", is_active: false, review_status: "needs_check" });
    assert.deepEqual(complaintsImportState({ name_en: "X", is_active: true }, true), { name_en: "X" });
  });
  it("match keys are by slug; unknown sector_slug is rejected", () => {
    assert.equal(complaintsMatchKey("complaint_channels", { slug: "a" }), '["a"]');
    assert.match(complaintsForeignKeyError("complaint_channels", { sector_slug: "nope" }, new Set(["industry"]))!, /Unknown sector_slug/);
    assert.equal(complaintsForeignKeyError("complaint_channels", { sector_slug: "industry" }, new Set(["industry"])), null);
  });
  it("preview validates rows, rejects unsupported columns and bad values", () => {
    const csv = "slug,name_en,name_ar,family,scope_en,scope_ar,notice_type,sort_order\nindustry,Industry,الصناعة,trade_finance,Factories,المصانع,none,3";
    const preview = previewComplaintsCsv("complaint_sectors", csv, [], new Set());
    assert.equal(preview.rows.length, 1);
    assert.equal(preview.rows[0].action, "new");
    assert.equal(preview.plans[0].payload["is_active"], false);
    assert.equal(preview.plans[0].payload["review_status"], "needs_check");
    assert.throws(() => previewComplaintsCsv("complaint_sectors", "slug,name_en,hacker\na,A,x", [], new Set()), /unsupported columns/);
    const bad = previewComplaintsCsv("complaint_sectors", "slug,name_en,name_ar,family\na,A,ب,wrong_family", [], new Set());
    assert.equal(bad.rows[0].action, "rejected");
  });
});

describe("phase 2 flags", () => {
  it("all eight infrastructure flags are registered", () => {
    assert.equal(COMPLAINTS_PHASE2_FLAGS.length, 8);
    for (const f of COMPLAINTS_PHASE2_FLAGS) assert.match(f, /^complaints_/);
  });
  it("only the two content tables exist — no intake, case or evidence tables", () => {
    assert.deepEqual([...COMPLAINTS_TABLES], ["complaint_sectors", "complaint_channels"]);
  });
});
