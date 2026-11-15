# Prompt 54 — Temporary Mobility & Industrial procedure guides

15 November 2026. Privileged database data-tool path used as explicitly requested; no admin UI import. Nothing published; maintenance unchanged.

## Validation and import
- Both CSVs saved exactly as supplied under `docs/prompt-54-data/`.
- Existing `previewTradeCsv` dry run: guides **4 new / 0 updated / 0 rejected**; steps **4 new / 0 updated / 0 rejected**. Step foreign keys validated against the accepted guide batch plus existing guides. Activation payloads also passed `validateTradeValues`.
- `internal_notes` exists in both the schema and validator/admin allowlist: retained, not dropped. No supplied records omitted or edited.
- Imported inactive with `review_status = needs_check`; confirmed this intermediate state before activation. Only the exact four guides and four steps approved by Amro were then activated as `editorial_reviewed`, never `verified`; database activation checks passed.
- Required step slugs came directly from the existing importer's random `trade-<uuid>` generation; CSV match key remained `guide_slug + step_no`.

## Counts and protection
| Table | Before | After | Final status |
|---|---:|---:|---|
| procedure_guides | 4 | 8 | 8 editorial_reviewed / active; 0 needs_check; 0 verified |
| procedure_steps | 19 | 23 | 23 editorial_reviewed / active; 0 needs_check; 0 verified |
| procedure_documents | 29 | 29 | 29 editorial_reviewed / active; unchanged |

Full-row aggregate hashes of all original guides, original steps and all documents match before/after. No other content records changed.

## Audit entries
- `0eb14f3a-4a35-4f5f-8ff3-840da7274858`: import.csv, procedure_guides, 4 created.
- `b1194231-f8e0-42e5-a923-66a3e58ec773`: import.csv, procedure_steps, 4 created.
- `456af2c3-98b5-4679-b174-c9424f63b697`: content.activate, 4 guides + 4 steps, owner approval recorded.

All three record prompt 54 and method `privileged`.

## Public verification
- Signed out in EN and AR at 390px and 1280px: **20/20 page checks passed** (list plus four details). Document width equals viewport width throughout; no runtime errors. Sources and 14/11/2026 verification dates render; private notes never appear.
- List contains all eight guides. Activity is data-derived: Vehicles & mobility and Government procurement appear automatically (English values also on Arabic pages, as supplied; no translations added). Filter submissions returned 1 mobility, 2 procurement and 2 import/export guides.
- GOEIC detail shows four ordered steps and the exact EGP 2,500 fee with its separate source link. Other three details contain no fee/time/steps sections. All four contain no processing time or documents sections.
- Official/source hrefs match the supplied URLs and use a new tab with noopener. List-to-GOEIC navigation and Fee source popup exercised successfully. No Egyptian-source warning appeared. GAGS retains the supplied HTTP URL; no rewrite to HTTPS. Remote authority website availability was not independently certified.
- Anonymous public-column reads: 8 guides and 23 steps (HTTP 200). `internal_notes` requests refused for both tables (HTTP 401, code 42501).
- Data appears at `/do-business/procedure-guides` and its four new details: `traffic-egypt-eservices`, `gags-procurement-portal`, `mof-government-contracting-system`, `goeic-producer-registration-visual-inspection`.

## Sitemap and tests
- Existing generator includes guide details; regenerated sitemap **227 → 231 URLs**, adding exactly the four guide detail URLs.
- Full existing suite run once: **121 passed, 0 failed**. Two additional concrete CSV fee/step regression tests were added afterward and run separately: **2 passed, 0 failed** (123 tests total).
- No new tables, columns, routes, nav items, flags, translations or application behavior; Transportation & Mobility and Tenders & Projects unchanged.