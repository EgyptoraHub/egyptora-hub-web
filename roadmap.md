# Roadmap

## Prompt 45 — Trade foundation
- [ ] Add seven protected tables and disabled Phase 2 flags, without public content or routes.
- [ ] Extend central admin, validated CSV preview/import, inquiries, audit and bilingual text.
- [ ] Verify database access/activation/consent, full tests, type check and document results.

## Prompt 44e — Currency switcher next to language switcher
- [x] Currency switcher in header from 1536px up; bell stays in "…" popover 1536–1899px; "…" hidden when signed out.
- [x] FR/DE 1536px overflow fixed by tightening fluid nav gap to ~0px and right-cluster/container gaps below 1700px; no language-specific hamburger fallback needed.
- [x] 24 automated checks (6 widths × EN/AR/FR/DE) pass; 39 tests, 0 failures; docs/prompt-44e-verification.md saved.
- [ ] Verify signed-in bell/"…" spacing — blocked by no requesting-user app account/session; needs intended user preview sign-in.

## Prompt 44d — Fluid header spacing
- [x] Preserve labels/font sizes; use equal fluid nav gaps and a single flexible gap before controls, with 16px controls and 24px before auth from 1700px.
- [x] Test EN/AR/FR/DE at six requested widths; also test every integer width 1536–1699px in FR/DE. All fit; no language-specific fallback needed.
- [x] Save measured gaps and limitations in docs/prompt-44d-verification.md; full suite: 39 passed, 0 failed.
- [ ] Verify signed-in My dashboard/bell spacing — blocked by no requesting-user app account/session; needs intended user preview sign-in.

## Prompt 44c — Desktop header spacing
- [x] Start desktop navigation 24px after the logo; distribute space between entries and use 10px right-hand control gaps without changing breakpoints.
- [x] Check EN/AR/FR/DE signed out at 1536, 1600, 1700, 1899, 1920 and 2200px; 24 combinations passed with 24px section gaps and working currency selection.
- [x] Run the test suite: 39 passed, 0 failed; save docs/prompt-44c-verification.md.
- [ ] Verify real signed-in dashboard/bell spacing — blocked because no app account matches the requesting user; requires intended user's preview sign-in.

## Prompt 43 — Healthcare fixes from review
- [ ] A) Remove fallback-to-all rows on /health/insurance, /health/official-websites, /health/apps; term-matched rows only, empty state with directory links, no search box when empty; tests.
- [ ] B) Nav: single-line "Healthcare" top label, remove multi-line special case, no overlaps at 1280–1970 in EN/AR (screenshots).
- [ ] C) /health hero → navy gradient (no image); disclaimer copy fix + "Read the full disclaimer" link; distinct icon per category card.
- [ ] D) Concierge: health section links + no-medical-advice rules in system prompt, allowed-links fix, 6 regression tests.
- [ ] E) Legal doc "Health Information Disclaimer" (EN+AR), footer link, sitemap, docs note that it needs owner/legal review.
- [ ] F) Final QA: all /health routes EN/AR desktop+390px, forms, redirect, docs/prompt-43-verification.md. Maintenance ON, no publish.

## Prompt 42 — Public healthcare
- [x] Build public healthcare routes, active-only directory, sourced detail pages and shared disclaimer.
- [x] Add validated public report/inquiry forms with consent and no medical uploads; real submissions read back and test rows removed.
- [x] Wire navigation, homepage search, footer, legacy redirect, translations, search and sitemap.
- [x] Verify 68 EN/AR desktop/mobile route checks, public forms and 21 rule tests; maintenance remains ON, not published. Full file list/decisions: docs/prompt-42-verification.md.
- [ ] Verify real facility/specialty detail content and facility-specific report — blocked by zero active catalogue rows; no records invented or activated.

## Prompt 41b — Maintenance separation
- [x] Separate preview/public maintenance visibility and remove static bypass.
- [x] Require authenticated server-verified admin toggles without a password; preserve the current flag (ON).
- [x] Verify host rules, signed-out RPC rejection, translated EN/AR badge and Preview visibility; seven rule tests pass.
- [ ] Verify signed-in admin bypass, confirmation and audit actor end-to-end — requesting user has no matching auth account; needs intended admin sign-in. No toggle applied during verification.

## Prompt 41 — Healthcare foundation
- [x] Restore only the chat avatar import (visual verification blocked by existing maintenance screen).
- [x] Add protected healthcare schema, inactive specialty seeds and disabled Phase 2 flags.
- [x] Register admin editing/import, activation validation and data audit coverage.
- [x] Add public-only concierge search groundwork and Phase 2 scope note.
- [x] Verify public permissions, submission limits, database activation guard and build; remove temporary submissions.
- [ ] Verify signed-in admin editing/import and visible avatar — blocked by no requesting-user auth account and existing maintenance screen; user must sign in as their intended admin account.

