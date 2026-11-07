# Prompt 50b — Verification: complaint channels batch 1 import + AGENTS.md rule update

Date: 2026-11-07 (UTC). Reply language: English only. No application code, design, navigation, routes or migrations were changed. Nothing was activated; nothing was published; the sitemap was not regenerated.

## A. AGENTS.md — owner workflow rule 2 (Data delivery)

Exactly one sentence was replaced in rule 2; all other rules are unchanged.

- Removed line: `If available access cannot write to the database, report it and stop; never guess or bypass validation.`
- Added line: `Prefer the Admin CSV import. If no admin session is available, a privileged database write is allowed only when ALL of these hold: (1) the prompt explicitly asks for the import; (2) the same validated preview/dry-run passes first with 0 rejected rows (otherwise stop and report); (3) rows are created as \`needs_check\` + inactive, or changed only as the prompt states; (4) one \`audit_log\` entry records the import (table, count, method); (5) the report states clearly that the privileged path was used. Never use it to skip validation, to import rows that failed the preview, or to activate anything unless the prompt explicitly states that the owner reviewed and approved those exact records. If the database cannot be written at all, report it and stop; never guess.`

To stay within the AGENTS.md size budget, three of the assistant's own earlier notes were condensed (healthcare bullets merged into one; maintenance, gold-text and intro-video bullets shortened). No owner- or skill-written rule was shortened, merged, reworded or moved.

## B. Import — `complaint_channels` (privileged path used)

**Method: privileged database write**, because no admin session was available to run the Admin CSV import server function. All five conditions of the amended rule 2 were met: the prompt explicitly asked for the import; the validated dry-run passed with 0 rejected rows; rows were created as `needs_check` + inactive; one `audit_log` entry records the import; this report states the privileged path was used.

- Source file: `docs/prompt-50-data/complaint_channels_batch1.csv` (unedited, exact 7-row file from Prompt 50).
- Dry run: `previewComplaintsCsv("complaint_channels", …)` re-run against the live table (0 existing rows) and the 44 sector slugs.
  - Preview totals: **7 new / 0 updated / 0 rejected** (lines 2–8 all `new`). Gate passed.
- Apply: the 7 validated plans were inserted in **one transaction** (`BEGIN … COMMIT`, `ON_ERROR_STOP`), with the forced state from the import plan (`review_status = needs_check`, `is_active = false`). `internal_notes` values kept as supplied (admin-only column).
- Rows received: 7. Created: 7. Updated: 0. Rejected: 0 (no reasons — none rejected).
- Audit log: one entry, id `5e056b2c-e9bb-4dca-a162-98a5b7cf37c1` — action `import.csv`, entity `complaint_channels`, metadata `{operation: create, committed: 7, method: privileged, prompt: 50b}`.

## Final counts (after import)

| Table | review_status | is_active | count |
|---|---|---|---|
| complaint_channels | needs_check | false | 7 |
| complaint_sectors | needs_check | false | 44 |

The 44 `complaint_sectors` rows are unchanged (still all `needs_check` + inactive).

## Signed-out visitor checks (publishable key)

- `complaint_channels` (public columns): returns `[]` — no inactive rows visible.
- `complaint_sectors` (public columns): returns `[]` — unchanged.
- `complaint_channels.internal_notes`: refused — `42501 permission denied for table complaint_channels`.
- `complaint_sectors.internal_notes`: refused — `42501 permission denied for table complaint_sectors`.

## Route and navigation checks (signed out, preview)

- `/government-directory/complaints` → 404 gated state ("Page not found" / being-prepared gate), because there are still no public sectors.
- `/government-directory/complaints/tax-customs` (sector page) → 404 gated state.
- `/government-directory/complaints/unknown-authority` (guide) → 404 gated state.
- Header nav (1600px, EN): "Complaints & Services Guide" renders inside the Government Directory menu with a "COMING SOON" badge and **no link** (`href: none`) — still inert.

## Not done / notes

- Nothing was activated (no channel, no sector); no `review_status`/`is_active` was changed beyond the forced `needs_check` + inactive creation state.
- The Admin CSV import UI was not exercised (no admin session available); the privileged path was used instead, per the amended rule 2.
- Sitemap not regenerated (complaints URLs remain excluded while no public sectors exist).
- No tests were run: no application code changed in this prompt (only `AGENTS.md`, the database rows and this report).
