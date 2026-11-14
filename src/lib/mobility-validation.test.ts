import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MOBILITY_PHASE2_FLAGS } from "./mobility-validation";
import { DISABLED_PHASE2_FLAGS, assertFeatureFlagChangeAllowed } from "./phase2-flags";

describe("mobility Phase 2 flags", () => {
  it("defines exactly the 13 owner-approved keys", () => {
    assert.equal(MOBILITY_PHASE2_FLAGS.length, 13);
    for (const f of MOBILITY_PHASE2_FLAGS) assert.match(f, /^mobility_/);
    assert.deepEqual([...MOBILITY_PHASE2_FLAGS], [
      "mobility_marketplace_listings",
      "mobility_rfq",
      "mobility_rental_operations",
      "mobility_contracts_esignature",
      "mobility_payments_escrow",
      "mobility_financed_asset_settlement",
      "mobility_inspection_booking",
      "mobility_vehicle_tracking",
      "mobility_roadside_dispatch",
      "mobility_tenders_auctions",
      "mobility_gov_asset_gateway",
      "mobility_taxi_registry",
      "mobility_mobile_app",
    ]);
  });
  it("all 13 keys are in the disabled Phase 2 set", () => {
    for (const f of MOBILITY_PHASE2_FLAGS) assert.ok((DISABLED_PHASE2_FLAGS as readonly string[]).includes(f), f);
  });
  it("setFeatureFlag rejects every mobility key (same predicate the server function uses)", () => {
    for (const f of MOBILITY_PHASE2_FLAGS) {
      assert.throws(() => assertFeatureFlagChangeAllowed(f), /Phase 2 mobility flags are disabled\./, f);
    }
  });
  it("trade and complaints rejections still work", () => {
    assert.throws(() => assertFeatureFlagChangeAllowed("trade_rfq"), /Phase 2 trade flags are disabled\./);
    assert.throws(() => assertFeatureFlagChangeAllowed("complaints_intake"), /Phase 2 complaints flags are disabled\./);
    assert.doesNotThrow(() => assertFeatureFlagChangeAllowed("payments.enabled"));
  });
});
