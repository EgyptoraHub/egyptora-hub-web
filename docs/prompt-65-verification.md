# Prompt 65 — Verification

## Scope and files changed

Code-only cleanup. No data writes, migrations, new pages, flags, activation, search-engine changes, image changes or publication. The public site remains in maintenance; signed-out checks below refer to the running preview, where visitor pages remain inspectable.

- `src/lib/protected-areas.ts` — sole new approved domain and approval comment.
- `src/lib/protected-areas.test.ts` — four EgyptAir Cargo regression tests.
- `src/lib/format-languages.ts` and `src/lib/format-languages.test.ts` — shared formatter and four tests.
- `src/components/shipping/ShippingPages.tsx`, `src/components/education/EducationPages.tsx`, `src/components/real-estate/RealEstatePages.tsx` — formatted language names.
- `src/routes/do-business_.shipping-logistics.tsx` — parent breadcrumb.
- `src/data/search-index.generated.ts` — only the shipping directory description extended.
- `src/lib/AGENTS.md` — one requested shipping table rule.
- `roadmap.md` and this report — task verification.
- Project memory updated with the owner-approved domain and date.

## Egyptian-source allowlist

Added only `egyptair-cargo.com`, including hostname-boundary subdomain matching under the existing rule. Comment records owner approval on 22 Nov 2026, the official EgyptAir Cargo site and record `egyptair-cargo`.

Tests accept the exact host and `www.egyptair-cargo.com`, reject `egyptair-cargo.com.example.org` and `notegyptair-cargo.com`, and continue warning about PDFs on the approved domain. Existing EgyptERA tests remain unchanged.

Read-only database inspection found exactly 11 shipping records, all active and editorial_reviewed. A real signed-out visitor read also returned 11 rows. Applying the same `sourceUrlWarning` used by Data audit to all three shipping link fields (`source_url`, `official_url`, `fee_source_url`) returned **0 warnings**. Both EN and AR card views show no warning, including EgyptAir Cargo.

**Audit limitation:** The authenticated Data audit screen was not exercised: no app account matches the requesting owner, so self-session minting failed. No other user was impersonated or role granted. The 0-warning result is a read-only check of all 11 live rows using the audit’s actual shared warning function, not a claim of admin-screen verification.

## Shared language helper

`formatLanguages(value, lang)` maps `ar`/`en` to `Arabic`/`English` or `العربية`/`الإنجليزية`, trims comma-separated input, uses comma-space in English and Arabic-comma-space in Arabic, preserves unknown codes, and returns undefined for empty values. Other UI languages retain English fallback.

Used in all three requested platform card lists, with `dir="auto"` so translated names have their natural direction and an unknown-code-only string remains LTR. Tests cover both languages, single and multiple codes, unknown-code preservation, English fallback and empty/null/undefined input. No stored language values changed.

## Breadcrumb before / after

- EN before: Home > Shipping & Logistics.
- EN after: Home > Do Business > Shipping & Logistics.
- AR after: الرئيسية > ممارسة الأعمال > الشحن والخدمات اللوجستية.
- Uses the existing `InnerPage.parent` option and shared `Crumbs`, also used by the platforms page. Platforms breadcrumb remains Home > Do Business > Shipping & Logistics > Official shipping & trade websites (and Arabic equivalent).

## Signed-out search results

Only the directory entry `desc` changed; both shipping paths retain their existing path gates. New factual EN/AR text names customs, Nafeza, ports, dry ports, Suez Canal, railways, post, air cargo, civil aviation and Alexandria. No airport synonym or Arabic singular ميناء was added beyond the requested factual text.

| Language | Query | Total results | Shipping results |
|---|---|---:|---|
| EN | cargo | 1 | Official websites directory |
| EN | railway | 1 | Official websites directory |
| EN | airport | 0 | None |
| EN | port | 34 | Hub; Official websites directory |
| EN | customs | 4 | Hub; Official websites directory |
| EN | Nafeza | 1 | Official websites directory |
| EN | Suez | 3 | Official websites directory |
| EN | post | 1 | Official websites directory |
| AR | شحن | 2 | Hub; Official websites directory |
| AR | سكة حديد | 1 | Official websites directory |
| AR | مطار | 0 | None |
| AR | ميناء | 0 | None |
| AR | جمارك | 1 | Official websites directory |
| AR | نافذة | 1 | Official websites directory |
| AR | قناة السويس | 3 | Official websites directory |
| AR | بريد | 2 | Official websites directory |

The existing matcher uses substrings, not whole words or stemming. `port` returned 34 results, including non-shipping “Support”, “Passport Renewal” and “Digital Egypt Portal”. `airport` and مطار returned 0: static search does not index full shipping card contents. ميناء returned 0 because it does not substring-match the plural الموانئ. No search-engine changes were made.

### Exact returned titles