## Done
- [x] Six detail pages (properties, providers, offers, investment opportunities, countries, products): hardened loaders, graceful not-found, SEO meta, fully translated labels, linked from each list page. Verified with real and invalid ids.

## Prompt 23 — repo rename + dev onboarding docs
- [x] Part 1: repo renamed to EgyptoraHub/egyptora-hub-web (same repo ID, history preserved). User to click Re-check in Project settings → Git.
- [x] Part 2: README.md rewritten + docs/ (architecture, data-model, known-limitations, environment). Documentation only.

## Pending
- [ ] Machine-translate database content (all content tables) into the 9 supported languages, stored so the switcher swaps content text too. Report summary before publishing.

## Redesign (8-page template system)
- [x] Step 1: 8-item top nav with 5 dropdown menus (desktop + mobile accordion, RTL-safe).
- [x] Step 2: shared interior template (PageTemplate/HeroSearch/CategoryTabs/FeaturedRow/ExploreGrid/SidebarWidgets) proven on /properties.
- [ ] Step 3: Government Directory through the template (awaiting user review).
- [ ] Steps 4-9: Invest, Explore Egypt, Visit Egypt, Do Business, homepage slim-down, Live in Egypt + Digital Gov Services, RTL/mobile pass.

## Blocked
- [ ] Custom email sending domain (notify.egyptora-hub.com) — DNS records pending; after verification, switch auth emails to own domain and re-enable email confirmation.

## Payments (Trip Builder bookings)
- [x] Price-column audit: only providers (price_from/currency USD), properties (price_usd) and investment_opportunities (min/max USD) hold real prices.
- [x] bookings table extended: amount, currency, stripe_session_id, stripe_payment_intent_id, paid_at.
- [x] "Request booking" action on provider detail page; records provider price_from as amount in USD.
- [ ] BLOCKED: Stripe test checkout + webhook — Lovable built-in payments unavailable for seller country EG; needs the user's own Stripe test key (BYO) or a non-EG seller entity.
- [x] Homepage rebuild (Prompt 3) with photos cropped from mockups

## Prompt 9 — mockup fidelity
- [x] Desktop nav row, shorter heroes, bold navy icons, dense card grids, save hearts, homepage/Invest/Do Business/Visit fixes. Unpublished.

## Prompt 29 — safe groundwork
- [x] Translations for Prompt 24–27 page texts (7 languages), coverage script
- [x] Concierge knows new sections, public-only search, link guard, usage log
- [x] Audit log, points ledger, culture links, licence fields, AI usage log, trip preview videos, flags (all off), webhook skeleton, notes leak closed
- [x] Account deletion server functions (no UI yet — awaiting design decision)
- [ ] WEBHOOK_SHARED_SECRET not set (only needed when a provider is chosen)

## Prompt 30 — Coming soon Wave 1
- [x] Reverted in Prompt 30b: guide hubs removed, 8 items back to Coming soon (20)

## Prompt 43 — Healthcare review fixes
- [x] Resource pages filter by health terms (EN+AR); no fallback to unrelated rows
- [x] Header: short "Healthcare" desktop label, full label in mobile menu, no overlaps 1280–1970 EN/AR
- [x] Navy gradient hero, distinct category icons, disclaimer with emergency + full-disclaimer links, honest empty states
- [x] Concierge health safety rules + link allowlist from prompt; 6 regression tests
- [x] Legal doc #35 health-disclaimer (DRAFT, counsel review required) + footer link + sitemap
- [x] QA: tsgo clean, 30 tests pass, 12 pages EN/AR + 390px + redirect verified
- [ ] Health disclaimer text needs qualified Egyptian legal counsel review before launch
- [ ] Live AI concierge responses not exercised (no AI key in dev sandbox)

## Prompt 43b — Arabic term matching fix
- [x] English-only reply rule saved (mem://reply-language.md + index Core + AGENTS.md)
- [x] healthResourceMatcher: whole-token Arabic matching (tashkeel/tatweel strip, alef/ى/ة normalisation, ال/و/ب/ل prefixes) + English word-boundary stem matching
- [x] Events filter uses the same matcher; apps match name/description only (category labels like "Insurance & Tax" are not health-specific)
- [x] 14 tests pass (incl. all required must-match / must-not-match cases); tsgo clean; pages verified EN/AR
- [x] Prompt 44 — nav overlap fix (breakpoint 2xl, wider container) + health location dedup + empty Specialties hidden; docs/prompt-44-verification.md
