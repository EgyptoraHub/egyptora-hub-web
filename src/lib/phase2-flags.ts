import { ENERGY_PHASE2_FLAGS } from "./energy-validation";
import { COMMUNITY_PHASE2_FLAGS } from "./community-validation";
import { JUSTICE_PHASE2_FLAGS } from "./justice-validation";
import { SHIPPING_PHASE2_FLAGS } from "./shipping-validation";
import { TRADE_PHASE2_FLAGS } from "@/lib/trade-validation";
import { COMPLAINTS_PHASE2_FLAGS } from "@/lib/complaints-validation";
import { MOBILITY_PHASE2_FLAGS } from "@/lib/mobility-validation";
import { EDUCATION_PHASE2_FLAGS } from "@/lib/education-validation";

import { REAL_ESTATE_PHASE2_FLAGS } from "./real-estate-validation";

/** Every Phase 2 infrastructure flag across modules — all permanently disabled in Phase 1. */
export const DISABLED_PHASE2_FLAGS = [...TRADE_PHASE2_FLAGS, ...COMPLAINTS_PHASE2_FLAGS, ...MOBILITY_PHASE2_FLAGS, ...EDUCATION_PHASE2_FLAGS, ...REAL_ESTATE_PHASE2_FLAGS, ...SHIPPING_PHASE2_FLAGS, ...ENERGY_PHASE2_FLAGS, ...COMMUNITY_PHASE2_FLAGS, ...JUSTICE_PHASE2_FLAGS] as const;

/**
 * The exact rejection setFeatureFlag applies before any write. Kept in a pure
 * module so the server function and the regression tests share one source of
 * truth without importing the server-function module.
 */
export function assertFeatureFlagChangeAllowed(flag: string): void {
  if ((JUSTICE_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 justice flags are disabled.");
  if ((COMMUNITY_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 community flags are disabled.");
  if ((ENERGY_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 energy flags are disabled.");
  if ((SHIPPING_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 shipping flags are disabled.");
  if ((REAL_ESTATE_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 real estate flags are disabled.");
  if ((TRADE_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 trade flags are disabled.");
  if ((COMPLAINTS_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 complaints flags are disabled.");
  if ((MOBILITY_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 mobility flags are disabled.");
  if ((EDUCATION_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 education flags are disabled.");
}
