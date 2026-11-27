# Prompt 75b — Justice official services guide: corrections + activation of 4

Path: **privileged database path** (no admin session), as the prompt requested. No code, migration, flag, allowlist, page, hub, menu, search or sitemap change.
Files: `docs/prompt-75b-data/justice_service_guides_batch1_corrected.csv` (exact CSV fence, UTF-8, 5 rows), this report.

## Dry run
Shared importer preview `previewComplaintsCsv('justice_service_guides', csv, <5 live rows>, …)`: lines 2–6 all `update`. **0 new / 5 updated / 0 rejected.**

## Field-by-field diff (generated payload vs live rows, before Step A)
Only allowed fields differed; no other field (title, provider, URLs, source names, service_area, sort_order) changed.
| Slug | Changed fields |
| --- | --- |
| moj-electronic-services | summary_en, internal_notes |
| moj-attestation-inquiry | summary_en, summary_ar, languages (ar → ar,en), internal_notes |
| moj-lawyers-remote-criminal-litigation | summary_en, summary_ar, internal_notes |
| digital-egypt-court-services | summary_ar, internal_notes |
| moi-services-guide | internal_notes |
verified_on was already 2026-11-27 on all rows (rewritten with the same value). After Step A the dry run was re-run against the read-back rows: 0 differences.

## Audit entries
- Step A: `37c66e8f-f86c-4333-bcd6-a4ae37eb2977` — `update.csv`, entity `prompt-75b-corrections`, count 5, fields, dry-run result, slugs.
- Step B (separate statement, after Step A read back): `a6e8c9e5-b732-4bbe-a211-06d74d556270` — `activate`, entity `prompt-75b-activation`, count 4, owner approval 2026-11-27, the 4 slugs, note that the lawyers platform stays hidden.

## Row status
| Slug | After Step A | After Step B | languages |
| --- | --- | --- | --- |
| moj-electronic-services | needs_check / false | editorial_reviewed / true | ar |
| moj-attestation-inquiry | needs_check / false | editorial_reviewed / true | ar,en |
| moj-lawyers-remote-criminal-litigation | needs_check / false | needs_check / false | ar |
| digital-egypt-court-services | needs_check / false | editorial_reviewed / true | ar |
| moi-services-guide | needs_check / false | editorial_reviewed / true | ar |
No trigger rejected any activation.

## Data audit
Shared `sourceUrlWarning` on official_url + source_url of all 5 rows: 10 checks, **0 warnings** (no PDFs, all .gov.eg). Activation trigger (source, date, reviewed status) passed for all 4.

## Real API checks
- Signed out: 200, exactly the 4 active slugs; lawyers row absent; `internal_notes` → 401.
- Signed in, disposable non-admin test user (0 user_roles rows): 200, same 4 slugs; `internal_notes` → 403.
- No "fee", "price" or "EGP" text in returned public data.

## Page checks (real Chromium, signed out)
`/justice/services-guide`, EN and AR at 390px and 1280px: 4 cards in sort order, no lawyers-platform card or link, 8 external links all `target=_blank` with `noopener`, 0px horizontal overflow, dir ltr/rtl correct, banner and disclaimer link present, no page errors.
`languages` is shown as a line on each card: `ar` → "Arabic" / "العربية"; row 2 `ar,en` → "Arabic, English" / "العربية، الإنجليزية" — displays correctly.
Each card shows its "last verified 2026-11-27" line (the existing verified-on field); no fees, service dates or availability claims appear. No code fix was needed.
Sitemap: 250 URLs (unchanged, not rebuilt). Hub, menu and search code untouched; not re-checked in a browser.

## Tests
`bun test`: 364 passed, 0 failed (38 files).

## Limits
- Admin screens not exercised (no owner admin session).
- Wording not checked against the live sites by me; it is the owner's extension-relayed text.
