# Prompt 53 — Mobility & Industrial Hub (Phase 2 infrastructure) + importers-register steps

Date: 2026-11-14. Nothing published; maintenance mode unchanged.

## Part A — Phase 2 flags
- `src/lib/mobility-validation.ts`: `MOBILITY_PHASE2_FLAGS` with exactly the 13 owner-approved keys.
- `src/lib/phase2-flags.ts` (new pure module): `DISABLED_PHASE2_FLAGS` + `assertFeatureFlagChangeAllowed()` — the single rejection predicate now used by `setFeatureFlag` (`src/lib/groundwork.functions.ts`) for trade, complaints and mobility keys; behaviour for the existing keys is unchanged.
- Admin display: `src/components/admin/MobilityPhase2Flags.tsx` ("Mobility & Industrial Phase 2 (infrastructure only)", disabled checkboxes, "Disabled · Phase 2", no toggles), mounted on the admin dashboard next to the Trade and Complaints sections. English labels only.
- Database (privileged path, explicitly allowed by the prompt): 13 rows inserted into `site_settings` as `{"enabled": false, "phase": 2}` with `WHERE NOT EXISTS` (no existing row overwritten). No code path reads these flags to enable behaviour. No tables or columns created.

## Part B — Egyptora AI rules
- New "Mobility & Industrial Hub (strict, no exceptions)" section in `src/lib/concierge-prompt.ts` covering: module not available (no marketplace/listings/quotes/contracts/payments/tracking/auctions), no vehicle condition/ownership/legal/financing claims, no "authorised/official/verified" dealer claims without an active sourced record, no prices/fares/fees without an active dated official record, no licensing/import/inspection decisions or evasion advice, no buy/sell/finance/insure recommendations, emergencies only via `/emergency-numbers` (never commercial towing), no plate/chassis/ID/location/contract details, never a complaints channel, no persona name.
- `src/lib/concierge-mobility.test.ts`: 8 tests pinning every rule; also asserts the prompt never contains "Thoth".

## Part C — procedure_steps import (goeic-importers-register)
- CSV saved verbatim at `docs/prompt-53-data/procedure_steps_goeic_importers.csv` (description fields with commas double-quoted).
- Dry run via existing `previewTradeCsv`: parsed 4 data rows × 10 columns; **4 new / 0 updated / 0 rejected**; guide_slug FK check passed.
- Privileged write path (no admin session; explicitly allowed by the prompt): 4 rows inserted as `needs_check` + inactive, then the approved activation set exactly those 4 rows to `editorial_reviewed` + active. Guide row, summary, source, fees, time and documents untouched (page states no fees/time/documents — left empty).
- Difference from the import spec: `procedure_steps.slug` is NOT NULL, so each row received a deterministic slug (`goeic-importers-register-step-1..4`); the admin CSV path would have generated random `trade-<uuid>` slugs. Match key `guide_slug + step_no` was respected.

## Audit entries (all method "privileged", prompt 53)
- `76592c45-d568-4376-bbff-fbee98518545` — feature_flag.seed (13 flags)
- `ca9e4373-0a88-4674-a92c-0c62f73b3d22` — import.csv (4 new / 0 updated / 0 rejected)
- `25e90531-aa6d-4848-8511-fae7d7855838` — content.activate (4 steps, editorial_reviewed)

## Counts before → after
- `site_settings` Phase 2 keys: 15 → 28 (+13 mobility)
- `procedure_steps`: 15 → 19 (all 19 active; the 4 new ones editorial_reviewed)
- Active `procedure_guides`: 4 → 4 (unchanged)
- `procedure_documents`: 29 → 29 (unchanged)
- No other rows changed.

## Signed-out checks (EN + AR, 390 and 1280 px)
- `/do-business/procedure-guides/goeic-importers-register` shows the 4 numbered steps with the source line and verification date; no fees, processing time or documents sections; no horizontal overflow at any width; Arabic fully RTL.
- `internal_notes` is not exposed: public reads use the safe-column server function; direct anonymous table access is denied (42501).

## Flags
- All 13 mobility keys are rejected by `assertFeatureFlagChangeAllowed` (the exact predicate `setFeatureFlag` uses) — covered by tests; stored values are all `{"enabled": false, "phase": 2}`.

## No changes to
Routes, navigation, sitemap (not regenerated), translation files, other modules' flags, migrations, maintenance mode.

## Tests
- Full suite: **121 passed, 0 failed** (12 new: 4 mobility flags + 8 concierge mobility). Build OK.
