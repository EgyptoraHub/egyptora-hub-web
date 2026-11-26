# Prompt 73 — Community authority guide batch 1

## Result and scope
- Received 4 rows; created 4; updated 0; rejected 0.
- All four remain `review_status = needs_check`, `is_active = false`. No activation or editorial approval was applied.
- Used the explicitly requested **privileged database path**, not an administrator session.
- Changed files: this report, `docs/prompt-73-data/community_authority_guides_batch1.csv`, and the Prompt 73 task in `roadmap.md`.
- CSV saved as UTF-8, extracted exactly from the supplied CSV fence, including its final newline.
- No application code, migration, page, flag, allowlist, image or sitemap changes. A pre-existing `bun.lock` change was left untouched and excluded from this request's commit.

## Validated dry run
The live table was empty before import. Ran the existing `previewComplaintsCsv('community_authority_guides', csv, [], new Set())`, the same preview used by the central admin importer. It applies configured column coercion/allowlists, slug/match-key checks, Community validation and forced hidden creation state.

| CSV line | Action | Rejection reason |
| --- | --- | --- |
| 2 | new | None |
| 3 | new | None |
| 4 | new | None |
| 5 | new | None |

Result: **4 new / 0 updated / 0 rejected**. Only after this passed were the generated validated payloads inserted.

## Database write and final read-back
One database statement inserted exactly the four records and one audit entry atomically. No existing content row or other content table was changed. Post-import read-back confirmed exactly these four rows:

| Slug | ID | review_status | is_active |
| --- | --- | --- | --- |
| endowments-ministry-of-awqaf | f56bdcbf-946f-4784-a779-5981843d1a41 | needs_check | false |
| endowments-inventory-and-maps | f4a16a91-23ee-4033-b344-324e34ff1d00 | needs_check | false |
| associations-ministry-of-social-solidarity | 5bee9694-52bd-45ec-95ff-163703317d61 | needs_check | false |
| investment-general-authority-for-investment | f35ccb68-b615-4344-9f8c-bb0e017ba4ee | needs_check | false |

Final table counts: **4 needs_check/inactive; 0 editorial_reviewed; 0 verified; 0 active**.

Audit entry read back:
- ID: `4e538f6c-601b-4a4f-9cbd-a10d52b4a37b`
- Action: `import.csv`; entity type: `community_authority_guides`; entity ID: `prompt-73-batch1`.
- Metadata: prompt 73, table name, count 4, created 4, updated 0, rejected 0, method `privileged database path`, match key `slug`, dry run `4 new / 0 updated / 0 rejected`, and all four slugs.
- Actor is unset because this was not an authenticated administrator operation.

## Data audit link checks
Used the same `sourceUrlWarning` function as Data Audit on both registered fields (`source_url`, `official_url`) of all four validated payloads; post-import database read-back confirmed those URLs.

| Slug | source_url warnings | official_url warnings |
| --- | --- | --- |
| endowments-ministry-of-awqaf | 0 | 0 |
| endowments-inventory-and-maps | 0 | 0 |
| associations-ministry-of-social-solidarity | 0 | 0 |
| investment-general-authority-for-investment | 0 | 0 |

Total: **8 link checks, 0 warnings**. All hosts end in `.gov.eg`; no PDF sources. This is the shared link-policy check, not a new claim that source pages were fetched or their statements independently verified.

## Real visitor API checks
Ran real database API requests through the app's browser client, without privileged credentials:

| Visitor | Public columns | internal_notes |
| --- | --- | --- |
| Signed out | HTTP 200, 0 rows | HTTP 401, refused (`42501`) |
| Signed in non-admin | HTTP 200, 0 rows | HTTP 403, refused (`42501`) |

The signed-in session was confirmed through the app client and the visible “My dashboard” navigation. A separate read of `user_roles` confirmed the disposable test visitor had no roles. No roles were granted; the platform-provided test account is temporary.

## Public page checks
Real Chromium checks, signed out, at `/community/authority-guide`:

| Language | Viewport | Result |
| --- | --- | --- |
| English | 390 × 800 | “Official sources are being verified”; no imported records; 0px horizontal overflow; no page errors |
| English | 1280 × 800 | Same empty state; no imported records; 0px horizontal overflow; no page errors |
| Arabic | 390 × 800 | “المصادر الرسمية قيد التحقق”; no imported records; 0px horizontal overflow; no page errors |
| Arabic | 1280 × 800 | Same Arabic empty state; no imported records; 0px horizontal overflow; no page errors |

Screenshots captured for all four combinations, plus the signed-in guide. Visually inspected English mobile and Arabic desktop screenshots; no new display bug was identified.

Sitemap, hub, menu and search files were not modified or regenerated. The import creates no publicly readable records, so it supplies no new public content to these surfaces. No separate interactive before/after hub/menu/search comparison was run; this conclusion is based on unchanged application files and the confirmed zero-row visitor result.

## Tests and health
- Ran the full suite **once** using `bun test`: **317 passed, 0 failed, 36 files**.
- Latest available build log: `build OK` (2026-11-26 16:46:11 UTC). No application code was changed or manual build run.
- No publication.

## Deliberately not imported
- Labour unions and the Ministry of Labour: opened pages supplied no trade-union competence statement.
- Professional syndicates: no source supplied.
- 2025 rent-law records and the housing-alternatives record: news/gazette records, not competence statements; legacy tenancy remains Phase 2.
- Egyptian Awqaf Authority's own website: not opened.
- `ngo.eg` and `csf.eg`: not opened.
- No standalone records for linked but unopened sites or duplicate Government Directory data were created.

## Limits
- No administrator screen/session was exercised; the shared validated preview and Data Audit checker were run directly as requested.
- Source wording remains the owner's supplied summary for later admin review, not a verified quotation or approval.
- No requested import or visitor check remains blocked.