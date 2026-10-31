# Prompt 43 — Healthcare fixes from review: verification

Date: 2026-10-31. Maintenance mode stayed ON throughout; nothing published.

## Part A — Resource pages no longer show unrelated rows
- `getHealthResources` now filters government/app/event rows through `healthResourceMatcher` (EN+AR health terms; insurance page uses insurance-only terms). There is no fallback to "all rows" — no match means an empty list.
- Tests in `src/lib/health-public.test.ts`: EN match, AR match, unrelated entity rejected, insurance-only matching, no-match returns empty. All pass.

## Part B — Header
- `NavEntry.shortLabel` added; healthcare keeps the full label in the mobile menu and uses "Healthcare" on desktop. Removed the special two-line/max-width rule.
- Nav gap bump moved from 1440px to 1536px (real overlap found at exactly 1440px, fixed).
- Measured at 1280 / 1366 / 1440 / 1536 / 1920 / 1970 in EN and AR: all items one line (44px), no item-item, logo-item or search-item overlaps (direction-agnostic rect intersection).

## Part C — Visual
- Health hero is a navy gradient band with a gold icon, no image.
- Category cards use distinct Lucide icons (no repeated icon on one screen).
- Disclaimer is a shared component with an official emergency-numbers link and a "Read the full disclaimer" link.
- Resource pages with no matching rows show a shield icon + "Verified official links for this section are being added." + links to Government Directory, Egypt Apps and Emergency numbers. Search form is hidden when there is no source data.

## Part D — Egyptora AI
- System prompt moved to `src/lib/concierge-prompt.ts`; the API route imports it. Added healthcare rules: never diagnose or interpret symptoms, emergencies → official emergency numbers, no medicines/prescriptions/doses, no facility quality judgments, medical-travel → administrative form only, use exact tool-returned links, admit when listings are still being verified.
- Prompt links now include the four healthcare URLs; `extractPromptLinks()` derives the allowed-link allowlist from the prompt (also fixes the previous regex missing `www.` links).
- Six regression tests in `src/lib/concierge-health.test.ts` pass. These are structural prompt tests — live model responses were not exercised (no AI key in the dev sandbox).

## Part E — Health disclaimer page
- New legal doc #35 `health-disclaimer` in `src/data/legal.ts`: informational only, no doctor–patient relationship, independent private platform, listings & sources, third-party links, administrative forms only, emergencies, medical travel. Status DRAFT, `counselReviewRequired: true` (registry default) — **requires review by qualified Egyptian legal counsel before launch**; this text is not legally reviewed.
- Full Arabic translations in `src/i18n/health-translations.ts`.
- Footer legal column links to it; sitemap regenerated (`npm run sitemap`): 169 URLs, `/legal/health-disclaimer` included.

## Part F — Final QA
- `bunx tsgo --noEmit`: clean. Build log: OK.
- `bun test` health-public + concierge-health + health-validation + maintenance: 30 pass, 0 fail.
- Browser checks (Playwright): 12 health/legal pages × EN/AR — correct H1 and `dir` in both languages; 390px AR: no horizontal overflow on hub, insurance, disclaimer; `/live-in-egypt/healthcare` redirects to `/health`; no app console errors (only a blocked third-party tracker and stale Vite dev-module hashes mid-session).
- Forms: unchanged from Prompt 42 (already verified); no medical fields exist.
- Not verified: live AI responses (no key), real facility/specialty detail content (zero active records).

## Prompt 43b addendum — Arabic term matching
- `healthResourceMatcher` rewritten: Arabic matches whole tokens after light normalisation (tashkeel/tatweel stripped, أ/إ/آ→ا, ى→ي, ة→ه) with ال/و/ب/ل prefix stripping; English matches on word boundaries with same-stem suffixes. "دم"/"طب" match only as whole tokens.
- Events filter now uses the same matcher; apps match name/description only (the "Insurance & Tax" category label pulled in tax apps — removed from matching).
- Verified live: official-websites 1 genuine row, insurance empty state, apps 3 genuine health apps (eInvoicing/Real Estate Taxes gone). 14/14 tests pass, tsgo clean.
