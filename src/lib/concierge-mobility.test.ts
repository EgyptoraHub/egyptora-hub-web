import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SYSTEM_PROMPT, extractPromptLinks } from "./concierge-prompt";

/**
 * Mobility & Industrial Hub regression tests for the Egyptora AI system prompt.
 * The model itself cannot run in unit tests, so each rule is pinned to the exact
 * text the prompt must contain.
 */
const links = extractPromptLinks();

describe("concierge mobility rules", () => {
  it("never describes the module as available and never invents marketplace features", () => {
    assert.match(SYSTEM_PROMPT, /NO marketplace, listings, quotes, rental, contracts, payments, escrow, inspection booking, vehicle tracking, roadside dispatch, tenders, auctions, government asset gateway or taxi registry/);
    assert.match(SYSTEM_PROMPT, /Never describe any of these as available and never invent them/);
  });
  it("never implies vehicle condition, ownership, legal/financing status or an authorised dealer without an active sourced record", () => {
    assert.match(SYSTEM_PROMPT, /Never confirm or imply a vehicle's technical condition, ownership, legal status, liens or financing status/);
    assert.match(SYSTEM_PROMPT, /never call a seller or dealer "authorised", "official" or "verified", unless an active public record with a source says so/);
  });
  it("never states prices, fares or fees without an active dated official record, and never sets official fares", () => {
    assert.match(SYSTEM_PROMPT, /Never state prices, fares, taxi tariffs, fees or customs\/tax amounts unless an active dated record with an official source says so/);
    assert.match(SYSTEM_PROMPT, /Never say the platform sets official fares/);
  });
  it("never decides licensing/import/inspection eligibility and never advises evading it", () => {
    assert.match(SYSTEM_PROMPT, /Never decide whether a vehicle may be licensed, imported, inspected or driven based on its age or type/);
    assert.match(SYSTEM_PROMPT, /never advise how to avoid inspection, licensing or customs/);
  });
  it("never recommends buying, selling, financing or insuring a particular vehicle or provider", () => {
    assert.match(SYSTEM_PROMPT, /Never recommend buying, selling, financing or insuring a particular vehicle, equipment or provider/);
  });
  it("emergencies point only to the official emergency numbers, never to commercial towing", () => {
    assert.match(SYSTEM_PROMPT, /point only to the active official emergency numbers/);
    assert.match(SYSTEM_PROMPT, /never present a commercial towing or recovery service as an emergency response/);
    assert.ok(links.has("https://www.egyptora-hub.com/emergency-numbers"));
  });
  it("never asks for or stores plate numbers, chassis numbers, IDs, locations or contract details", () => {
    assert.match(SYSTEM_PROMPT, /Never ask for, accept or store plate numbers, chassis numbers, identity numbers, locations or contract details in the chat/);
  });
  it("never acts as a complaints channel and never uses a persona name", () => {
    assert.match(SYSTEM_PROMPT, /Never act as a complaints channel for mobility matters; suggest only active public records/);
    assert.match(SYSTEM_PROMPT, /Never use a persona name; you are only Egyptora AI/);
    assert.doesNotMatch(SYSTEM_PROMPT, /Thoth/i);
  });
});
