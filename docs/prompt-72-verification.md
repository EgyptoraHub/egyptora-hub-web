# Prompt 72 — Egyptora Community Phase 1 — verification

## Files changed
New: `drizzle/migrations/0043_community_phase1.sql` (+ snapshot/journal), `src/lib/community-validation.ts`, `src/lib/community-public.ts`, `src/lib/community.functions.ts`, `src/i18n/community-translations.ts`, `src/components/community/CommunityPages.tsx`, `src/components/community/CommunityPhase2Flags.tsx`, `src/routes/community.tsx`, `community_.institution-types.tsx`, `community_.authority-guide.tsx`, `community_.partner-interest.tsx`, `src/lib/community-validation.test.ts`, `src/lib/concierge-community.test.ts`.
Edited: `path-gates.ts`, `nav-availability.ts` (gate `community`, always on), `phase2-flags.ts`, `groundwork.functions.ts`, `complaints-validation.ts` (GUIDE_TABLES + slug match key), `admin-content.config.ts`, `data-audit.functions.ts`, `concierge-prompt.ts`, `src/data/navigation.ts`, `gov-directory-chips.ts` (+test), `routes/government-directory.tsx` (entry card), `routes/admin.index.tsx` (flags panel), `search-index.generated.ts`, `scripts/generate-sitemap.mjs` + `public/sitemap.xml` (247 URLs), `src/data/legal.ts` (doc 41 draft), `i18n/dictionary.ts`, `src/lib/AGENTS.md`, `roadmap.md`; tests `nav-availability`, `search-gating`, `shipping-validation`, `energy-validation` updated for the new total.

## Pages
`/community`, `/community/institution-types`, `/community/authority-guide`, `/community/partner-interest` — EN/AR, breadcrumb Home > Government Directory > Egyptora Community > …, banner on every page, concept/no-affiliation line and draft disclaimer link in the section footer. No home-page change; 9 top-level items unchanged.

## Tables (migration 0043, no data, no count assertions)
- `community_authority_guides`: slug (unique), topic_ar/en, institution_type (8 keys), competent_body_name_ar/en, summary_ar/en, official_url, source_name(_ar), source_url, verified_on, languages, sort_order, review_status (default needs_check), is_active (default false), internal_notes, timestamps. Trigger: no future date, no PDF, HTTPS official URL, activation requires source+date+reviewed. Broad grants revoked; column SELECT to anon+authenticated without internal_notes; RLS shows active + editorial_reviewed/verified; admin ALL via has_role. Registered in admin content (CSV import via GUIDE_TABLES: dry-run, forced needs_check+inactive, slug key), data-audit link and hygiene checks.
- `community_partner_interest`: fields as specified, all visitor privileges revoked, server-function insert (service role), 30/min advisory-lock rate limit trigger, honeypot, admin view with submitted fields read-only and only status/internal_notes editable. Everything mirrored; nothing weaker substituted. No automatic email.

## Real API permission checks
| Caller | guides public cols | guides internal_notes | partner_interest SELECT | partner_interest INSERT |
|---|---|---|---|---|
| Signed out (publishable key) | 200 `[]` | 401 (42501) | 401 | 401 |
| Signed in, non-admin test user | 200 `[]` | 403 (42501) | 403 | — |

## Flags
26 `community_` flags inserted as `{"enabled": false}` (0 enabled). Total disabled Phase 2 flags: 102 → **128**. Setter rejects each with "Phase 2 community flags are disabled." (tested per flag).

## Egyptora AI
New "Egyptora Community (strict, no exceptions)" block in the concierge prompt covering all required prohibitions; `concierge-community.test.ts` (9 tests).

## Browser checks (really run)
- 16 page loads signed out: EN/AR × 390/1280 × 4 pages — HTTP 200, banner visible, 0px horizontal overflow, `dir=rtl` in Arabic, no page errors; authority guide shows "Official sources are being verified" / Arabic.
- Signed in (test non-admin user): hub loads with banner.
- Desktop 1536px: Government Directory menu lists Official Directory, Digital Government Services, Complaints & Services Guide, **Egyptora Community**, Emergency & Quick Numbers, Egypt Apps; click opens /community. Top-level items unchanged.
- Mobile 390px menu: item visible in the Government Directory accordion, opens /community.
- /government-directory: card and chip both link /community (2 links).
- Search: "community" → 4 results; "مجتمع" → 4 results (EN and AR UI).
- Form: empty submit shows error alert; fake submission (`prompt72@example.invalid`) shows success; stored `organisation_type` = `club or resort operator` (key), interests `[booking]`, status `new`; row deleted afterwards via privileged cleanup (count 0).
- Disclaimer `community-hub-disclaimer` exists as DRAFT; not published.

## Tests
Full suite: **317 passed, 0 failed, 36 files** (`bun test`). Build OK.

## AGENTS.md / roadmap
`src/lib/AGENTS.md`: "Community is Phase 1 informational; community_ flags stay disabled; community_authority_guides grants public columns to anon/authenticated without internal_notes; community_partner_interest is insert-only via the server function; no member data, cases or complaints." Matching roadmap entry added.

## Not done
- Header overlap at 1536px checked only via menu operation, not a pixel overlap measurement.
- Admin screens not exercised in a browser (no owner admin session).
