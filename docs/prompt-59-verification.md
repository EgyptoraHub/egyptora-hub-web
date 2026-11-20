# Prompt 59 — Verification: temporarily hide demo data

## Inventory before hiding (all `source_status = DEMO`; no non-demo rows existed)
| Table | Rows | Notes |
|---|---|---|
| properties | 81 | all PENDING_GOVERNMENT_LINK + PUBLISHED; 81 with `price_usd` |
| offers | 8 | all PENDING_GOVERNMENT_LINK |
| investment_opportunities | 81 | all PUBLISHED; 81 with min/max amounts |
| providers | 389 | 362 PUBLIC + 27 SENSITIVE; 308 with price_from; all with rating/review_count/demo label; 0 licence refs |
| products | 73 | report only, unchanged (73 with `price_egp`) |

Static data left unchanged by instruction: tourism tour cards (prices/ratings/discounts in `src/data/site.ts`), e-visa fees, marketplace static data (`src/data/marketplace*.ts`, report only).

## Change (reversible, nothing deleted)
- Migrations `0037_hide_archived_properties_investments` (visitor rule hides REJECTED/ARCHIVED/REMOVED on properties + investment_opportunities; admin read policies) and `0038_allow_archived_governance_status` (ARCHIVED allowed on the four tables).
- Privileged database write (no admin session available; explicitly requested): every row of the four tables set `governance_status = ARCHIVED`. One `audit_log` entry per table records row ids and prior status (all `PENDING_GOVERNMENT_LINK`) for restore.
- Rows remaining visible: 0 in each table. Providers kept visible: 0.

## Site behaviour
- `/properties`, `/offers`, `/investment-opportunities`, `/providers` and their detail pages → 404 while no public row exists; detail not-found "back" link falls back to Home.
- Menu: investment sector items and Investment Incentives / Business Support show "Coming soon". Cards, buttons, tiles, chips, footer links, search results and saved items pointing at these pages are hidden by one gate (`src/lib/path-gates.ts`).
- Egyptora AI: admin-key lookups now exclude REJECTED/ARCHIVED/REMOVED rows (same as the visitor rule).
- Live in Egypt: unsourced cost figures replaced with "Varies by city" (EN/AR).
- Sitemap rebuilt: 238 → 234 URLs (four list pages removed; re-added automatically when public rows exist).

## Checks
- Signed out, EN + AR, 390 and 1280 px: 4 list pages + a demo detail → 404; Home, Invest, Live, Real Estate, Governorate (Cairo), Do Business, Visit Egypt, Explore Egypt, Saved → no links to hidden pages, no demo names, no horizontal overflow. Anonymous API returns `[]` for all four tables.
- Tests: 171 passed, 0 failed (4 new in `src/lib/demo-hide-gating.test.ts`). Typecheck clean; build OK.

## To restore later
Set `governance_status` back to the prior value from the audit entries for the approved rows; gates, menu, sitemap and AI pick them up automatically.
