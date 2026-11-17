import { TRADE_PHASE2_FLAGS } from "@/lib/trade-validation";
import { COMPLAINTS_PHASE2_FLAGS } from "@/lib/complaints-validation";
import { MOBILITY_PHASE2_FLAGS } from "@/lib/mobility-validation";
import { EDUCATION_PHASE2_FLAGS } from "@/lib/education-validation";

/** Every Phase 2 infrastructure flag across modules — all permanently disabled in Phase 1. */
export const DISABLED_PHASE2_FLAGS = [...TRADE_PHASE2_FLAGS, ...COMPLAINTS_PHASE2_FLAGS, ...MOBILITY_PHASE2_FLAGS, ...EDUCATION_PHASE2_FLAGS] as const;

/**
 * The exact rejection setFeatureFlag applies before any write. Kept in a pure
 * module so the server function and the regression tests share one source of
 * truth without importing the server-function module.
 */
export function assertFeatureFlagChangeAllowed(flag: string): void {
  if ((TRADE_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 trade flags are disabled.");
  if ((COMPLAINTS_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 complaints flags are disabled.");
  if ((MOBILITY_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 mobility flags are disabled.");
  if ((EDUCATION_PHASE2_FLAGS as readonly string[]).includes(flag)) throw new Error("Phase 2 education flags are disabled.");
}
