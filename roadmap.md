# Roadmap

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
