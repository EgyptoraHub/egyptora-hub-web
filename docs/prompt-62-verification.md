# Prompt 62 — Migration 0039 portability verification

Date: 21 November 2026.

## Result and scope

The embedded preview-data test block is removed from migration 0039. The first block no longer checks a synthetic user's roles or requires the authenticated pre-change count to be zero. Its public-policy lookup now uses the existing policy's identity rather than requiring an anon-only role list, so an already/partly applied role-list change does not make the lookup fail. Protected-policy comparisons use that same identity before and after.

No migration was executed, no database connection/write was used, and no policies, grants, records, pages, translations or flags were changed in any running database. No new migration number or permission migration was created. Nothing published.

## Exact migration lines removed

Line numbers refer to the version applied in Prompt 61, commit `6516b69`.

- Original lines **52–121**: both test-introduction comments and the entire `DO $permissions_test$ ... $permissions_test$;` block (70 lines). Exact removed text:

```sql
-- Read-only regression checks, run by migration 0039 under a privileged session.
-- No auth account is created. The synthetic JWT subject has no admin role.
DO $permissions_test$
DECLARE
  original_role text := current_user;
  original_claims text := current_setting('request.jwt.claims', true);
  original_sub text := current_setting('request.jwt.claim.sub', true);
  subject text := '00000000-0000-4000-8000-000000000061';
  target record;
  visitor_role text;
  private_column text;
  public_predicate text;
  anon_ids text[];
  visitor_ids text[];
  hidden_ids text[];
  found_count bigint;
  refused boolean;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = subject::uuid) THEN
    RAISE EXCEPTION 'Permission test subject must have no assigned roles';
  END IF;
  FOR target IN SELECT * FROM (VALUES
    ('trade_sectors',15), ('trade_country_profiles',0), ('trade_country_commodities',0),
    ('procedure_guides',10), ('procedure_steps',23), ('procedure_documents',29),
    ('complaint_sectors',6), ('complaint_channels',12), ('education_platforms',13),
    ('real_estate_platforms',3), ('research_programs',12), ('health_facilities',14),
    ('health_specialties',14), ('health_facility_specialties',0), ('military_media',0)
  ) AS expected(table_name,row_count) LOOP
    SELECT qual INTO public_predicate FROM pg_policies
      WHERE schemaname='public' AND tablename=target.table_name AND cmd='SELECT'
        AND 'anon'=ANY(roles);
    IF public_predicate IS NULL THEN RAISE EXCEPTION 'Missing public policy: %',target.table_name; END IF;
    EXECUTE format('SELECT coalesce(array_agg(id::text ORDER BY id::text),ARRAY[]::text[]) FROM public.%I WHERE NOT (%s)', target.table_name,public_predicate) INTO hidden_ids;
    anon_ids := NULL;
    FOREACH visitor_role IN ARRAY ARRAY['anon','authenticated'] LOOP
      PERFORM set_config('request.jwt.claim.sub',CASE WHEN visitor_role='authenticated' THEN subject ELSE '' END,true);
      PERFORM set_config('request.jwt.claims',json_build_object('sub',CASE WHEN visitor_role='authenticated' THEN subject ELSE NULL END,'role',visitor_role)::text,true);
      PERFORM set_config('role',visitor_role,true);
      IF visitor_role='authenticated' THEN
        IF public.has_role(auth.uid(),'admin') THEN
          RAISE EXCEPTION 'Test must run as non-admin';
        END IF;
      END IF;
      EXECUTE format('SELECT coalesce(array_agg(id::text ORDER BY id::text),ARRAY[]::text[]) FROM public.%I',target.table_name) INTO visitor_ids;
      IF cardinality(visitor_ids) <> target.row_count THEN
        RAISE EXCEPTION '% %: expected %, got %',visitor_role,target.table_name,target.row_count,cardinality(visitor_ids);
      END IF;
      IF visitor_role='anon' THEN anon_ids := visitor_ids;
      ELSIF visitor_ids IS DISTINCT FROM anon_ids THEN RAISE EXCEPTION 'Visitor row IDs differ: %',target.table_name;
      END IF;
      EXECUTE format('SELECT count(id) FROM public.%I WHERE id::text=ANY($1)',target.table_name) INTO found_count USING hidden_ids;
      IF found_count <> 0 THEN RAISE EXCEPTION 'Hidden rows exposed: % %',visitor_role,target.table_name; END IF;
      FOR private_column IN SELECT a.attname FROM pg_attribute a
        WHERE a.attrelid=format('public.%I',target.table_name)::regclass AND a.attnum>0 AND NOT a.attisdropped
          AND NOT has_column_privilege('anon',a.attrelid,a.attnum,'SELECT') LOOP
        refused := false;
        BEGIN
          EXECUTE format('SELECT %I FROM public.%I LIMIT 1',private_column,target.table_name);
        EXCEPTION WHEN insufficient_privilege THEN refused := true;
        END;
        IF NOT refused THEN RAISE EXCEPTION 'Private column exposed: % %.%',visitor_role,target.table_name,private_column; END IF;
      END LOOP;
      PERFORM set_config('role',original_role,true);
    END LOOP;
    RAISE NOTICE 'PASS %: anon=authenticated=%; hidden IDs excluded=%; private columns refused',target.table_name,target.row_count,cardinality(hidden_ids);
  END LOOP;
  PERFORM set_config('request.jwt.claims',coalesce(original_claims,''),true);
  PERFORM set_config('request.jwt.claim.sub',coalesce(original_sub,''),true);
END;
$permissions_test$;
```

