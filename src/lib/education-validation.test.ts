import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateEducationValues, EDUCATION_PHASE2_FLAGS } from "./education-validation";
import { DISABLED_PHASE2_FLAGS, assertFeatureFlagChangeAllowed } from "./phase2-flags";
import { accreditationLabel, educationHubCards, showPlatformFee } from "./education-public";
import { validateComplaintValues, COMPLAINTS_MATCH_KEYS } from "./complaints-validation";

const base = { name_en: "Platform", category: "government", official_url: "https://example.gov.eg", source_url: "https://example.gov.eg/about", last_verified_at: "2026-11-01" };
describe("education platforms validation", () => {
  it("activation needs source, date, reviewed status and https official URL", () => {
    assert.equal(validateEducationValues({ ...base, is_active: true, review_status: "needs_check" }), "Activation requires a reviewed status.");
    assert.equal(validateEducationValues({ ...base, is_active: true, review_status: "editorial_reviewed", last_verified_at: null }), "Activation requires a source URL and verification date.");
    assert.equal(validateEducationValues({ ...base, is_active: true, review_status: "editorial_reviewed" }), null);
  });
  it("rejects PDF sources, http official URLs and javascript URLs", () => {
    assert.ok(validateEducationValues({ ...base, source_url: "https://x.gov.eg/a.pdf" }));
    assert.ok(validateEducationValues({ ...base, official_url: "http://x.gov.eg" }));
    assert.ok(validateEducationValues({ ...base, source_url: "javascript:alert(1)" }));
  });
  it("fee needs its own source; accredited needs its own source", () => {
    assert.equal(validateEducationValues({ ...base, published_fee_text: "EGP 100" }), "A published fee requires a fee source URL.");
    assert.equal(validateEducationValues({ ...base, accreditation_status: "accredited" }), "Accredited status requires an accreditation source URL.");
  });
  it("shares the admin/CSV path with slug as match key", () => {
    assert.deepEqual(COMPLAINTS_MATCH_KEYS.education_platforms, ["slug"]);
    assert.equal(validateComplaintValues("education_platforms", { ...base, published_fee_text: "x" }), "A published fee requires a fee source URL.");
  });
  it("accreditation defaults to not stated and fee shows only with a source", () => {
    assert.equal(accreditationLabel({ accreditation_status: "not_stated" }), "Accreditation status: not stated by the source");
    assert.equal(accreditationLabel({ accreditation_status: "accredited", accreditation_source_url: "" }), "Accreditation status: not stated by the source");
    assert.equal(showPlatformFee({ published_fee_text: "EGP 100", fee_source_url: null }), false);
  });
  it("hub shows only the research card when there is no data", () => {
    assert.deepEqual(educationHubCards({ platforms: false, guides: false }), ["research"]);
    assert.deepEqual(educationHubCards({ platforms: true, guides: true }), ["research", "platforms", "guides"]);
  });
  it("15 education Phase 2 flags are disabled and rejected", () => {
    assert.equal(EDUCATION_PHASE2_FLAGS.length, 15);
    for (const f of EDUCATION_PHASE2_FLAGS) {
      assert.ok((DISABLED_PHASE2_FLAGS as readonly string[]).includes(f));
      assert.throws(() => assertFeatureFlagChangeAllowed(f), /Phase 2 education flags are disabled\./);
    }
  });
});
