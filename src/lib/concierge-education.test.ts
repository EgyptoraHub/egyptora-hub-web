import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SYSTEM_PROMPT, extractPromptLinks } from "./concierge-prompt";

/** Education rules for the Egyptora AI system prompt, pinned to the exact required text. */
const links = extractPromptLinks();
describe("concierge education rules", () => {
  it("is the single assistant with no persona names", () => {
    assert.match(SYSTEM_PROMPT, /You are Egyptora AI, the single assistant across the whole platform/);
    for (const n of ["SESH", "Thoth", "Maat", "Imhotep"]) assert.ok(!SYSTEM_PROMPT.includes(n), n);
  });
  it("never decides admission, transfer, equivalency, accreditation or certificate validity", () => {
    assert.match(SYSTEM_PROMPT, /Never decide or imply a decision on admission, transfer, equivalency, accreditation, certificate validity, scholarship eligibility, disciplinary matters or job suitability/);
    assert.match(SYSTEM_PROMPT, /Say the competent authority decides/);
  });
  it("never calls a platform verified/approved/recognised without a sourced active record", () => {
    assert.match(SYSTEM_PROMPT, /Never call an education platform, institution or programme "verified", "approved" or "recognised" unless an active public record with a source says so/);
  });
  it("states accreditation only from the record's accreditation fields", () => {
    assert.match(SYSTEM_PROMPT, /State accreditation only from the record's accreditation fields/);
  });
  it("never promises jobs, scholarships, seats or outcomes", () => {
    assert.match(SYSTEM_PROMPT, /Never promise jobs, scholarships, seats or outcomes/);
  });
  it("never collects personal data, CVs, national IDs or details about minors", () => {
    assert.match(SYSTEM_PROMPT, /Never ask for, accept or store personal data, CV details, national IDs or details about minors/);
  });
  it("routes child-safety concerns to official channels and emergency numbers only", () => {
    assert.match(SYSTEM_PROMPT, /Child safety or abuse concerns: point only to official channels \(Egyptora takes no reports\)/);
    assert.ok(links.has("https://www.egyptora-hub.com/emergency-numbers"));
  });
  it("is never a complaints channel for education and suggests only tool records", () => {
    assert.match(SYSTEM_PROMPT, /Never act as a complaints channel for education matters; suggest only active public records returned by the tool/);
  });
});