Additional first-block portability removals:

- Lines **15–16**: `original_role` and `gap_count` declarations, no longer used.
- Line **18**: the synthetic test-subject `user_roles` assertion.
- Lines **29–34**: synthetic JWT/session-role setup, the `count(id)` query, zero-count assertion and role restoration.
- Lines **47–48**: test JWT cleanup.

Original line **28** is replaced by a STRICT lookup of `policyname=target_table || '_public'` (still scoped to public schema, target table and SELECT). Original lines **24** and **42** use the same public-policy identity for their before/after exclusions. No other first-block statements were rewritten.

## Assertion-by-assertion review

“Depends” below means depends on a particular dataset, preview identity or pre-application role-list state, rather than ordinary prerequisite schema/privileges or a same-database before/after invariant.

| Original check | Depends on data/preview state? | Action and reason |
|---|---|---|
| Synthetic subject has no `user_roles` row (line 18) | **Yes** | Removed entirely; migration needs no test identity. |
| Public policy `INTO STRICT` lookup requires `roles={anon}` (line 28) | **Yes — application state** | Retained STRICT uniqueness/missing-schema protection, but select by the existing named SELECT policy. Accepts anon-only, anon+authenticated or another partially adjusted role list; original ALTER sets the same intended roles. |
| Non-admin authenticated pre-change count must equal zero (lines 29–34) | **Yes** | Removed count assertion and all impersonation. Public rows on a partly applied database no longer cause failure. |
| `public_columns IS NULL`: no anon-readable columns (line 21) | **No — schema/permissions** | Kept unchanged. Zero table rows still have columns/grants. A genuinely missing public SELECT list must not silently weaken the change. |
| Anon can SELECT `internal_notes` (line 22) | **No — security grants** | Kept unchanged; detects unsafe prerequisite grants, not record contents. |
| Information-schema/catalog public-column mismatch (line 23) | **No — schema/session privileges** | Kept unchanged; requires a privileged migration session able to inspect grants. Independent of row data. |
| Saved public `qual`/`with_check` and final role-list assertion (line 36) | **No — same-schema invariant** | Kept unchanged; compares the current database's captured predicate, not a preview predicate. |
| Authenticated table SELECT must be gone and column access must match anon (line 41) | **No — intended grant invariant** | Kept unchanged; enforces precisely the original permission change. |
| Protected policies before/after (lines 24, 42, 45) | **No after adjustment** | Exclude exactly the same named public policy before and after instead of relying on its role list. All other policies, including admin policies, remain protected. |
| Protected table/column grants before/after (lines 25, 43, 45) | **No — same-database invariant** | Kept unchanged. Dataset size and partial SELECT application do not affect the check. |
| Full-row hash before/after (lines 26, 44, 45) | **No — no fixed data value** | Kept unchanged as explicitly allowed: each table compares itself within this execution. Empty tables hash `[]`; different datasets produce different local hashes but still compare equal if untouched. |

The hash/protection checks can still correctly stop on a real unexpected policy/grant/data change. The migration intentionally assumes earlier schema migrations and required database roles/policies exist, and that it is run with normal privileged migration access. It does not attempt to repair absent prerequisite schema or unsafe anon grants.

## First-block preservation evidence

Compared the edited file against the original copied before editing, applying only the explicit replacements above and removing the test tail. Exact comparison passed. The target-table arrays, anon-column selection, `ALTER POLICY`, both `REVOKE SELECT` statements, `GRANT SELECT`, predicate/column checks, protected grant queries and row-hash queries are otherwise identical to the applied version.

The first block is therefore **not claimed to be entirely byte-identical**: its documented portability changes are intentional under step 2 of the prompt. Permission targets and outcomes are unchanged.

