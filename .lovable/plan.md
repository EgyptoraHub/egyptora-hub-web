# Prompt 45 — Trade, Industry & Agriculture foundation

- Add six empty sourced content tables and one private, consent-required inquiry table. Keep visa countries and all existing content unchanged.
- Extend the existing content admin with six collections, inquiry status/notes, bulk editing, per-write audit records and CSV preview/import. Preview validates linked country/guide slugs; imports ignore visibility columns and force new records inactive and needs_check.
- Add seven disabled Phase 2 flags to existing admin settings and a short trade safety note to Egyptora AI, without new AI searches or public pages.
- Add English/Arabic labels and shared validation tests. Run the full suite and type-only check; test each table with signed-out access and database guards; document actual outcomes and any unavailable signed-in checks.

## Technical details
Use the central admin allowlist and authenticated server-role checks. New visitor SELECT grants cover explicit safe columns only, with RLS requiring active + reviewed records. Database triggers enforce source/date activation, fee/time evidence, commodity evidence and inquiry consent/rate limits. No seed content, routes, navigation, maintenance changes or publishing.