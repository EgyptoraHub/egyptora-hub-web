# Prompt 75 — Justice official services guide, batch 1 (hidden import)

## Result
- Received 5 rows; created 5; updated 0; rejected 0. No activation, no `editorial_reviewed`.
- Path: **privileged database path** (no admin session), as the prompt explicitly requested.
- Files: `docs/prompt-75-data/justice_service_guides_batch1.csv` (exact CSV fence, UTF-8), this report, roadmap line. No code, migration, flag, allowlist, page or sitemap change.

## Dry run
Table was empty (0 rows) before import. Ran the shared admin importer preview `previewComplaintsCsv('justice_service_guides', csv, [], new Set())` (column allowlist, slug match key, Justice validation, forced `needs_check` + inactive). Lines 2–6: all `new`. **5 new / 0 updated / 0 rejected.** Only the generated validated payloads were written.

## Rows after import (read back)
| Slug | ID | review_status | is_active |
| --- | --- | --- | --- |
| moj-electronic-services | cb13dc26-fc90-4f61-a7c2-bab1d1511143 | needs_check | false |
| moj-attestation-inquiry | 585f5637-8458-4347-abe4-2f7ad0fd36cb | needs_check | false |
| moj-lawyers-remote-criminal-litigation | 242e09f7-fcb1-4aaf-8c37-a9f1ed29dac8 | needs_check | false |
| digital-egypt-court-services | 8f5b945c-3ad8-4bbe-bed8-dd7a1d97bba9 | needs_check | false |
| moi-services-guide | 721651b2-d183-4cd1-830e-41f49bae570f | needs_check | false |

Table totals: 5 needs_check/inactive, 0 active.

## Audit entry
One statement inserted the 5 rows and the audit entry together (audit written only if exactly 5 rows inserted).
- ID `bbf8a761-820e-4653-92a5-2d29c5ccd79d`, action `import.csv`, entity `justice_service_guides` / `prompt-75-batch1`, actor unset.
- Metadata: prompt 75, count 5, created 5, updated 0, rejected 0, method `privileged database path`, match key `slug`, dry run result, the 5 slugs.

## Data audit link check
Shared `sourceUrlWarning` on `official_url` and `source_url` of all 5 rows: 10 checks, **0 warnings** (hosts moj.gov.eg, lawyers.moj.gov.eg, digital.gov.eg, www.moi.gov.eg; no PDFs).

## Real API checks
- Signed out: `select=slug` → 200 `[]`; `select=internal_notes` → 401 (42501).
- Signed in, disposable non-admin test user (0 `user_roles` rows): `select=slug` → 200 `[]`; `select=internal_notes` → 403 (42501).

## Page checks (real Chromium, signed out)
`/justice/services-guide` EN and AR at 390px and 1280px: "Official sources are being verified" / "المصادر الرسمية قيد التحقق" shown, no imported text, 0px horizontal overflow, dir ltr/rtl correct, no page errors.
Sitemap still 250 URLs (not rebuilt). Hub, menu and search code untouched; not re-checked in a browser this time.

## Tests
`bun test`: 364 passed, 0 failed (38 files).

## Deliberately not imported
`rta.gov.eg` (Real Estate Tax Authority), `sis.gov.eg` (no justice page read), `egyls.com` (owner excluded; not allowlisted), any sign-in or service-level page, any non-Egyptian source. No rows for public records/archives, mediation/legal aid, translation/foreign documents (no official source yet). Allowlist unchanged.

## Limits
- Admin screens not exercised (no owner admin session).
- Wording not checked against the live sites by me; it is the owner's extension-relayed text.
