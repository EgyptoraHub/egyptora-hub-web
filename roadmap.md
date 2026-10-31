# Roadmap

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
