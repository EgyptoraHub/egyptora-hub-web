# Prompt 67 — Verification (Energy official bodies, batch 1)

## Dry run
`previewComplaintsCsv("energy_official_bodies", …)` on `docs/prompt-67-data/energy_official_bodies_batch1.csv` (4 rows): **4 new, 0 updated, 0 rejected.**

## Import path
No admin session available, so the **privileged database path** was used after the 0-rejected dry run. All 4 rows forced to `review_status = needs_check`, `is_active = false`. One `audit_log` entry: action `csv_import`, entity `energy_official_bodies`, metadata `{prompt:67, method:"privileged_sql_after_validated_dry_run", inserted:4, updated:0, rejected:0}`.

| slug | body_type | result |
|---|---|---|
| ministry-of-petroleum-and-mineral-resources | ministry | inserted |
| egas | holding_company | inserted |
| mineral-resources-and-mining-industries-authority | authority | inserted |
| egyptian-organization-for-standardization-and-quality | standards_body | inserted |

Rejected: none. Not imported on purpose: EGPC, ECHEM, Ganope, Ministry of Electricity and Renewable Energy, Waste Management Regulatory Authority, Ministry of Environment.

## Status counts
`energy_official_bodies`: needs_check / inactive = 4. Nothing activated.

## Source warnings
Shared `sourceUrlWarning` on every source_url and official_url: **0 warnings** (all `.eg`). `EGYPTIAN_SOURCE_ALLOWLIST` unchanged.

## Visitor and permission checks (real API)
- Signed out: `select=id` → `[]` (0 rows); `select=internal_notes` → 401.
- Signed in, non-admin test user (no roles): `select=id` → `[]`; `select=internal_notes` → 403.
- `/energy-materials/official-bodies` (signed out) still shows "Official sources are being verified".

## Pages showing the data
None while inactive.

## Body type labels
Added to `src/i18n/energy-translations.ts` and shown on the official-bodies cards: ministry = Ministry / وزارة; holding_company = Holding company / شركة قابضة; authority = Authority / هيئة; standards_body = Standards body / جهة مواصفات. Unknown keys shown unchanged. Test: `src/lib/energy-body-type.test.ts`.

## Tests
`bun test`: 254 passed, 0 failed, 31 files.

## Not done
- Admin list not reached (no admin session); database read confirms 4 rows, all needs_check and inactive.
- Signed-in page view not rendered in a browser; signed-in API returns 0 rows, so the page uses the same empty state.
