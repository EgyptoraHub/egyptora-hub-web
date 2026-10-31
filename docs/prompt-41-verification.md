# Prompt 41 — Healthcare foundation

## Implemented
- Five tables with timestamps and RLS; catalogue records default inactive, joining rows are public only when both parents are active.
- Admin-only catalogue writes; reports and inquiries accept validated anonymous inserts but cannot be read anonymously.
- Facilities require source and verification date before activation; licensing and accreditation each require their own evidence. Verification dates cannot be in the future.
- 18 bilingual specialty names, all inactive; no descriptions or facilities seeded.
- Three healthcare Phase 2 settings exist and are disabled. No new roles, public pages, navigation, sitemap entries, or medical-data tables.
- Central admin registration, dry-run CSV import, bulk catalogue activation checks, healthcare audit totals and source checks.
- Reports/inquiries use status-only CSV updates by existing ID, not fake submission creation or publication toggles; active/inactive and source checks do not apply to private submissions.
- Original chat avatar import restored; no image file changed or deleted.

## Verified
- Both migrations applied; generated database types refreshed.
- Seven focused validation tests passed.
- Latest preview build reports `build OK`.
- Public API: specialties/facilities return no rows (18 specialties inactive, no facilities).
- Public API: report/inquiry reads, reserved facility identifiers and catalogue inserts denied.
- Public API: valid report/inquiry accepted; 1001-character report and false inquiry consent rejected. Both valid temporary submissions removed afterward.
- Database transaction: activation without source/date and unsourced licensing rejected; rolled back all fixtures.
- Discovered broad inherited anonymous grants on new tables and removed them in a second migration; public API then confirmed private-column protection.

## Not verified
- Signed-in admin list/edit/import readback: requesting user has no matching app auth account; multiple existing accounts cannot be selected without the owner's choice.
- Avatar rendering: the existing maintenance screen prevents the chat widget from rendering. Its import and original file are confirmed; maintenance was not altered.
- No active health rows were published for testing. Active-only visibility is enforced by the inspected policies, while live anonymous tests verified hidden rows remain absent.
- Concierge future detail links are groundwork only; public healthcare routes intentionally do not exist yet and the system prompt is unchanged.

## Files changed or added
- `AGENTS.md`
- `roadmap.md`
- `docs/prompt-41-verification.md`
- `drizzle/migrations/0025_health_foundation.sql`
- `drizzle/migrations/0026_health_public_column_grants.sql`
- `drizzle/migrations/meta/0025_snapshot.json` (migration tool)
- `drizzle/migrations/meta/0026_snapshot.json` (migration tool)
- `drizzle/migrations/meta/_journal.json` (migration tool)
- `drizzle/schema.ts` (migration tool managed)
- `src/integrations/supabase/types.ts` (generated)
- `src/components/site/FloatingConcierge.tsx`
- `src/components/admin/HealthCsvImport.tsx`
- `src/lib/admin-content.config.ts`
- `src/lib/admin-content.functions.ts`
- `src/lib/data-audit.functions.ts`
- `src/lib/concierge-search.server.ts`
- `src/lib/health-validation.ts`
- `src/lib/health-validation.test.ts`
- `src/lib/health-import.functions.ts`
- `src/lib/health-phase2.md.ts`
- `src/routes/admin.content.$table.tsx`
- `src/routes/admin.data-audit.tsx`

Project memory also records the independent informational scope, medical-information prohibition and avatar preference.

Nothing published. The only image-related change is the requested avatar import.