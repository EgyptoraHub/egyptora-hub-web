# Prompt 63 — Shipping & Logistics verification

Date: 2026-11-21. Not published; existing public maintenance remains unchanged.

## Delivery
- New informational hub: `/do-business/shipping-logistics`.
- Seven-record directory: `/do-business/shipping-logistics/platforms`.
- Draft bilingual disclaimer: `/legal/shipping-guide-disclaimer`; qualified Egyptian counsel review remains required before launch.
- One gated Do Business menu item, shared footer discovery link, visitor search entries, saved-item link filtering through the existing gate, and public-only Egyptora AI shipping search.
- Shared GUIDE_TABLES admin editor/CSV path, slug match key and Data audit source/official/fee links.
- Shipping Phase 2 admin panel; all 21 switches stored disabled and rejected by the change guard.
- Existing Do Business Logistics example cards, Invest pages, marketplace data and Mobility flags untouched.
- EN/AR only; other languages use the existing English fallback. Existing Suez shipping photograph reused; no generated imagery or invented records.

## Data and privileged path
The owner explicitly allowed the privileged database path. The existing `previewComplaintsCsv` dry-run returned **7 new, 0 updates, 0 rejected**. Every new payload was forced `needs_check` + inactive. All seven also passed `validateShippingValues` with the explicitly approved editorial activation state before any write.

The validated privileged import created 0 → 7 records. Read-back checked every field against the validated plans: all seven matched exactly, including blank-to-null values, source URLs, Arabic text and notes. Only those seven slugs were then activated as `editorial_reviewed` + true, never `verified`.

| Slug | Result | Final review status | Active |
|---|---|---|---|
| egyptian-customs-authority | Created and activated | editorial_reviewed | true |
| nafeza-platform | Created and activated | editorial_reviewed | true |
| ministry-of-transport-website | Created and activated | editorial_reviewed | true |
| egyptian-railways-website | Created and activated | editorial_reviewed | true |
| suez-canal-authority | Created and activated | editorial_reviewed | true |
| egypt-post | Created and activated | editorial_reviewed | true |
| alexandria-port-authority | Created and activated | editorial_reviewed | true |

- Received 7; created 7; existing rows updated 0; rejected 0; records not imported: none.
- Final shipping counts: editorial_reviewed/active 7; needs_check/inactive 0; verified 0.
- Three operation audit entries confirmed: `content.csv_import` (7), `content.activation` (7), `feature_flag.seed` (21), each with prompt 63 and privileged method metadata.
- Shipping switches: 21 disabled; all Phase 2 switches: **82, all disabled**. This is the Phase 2 total, not all settings or unrelated feature flags; unrelated existing switches were preserved.

## Schema and permission verification
Migrations 0040 and 0041 are schema-only, with no migration-time data counts, inventory assumptions or role impersonation. The table uses reviewed-active visitor RLS for both anon and authenticated and a server-validated admin write policy. Activation enforces dated non-PDF sources, HTTPS official URLs and a separate source for any published fee.

The platform supplied inherited table-level ALL grants despite the explicit column grants in 0040. Real HTTP checks detected that notes could be read. Migration 0041 explicitly revoked broad visitor privileges, restored authenticated admin-controlled INSERT/UPDATE/DELETE and granted the same safe columns to both visitor roles. Final catalog checks: no anon/authenticated table SELECT; no internal_notes SELECT; public column lists identical. Privileged ALL preserved.

`src/lib/shipping-permissions.test.sql` is a standalone manual check (expected 7), never part of a migration. It was attempted once with role impersonation via the available database reader, but that execution role cannot SET ROLE anon (permission denied). Thus the requested manual SQL impersonation execution is **not completed**; the file remains ready for an appropriately privileged session. No migration or helper function was added to evade that restriction.

Equivalent checks were completed over the actual public API using anon and a minted temporary authenticated visitor with **zero assigned roles**:

| Role | Public rows | internal_notes request | Inactive/needs_check returned |
|---|---:|---|---:|
| anon | 7 | Refused (401) | 0 |
| authenticated non-admin | 7 | Refused (403) | 0 |

The two roles returned identical ordered record IDs. The real signed-in directory displayed all seven records. Before activation the hub and directory were both observed as 404; after activation they both opened. There are no hidden shipping records in the final inventory, so exclusions were also checked via the visitor predicate, empty inactive/needs_check requests and pure visibility regressions rather than inserting an extra unpublished fixture.

## Browser checks
Signed out EN/AR at 390px and 1280px, plus 1600px to exercise the existing desktop-menu breakpoint:
- Hub title, supplied intro, informational notice and exactly one directory card.
- Directory exactly 7 cards, 14 official/source links and seven verification dates 2026-11-21; Arabic dates isolated LTR.
- Category filter Customs → one card; All → seven; Nafeza/نافذة search → one.
- Notice opens the correct DRAFT disclaimer in both languages.
- Compact menu at 390/1280 and desktop dropdown at 1600 show Shipping & Logistics as a real link under Do Business.
- Visitor search for customs and port includes both shipping pages; no hidden properties/offers/providers/investment-opportunities destination appears.
- No horizontal overflow or browser runtime errors in all six language/width combinations. Screenshots inspected for EN mobile, AR mobile and AR desktop; signed-in directory inspected too.

## Egyptora AI
Shipping rules cover official-only explanations, no quotes/prices/rates/transit times/volumes/capacity, no provider recommendations/ranking, no customs/HS/permission decisions, no sensitive-cargo handling advice beyond official authorities, no tracking/location/insurance claims, evidence-required status claims, no promised outcomes, official emergencies and no personas.

The shipping search uses publishable visitor access and explicit safe columns. Real lookups: customs → 3, port → 4, نافذة → 1; all returned the existing gated directory link. If no public shipping result exists, the Shipping block directs AI to site search rather than the unavailable hub. Model-generated live chat responses were not exercised; prompt rules and grounding searches were tested.

## Sitemap and tests
- `npm run sitemap`: **237 URLs** (234 → 237), adding the two data-gated Shipping pages and draft disclaimer.
- Full suite after the search-gate regression update: **200 passed, 0 failed, 27 files** (179 existing + 21 Shipping rule tests).
- Preview build log: latest entry build OK; no manual build/typecheck run.
- Shared app-spreadsheet-import workflow reused for validated CSV parsing and dry-run.

## Remaining limitations
- Standalone SQL role-impersonation execution requires a database execution role allowed to SET ROLE; actual anon/non-admin API checks passed instead.
- Draft disclaimer needs qualified Egyptian legal counsel review before launch.
- Admin editor/flag panel registration uses the existing authorized flow; a real admin UI session was not exercised. No administrator account was invented or elevated.
- No publication, cargo services, operational cargo tables or enabled Shipping functionality.
