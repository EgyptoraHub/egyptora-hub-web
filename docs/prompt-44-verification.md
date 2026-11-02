# Prompt 44 — Verification

Date: 2026-11-02. Maintenance gate unchanged (still ON). No data, migrations, RLS, routes or copy changes. Nothing published.

## Files changed

- `src/components/layout/MainNav.tsx` — desktop nav breakpoint raised from `xl` (1280px) to `2xl` (1536px); below 1536px the hamburger menu is used. Container at 2xl widened to `max-w-[1800px]` with `px-6`; currency switcher and notifications bell in the header now appear only at ≥1900px (they remain available in the mobile menu); logo wordmark/tagline classes retargeted from `xl` to `2xl`.
- `src/lib/health-public.ts` — new `formatHealthLocation(governorate, city)`: shows "Governorate, City", or the governorate once when the city matches after normalisation (case/trim, tashkeel/tatweel removed, أإآ→ا, ى→ي, ة→ه) or is a known spelling variant (Asyut/Assiut, both directions).
- `src/components/health/HealthShared.tsx` — facility cards use `formatHealthLocation` (was `{governorate} {city}` side by side).
- `src/components/health/HealthPages.tsx` — facility detail page: the whole "Specialties" section (heading + empty state) is hidden when the facility has no linked specialties. The empty state on `/health/specialties/<slug>` (facility list) is unchanged.
- `src/lib/health-public.test.ts` — 5 new test cases for `formatHealthLocation`.

## Problem 1 — Nav overlap, per-width results

Measured with Playwright (bounding-box overlap check across logo, every nav item, and the right cluster; plus nav clipping check scrollWidth vs clientWidth). Root cause: the overlap reproduces in French/German (longer labels) — e.g. German needed ~973px of nav but had ~846px, so items spilled over the logo ("HUBome") and the search icon. English/Arabic did not overlap but were within ~14px of clipping at 1280px.

| Width | EN | AR | FR | DE |
|---|---|---|---|---|
| 1024 | hamburger, no overlap | hamburger, no overlap | hamburger | hamburger |
| 1280 | hamburger, no overlap | hamburger, no overlap | hamburger | hamburger |
| 1366 | hamburger, no overlap | hamburger, no overlap | hamburger | hamburger |
| 1440 | hamburger, no overlap | hamburger, no overlap | hamburger | hamburger |
| 1536 | desktop, no overlap, not clipped | desktop, clean | desktop, clean | desktop, clean |
| 1600 | desktop, clean | desktop, clean | desktop, clean | desktop, clean |
| 1920 | desktop, clean | desktop, clean | desktop, clean | desktop, clean |

Screenshots: `/tmp/browser/nav44/nav-en-1440.png`, `nav-en-1600.png`, `nav-ar-1440.png`, `nav-ar-1600.png` (header strip; 1440 shows logo + hamburger, 1600 shows the full desktop nav with "Healthcare" short label and clear gaps on both sides).

The Healthcare item keeps its short label ("Healthcare") in the desktop nav; the mobile menu still shows the full "Healthcare & Medical Services".

## Problem 2 — Duplicated location text

`formatHealthLocation` covers: Cairo/Cairo → "Cairo"; Alexandria/Alexandria → "Alexandria"; Asyut/Assiut → "Asyut" (and reverse); Gharbia/Tanta → "Gharbia, Tanta"; Arabic same-name (القاهرة/القاهره, أسيوط/أسيوط) → shown once; Arabic different (الغربية/طنطا) → both. Same logic applies in EN and AR because the card passes the localized governorate name and the matching city field.

Note: the facility **detail** page does not render a separate governorate/city line (only the free-text address field), so the fix applies to the cards; if a location line is added to the detail page later it should reuse `formatHealthLocation`.

## Problem 3 — Empty Specialties block

Code change verified by inspection and typecheck. Could not be verified visually with real data: there are currently zero active facilities, so no facility detail page renders. The empty state on `/health/specialties/<slug>` is untouched.

## Test results

- `bun test`: 39 pass, 0 fail (4 files) — includes the 5 new `formatHealthLocation` cases.
- `tsgo --noEmit`: clean.
- Build: OK (per build-errors.log).

## Could not verify

- Visual rendering of the deduplicated location text and the hidden Specialties block on a real facility (no active facility data exists; out of scope to add any).
- Signed-in header state (no session in this environment); the signed-in right cluster is narrower than or equal to the signed-out one at the breakpoints where the desktop nav shows.