## Metadata consistency

`meta/0039_snapshot.json` and the migration journal were not edited. Byte comparison against `HEAD` passed:

- `drizzle/migrations/meta/0039_snapshot.json`: SHA-256 `eec05b9edb81bded0e50946948955104a24d53003cb009fc0960e500bab3bb84`.
- `drizzle/migrations/meta/_journal.json`: SHA-256 `214c3e73b9fdc3745bab23637feb4f99f276c3713bf57a0e3e4fbde80048b195`.

The filename/tag/order and intended final schema remain unchanged, so no journal/snapshot renumbering or new migration was needed. The previously recorded execution was not rerun or rewritten.

A subsequent protected-editor request to remove a harmless trailing blank line was refused for the applied-history directory; no further edit through an alternate tool was attempted. The substantive source changes already written remained in place. The extra blank line is valid SQL and has no effect on permissions or execution.

## Standalone manual SQL check

Kept `src/lib/public-content-permissions.test.sql`. Its executable `DO $permissions_test$` body is byte-identical to the Prompt 61 version; only its header changed:

```sql
-- Preview-data counts from 2026-11-21; manual check only.
-- Run by hand with a privileged session after permission changes, never inside a migration.
-- Update expected counts to match the data of the database being checked.
-- No auth account is created. The synthetic JWT subject has no admin role.
```

It retains the historical preview counts and must be updated to the actual target dataset before manual execution. It was **not executed** in Prompt 62.

## AGENTS.md rule

Added:

> No data-dependent/count assertions in migrations; data checks belong in standalone tests.

Condensed only the two rules written in the preceding work (manual search and public-column grants), preserving their meaning, to fit the existing file size limit.

## Audit of migrations 0030–0038

Read all nine files, searched `RAISE`, `ASSERT`, `count(`, `cardinality` and `DO` blocks. Found **no fixed-count/data-inventory assertions** matching migration 0039's problem. None was changed.

| Migration | Findings |
|---|---|
| 0030 | Six `RAISE EXCEPTION` checks inside `validate_trade_content`: source/date/PDF/commodity/fee/time validation on `NEW`. These are write-time trigger rules, not assertions of current database contents during migration. |
| 0031 | Seven `RAISE EXCEPTION` checks inside `validate_complaint_channel`: source/date/channel URL/phone/hour/scope checks on `NEW`. The migration's DO block grants public columns and creates triggers; it has no row-count checks. |
| 0032 | Ten `RAISE EXCEPTION` checks inside `validate_education_platform`: activation/review/URL/date/fee/accreditation rules on `NEW`. No preview-count assertion. |
| 0033 | Four `RAISE EXCEPTION` checks inside `validate_research_program`: activation/review/date/source rules on `NEW`. Also contains the historical `UPDATE ... SET is_active=false, review_status='needs_check'`; it asserts no count and was not rerun or changed. |
| 0034 | No RAISE/assertion/count tests; public policy definitions. |
| 0035 | Eight `RAISE EXCEPTION` checks inside `validate_real_estate_platform`: activation/review/URL/date/fee source validation on `NEW`. No preview-count assertion. |
| 0036 | No RAISE/assertion/count tests; anon column grants. |
| 0037 | No RAISE/assertion/count tests; public/admin policy definitions. |
| 0038 | No RAISE/assertion/count tests. Governance-status CHECK constraints validate allowed business values in existing rows; ordinary constraint validation, not a fixed preview inventory requirement. |

Total: 35 row-validation exception statements in trigger functions. Defining those functions does not execute their validation against all existing rows. No same-problem migration was identified requiring an additional change or approval.

## SQL validation and tests

- Installed `pglast` only in the sandbox tool environment; no project dependencies changed.
- PostgreSQL grammar parse (`parse_sql`) passed: **one DO statement** in edited migration 0039, and one DO statement in the standalone test.
- PL/pgSQL grammar parse (`parse_plpgsql`) passed: **one procedural block** in each file.
- New `src/lib/migration-portability.test.ts`: three regressions assert no embedded preview checks/subject/role switching, identity-based replay lookup and symmetric protected-policy exclusions, and retention of the original permission operations/protection checks.
- `bun test ./src/lib/*.test.ts`: **179 passed, 0 failed**, across 25 files (176 existing + 3 new).
- Latest app build log: **build OK**.

### Not tested

No execution on preview, live, restored, empty or partially applied databases was performed. Grammar parsing and source regression checks do not prove runtime name/type resolution, privileged-session access, grant effects, or publishing behavior. Generated dynamic SQL strings retain the original permission commands; their execution was not retested. No database migration/check command was run, in accordance with the no-rerun request.
