# Prompt 61 — Verification

Date: 21 November 2026. Applied to the existing Lovable Cloud database. No data changes, account creation, activation, UI changes, translations, flags or publication.

## 1. Actual before-state inspection

- Queried `information_schema.table_privileges`, `information_schema.column_privileges`, `pg_policies`, `pg_class.relacl`, `pg_attribute.attacl`, and effective `has_column_privilege` for all public tables, rather than relying on migration history.
- The read tool runs as `supabase_read_only_user`: both information-schema privilege queries returned empty lists because this role cannot see grants to other roles. These empty lists do **not** mean missing grants. Actual table/column ACLs and effective privileges were read through PostgreSQL catalogs; the privileged migration additionally cross-checked the anon column list against `information_schema.column_privileges` and compared protected table/column privilege rows before and after.
- SQL role impersonation was refused in the read tool. The migration used its privileged session for the requested read-only role impersonation checks, with a synthetic UUID JWT subject verified to have no row in `user_roles`. No auth account or role assignment was created.

### A — public read policy previously anon-only

- `trade_sectors`
- `trade_country_profiles`
- `trade_country_commodities`
- `procedure_guides`
- `procedure_steps`
- `procedure_documents`
- `complaint_sectors`
- `complaint_channels`
- `education_platforms`

### B — public read policy already includes authenticated

- `real_estate_platforms`
- `research_programs`
- `health_facilities`
- `military_media`

All 13 originally had authenticated table-level SELECT. The nine A tables exposed zero rows to a non-admin authenticated role, confirmed before alteration in the applied migration. B already had public read policies but wider column privileges (military media currently has zero rows). `health_facilities` has no `internal_notes` column: the non-public field is `external_ids`. `military_media` has no `internal_notes`: excluded columns were timestamps and rights/license administration fields. No public or user-session consumer requests these extra fields, and no documented intentional signed-in-only public read was found.

### Unchanged checks and intentional private tables

- `health_specialties` and `health_facility_specialties`: identical anon/authenticated column access already; no private column difference and no grant/policy change.
- Private reports/inquiries, audit/AI logs, CRM, user roles, profiles, bookings, trips, saved items, notifications, partner applications/assignments and consents are not public catalogues. Their authenticated access is intentionally admin/staff/owner scoped; they were not converted to visitor column grants.

## 2. Migration and SQL summary

`drizzle/migrations/0039_signed_in_public_column_permissions.sql` applied successfully.

- A: `ALTER POLICY ... TO anon, authenticated` changes only the role list, not `USING` or `WITH CHECK`. Live procedure-step/document predicates have **no parent-guide condition**; none was invented or removed.
- A+B: revoke authenticated table SELECT and any authenticated column SELECT, then grant SELECT on exactly the currently anon-readable columns, taken from the live catalog.
- Anon and service_role permissions, all non-SELECT authenticated grants and all admin policies remain unchanged. Read-only assertions compare protected privilege rows and policies before/after, plus a full-row hash for each affected table.
- The SQL regression suite saved at `src/lib/public-content-permissions.test.sql` was executed byte-for-byte in this migration. It asserts concrete preview counts, identical public IDs, no hidden IDs and permission-denied private-column reads for each visitor role.
- Early attempts rolled back completely on test-harness issues (ambiguous variable, evaluation of the admin helper under anon, and mixed text/UUID ID types). The final suite nests the authenticated-only role check and compares IDs as text. No helper EXECUTE grant was widened.

## 3. Counts, private columns and hidden records

The following **actual role-executed checks passed** during application. Counts are not privileged counts relabeled as visitor counts. All 15 tables also returned identical ordered public record IDs for the two visitor roles.

