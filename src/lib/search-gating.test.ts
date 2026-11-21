import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { staticSearchIndex } from "@/data/search-index.generated";
import { filterSearchEntries, gateForPath } from "@/lib/path-gates";

describe("Prompt 60 — static search visibility", () => {
  it("excludes all empty gated destinations and source pages", () => {
    const visible = filterSearchEntries(staticSearchIndex, {});
    assert.ok(visible.length > 0);
    assert.ok(visible.length < staticSearchIndex.length);
    for (const entry of visible) {
      assert.equal(gateForPath(entry.to), undefined);
      assert.equal(gateForPath(entry.page), undefined);
    }
  });

  it("gates child routes and source pages even when the destination itself is public", () => {
    const entries = [
      { to: "/properties/example", page: "/real-estate" },
      { to: "/real-estate", page: "/offers/example" },
      { to: "/investment-opportunities/example?sector=ict", page: "/invest-in-egypt" },
      { to: "/providers/example", page: "/do-business" },
    ];
    assert.deepEqual(filterSearchEntries(entries, {}), []);
    assert.deepEqual(filterSearchEntries(entries, { properties: true, offers: true, investment_opportunities: true, providers: true }), entries);
  });

  it("restores retained entries automatically when their gates open", () => {
    const entries = filterSearchEntries(staticSearchIndex, { properties: true, offers: true, investment_opportunities: true, providers: true });
    assert.deepEqual(entries, staticSearchIndex);
  });

  it("contains only the two current bilingual real-estate entries and no removed investment records", () => {
    const estate = staticSearchIndex.filter(e => e.category === "Real Estate");
    assert.deepEqual(estate.map(e => e.to), ["/real-estate", "/real-estate/platforms"]);
    assert.ok(estate.every(e => e.title_ar));
    const removed = ["New Capital Residence", "North Coast Villa", "Zamalek Apartment", "Al Rehab City Compound Unit", "Sahl Hasheesh Chalet", "Ain Sokhna Industrial Zone", "Red Sea Tourism Development", "Renewable Energy Projects"];
    for (const name of removed) assert.equal(staticSearchIndex.some(e => e.title === name), false);
    assert.equal(staticSearchIndex.some(e => e.category === "Investment" && (e.title === "Real Estate & New Cities" || (e.title === "New Administrative Capital" && e.desc === "Mixed-use development"))), false);
  });
});