# Prompt 56 / 56b — Education data verification

Prompt 56b re-ran Prompt 56 with a corrected platforms CSV (`accreditation_status = not_stated` on every row). This report replaces the earlier Prompt 56 blocker report. No importer or application code was changed.

## Data files
- `docs/prompt-56-data/education_platforms.csv` — 14 rows (overwritten with 56b content)
- `docs/prompt-56-data/procedure_guides_education.csv` — 1 row

## Dry-run (existing admin CSV preview logic, against live rows)
| File | Received | New | Updated | Rejected |
|---|---|---|---|---|
| education_platforms | 14 | 14 | 0 | 0 |
| procedure_guides | 1 | 1 | 0 | 0 |

## Import and activation — DB path used: privileged
No admin session was available, so the privileged database path was used (explicitly allowed by the prompt, after a 0-rejected dry-run). Rows were inserted exactly from the preview plans as `needs_check` + inactive, then the owner-approved records were set to `editorial_reviewed` + active (never `verified`). Audit log entries: `import.csv` education_platforms (14), `import.csv` procedure_guides (1), `content.activate` (13 platforms + 1 guide).

## Final counts
| Table | editorial_reviewed / active | needs_check / inactive | Total |
|---|---|---|---|
| education_platforms | 13 | 1 (`asrt` — no HTTPS, blank official_url) | 14 |
| procedure_guides | 9 (1 new: `scu-degree-equivalency`) | 0 | 9 |

## Signed-out checks (EN + AR, 390 px and 1280 px)
- `/education`: 200; shows "Official learning platforms" and "Certificates & equivalency guides" cards; no horizontal overflow.
- `/education/platforms`: 200; lists exactly 13 platforms, each with source link and "Last verified" date; `asrt` absent; no overflow.
- `/do-business/procedure-guides`: Activity filter includes "Education & certificates" with the new guide.
- Public API: anon sees 13 platforms (no `asrt`); selecting `internal_notes` → 401.
- No inactive record appears publicly.

## Pages showing the data
`/education`, `/education/platforms`, `/do-business/procedure-guides`, `/do-business/procedure-guides/scu-degree-equivalency`.

## Sitemap
Regenerated: 233 → 235 URLs (`/education/platforms` and the new guide detail page added).

## Tests
`bun test`: 139 passed, 0 failed (19 files).

## Records not imported
None. `asrt` was imported but intentionally kept `needs_check` + inactive.
