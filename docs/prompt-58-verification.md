# Prompt 58 — Real Estate & Property Hub verification

## Step 0 — Existing disclaimers (report only)
Signed-out EN and AR checks found these existing static Legal Center documents visible (HTTP 200):
- `/legal/health-disclaimer` — Health Information Disclaimer.
- `/legal/complaints-guide-disclaimer` — Complaints & Government Services Guide Disclaimer.
- `/legal/education-guide-disclaimer` — Education Guide Disclaimer.
- `/legal/investment-disclaimer` — Investment Disclaimer, the existing investment-related document.
- `/legal/genetic-scientific-disclaimer` — Genetic & Scientific Information Disclaimer, the existing scientific/research-related document.

There is no dedicated trade or research disclaimer document in `src/data/legal.ts`: `/legal/trade-guide-disclaimer` and `/legal/research-disclaimer` return 404. These are missing documents, not documents hidden by migration 0034. The existing Legal Center reads its static document collection, not `legal_document_versions`; its visible drafts remain visible. The initial browser attempt ran before hydration and showed blank HTML; visibility results above were rechecked after waiting for the actual headings. No legal-version policy was altered.

## Schema and implementation
- `0035_real_estate_platforms_foundation` creates the requested platform fields, default needs_check/inactive state, admin editing policy, active-reviewed visitor policy and evidence/HTTPS/non-PDF/date/fee-source validation trigger.
- Public read helpers project explicit public columns; the new table shares GUIDE_TABLES admin editing and CSV validation, slug matching and forced inactive creation. Three link fields added to Data audit.
- Live permission verification discovered inherited anon full-table SELECT on the newly created table. Additive migration `0036_restrict_real_estate_visitor_columns` explicitly revokes that grant and restores only public-column SELECT. Final visitor internal_notes access is refused (401).
- `/real-estate` retains its original hero image and InnerPage template, replacing listings, prices, market/lifestyle claims, map and providers services with the informational notice and two public-data-gated cards. No Listings card or property search.
- `/real-estate/platforms` uses a public-data loader, not-found on empty public results, bilingual cards, search and category controls; source and official links retain exact stored hrefs and open with noopener noreferrer.
- Draft #38 `real-estate-guide-disclaimer` is linked from the notice, requires counsel review and remains DRAFT.
- All 18 new Phase 2 flags are disabled and rejected by the shared change guard. Read-only admin panel added. No transactional property structures or code paths added.
- Egyptora AI real-estate restrictions added with six focused tests. Existing properties/offers/investment_opportunities/providers tables and pages were not edited. Navigation entries remain unchanged.

## Data delivery and path
CSV files saved verbatim under `docs/prompt-58-data/`.
The requesting user's admin session could not be minted (no matching app account), so the explicitly permitted **privileged database path** was used, only after both shared validated dry-runs passed with zero rejected rows. SQL inserts were generated from the preview payloads; activation payloads also passed shared validation. No bypass of validation.

| Table | Received | Created | Updated | Rejected | Final editorial_reviewed / active | Final needs_check / inactive |
|---|---:|---:|---:|---:|---:|---:|
| real_estate_platforms | 3 | 3 | 0 | 0 | 3 | 0 |
| procedure_guides (new batch) | 1 | 1 | 0 | 0 | 1 | 0 |

Exactly these records were activated under the owner's explicit approval: egypt-real-estate-platform, digital-egypt-portal, ministry-of-housing-portal, registry-documents-digital-egypt. None set to verified; no records omitted or rejected. Platform count 0 → 3; procedure guide count 9 → 10. Unknown fields stayed blank. Four audit entries: platforms import, guide import, activation, feature_flag.seed. Phase 2 flags 43 → 61, all disabled (0 enabled).

## Signed-out UI and privacy checks
- EN + AR at 390 and 1280px: 20/20 route checks across hub, platforms, activity-filtered guides, new guide detail and new disclaimer returned 200 and document width equalled viewport width.
- Hub has the informational notice, exactly two cards and no `/properties` card, price cards, market claims or providers block.
- Directory has exactly 3 platform cards, 3 verification dates `2026-11-20`, and 6 source/official links. Search for Digital returns one card; clearing restores three.
- All platform source/official hrefs match stored values exactly in EN/AR, target=_blank and noopener present.
- Hub → Property & housing filtered guide list → new guide detail exercised end-to-end in EN/AR. Exactly the new guide appears; source and official links preserve the percent-encoded stored URL. No fee/time/steps were fabricated for this link-only guide.
- Public read returns exactly 3 active editorial_reviewed platform rows; inactive query returns zero. Public internal_notes query refused for real_estate_platforms and procedure_guides (401).
- No browser page errors during the 20 layout checks. Existing global chat badge was unchanged.
- Admin panel/editor not exercised signed-in: no requesting-user admin account. Shared preview and database/public flows verified; live AI responses not exercised.

## Sitemap, tests and final state
- Rebuilt using the existing generator: **238 URLs** (235 → 238), adding the platform directory, new guide detail and disclaimer.
- Full suite run once: **167 passed, 0 failed across 22 files** (149 existing + 18 new).
- Latest compilation log: build OK. Leaf metadata inspected for changed routes; index already has app-specific metadata. No unrelated route/head changes.
- Nothing published. Maintenance unchanged. Counsel review remains required for the new disclaimer.
