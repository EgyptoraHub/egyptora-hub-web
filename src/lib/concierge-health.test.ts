import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SYSTEM_PROMPT, extractPromptLinks } from "./concierge-prompt";

/**
 * Healthcare regression tests for the Egyptora AI system prompt. The model itself
 * cannot run in unit tests, so each scenario is pinned to the exact rule and link
 * the prompt must contain; the manual end-to-end checks are documented in
 * docs/prompt-43-verification.md.
 */
const links = extractPromptLinks();

describe("concierge healthcare rules", () => {
  it("symptom question: prompt forbids diagnosis and symptom interpretation", () => {
    assert.match(SYSTEM_PROMPT, /NEVER diagnose, interpret symptoms, suggest treatments, medicines or doses/);
  });
  it("facility search with no results: listings are being verified, never claimed complete", () => {
    assert.match(SYSTEM_PROMPT, /Never claim the facility list is complete/);
    assert.match(SYSTEM_PROMPT, /listings are still being verified/);
    assert.ok(links.has("https://www.egyptora-hub.com/health/find-care"));
  });
  it("urgent case: prompt routes to the official emergency numbers page", () => {
    assert.match(SYSTEM_PROMPT, /urgent or symptom-related/);
    assert.ok(links.has("https://www.egyptora-hub.com/emergency-numbers"));
  });
  it("medicine dose request: covered by the no-medicines rule and the medical-advice hard rule", () => {
    assert.match(SYSTEM_PROMPT, /medicines or doses/);
    assert.match(SYSTEM_PROMPT, /Never give legal, medical, visa-eligibility, or investment advice/);
  });
  it("medical-travel question: prompt explains the administrative form and the no-medical-info rule", () => {
    assert.match(SYSTEM_PROMPT, /administrative inquiry form/);
    assert.match(SYSTEM_PROMPT, /no medical information should be sent/);
    assert.ok(links.has("https://www.egyptora-hub.com/health/medical-travel"));
  });
  it("valid facility result: prompt requires the exact tool link and forbids naming unreturned facilities", () => {
    assert.match(SYSTEM_PROMPT, /exact "link" the tool returned/);
    assert.match(SYSTEM_PROMPT, /never name a facility or specialty the tool did not return/);
    for (const path of ["/health", "/health/specialties", "/health/blood-donation", "/health/insurance", "/health/official-websites", "/health/apps", "/health/projects-research", "/health/support"]) {
      assert.ok(links.has(`https://www.egyptora-hub.com${path}`), `missing allowed link ${path}`);
    }
  });
});