| Table | Total rows | anon SELECT id | Non-admin authenticated SELECT id | Hidden/inactive IDs excluded in both | Expected count met |
|---|---:|---:|---:|---:|---|
| `trade_sectors` | 15 | 15 | 15 | 0 | Yes |
| `trade_country_profiles` | 0 | 0 | 0 | 0 | Yes |
| `trade_country_commodities` | 0 | 0 | 0 | 0 | Yes |
| `procedure_guides` | 10 | 10 | 10 | 0 | Yes |
| `procedure_steps` | 23 | 23 | 23 | 0 | Yes |
| `procedure_documents` | 29 | 29 | 29 | 0 | Yes |
| `complaint_sectors` | 44 | 6 | 6 | 38 | Yes |
| `complaint_channels` | 15 | 12 | 12 | 3 | Yes |
| `education_platforms` | 14 | 13 | 13 | 1 | Yes |
| `real_estate_platforms` | 3 | 3 | 3 | 0 | Yes |
| `research_programs` | 65 | 12 | 12 | 53 | Yes |
| `health_facilities` | 14 | 14 | 14 | 0 | Yes |
| `military_media` | 0 | 0 | 0 | 0 | Yes |
| `health_specialties` | 18 | 14 | 14 | 4 | Yes |
| `health_facility_specialties` | 0 | 0 | 0 | 0 | Yes |

- 30 role-specific row-count checks passed; all 11 owner-provided expected counts matched exactly.
- 99 existing hidden/inactive rows across complaint sectors (38), complaint channels (3), education platforms (1), research programmes (53) and health specialties (4) were excluded. The test collected every hidden ID as a privileged read, then attempted those same IDs under each visitor role; both returned zero.
- Tables with no inactive rows or no rows are marked 0 above; no test records were invented. For them, preservation of the original public predicate was independently asserted.
- `SELECT internal_notes` failed with SQLSTATE 42501 (`insufficient_privilege`, permission denied) under **both** roles for all nine A tables plus real-estate platforms and research programmes. Empty tables were tested too: zero rows cannot disguise a successful forbidden column read.
- Healthcare `SELECT external_ids` failed under both roles. Military-media SELECT failed on each of `created_at`, `updated_at`, `license_type`, `rights_holder`, `license_url`, `attribution_text`, `rights_verified_at` under both roles. Total: **38 actual forbidden-column queries denied**.

## 4. Code review and admin paths

Searched all `src` consumers of the 13 tables, all `internal_notes`/`external_ids`/rights-license references, wildcard SELECTs and session-client queries; generated type declarations were not counted as reads.

- Public trade reads: `src/lib/trade.functions.ts` names safe sector/country/commodity/guide/step/document columns.
- Public complaints, education, real estate and health reads: their corresponding `*.functions.ts` modules use explicit public projections.
- Research list/detail route loaders select `RESEARCH_PROGRAM_COLUMNS` directly; localized-content hooks then merge translations only into existing row fields. Neither path reads internal notes.
- Menu availability in `src/lib/nav-availability.ts` reads `id` only from affected tables; signed-in availability can now see the same public rows.
- `src/lib/military.ts:120–121` selects only its public media fields; none of the seven removed extras are requested.
- AI public search explicitly projects safe columns. No public/client/user-session read was found that would break under the tightened columns.

Admin content list/editor/save/bulk activation remains in `src/lib/admin-content.functions.ts`: authenticated middleware, then `isAdmin(context)` via the user-session `has_role` RPC, then dynamic import of `supabaseAdmin`. Evidence: list at lines 128–156, editor read at 245–273, save at 345–364, bulk activation at 483–518. All reads/writes after authorization use the service-role client.

CSV paths are similarly unaffected: `trade-import.functions.ts:7–19`, `complaints-import.functions.ts:10–33`, and `health-import.functions.ts:24–68` authenticate, verify the admin role, and only then import/use `supabaseAdmin`. Education/real-estate reuse `GUIDE_TABLES` through the complaints importer; research uses the central admin editor/bulk path. Existing validation and activation checks were not edited.

All affected admin `FOR ALL TO authenticated` policies still have the same `has_role(auth.uid(), admin)` USING/WITH CHECK predicates. This was checked against live before/after policies, not merely code. Service-role grants and authenticated INSERT/UPDATE/DELETE are unchanged.

## 5. Per-table actual grants and policies: before and after

Column lists below are the effective SELECT lists; the raw ACLs also show table SELECT versus explicit column SELECT. In all A/B tables, after authenticated columns exactly equal the unchanged anon list. PostgreSQL ACL letters: `r` SELECT, `a` INSERT, `w` UPDATE, `d` DELETE, `D` TRUNCATE, `x` REFERENCES, `t` TRIGGER, `m` MAINTAIN.

