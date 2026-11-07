# Prompt 50 — Complaint channels batch 1: preparation-only verification

Verified on 2026-11-07 UTC. No application code, design, navigation, routes, migrations or database writes were changed or performed.

## File and method

- File: `docs/prompt-50-data/complaint_channels_batch1.csv`
- Target table: `complaint_channels`; match key: `slug`.
- Received and saved: **7 rows**, with the exact supplied header and content. Equality against the uploaded fenced CSV was checked successfully. No corrections were made.
- Executed the existing `previewComplaintsCsv` from `src/lib/complaints-import.ts` locally, without invoking any commit/import function. Preview timestamp: `2026-11-07T20:23:40.811Z`.
- Read-only database queries confirmed all **44 sectors** exist and all four referenced sector slugs exist: `tax-customs`, `other-unknown-authority`, `water-sanitation`, `telecom-post`.
- The channel table was empty, so the preview used an empty existing-channel list. All seven slugs are new.

## Per-row dry-run results

| CSV line | Slug | Result | Channel format | Sector FK | Source/date checks |
|---|---|---|---|---|---|
| 2 | `eta-hotline-16395` | PASS — new | `16395`: valid hotline | `tax-customs`: exists | Valid non-PDF HTTP(S) source; date passes |
| 3 | `eta-incentive-complaints-portal` | PASS — new | Valid HTTPS channel URL | `tax-customs`: exists | Valid non-PDF HTTP(S) source; date passes |
| 4 | `official-unified-complaints-system` | PASS — new | Valid HTTPS channel URL | `other-unknown-authority`: exists | Valid non-PDF HTTP(S) source; date passes |
| 5 | `hcww-water-hotline-125` | PASS — new | `125`: valid hotline | `water-sanitation`: exists | Valid non-PDF HTTP(S) source; date passes |
| 6 | `hcww-sewage-hotline-175` | PASS — new | `175`: valid hotline | `water-sanitation`: exists | Valid non-PDF HTTP(S) source; date passes |
| 7 | `hcww-online-complaint-form` | PASS — new | Valid HTTPS channel URL | `water-sanitation`: exists | Valid non-PDF HTTP(S) source; date passes |
| 8 | `ntra-call-center-155` | PASS — new | `155`: valid hotline | `telecom-post`: exists | Valid non-PDF HTTP(S) source; date passes |

All supplied verification dates are `2026-11-07`, equal to the validator's UTC date, not future dates. Hotline checks use the existing 3–20 character digits/plus/spaces/dashes rule. No hours or handles were supplied. All source URLs use HTTPS and none is a PDF. Validation checks URL syntax and existing rules; it does **not** establish that a remote page is reachable or that its content supports the claim.

Preview totals: **7 pass/new plans, 0 updates, 0 rejected**. Each of the seven in-memory plans has `review_status = needs_check` and `is_active = false`. These are proposed states, not database rows.

## Database state and scope confirmation

- Created: **0**. Updated: **0**. Activated: **0**. All **7 records remain unimported**, pending the owner's Admin UI import.
- Read-only follow-up query: `complaint_sectors` has **44 needs_check/inactive** rows; `complaint_channels` has **0 rows** and therefore no status groups.
- Only SELECT database tools were used. No privileged write, import, audit-log insert, activation or publishing was performed.
- No data was added to public pages. Signed-out page/column-access checks and the test suite were not rerun: this prompt only saved data and a report and executed the existing read-only preview.

## Owner review before activation

Preserved exactly as supplied in the CSV notes:

- Unified complaints portal: owner should open the portal and, if possible, replace the indirect Tax Authority source with the portal's own page.
- HCWW online form: owner must open the form before activation.
- Hotline `175` is limited to Cairo and Alexandria in the supplied description.
- ETA incentive portal scope is not described precisely in the supplied source notes.
- Hours remain unspecified; NTRA app/WhatsApp channels without supplied links or numbers were not added.

No live source-page research was performed in this preparation-only task; passing validation is not editorial approval.