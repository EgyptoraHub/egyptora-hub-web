import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SYSTEM_PROMPT, extractPromptLinks } from "./concierge-prompt";

/**
 * Complaints & Government Services Guide regression tests for the Egyptora AI
 * system prompt. The model itself cannot run in unit tests, so each scenario is
 * pinned to the exact rule the prompt must contain.
 */
const links = extractPromptLinks();

describe("concierge complaints rules", () => {
  it("the platform never receives, stores, forwards or tracks complaints", () => {
    assert.match(SYSTEM_PROMPT, /NEVER receives, stores, forwards or tracks complaints or reports/);
    assert.match(SYSTEM_PROMPT, /no complaint form, case number or tracking/);
  });
  it("never invents reference numbers", () => {
    assert.match(SYSTEM_PROMPT, /never invent reference numbers/);
  });
  it("never decides the competent authority as final; suggests only tool-returned active records", () => {
    assert.match(SYSTEM_PROMPT, /Never decide the competent authority as final/);
    assert.match(SYSTEM_PROMPT, /categories complaint_sectors and complaint_channels/);
    assert.match(SYSTEM_PROMPT, /confirm on the official channel/);
  });
  it("never implies guilt or promises resolution, speed or anonymity", () => {
    assert.match(SYSTEM_PROMPT, /guilty, corrupt or liable/);
    assert.match(SYSTEM_PROMPT, /never promise resolution, speed or anonymity/);
  });
  it("never asks for or stores complaint details, identity numbers or evidence in the chat", () => {
    assert.match(SYSTEM_PROMPT, /Never ask for, accept or store complaint details, identity numbers or evidence in the chat/);
  });
  it("emergencies point to the official emergency numbers page", () => {
    assert.match(SYSTEM_PROMPT, /immediate danger: point to the official emergency numbers from active emergency_numbers records only/i);
    assert.ok(links.has("https://www.egyptora-hub.com/emergency-numbers"));
  });
  it("with no active channel, the unified channel is mentioned only when its record is active", () => {
    assert.match(SYSTEM_PROMPT, /no verified channel yet/);
    assert.match(SYSTEM_PROMPT, /official-unified-complaints-system/);
  });
});
