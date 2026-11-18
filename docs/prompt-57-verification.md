# Prompt 57 — Verification: real research programmes (Ain Shams Archaeology)

Date: 18 Nov 2026. Nothing published; maintenance unchanged.

## Database path used
- Schema: migration `0033_research_programs_sourced_records` (privileged migration tool).
- Import and activation: **privileged database path** (no admin session available), explicitly allowed by this prompt, run only after the dry-run passed with 0 rejected rows.
- Four `audit_log` entries: `schema_backfill`, `csv_import` (12 rows, needs_check/inactive), `activate` (12 rows, editorial_reviewed), `demo_hide` (53 rows, none deleted).

## Before the backfill
- 53 existing rows, all `source_status = DEMO`, ids `res-…`. They reference 27 governorates (e.g. cairo, giza, alexandria, luxor) and demo universities/fields (Coptic studies, Desert ecology, Tourism economics, Bioarchaeology, …). All set to `needs_check` + inactive; **none deleted**.

## Schema changes (research_programs)
- New columns: name_ar, university_ar, degree_ar, summary_ar, source_name, source_name_ar, source_url, last_verified_at (date), internal_notes, review_status (default needs_check; needs_check/editorial_reviewed/verified), is_active (default false).
- Trigger `validate_research_program`: activation needs source_url + last_verified_at + reviewed status; source must be http(s), not PDF; date not in the future.
- Old open-read policy replaced: visitors read only `is_active AND review_status IN (editorial_reviewed, verified)`; admins (has_role) manage all.
- Visitor column grants exclude `internal_notes`.

## Data (docs/prompt-57-data/research_programs_real.csv)
- `__CAIRO__` replaced with `cairo` (matches `governorates.slug`; FK passed).
- Dry-run: 12 received, **12 new, 0 rejected**, 0 updated.
- Imported 12 as needs_check/inactive, then activated all 12 as `editorial_reviewed` (owner-approved). Not `verified`.
- Records not imported: none.

## Final counts
| review_status | is_active | rows |
|---|---|---|
| editorial_reviewed | true | 12 |
| needs_check | false | 53 (demo) |
Total 65.

## Signed-out checks (EN + AR, 390 px and 1280 px)
- `/research-programs`: exactly 12 cards in all four runs; no DEMO badge; 12 source links to https://www.asu.edu.eg/343/page; "Last verified 2026-11-18" on all 12.
- Field filters: Archaeology, Conservation science, Egyptology, Museum studies, Papyrology only (Arabic labels in AR).
- Arabic shows the `_ar` names/university/degree/summary/source name.
- Detail `/research-programs/asu-phd-islamic-archaeology` opens with source link and Last-verified date (EN + AR).
- Demo slug `/research-programs/res-egyptology-phd-—-damanhour-university` → 404 "We couldn't find this record".
- `internal_notes` via the public data API → 401. Signed-out row list returns only the 12 `asu-` rows.
- No horizontal scroll (scrollWidth − viewport = 0) on list and detail in all runs.

## Pages where the data appears
`/research-programs`, `/research-programs/$id` (12 detail pages), `/education` first card (description now: "Postgraduate programmes listed from official Egyptian university pages.").

## Other places that read or link to research_programs (checked)
- Health "Projects & Research" — link to `/research-programs` only; list now has 12 rows.
- Invest in Egypt / Investment opportunities chips and cards, Live in Egypt, Home page Education card, Government Directory chip, navigation — links to the list page only.
- Saved items — legacy demo saves link to the list page (not to a hidden detail), so no broken card.
- Search index — 3 entries, all to `/research-programs` (list), none to demo details.
- Government dashboard — table name/link mapping only.
- Sitemap — `/research-programs` static entry only (no detail URLs before or after).
- Content translations (`useLocalizedRows`) — no entries for the new ids; Arabic comes from the `_ar` columns.
- Admin: research_programs entry now has the new fields, review-status/active filters and bulk actions; Data audit checks `research_programs.source_url`.

## Sitemap
235 URLs (unchanged; the list page was already included).

## Tests
149 passed, 0 failed (10 new: 9 in `src/lib/research-programs.test.ts`, 1 in `data-audit-sources.test.ts`).

## Note
In Prompt 57r the source page `https://www.asu.edu.eg/343/page` returned an error page to the research fetcher. The owner supplied and approved these names; re-check the page live during the next review.
