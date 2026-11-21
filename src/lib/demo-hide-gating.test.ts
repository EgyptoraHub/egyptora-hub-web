import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gateForPath, linkGatedOff } from "@/lib/path-gates";
import { mainNav as navigation } from "@/data/navigation";

describe("Prompt 59 — hidden demo data gates", () => {
  it("maps list, detail and filtered links to their table gate", () => {
    assert.equal(gateForPath("/properties"), "properties");
    assert.equal(gateForPath("/offers/abc"), "offers");
    assert.equal(gateForPath("/investment-opportunities?sector=ict"), "investment_opportunities");
    assert.equal(gateForPath("/providers"), "providers");
    assert.equal(gateForPath("/real-estate"), undefined);
    assert.equal(gateForPath("https://example.com/properties"), undefined);
  });

  it("hides a gated link while its table has no public row and shows it once it has one", () => {
    assert.equal(linkGatedOff("/properties", {}), true);
    assert.equal(linkGatedOff("/properties", { properties: false }), true);
    assert.equal(linkGatedOff("/properties", { properties: true }), false);
    assert.equal(linkGatedOff("/research-programs", {}), false);
    assert.equal(linkGatedOff(undefined, {}), false);
  });

  it("investment sector menu items are 'Coming soon' behind the investment gate", () => {
    const invest = navigation.find((s) => s.label === "Invest in Egypt");
    const sectorItems = (invest?.items ?? []).filter((i) => i.to === "/investment-opportunities");
    assert.ok(sectorItems.length >= 8);
    for (const i of sectorItems) {
      assert.equal(i.gate, "investment_opportunities");
      assert.equal(i.soon, true);
    }
  });
});

describe("Prompt 59 — Egyptora AI excludes hidden statuses", () => {
  it("lists ARCHIVED among hidden statuses for the four demo tables", async () => {
    const m = await import("@/lib/concierge-search.server");
    assert.deepEqual([...m.HIDDEN_GOVERNANCE_STATUSES], ["REJECTED", "ARCHIVED", "REMOVED"]);
    for (const t of ["properties", "offers", "investment_opportunities", "providers"]) assert.ok(m.GOVERNANCE_GATED_TABLES.has(t));
  });
});

describe("AI suggestions — itinerary cards hide while their page is unavailable", () => {
  it("hides offers/properties cards when the section has no public row, keeps them when it does", async () => {
    const { itineraryItemGatedOff } = await import("@/lib/path-gates");
    assert.equal(itineraryItemGatedOff("offers", {}), true);
    assert.equal(itineraryItemGatedOff("properties", { properties: false }), true);
    assert.equal(itineraryItemGatedOff("investment_opportunities", {}), true);
    assert.equal(itineraryItemGatedOff("offers", { offers: true }), false);
    assert.equal(itineraryItemGatedOff("museums", {}), false);
  });
});
