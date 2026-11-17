# Prompt 55 — Education Hub verification

## Migrations
- `drizzle/migrations/0032_education_platforms_foundation.sql`: `education_platforms` (all requested columns), RLS (visitors: active + editorial_reviewed/verified; admins: all), column-level anon grants without `internal_notes`, trigger `validate_education_platform` (activation needs source URL + date + reviewed status + HTTPS official URL; fee needs `fee_source_url`; `accredited` needs `accreditation_source_url`; PDF and non-http(s) sources rejected), `touch_updated_at` trigger.

## Data / privileged path
- `education_platforms`: 0 rows (no data in this prompt; nothing activated).
- 15 education Phase 2 flags inserted as `{"enabled": false, "phase": 2}` via the **privileged database path** (explicitly allowed by this prompt), `ON CONFLICT DO NOTHING`. One `audit_log` entry: `feature_flag.seed` / `site_settings`, `{count: 15, method: "privileged", prompt: 55}`.
- Flags: 28 → **43**, 0 enabled.

## Files changed
- New: `src/lib/education-validation.ts`, `src/lib/education-public.ts`, `src/lib/education.functions.ts`, `src/components/education/EducationPages.tsx`, `src/components/admin/EducationPhase2Flags.tsx`, `src/routes/education.tsx`, `src/routes/education_.platforms.tsx`, `src/i18n/education-translations.ts`, `src/lib/education-validation.test.ts`, `src/lib/concierge-education.test.ts`.
- Edited: `phase2-flags.ts` (education flags + "Phase 2 education flags are disabled."), `complaints-validation.ts` (`GUIDE_TABLES` dispatch; `COMPLAINTS_TABLES` unchanged), `admin-content.config.ts` (Education platforms, filters, CSV import), `admin-content.functions.ts`, `complaints-import.functions.ts`, `admin.content.$table.tsx`, `admin.index.tsx`, `data-audit.functions.ts` + test (4 link fields), `concierge-prompt.ts` (Education block), `legal.ts` (`education-guide-disclaimer`, DRAFT, counsel review required), `navigation.ts`, `live-in-egypt.tsx`, `dictionary.ts`, `scripts/generate-sitemap.mjs`. `EGYPTIAN_SOURCE_ALLOWLIST` not changed; `education-research` complaint sector untouched.

## Signed-out checks
- `internal_notes` on `education_platforms`: 401. Public select: `[]`. Anon insert: 401. Anon flag update: no row changed (value stays disabled); server guard rejects all 15 education flags (tests).
- `/education` EN/AR at 390 and 1280: 200, only "Universities & programmes" card, document width = viewport width.
- `/education/platforms`: 404 "Page not found" while empty.
- Live in Egypt "Education & Schools" (chip + card) and the menu item → `/education`.

## `/research-programs` references left untouched
- Live in Egypt: "Students" stage card, "International Schools Directory" quick tool.
- Main menu "Education & Research" (Invest), invest-in-egypt chip + "Education" card, investment-opportunities "Education & research" chip, home page "Education" icon and card, Government Directory "Educational Institutions" chip, government.functions.ts entity mapping, health "Projects & Research", saved items.

## Sitemap and tests
- Sitemap 231 → **233** (`/education` + legal page `education-guide-disclaimer`; `/education/platforms` excluded while empty).
- Full suite: **139 passed, 0 failed**. Typecheck clean.
- Not published; maintenance unchanged.
