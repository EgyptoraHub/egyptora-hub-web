# Prompt 68 — Energy official bodies batch 2

## Scope and source approval
Added only `echem-eg.com` to the shared Egyptian-source allowlist, including boundary-matched subdomains. Comment records owner approval on 25 Nov 2026, the Ministry of Petroleum link and the `echem` record. Regression tests cover `www.echem-eg.com`, the unrelated-domain look-alike `echem-eg.com.example.org`, `notechem-eg.com`, and PDF refusal. No other domain, migration, page or flag added.

## Body type label
Added `agency` = **Agency / جهاز** to the existing Energy label map and updated its English/Arabic unit tests. Existing unknown-key fallback remains unchanged. The official-bodies page already uses this map; no page implementation change was needed.

## CSV and dry run
Saved the supplied UTF-8 CSV exactly to `docs/prompt-68-data/energy_official_bodies_batch2.csv`.
Table: `energy_official_bodies`; match key: `slug`.
Received 2 rows. Existing `previewComplaintsCsv` validation: **2 new, 0 updated, 0 rejected**. Both proposed activated states also passed shared Energy validation. Neither supplied row was omitted.

## Import and activation
Used the explicitly requested **privileged database path**, not an admin session, after the zero-rejected dry run. First inserted both rows as `needs_check` / inactive, confirmed those states by read-back, then activated exactly the two slugs under owner approval dated 25 Nov 2026. Existing activation triggers passed.

| Slug | After import | After activation |
|---|---|---|
| echem | needs_check / inactive | editorial_reviewed / active |
| egyptian-environmental-affairs-agency | needs_check / inactive | editorial_reviewed / active |

Created 2, updated 0 during import, activated 2, rejected 0. Final table counts: **6 editorial_reviewed / active**, 0 needs_check / inactive, 0 verified. All four previous records' full-row fingerprints matched before and after; no column on those rows changed.

No records created for EGPC, Ganope, the Ministry of Electricity and Renewable Energy, the Waste Management Regulatory Authority, or the Ministry of Local Development and Environment; the owner reported their sites did not open.

## Audit entries
- Import: `0e5942e2-0df5-463f-99d4-88a51db7266d`, action `csv_import`, entity `energy_official_bodies`, entity_id `prompt-68`; records privileged validated method, 2 inserted / 0 updated / 0 rejected, both slugs and initial hidden states.
- Activation: `243acd2e-702d-4c2c-bf29-c9e3ad1e0333`, action `activate`, same entity and prompt; records approval date, privileged method, count 2, both slugs, and old/new states.

Both entries confirmed through database read-back.

## Data Audit source check
Ran the same shared `sourceUrlWarning` checker used by Data Audit on `source_url` and `official_url` for all six records: **12 links, 0 warnings**. Each of the four old rows and both new rows had 0 warnings. The admin Data Audit screen itself was not exercised; this was a direct shared-checker run against real visitor-readable data.

## Real API checks
- Signed out: explicit public-column request returned exactly 6 rows in sort_order; `internal_notes` refused with **401**.
- Signed in as a test non-admin with **0 user_roles**: same 6 ordered slugs; `internal_notes` refused with **403**.
- Signed-in official-bodies page also rendered 6 cards.

## Page checks
`/energy-materials/official-bodies`, signed out: **EN 390px, EN 1280px, AR 390px, AR 1280px**, each at 1000px height.
All four checks confirmed 6 cards in sort_order 10/20/30/40/50/60, localized names and readable body types (including Agency / جهاز), 12 official/source links with `rel="noopener noreferrer"`, 6 verification dates of 2026-11-25, correct HTML direction, no horizontal overflow and no page runtime errors. Empty state absent. Screenshots inspected, including close-ups of the EEAA card in EN desktop and AR mobile. The Ministry and Mineral Resources Authority cards still omit summary text without placeholders; no card implementation changed.

## Unchanged surfaces
Sitemap, Energy hub, static search, navigation, flags and page metadata unchanged. These pages already exist; no sitemap rebuild required. No publication performed.

## Tests and limitations
Full suite run once: **258 passed, 0 failed, 31 files** (four added source-domain tests). Latest preview build: **build OK**.
Admin screens were not tested; the requested import used the privileged path and Data Audit used its shared checker directly. No external website facts were independently researched: imported the exact owner-approved supplied records.