- **EN / cargo**: Official shipping & trade websites.
- **EN / railway**: Official shipping & trade websites.
- **EN / airport**: No results.
- **EN / port**: Shipping & Logistics; Official shipping & trade websites; Support; Diving in Hurghada; 24/7 Support; Infrastructure & Transportation; Investment Opportunities; Infrastructure; Sectors & Opportunities; Supportive Government; Automotive and transport components; Mega Projects; Operate & Grow; Solar Energy Project; Tourism Development; Agri-Food Processing; Transportation & Mobility; Public Transportation Guide; Professionals; Live in Egypt; Transport; Passport Renewal; Ministry of Local Development and Environment (Environment portfolio) - see EEAA; Ministry of Social Solidarity; Suez Canal Economic Zone (SCZone); Transport & Traffic; Digital Egypt Portal; Business Registration Portal; Traveling Abroad; Apply Online; Digital Government Services; Opportunities for All; Egypt's Growing Investment Opportunities; Aligned with Egypt Vision 2030.
- **EN / customs**: Shipping & Logistics; Official shipping & trade websites; Customs Clearance; Tax & Customs.
- **EN / Nafeza**: Official shipping & trade websites.
- **EN / Suez**: Official shipping & trade websites; Suez Canal Authority (SCA); Suez Canal Economic Zone (SCZone).
- **EN / post**: Official shipping & trade websites.
- **AR / شحن**: الشحن والخدمات اللوجستية; مواقع الشحن والتجارة الرسمية.
- **AR / سكة حديد**: مواقع الشحن والتجارة الرسمية.
- **AR / مطار**: No results.
- **AR / ميناء**: No results.
- **AR / جمارك**: مواقع الشحن والتجارة الرسمية.
- **AR / نافذة**: مواقع الشحن والتجارة الرسمية.
- **AR / قناة السويس**: مواقع الشحن والتجارة الرسمية; Suez Canal Authority (SCA); Suez Canal Economic Zone (SCZone).
- **AR / بريد**: مواقع الشحن والتجارة الرسمية; Food, packaging and cold chain.

## Report-only static shipping mentions

| Location / mention | Signed-out preview visibility | Existing wording |
|---|---|---|
| Do Business sector tile | Hidden: targets the unavailable investment-opportunities page; shared card gate removes it | “Logistics & Transportation” |
| Do Business story | Hidden: same target gate; all story cards are gated so the section is omitted | “Logistics Hub” / “Connecting regional markets.” / badge “Example” |
| Invest featured project | Hidden: investment-opportunities gate | “Ain Sokhna Industrial Zone” / “Industrial & logistics hub” / location “Suez” / badge “Industry” |
| Invest sector card | Hidden: investment-opportunities gate | “Infrastructure” / “Transport, ports and logistics” |
| Invest sector chip | Hidden: investment-opportunities gate | “Infrastructure & Transportation” |
| Egyptian Cotton highlight | Visible, no gate on the static highlight | “Global shipping” / “Duty-friendly export packs for visitors.” |
| Handmade Crafts highlight | Visible, no gate on the static highlight | “Safe shipping” / “Fragile-safe packing for ceramics and glass.” |

The Marketplace sections have an existing separate DEMO badge in their statistics band, but the shipping highlights are not individually gated. These mentions and their pages were not edited. Actual signed-out browser reads confirmed the above visible/hidden states. On the closed published site visitors instead see maintenance.

### Shipping hero image rights

`trade-suez.jpg` is not individually recorded in `docs/image-rights-inventory.md` or `src/lib/generated-images.ts`. The generated Suez image entries concern other files, not this hero. A separate credit record exists in `src/data/photo-credits.json`: author **Aah-Yeah**, licence **CC BY 2.0**, title “Evergreen container ship in Suez Canal (4171874814).jpg”, source https://commons.wikimedia.org/wiki/File:Evergreen_container_ship_in_Suez_Canal_(4171874814).jpg. Thus a credit/source exists elsewhere, but not in either of the two specifically requested files. The image was not changed.

## AGENTS.md line

Added one line to the existing `src/lib/AGENTS.md`:

> shipping_platforms: grant public columns to anon and authenticated, never internal_notes; show only active, reviewed rows; Phase 1 is informational only — preserves visitor safety.

The root `AGENTS.md` has only 28 bytes remaining in its enforced 8192-byte budget. To obey “shorten no existing line”, it was left unchanged; the rule is recorded in the existing library-specific AGENTS.md instead. No other architectural rule was added.

## Verification results

- Signed out: EN and AR at 390×844 and 1280×1800, four pages each: **16 page checks passed**.
- Shipping directory: 11 cards, no source warnings, translated language names on all 11.
- Education: 13 cards with language names; Real Estate: 3 cards with language names.
- Hub and directory breadcrumbs verified in both languages. No horizontal scroll on any of the 16 checks.
- 16 real `/search?q=` navigations completed; returned result titles and totals above.
- Browser runtime errors: **0**. Screenshots inspected for EgyptAir Cargo in both languages, hub breadcrumbs and Arabic Education/Real Estate views.
- Full suite run once: **208 passed, 0 failed, 28 files** (`bun test ./src`); includes eight new tests.
- Latest preview build log: **build OK**. `git diff --check` passed.
- Content-route metadata inspected: the two shipping routes and Education/Real Estate directory routes use app-specific titles, descriptions, Open Graph fields, og:type and twitter:card via `simpleHead`; home metadata remains app-specific and unchanged.
- No publishing, data changes or administrator audit-screen verification.