### `trade_sectors`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, sector_group, name_en, name_ar, scope_en, scope_ar, matching_info_en, matching_info_ar, sort_order, source_name, source_url, last_verified_at, review_status, is_active, internal_notes, created_at, updated_at, source_name_ar`.
- authenticated SELECT columns **after**: `id, slug, sector_group, name_en, name_ar, scope_en, scope_ar, matching_info_en, matching_info_ar, sort_order, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.
- anon SELECT columns **before = after**: `id, slug, sector_group, name_en, name_ar, scope_en, scope_ar, matching_info_en, matching_info_ar, sort_order, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.

Live policies before (and exact after unless the role-list change is noted):

- `trade_sectors_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `trade_sectors_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `trade_country_profiles`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, iso2, iso3, name_en, name_ar, region, entity_type, summary_en, summary_ar, official_trade_site_url, source_name, source_url, last_verified_at, review_status, is_active, internal_notes, created_at, updated_at, source_name_ar`.
- authenticated SELECT columns **after**: `id, slug, iso2, iso3, name_en, name_ar, region, entity_type, summary_en, summary_ar, official_trade_site_url, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.
- anon SELECT columns **before = after**: `id, slug, iso2, iso3, name_en, name_ar, region, entity_type, summary_en, summary_ar, official_trade_site_url, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.

Live policies before (and exact after unless the role-list change is noted):

- `trade_country_profiles_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `trade_country_profiles_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `trade_country_commodities`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, country_slug, commodity_en, commodity_ar, record_kind, hs_code, hs_revision, reference_year, unit, quantity, flow, notes_en, notes_ar, source_name, source_url, last_verified_at, review_status, is_active, internal_notes, created_at, updated_at, source_name_ar`.
- authenticated SELECT columns **after**: `id, slug, country_slug, commodity_en, commodity_ar, record_kind, hs_code, hs_revision, reference_year, unit, quantity, flow, notes_en, notes_ar, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.
- anon SELECT columns **before = after**: `id, slug, country_slug, commodity_en, commodity_ar, record_kind, hs_code, hs_revision, reference_year, unit, quantity, flow, notes_en, notes_ar, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.

Live policies before (and exact after unless the role-list change is noted):

- `trade_country_commodities_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `trade_country_commodities_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `procedure_guides`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, title_en, title_ar, activity, authority_name_en, authority_name_ar, official_service_url, summary_en, summary_ar, published_fee_text, published_processing_time_text, fee_source_url, time_source_url, source_name, source_url, last_verified_at, review_status, is_active, internal_notes, created_at, updated_at, source_name_ar, published_fee_text_ar, published_processing_time_text_ar`.
- authenticated SELECT columns **after**: `id, slug, title_en, title_ar, activity, authority_name_en, authority_name_ar, official_service_url, summary_en, summary_ar, published_fee_text, published_processing_time_text, fee_source_url, time_source_url, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar, published_fee_text_ar, published_processing_time_text_ar`.
- anon SELECT columns **before = after**: `id, slug, title_en, title_ar, activity, authority_name_en, authority_name_ar, official_service_url, summary_en, summary_ar, published_fee_text, published_processing_time_text, fee_source_url, time_source_url, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar, published_fee_text_ar, published_processing_time_text_ar`.

Live policies before (and exact after unless the role-list change is noted):

- `procedure_guides_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `procedure_guides_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `procedure_steps`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, guide_slug, step_no, title_en, title_ar, description_en, description_ar, official_url, source_name, source_url, last_verified_at, review_status, is_active, internal_notes, created_at, updated_at, source_name_ar`.
- authenticated SELECT columns **after**: `id, slug, guide_slug, step_no, title_en, title_ar, description_en, description_ar, official_url, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.
- anon SELECT columns **before = after**: `id, slug, guide_slug, step_no, title_en, title_ar, description_en, description_ar, official_url, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.

Live policies before (and exact after unless the role-list change is noted):

