# Prompt 66 — Energy Materials verification

## Delivered scope
Independent EN/AR informational section, not a functioning marketplace. No top-navigation items changed. No new images, source-domain approvals, email automation, payments, uploads, purchasing, quotations, supplier verification or auctions. The existing Egyptora Hub and Egyptora AI identities remain unchanged. The other seven languages retain English fallback.

Pages: `/energy-materials`, `/energy-materials/disciplines`, `/energy-materials/official-bodies`, `/energy-materials/partner-interest`. Home and Do Business link to the section. Each page has a breadcrumb, under-development notice and link to legal document 40, `energy-materials-disclaimer`, still DRAFT. Engineering and Circular path cards share the same grid and styling. Disciplines contain only editorial categories, with hazardous-waste and copyrighted-standards notices.

`energy_materials` is a separate original-content availability gate shared by path gates, search and entry cards. It starts available because the prompt requires editorial pages and an official-bodies empty state before records arrive. No official-body records were imported or activated. This deliberately differs from Shipping's empty-directory 404 while keeping its common gate mechanism.

## Database and permissions
Applied `0042_energy_materials_phase1.sql`; schema presence checked against the live database. Migration contains no data-count assertions.

- `energy_official_bodies`: UUID id, unique slug, required EN/AR names and body type, optional bilingual summaries and source names, official/source URLs, verification date, languages, review state, active flag, sort order, private notes and timestamps. Defaults: `needs_check`, inactive. Trigger requires dated reviewed evidence and HTTPS official URL for activation; rejects future dates and PDF sources. Broad visitor grants revoked; public-column SELECT granted to anon/authenticated, excluding internal_notes. RLS permits only active editorial_reviewed/verified rows; administration uses the existing role-checked privileged central path.
- `energy_partner_interest`: UUID id, company/country/role, allowed unique disciplines array, contact name/email, message limited to 1000 characters, true consent, default `new` status, creation timestamp and private notes. All direct visitor privileges revoked. Server-only validated INSERT, no visitor SELECT/UPDATE/DELETE. Central admin configuration reads incoming fields as read-only, with editable status and private notes.

Real API results, repeated after implementation:

| Access | Public body IDs | Body internal_notes | Interest SELECT |
|---|---:|---:|---:|
| Signed out | 200, empty | 401 refused | 401 refused |
| Signed-in non-admin | 200, empty | 403 refused | 403 refused |

Initial API checks also refused direct interest INSERT, UPDATE and DELETE for both visitor roles. No private information was returned. No changes to Trade/Mobility permissions or flags.

Shared source warnings use `sourceUrlWarning` and the existing owner-approved allowlist. Energy source/official URLs are included in Data audit link coverage. Active-body hygiene audit includes source names, required EN/AR names, evidence and `verified_on`.

## Permanently disabled flags
20 new switches, all inserted disabled and read back disabled, bringing the total from 82 to **102**. A no-op enforcement query confirmed no Energy switch needed correction. Every switch has an individual setter-rejection test; exact rejection: `Phase 2 energy flags are disabled.` Admin panel displays disabled infrastructure-only switches.

```
energy_company_registration
energy_kyb_verification
energy_supplier_directory
energy_supplier_qualification
energy_inventory
energy_mto_upload
energy_mto_ai_analysis
energy_material_matching
energy_rfq
energy_offer_comparison
energy_price_intelligence
energy_logistics
energy_inspection
energy_surplus_listings
energy_scrap_classification
energy_auctions
energy_recycler_network
energy_subscriptions
energy_reports
energy_mobile_app
```

## Egyptora AI
Added the separate strict Energy prompt block and `concierge-energy.test.ts` (9 tests). It allows describing categories and pointing to official bodies, but forbids operating-platform claims; approving/verifying/ranking/recommending companies; implying operator/authority approval; prices, quotes or lead times; compliance verdicts; safe/non-hazardous waste verdicts; future dates; alternate assistant names; external AI vendor/service implications; invented official bodies and confidential project details.

## Form verification
Both languages, signed out and signed in as a temporary non-admin, 390×844 and 1280×1800. Required inputs, valid email, allowed roles/disciplines, unique nonempty disciplines, message length and explicit consent validated client-side and server-side. No file fields, no documents and no emails. Empty discipline submission displays an error. Populated honeypot displays the safe retry error without saving. Valid submission displays a translated success statement without promising service.

Mirrored Trade's durable global advisory-lock rate limit: **30 submissions per minute**, enforced by the database trigger. Trade had no honeypot to copy; Energy uses the project's existing hidden-field pattern plus explicit server rejection, not a weaker replacement. No per-IP limiter is claimed. The 31st-submission boundary was not load-tested.

Browser retries created **24 disposable submissions**. Stored fields read back on deletion: role buyer/operator, discipline mechanical, consent true, status new. All 24 deleted through the privileged cleanup path; a second scoped deletion returned zero remaining rows. Cleanup was limited to the exact QA company, reserved `.invalid` emails and test message. No real company data was touched.

Admin viewing is wired into the existing authenticated, server-role-checked central content editor. Administrator UI and Data audit UI were **not exercised** because no matching owner account was available; the test account remained non-admin. No admin-success claim is made.

## Pages, search and tests
- Screenshots produced for all **32** required page combinations, plus translated form error/success states. EN and AR screenshots inspected; correct RTL and no horizontal overflow in the page assertions.
- Home and Do Business entry clicks verified. Existing top-navigation files untouched.
- Real search queries `energy` and `طاقة` each returned **4 Energy links**, including final signed-in Arabic checks. Search and all four paths use the same gate.
- Long browser run exceeded its command deadline after producing the required screenshots; final signed-in Arabic search, both entry clicks and DRAFT disclaimer were rechecked successfully in a short fresh run. No claim is made that the long runner returned a complete summary.
- Sitemap rebuilt only with `npm run sitemap`: **242 URLs**, including four Energy pages and the draft disclaimer under the existing legal sitemap mechanism.
- Full suite run **once**: initially **248 passed, 3 failed, 251 total, 30 files**. Failures were two existing total/gate expectations affected by Energy and one new rate-limit SQL test typo. Corrected those expectations and reran only the three affected files: **50 passed, 0 failed**. Thus all 251 tests have passing results, but a second full-suite run was intentionally not performed.
- Latest preview diagnostic: **build OK**. `git diff --check` passed.
- Four new routes have unique app-specific head titles/descriptions, matching OG fields, og:type and twitter:card through simpleHead. Home/Do Business metadata preserved. No page cover images were added.

## Files
New: migration 0042 and generated snapshot/types; energy-validation.ts, energy-public.ts, energy.functions.ts, energy-validation.test.ts, concierge-energy.test.ts; EnergyPages.tsx and EnergyPhase2Flags.tsx; energy-translations.ts; four Energy routes; this report.

Updated: central complaints validation/admin allowlist, Data audit, groundwork and disabled flags, path/nav availability, concierge prompt, Arabic dictionary, static search, sitemap generator and generated sitemap, homepage, Do Business, admin dashboard, generated route tree, migration journal, two existing tests, library AGENTS and roadmap. Tool-generated files were not hand-authored.

## AGENTS rule
Added only this short line to src/lib/AGENTS.md; shortened no existing line:

> Energy is Phase 1 informational; energy_ flags stay disabled; energy_official_bodies grants public columns to anon/authenticated without internal_notes; energy_partner_interest uses server-only inserts and role-checked central admin access — protects private interest details.

No publication. Disclaimer still requires Egyptian legal counsel review. Official bodies intentionally await Prompt 67.
