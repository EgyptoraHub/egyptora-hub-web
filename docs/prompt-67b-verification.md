# Prompt 67b — Energy official bodies activation

## Rows changed (energy_official_bodies, match key slug)
| slug | old | new |
|---|---|---|
| ministry-of-petroleum-and-mineral-resources | needs_check / inactive | editorial_reviewed / active |
| egas | needs_check / inactive | editorial_reviewed / active |
| mineral-resources-and-mining-industries-authority | needs_check / inactive | editorial_reviewed / active |
| egyptian-organization-for-standardization-and-quality | needs_check / inactive | editorial_reviewed / active |

Precondition confirmed before the write: all 4 slugs existed as needs_check + inactive. No other column or row changed; the 6 non-imported bodies were not touched.

## Path
Privileged database write (no admin session), owner approval dated 25 Nov 2026 per prompt. Existing activation trigger passed unchanged.

## Audit
One audit_log row: action `activate`, entity_type `energy_official_bodies`, entity_id `prompt-67b`, metadata with method, approval date, count 4, the 4 slugs, old and new values.

## API checks
- Signed out: 4 rows with public columns; `internal_notes` → 401.
- Signed in as non-admin test user: 4 rows; `internal_notes` → 403.

## Page checks (/energy-materials/official-bodies, signed out)
Tested EN 390, EN 1280, AR 390, AR 1280: 4 cards with name, readable body type, official website and source links, "Last verified 2026-11-25"; empty state gone; no horizontal scroll; dir=rtl in Arabic; 8 external links all with rel noopener; no runtime errors. Cards without a summary (Ministry, Mineral Resources Authority) show no gaps or placeholders. Signed-in page also shows the 8 links.

## Data audit
Source warnings for the 4 rows: 0 (unchanged from Prompt 67, no allowlist change). Active-record hygiene query (names EN/AR, source URL, date, no PDF, HTTPS official URL): 0 failures. The admin Data Audit screen itself was not opened (no admin session).

## Hub, search, sitemap
The hub and static search entries do not depend on this table, so they are unchanged. The sitemap already lists the official-bodies page; the page list did not change, so no rebuild.

## Tests
254 passed, 0 failed.

## Not done
Admin UI screens not exercised (no admin session).