- `procedure_steps_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `procedure_steps_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `procedure_documents`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, guide_slug, document_name_en, document_name_ar, issuing_source_en, issuing_source_ar, official_url, last_reviewed_at, source_name, source_url, last_verified_at, review_status, is_active, internal_notes, created_at, updated_at, source_name_ar`.
- authenticated SELECT columns **after**: `id, slug, guide_slug, document_name_en, document_name_ar, issuing_source_en, issuing_source_ar, official_url, last_reviewed_at, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.
- anon SELECT columns **before = after**: `id, slug, guide_slug, document_name_en, document_name_ar, issuing_source_en, issuing_source_ar, official_url, last_reviewed_at, source_name, source_url, last_verified_at, review_status, is_active, created_at, updated_at, source_name_ar`.

Live policies before (and exact after unless the role-list change is noted):

- `procedure_documents_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `procedure_documents_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `complaint_sectors`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,anon=awdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,anon=awdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, name_en, name_ar, family, scope_en, scope_ar, notice_type, sort_order, review_status, is_active, internal_notes, created_at, updated_at`.
- authenticated SELECT columns **after**: `id, slug, name_en, name_ar, family, scope_en, scope_ar, notice_type, sort_order, review_status, is_active, created_at, updated_at`.
- anon SELECT columns **before = after**: `id, slug, name_en, name_ar, family, scope_en, scope_ar, notice_type, sort_order, review_status, is_active, created_at, updated_at`.

Live policies before (and exact after unless the role-list change is noted):

- `complaint_sectors_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `complaint_sectors_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `complaint_channels`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,anon=awdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,anon=awdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, sector_slug, authority_name_en, authority_name_ar, channel_type, channel_value, label_en, label_ar, hours_en, hours_ar, handles_en, handles_ar, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, internal_notes, sort_order, created_at, updated_at`.
- authenticated SELECT columns **after**: `id, slug, sector_slug, authority_name_en, authority_name_ar, channel_type, channel_value, label_en, label_ar, hours_en, hours_ar, handles_en, handles_ar, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, sort_order, created_at, updated_at`.
- anon SELECT columns **before = after**: `id, slug, sector_slug, authority_name_en, authority_name_ar, channel_type, channel_value, label_en, label_ar, hours_en, hours_ar, handles_en, handles_ar, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, sort_order, created_at, updated_at`.

Live policies before (and exact after unless the role-list change is noted):

