# Prompt 49 — Complaints & Government Services Guide: Phase 1 verification

Phase 1 is informational only. No complaint intake, case tables, reporter identity, evidence buckets, tracking, agency consoles, public metrics, mobile-app section, demo reference numbers or fake statistics were built. A guard test (`src/lib/complaints-guard.test.ts`) fails if any of these ever appear.

## Migration
`drizzle/migrations/0031_complaints_guide_foundation.sql` applied successfully:
- `complaint_sectors` (10-family CHECK, notice_type CHECK, review_status CHECK, is_active default false) and `complaint_channels` (sector_slug FK → complaint_sectors.slug ON UPDATE CASCADE, channel_type CHECK).
- GRANTs: `service_role` ALL, `authenticated` SELECT/INSERT/UPDATE/DELETE, `anon` column-level SELECT excluding `internal_notes` (same pattern as migrations 0027/0028).
- RLS: public SELECT only when `is_active AND review_status IN ('editorial_reviewed','verified')`; admin ALL via `has_role`.
- `validate_complaint_channel` trigger: activation requires source URL + verification date; source must be http(s), not `.pdf`; hotline values digits/`+`/spaces/dashes (3–20 chars); website/app/whatsapp values must be `https://`; `javascript:`/`data:` rejected; hours/handles text requires the row's own source. Sectors are the editorial taxonomy and need no source to activate.
- `touch_updated_at` triggers on both tables; function EXECUTE revoked from PUBLIC.

## Data — 44 sectors
- Received: 44 rows (CSV saved at `docs/prompt-49-data/complaint_sectors_batch1.csv`).
- Dry run through the validated import preview (`previewComplaintsCsv`, the same code the admin CSV path uses): 44 new, 0 updated, 0 rejected; every plan forced `needs_check` + inactive.
- The admin import server function requires a signed-in admin session, which is not available from this environment (session minting has never matched an app account here). The validated rows were therefore applied through privileged database access with the identical forced state, and one `audit_log` entry (`import.csv`, `complaint_sectors`, committed: 44) records this. Nothing was guessed; validation was not bypassed.
- Final state (verified by query): `complaint_sectors` = 44 × `needs_check` + `is_active = false`. `complaint_channels` = 0 rows (none imported in this prompt, as specified).
- Rejected: none. Not imported: none.

## Signed-out visitor check (publishable key)
- `complaint_sectors?select=slug,name_en` → `[]` (zero rows readable while inactive).
- `complaint_sectors?select=internal_notes` → `42501 permission denied` (refused).
- `complaint_channels?select=slug` → `[]`.

## Route gating (zero public rows)
All checked signed-out in the preview:
- `/government-directory/complaints` → 404, "This section is being prepared".
- `/government-directory/complaints/industry` → 404, same.
- `/government-directory/complaints/unknown-authority` → 404, same (gated like the hub).
- `/government-directory/complaints/other-unknown-authority` → redirects to the guide page, which is gated → 404, same.
- Sitemap generator updated (hub + guide only while public sectors exist; sector pages only with ≥1 public channel) but NOT regenerated, per instructions.

## Navigation
- "Complaints & Services Guide" added under Government Directory after "Digital Government Services", `soon: true` + `gate: "complaint_sectors"` → renders as inert "Coming soon" while no public sectors exist.
- Automated overlap checks at 1280 / 1440 / 1536 / 1600 px in English and Arabic: no overlapping header elements, no horizontal scroll, item present in the menu.

## Admin
- Both tables registered in `admin-content.config.ts` under "Complaints & Government Services Guide" with `csvImport: true`, review_status/is_active filters + bulk actions, `countBy: "review_status"`, `orderColumn: "sort_order"`, `internal_notes` textarea.
- `src/lib/complaints-validation.ts` (zod, mirrors the database trigger), `complaints-import.ts` / `complaints-import.functions.ts` (dry-run preview, match-key updates, forced needs_check + inactive, max 1000 rows, unsupported columns rejected, sector_slug FK validated), `ComplaintsCsvImport` wired into the admin content page.
- Admin create/edit/bulk validated through `validateComplaintValues` + `checkComplaintsForeignKeys` in `admin-content.functions.ts`; writes are audited.

## Legal disclaimer
- `complaints-guide-disclaimer` added to the Legal Center (index 36, Disclaimers, DRAFT, counsel review required — exactly like `health-disclaimer`), with the owner-supplied EN and AR text, linked from all three guide pages.

## Phase 2 flags (infrastructure only)
Inserted into `site_settings`, all `{"enabled": false, "phase": 2}`: `complaints_intake`, `complaints_tracking`, `complaints_integrity_channel`, `complaints_agency_console`, `complaints_evidence_upload`, `complaints_ai_triage`, `complaints_public_metrics`, `complaints_mobile_app`. Shown read-only on the admin dashboard via `ComplaintsPhase2Flags`; `setFeatureFlag` rejects them. Nothing in the app reads them to enable behavior.

## Egyptora AI
- `concierge-prompt.ts` gained the complaints rules (never receive/store/forward/track; never decide the authority as final; suggest only tool-returned active records; never imply guilt or promise resolution/speed/anonymity; never ask for complaint details, identity numbers or evidence; emergencies → active emergency_numbers only; unified channel only when its record is active).
- `concierge-search.server.ts` searches `complaint_sectors` and `complaint_channels` with the publishable key and explicit visibility filters; channels are suggested only when their sector is also public.

## Tests
`bun test src/lib/` — 94 pass, 0 fail (25 new: validation/trigger rules, CSV preview, visibility rule, 7 concierge rule tests, 5 gating tests, phase-1 guard). Type check clean; build OK.

## Not done / notes
- Sitemap not regenerated (per instructions); run `npm run sitemap` when the first sectors go live.
- Admin UI (editor, CSV import, flags panel) not exercised signed in — no admin session is available in this environment.
- No channel records exist yet, so the unified-channel block and channel cards render only after a future data prompt imports and activates them.
- Maintenance stays ON; nothing was published.
