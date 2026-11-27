# Prompt 74 — Justice & Legal Services Guide: verification

## Files
New: `drizzle/migrations/0044_justice_phase1.sql` (+ journal/snapshot), `src/lib/justice-validation.ts`, `src/lib/justice-public.ts`, `src/lib/justice.functions.ts`, `src/i18n/justice-translations.ts`, `src/components/justice/JusticePages.tsx`, `src/components/justice/JusticePhase2Flags.tsx`, `src/routes/justice.tsx`, `src/routes/justice_.service-areas.tsx`, `src/routes/justice_.services-guide.tsx`, `src/lib/justice-validation.test.ts`, `src/lib/concierge-justice.test.ts`.
Edited: `path-gates.ts`, `nav-availability.ts` (gate `justice`, always on), `phase2-flags.ts`, `groundwork.functions.ts`, `complaints-validation.ts` (GUIDE_TABLES + slug match key), `admin-content.config.ts`, `data-audit.functions.ts` (source-link + hygiene), `concierge-prompt.ts`, `src/data/navigation.ts`, `gov-directory-chips.ts`, `routes/government-directory.tsx` (card), `routes/admin.index.tsx` (flags panel), `search-index.generated.ts`, `scripts/generate-sitemap.mjs` (+ excludes the draft justice disclaimer) and `public/sitemap.xml`, `src/data/legal.ts` (doc 42 DRAFT), `i18n/dictionary.ts`, `src/lib/AGENTS.md`, `roadmap.md`; tests `nav-availability`, `gov-directory-chips`, `search-gating`, `shipping-validation`, `community-validation` (count assertions excluding `justice_`).

## Pages
`/justice`, `/justice/service-areas`, `/justice/services-guide` — EN/AR, breadcrumb Home > Government Directory > Justice & Legal Services Guide, banner on every page, concept/no-affiliation line and draft disclaimer link in the section footer. Services guide shows "Official sources are being verified".

## Table `justice_service_guides`
Columns as specified (service_area: 8 values). Trigger: no future date, no PDF, HTTPS official URL, activation needs source + date + reviewed status. Broad grants revoked; column SELECT to anon + authenticated without `internal_notes`; RLS shows only `is_active` and editorial_reviewed/verified; admin ALL via `has_role`. No data asserts, no rows.
Real API (27 Nov 2026): signed out `select=id,slug` 200 `[]`, `select=internal_notes` 401 (42501). Signed in disposable non-admin test user: 200 `[]`, `internal_notes` 403 (42501).

## Flags
25 `justice_` flags inserted as `{"enabled": false}` (DB: 25 rows, 0 enabled). Total disabled Phase 2 flags 128 → **153**. Setter rejects each with "Phase 2 justice flags are disabled." (tested per flag). Read-only admin panel added.

## Egyptora AI
New strict block before Energy Materials covering all listed prohibitions; `concierge-justice.test.ts` (12 tests, incl. no "Maat").

## Browser checks (Chromium, real)
- Signed out, EN/AR × 390/1280 × 3 pages (12 loads): 200, banner visible, 0px horizontal overflow, lang/dir correct (ar/rtl), 0 page errors; services guide empty state in all 4.
- Signed in (test non-admin), EN 1280: 3 pages load with banner.
- Hub links: Complaints guide, Official Directory, Emergency numbers, both cards → correct paths.
- `/government-directory` (1280): chip + card (2 `/justice` links), Community still 2 links; card opens `/justice`. Chip sits after Egyptora Community.
- Desktop 1536: 9 top-level items unchanged (Home … About), header overflow 0px, Justice item in Government Directory menu opens `/justice`.
- Mobile 390: accordion shows Justice item after Egyptora Community, opens `/justice`.
- Search: "justice", "legal", "عدالة" each return all 3 pages.
- `/legal/justice-guide-disclaimer` shows DRAFT.

## Sitemap
250 URLs (was 247): +3 justice pages; draft disclaimer excluded.

## AGENTS.md / roadmap
`src/lib/AGENTS.md`: "Justice is Phase 1 informational; justice_ flags stay permanently disabled; justice_service_guides grants public columns to anon/authenticated without internal_notes; no legal advice, cases, complaints or personal data." Matching roadmap entry added.

## Tests
`bun test`: 364 passed, 0 failed, 38 files. Build OK.

## Not done / limits
- Admin screens (content manager, flags panel) not exercised in a browser: no owner admin session.
- Header overlap at 1536 checked by overflow measurement and screenshot only, not pixel-by-pixel.
- Arabic pages at 1280 inspected visually for the hub only; other Arabic layouts verified by DOM checks.