- `complaint_channels_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `complaint_channels_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `education_platforms`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,anon=awdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,anon=awdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, name_en, name_ar, operator_name_en, operator_name_ar, category, audience_en, audience_ar, services_summary_en, services_summary_ar, languages, published_fee_text, published_fee_text_ar, fee_source_url, official_url, accreditation_status, accreditation_source_url, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, sort_order, internal_notes, created_at, updated_at`.
- authenticated SELECT columns **after**: `id, slug, name_en, name_ar, operator_name_en, operator_name_ar, category, audience_en, audience_ar, services_summary_en, services_summary_ar, languages, published_fee_text, published_fee_text_ar, fee_source_url, official_url, accreditation_status, accreditation_source_url, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, sort_order, created_at, updated_at`.
- anon SELECT columns **before = after**: `id, slug, name_en, name_ar, operator_name_en, operator_name_ar, category, audience_en, audience_ar, services_summary_en, services_summary_ar, languages, published_fee_text, published_fee_text_ar, fee_source_url, official_url, accreditation_status, accreditation_source_url, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, sort_order, created_at, updated_at`.

Live policies before (and exact after unless the role-list change is noted):

- `education_platforms_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `education_platforms_public`: `SELECT`; roles before `anon` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `real_estate_platforms`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,anon=awdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,anon=awdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, name_en, name_ar, operator_name_en, operator_name_ar, category, audience_en, audience_ar, services_summary_en, services_summary_ar, languages, published_fee_text, published_fee_text_ar, fee_source_url, official_url, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, sort_order, internal_notes, created_at, updated_at`.
- authenticated SELECT columns **after**: `id, slug, name_en, name_ar, operator_name_en, operator_name_ar, category, audience_en, audience_ar, services_summary_en, services_summary_ar, languages, published_fee_text, published_fee_text_ar, fee_source_url, official_url, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, sort_order, created_at, updated_at`.
- anon SELECT columns **before = after**: `id, slug, name_en, name_ar, operator_name_en, operator_name_ar, category, audience_en, audience_ar, services_summary_en, services_summary_ar, languages, published_fee_text, published_fee_text_ar, fee_source_url, official_url, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active, sort_order, created_at, updated_at`.

Live policies before (and exact after unless the role-list change is noted):

- `real_estate_platforms_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `real_estate_platforms_public`: `SELECT`; roles before `anon, authenticated` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `research_programs`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, name, university, governorate_slug, field, degree, languages, summary, description, images, tags, source_status, source_owner, verified_at, data_class, created_at, updated_at, governance_status, name_ar, university_ar, degree_ar, summary_ar, source_name, source_name_ar, source_url, last_verified_at, internal_notes, review_status, is_active`.
- authenticated SELECT columns **after**: `id, slug, name, university, governorate_slug, field, degree, languages, summary, description, images, tags, source_status, source_owner, verified_at, data_class, created_at, updated_at, governance_status, name_ar, university_ar, degree_ar, summary_ar, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active`.
- anon SELECT columns **before = after**: `id, slug, name, university, governorate_slug, field, degree, languages, summary, description, images, tags, source_status, source_owner, verified_at, data_class, created_at, updated_at, governance_status, name_ar, university_ar, degree_ar, summary_ar, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active`.

Live policies before (and exact after unless the role-list change is noted):

- `research_programs_admin`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `research_programs_public`: `SELECT`; roles before `anon, authenticated` → after `anon, authenticated`.
```sql
USING (is_active AND (review_status = ANY (ARRAY['editorial_reviewed'::text, 'verified'::text])))
WITH CHECK NULL
```

### `health_facilities`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, slug, name_en, name_ar, facility_type, ownership, governorate_id, city_en, city_ar, address_en, address_ar, lat, lng, phone, hours_en, hours_ar, official_website, services, description_en, description_ar, license_status, license_source_url, accreditation_status, accreditation_source_url, source_url, last_verified_at, is_active, external_ids, image_key, created_at, updated_at`.
- authenticated SELECT columns **after**: `id, slug, name_en, name_ar, facility_type, ownership, governorate_id, city_en, city_ar, address_en, address_ar, lat, lng, phone, hours_en, hours_ar, official_website, services, description_en, description_ar, license_status, license_source_url, accreditation_status, accreditation_source_url, source_url, last_verified_at, is_active, image_key, created_at, updated_at`.
- anon SELECT columns **before = after**: `id, slug, name_en, name_ar, facility_type, ownership, governorate_id, city_en, city_ar, address_en, address_ar, lat, lng, phone, hours_en, hours_ar, official_website, services, description_en, description_ar, license_status, license_source_url, accreditation_status, accreditation_source_url, source_url, last_verified_at, is_active, image_key, created_at, updated_at`.

Live policies before (and exact after unless the role-list change is noted):

- `health_facilities_admin_all`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `health_facilities_public_read`: `SELECT`; roles before `anon, authenticated` → after `anon, authenticated`.
```sql
USING (is_active = true)
WITH CHECK NULL
```

### `military_media`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=awdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.
- authenticated SELECT columns **before**: `id, record_id, figure_id, era_id, kind, url, title_ar, title_en, caption_ar, caption_en, institution, accession_id, rights_statement, origin_type, is_active, created_at, updated_at, license_type, rights_holder, license_url, attribution_text, rights_verified_at`.
- authenticated SELECT columns **after**: `id, record_id, figure_id, era_id, kind, url, title_ar, title_en, caption_ar, caption_en, institution, accession_id, rights_statement, origin_type, is_active`.
- anon SELECT columns **before = after**: `id, record_id, figure_id, era_id, kind, url, title_ar, title_en, caption_ar, caption_en, institution, accession_id, rights_statement, origin_type, is_active`.

Live policies before (and exact after unless the role-list change is noted):

- `Admins manage military media`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `Public reads rights-cleared military media`: `SELECT`; roles before `anon, authenticated` → after `anon, authenticated`.
```sql
USING ((is_active = true) AND (COALESCE(TRIM(BOTH FROM institution), ''::text) <> ''::text) AND (COALESCE(TRIM(BOTH FROM rights_statement), ''::text) <> ''::text))
WITH CHECK NULL
```

