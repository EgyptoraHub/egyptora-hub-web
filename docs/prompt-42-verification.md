# Prompt 42 — Public healthcare verification

## Result
- Added 15 static healthcare URLs plus facility and specialty detail templates.
- Public reads use the publishable client and explicit safe columns; only active healthcare records appear. No schema migrations or catalogue activation were performed.
- All 17 checked paths (15 static plus two missing-detail paths) rendered in EN and AR at 1440px and 390px: 68 checks, no page errors, no horizontal overflow.
- All three inquiry types and the support report were submitted through the real public UI. Database readback confirmed `new` status and consent for inquiries. Temporary test submissions were deleted, with zero remaining confirmed.
- Missing consent blocked submission. Simulated connection failure displayed a recoverable error. No upload controls exist.
- Search quick filter reached `/health/find-care` with the real Cairo ID (`gov-cairo`). Legacy healthcare URL reached `/health`; site search returned 15 health static links.
- Homepage widget checked in EN/AR desktop/mobile. Hamburger remains below 1280px. EN/AR headers visually checked at 1280, 1440 and 1970px; healthcare label wraps without overlap.
- Sitemap regenerated: 168 URLs, including 15 healthcare static pages. No empty facility/specialty detail URLs added.
- 21 healthcare/maintenance unit tests passed. Preview build log reported build OK.
- Maintenance remained ON. Nothing was published. Head changes reach the published website only after a future publish.

## Decisions and limitations
- There are zero active facilities and zero active specialties. The 18 foundation specialties remain inactive. Consequently, real facility/specialty detail rendering and facility-specific report submission cannot be verified against a public real row; missing/hidden paths correctly show the shared verification state. No invented row was added for testing.
- Mother & Child uses existing `obstetrics-gynecology`/`pediatrics` specialties. Chronic Care matches `internal-medicine`, `endocrinology`, `cardiology` and `nephrology` if those active specialties exist; no catalogue additions.
- Health Apps uses the existing health app category. Official Websites/Insurance reuse only health-category government rows. If there is no health category, they offer search over existing records and the original directory link.
- Existing events have category/tags and start_date. Only future health/blood-tagged records are included; empty campaigns link to Events.
- Licensed/Accredited labels require the exact corresponding positive status (`licensed`/`accredited`), a valid separate source URL and a review date. Unknown/pending/negative statuses never receive those labels.
- Reports also require explicit consent in the UI/server validator; their existing table has no consent column, so consent is validated but not stored there. Inquiry consent is stored.
- The medical-travel journey is explicitly conditional information, not an assertion of existing provider partnerships or guaranteed service.
- The other seven languages use the existing English fallback. They are not newly reviewed translations. Existing i18n coverage script passed for its previously tracked sections; it does not audit this new section.
- Existing signed-in administrator verification blockers from Prompts 41/41b remain unchanged and outside this public-page task.

## Files changed/added for this task
- `AGENTS.md`
- `roadmap.md`
- `scripts/generate-sitemap.mjs`
- `public/sitemap.xml` (generated)
- `src/lib/health-public.ts`
- `src/lib/health-public.test.ts`
- `src/lib/health.functions.ts`
- `src/components/health/HealthShared.tsx`
- `src/components/health/HealthForms.tsx`
- `src/components/health/HealthPages.tsx`
- `src/data/navigation.ts`
- `src/components/layout/MainNav.tsx`
- `src/components/layout/SiteFooter.tsx`
- `src/i18n/health-translations.ts`
- `src/i18n/dictionary.ts`
- `src/routes/index.tsx`
- `src/routes/live-in-egypt.tsx`
- `src/routes/live-in-egypt_.healthcare.tsx`
- `src/routes/search.tsx`
- `src/routes/health.tsx`
- `src/routes/health_.find-care.tsx`
- `src/routes/health_.find-care_.$slug.tsx`
- `src/routes/health_.specialties.tsx`
- `src/routes/health_.specialties_.$slug.tsx`
- `src/routes/health_.services.$type.tsx`
- `src/routes/health_.official-websites.tsx`
- `src/routes/health_.apps.tsx`
- `src/routes/health_.insurance.tsx`
- `src/routes/health_.blood-donation.tsx`
- `src/routes/health_.medical-travel.tsx`
- `src/routes/health_.projects-research.tsx`
- `src/routes/health_.support.tsx`
- `docs/prompt-42-verification.md`

Project healthcare memory and its index were also updated with the enduring scope constraints.
