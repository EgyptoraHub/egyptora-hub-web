# Prompt 52 — Complaints batch 3 + Phase 1 close-out

Date: 14 Nov 2026. Nothing published.

## Path
`previewComplaintsCsv` dry-run, then the **privileged database path** (explicitly allowed; no admin session). CSV saved at `docs/prompt-52-data/complaint_channels_batch3.csv`.

## Rows
Received 5 · accepted 5 (all new) · updated 0 · rejected 0. The WhatsApp row passed validation, so nothing was dropped. All 5 were inserted as `needs_check` / inactive (confirmed by a database read), then the approved activation was applied.

## Counts
| | Before | After |
|---|---:|---:|
| Sectors total / active | 44 / 5 | 44 / 6 |
| Channels total / active / needs_check | 10 / 9 / 1 | 15 / 12 / 3 |

Inactive channels: `hcww-online-complaint-form`, `fra-complaints-portal`, `fra-hotline-19669`. `banking-financial-services` stays needs_check/inactive. No `verified` rows. No other sector or channel was changed.

## Audit entries (method `privileged`, prompt 52)
- `56f0392f-6b56-4ca6-a43b-98016aa0a4fd` — import.csv (5 new, 0 updated, 0 rejected)
- `a382d773-7b50-49e0-9f9e-ce0423de8449` — content.activate (1 sector + 3 CPA channels)

## Data audit coverage
Added `complaint_channels.source_url` (label_en/label_ar) to `LINK_SOURCES`; `LINK_SOURCES` is now exported so the new test `src/lib/data-audit-sources.test.ts` can check it. Source warnings for complaint channels: before 0 (the table was not covered), after 0 (15 rows checked; all `.gov.eg`/`.eg` hosts pass). Other tables' warnings are unchanged because their data wasn't touched.

## Sitemap
226 → **227** URLs; added `/government-directory/complaints/trade-consumer-protection`.

## Signed-out checks (EN + AR, 390 + 1280 px)
- Hub: 5 sector cards + the "Not sure who to contact?" card (6 links).
- Trade sector page: 3 channels with source and date, `tel:19588`, a WhatsApp link to `wa.me/201577779999`, the online form; no hours, 24/7, forwarding or tracking claims. EN is LTR, AR is RTL.
- Visitor reads: 6 sectors, 12 channels; FRA channels and the banking sector are absent; asking for `internal_notes` returns 401.
- **Issue found (not fixed, components out of scope):** at 390 px the trade sector page is 481 px wide because the channel cards overflow (the source line inside each card is wider than the screen). 1280 px is fine.

## Tests
109 passed, 0 failed (1 new).

## Differences vs. the prompt
- `LINK_SOURCES` had to be exported for the test (a one-word change).
- The audit log uses `entity_type` (there is no table column), and the activation was written with the database data tool because the shell's database role can't update rows.