### `health_specialties`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres,anon=r/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres,anon=r/postgres}`.
- authenticated SELECT columns **before**: `id, slug, name_en, name_ar, summary_en, summary_ar, when_to_visit_en, when_to_visit_ar, icon, sort_order, is_active, source_url, last_verified_at, created_at, updated_at`.
- authenticated SELECT columns **after**: `id, slug, name_en, name_ar, summary_en, summary_ar, when_to_visit_en, when_to_visit_ar, icon, sort_order, is_active, source_url, last_verified_at, created_at, updated_at`.
- anon SELECT columns **before = after**: `id, slug, name_en, name_ar, summary_en, summary_ar, when_to_visit_en, when_to_visit_ar, icon, sort_order, is_active, source_url, last_verified_at, created_at, updated_at`.

Live policies before (and exact after unless the role-list change is noted):

- `health_specialties_admin_all`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `health_specialties_public_read`: `SELECT`; roles before `anon, authenticated` → after `anon, authenticated`.
```sql
USING (is_active = true)
WITH CHECK NULL
```

### `health_facility_specialties`

- RLS enabled before/after: `true` / `true`.
- Table ACL before: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres,anon=r/postgres}`.
- Table ACL after: `{postgres=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres,anon=r/postgres}`.
- authenticated SELECT columns **before**: `facility_id, specialty_id, id, created_at, updated_at`.
- authenticated SELECT columns **after**: `facility_id, specialty_id, id, created_at, updated_at`.
- anon SELECT columns **before = after**: `facility_id, specialty_id, id, created_at, updated_at`.

Live policies before (and exact after unless the role-list change is noted):

- `health_facility_specialties_admin_all`: `ALL`; roles before `authenticated` → after `authenticated`.
```sql
USING has_role(auth.uid(), 'admin'::text)
WITH CHECK has_role(auth.uid(), 'admin'::text)
```

- `health_facility_specialties_public_read`: `SELECT`; roles before `anon, authenticated` → after `anon, authenticated`.
```sql
USING ((EXISTS ( SELECT 1
   FROM health_facilities f
  WHERE ((f.id = health_facility_specialties.facility_id) AND f.is_active))) AND (EXISTS ( SELECT 1
   FROM health_specialties s
  WHERE ((s.id = health_facility_specialties.specialty_id) AND s.is_active))))
WITH CHECK NULL
```

## 6. Out-of-scope hidden demo tables — report only

All five have table-level SELECT on **both** anon and authenticated. Therefore none has a wider authenticated SELECT list than anon. They still contain governance/moderation metadata; this is a report, not an assertion that every existing public column should be public. Their grants, policies and data were left untouched as requested.

| Table | authenticated wider than anon? | Internal/moderation-like fields currently SELECT-granted to both roles |
|---|---|---|
| `properties` | No | `governance_status, moderation_state` |
| `offers` | No | `governance_status` |
| `investment_opportunities` | No | `governance_status, moderation_state` |
| `providers` | No | `governance_status` |
| `products` | No | `governance_status` |

The all-public-table catalog comparison confirmed every table outside A/B remained byte-identical in grants/columns, and exactly nine policy role lists changed across the entire public schema; no other policy changed.

## 7. Verification limits and remaining work

- Admin access was confirmed from code and unchanged grants/policies. No signed-in admin editor/import/activation UI action was executed, because that would require an actual admin session and no data changes were authorized.
- The browser sign-in flow and signed-in menu rendering were not exercised; the user-requested SQL role-impersonation alternative was used for the exact access rule being fixed. No account was created.
- Information-schema privilege lists could not be returned directly by the read tool; privileged in-migration cross-checks and catalog ACLs provide the actual grant evidence reported above.
- Existing TypeScript test suite: **176 passed, 0 failed**, 24 files. New saved SQL permission suite passed against the live database in migration 0039.
- Latest preview build log: **build OK**. No content route was edited; homepage metadata remains app-specific.
- No task-specific blocker remains. Nothing published.
