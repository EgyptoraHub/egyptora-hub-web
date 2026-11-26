# Prompt 73b — Community authority-guide corrections and activation

## Result and scope
- Corrected and activated exactly the four owner-approved records in `community_authority_guides`, matched by `slug`.
- Used the explicitly requested **privileged database path**, without an administrator session.
- Before writing, the table contained exactly 4 rows; all four approved slugs were `needs_check` and inactive, and there were no other rows.
- Final state: **4 editorial_reviewed/active; 0 needs_check; 0 inactive; 0 other rows**.
- Changed only `summary_en`, `summary_ar` and `internal_notes` through the correction update, followed by `review_status` and `is_active` through activation. Names, URLs, verification dates, languages, sort order and institution types read back exactly as imported by Prompt 73.
- No application code, migration, page, flag, allowlist, image, menu, search-index or sitemap file changed. No publication.

## Validated dry run
Built the corrected values from the exact Prompt 73 CSV and ran the existing central preview:

`previewComplaintsCsv('community_authority_guides', correctedCsv, existingRows, new Set())`

The preview merged each partial update with its existing record and applied the configured allowlist, coercion, match-key and Community validation rules. Each generated update payload was also passed directly to `validateComplaintValues('community_authority_guides', payload, true)`; all four returned no error.

| CSV line | Slug | Action | Rejection reason |
| --- | --- | --- | --- |
| 2 | endowments-ministry-of-awqaf | update | None |
| 3 | endowments-inventory-and-maps | update | None |
| 4 | associations-ministry-of-social-solidarity | update | None |
| 5 | investment-general-authority-for-investment | update | None |

Result: **0 new / 4 updated / 0 rejected**. No write occurred until this passed.

## Corrections: old and new values

### `endowments-ministry-of-awqaf`
Changed columns: `summary_en`, `summary_ar`, `internal_notes`.

- `summary_en` old: “The ministry's About page describes its role in charitable endowment affairs and lists the Egyptian Awqaf Authority among the bodies affiliated to the ministry.”
- `summary_en` new: “The ministry's About page states that the ministry is responsible for managing charitable endowment affairs, and lists the Egyptian Awqaf Authority among its most prominent affiliated bodies.”
- `summary_ar` old: «تعرض صفحة «عن الوزارة» دور الوزارة في شؤون الوقف الخيري، وتذكر هيئة الأوقاف المصرية ضمن الجهات التابعة للوزارة.»
- `summary_ar` new: «تذكر صفحة «عن الوزارة» أن الوزارة تضطلع بإدارة شئون الوقف الخيري، وتذكر هيئة الأوقاف المصرية ضمن أبرز الجهات والهيئات التابعة لها.»
- `internal_notes` old: “Page text was relayed by the owner through a browser extension as a summary, not verbatim: owner to confirm the wording on the page. English names are translated from the official Arabic. The Egyptian Awqaf Authority has no own row because its own site was not opened.”
- `internal_notes` new: “Wording compared with the page by browser extension on 26 Nov 2026 and approved by the owner. English names are translated from the official Arabic. The Egyptian Awqaf Authority has no own row because its own site was not opened.”

### `endowments-inventory-and-maps`
Changed value: `internal_notes` only. Both summaries remain unchanged.

- `internal_notes` old: “Page text was relayed by the owner through a browser extension as a summary, not verbatim. The page shows no publication date (only the 2016 decree year). The atlas details on the page were not used. English names are translated from the official Arabic.”
- `internal_notes` new: “Wording compared with the page by browser extension on 26 Nov 2026 and approved by the owner. The page shows no publication date (only the 2016 decree year). The atlas details on the page were not used. English names are translated from the official Arabic.”

### `associations-ministry-of-social-solidarity`
Changed columns: `summary_en`, `summary_ar`, `internal_notes`.

- `summary_en` old: “The ministry's Objectives and policies page describes a programme called the Central Unit for Civil Work that supports associations and civil institutions as development partners.”
- `summary_en` new: “The ministry's Objectives and policies page describes a programme called the Central Unit for Civil Work, which supports associations and civil institutions as a key partner in achieving comprehensive development.”
- `summary_ar` old: «تذكر صفحة «أهداف وسياسات الوزارة» برنامج «الوحدة المركزية للعمل الأهلي» الذي يدعم الجمعيات والمؤسسات الأهلية كشريك في التنمية.»
- `summary_ar` new: «تذكر صفحة «أهداف وسياسات الوزارة» برنامج «الوحدة المركزية للعمل الأهلي» الذي يدعم الجمعيات والمؤسسات الأهلية كشريك أساسي في تحقيق التنمية الشاملة.»
- `internal_notes` old: “The home page has no explicit sentence on the ministry's legal competence over associations; the summary is limited to the programme described on the Objectives page. Links to ngo.eg and csf.eg exist on the site and were not opened. The site writes the ministry name with a non-standard spelling; the standard spelling is used here. Page text was relayed by the owner as a summary.”
- `internal_notes` new: “Wording compared with the page by browser extension on 26 Nov 2026 and approved by the owner. The page has no explicit sentence on the ministry's legal competence over associations; the summary is limited to the programme described. The site spells the ministry name inconsistently; the standard spelling is used. Links to ngo.eg and csf.eg were not opened.”

### `investment-general-authority-for-investment`
Changed columns: `summary_en`, `summary_ar`, `internal_notes`.

- `summary_en` old: “The authority's About Us page describes it as a public economic authority reporting to the competent minister that regulates, encourages and promotes investment. The Invest in Egypt website is operated by the authority.”
- `summary_en` new: “The authority's About Us page describes it as a public economic authority with public legal personality, reporting to the competent minister, whose role is to regulate and encourage investment, develop its affairs and promote it.”
- `summary_ar` old: «تصف صفحة «من نحن» الهيئة بأنها هيئة عامة اقتصادية تتبع الوزير المختص وتنظم الاستثمار وتشجعه وتروج له. ويعمل موقع «استثمر في مصر» تحت إدارة الهيئة.»
- `summary_ar` new: «تصف صفحة «من نحن» الهيئة بأنها هيئة عامة اقتصادية ذات شخصية اعتبارية عامة تتبع الوزير المختص، وتقوم على تنظيم الاستثمار وتشجيعه وتنمية شئونه والترويج له.»
- `internal_notes` old: “Page text was relayed by the owner as a summary, not verbatim. The About link on that site leads to gafi.gov.eg, which was not opened. The Government Directory may already list this authority: this row is a competent-authority pointer only and must not duplicate directory data.”
- `internal_notes` new: “Wording compared with the page by browser extension on 26 Nov 2026 and approved by the owner. The earlier sentence about who operates the Invest in Egypt website was removed because it is not on the About Us page. The About link on that site leads to gafi.gov.eg, which was not opened. The Government Directory may already list this authority: this row is a competent-authority pointer only.”

## Activation and audit entries
All four rows changed from `review_status = needs_check`, `is_active = false` to `review_status = editorial_reviewed`, `is_active = true`:

- `endowments-ministry-of-awqaf`
- `endowments-inventory-and-maps`
- `associations-ministry-of-social-solidarity`
- `investment-general-authority-for-investment`

The existing database activation trigger passed unchanged. The first combined statement persisted the four corrections and correction audit but did not perform the second update of the same rows; activation was therefore applied in a separate statement after correction read-back. The activation statement and its audit succeeded together. No duplicate audit entries exist.

| Audit | ID | Action / entity ID | Contents |
| --- | --- | --- | --- |
| Corrections | `b1f4b263-51ae-4833-8d82-21e435163ada` | `update.csv` / `prompt-73b-corrections` | Four slugs, per-row changed columns, old/new summaries and notes, dry-run result, count 4 and privileged method |
| Activation | `7dd84689-0792-4328-b4c4-b56eba572457` | `activate` / `prompt-73b-activation` | Four slugs, old/new review and active states, owner approval date 2026-11-26, count 4 and privileged method |

Both have no actor user ID because these were privileged operations, not authenticated administrator actions.

## Real visitor API checks
Used the app's browser client and real database API requests. The signed-in check used a temporary platform test visitor because no app account matches the requesting owner's email. Its own `user_roles` read returned `[]`; no role was granted.

| Visitor | Public columns | Row order | `internal_notes` |
| --- | --- | --- | --- |
| Signed out | HTTP 200, exactly 4 rows, only the explicit public columns | sort_order 10, 20, 30, 40 | HTTP 401, PostgreSQL code `42501` |
| Signed in non-admin | HTTP 200, exactly the same 4 rows and public columns | sort_order 10, 20, 30, 40 | HTTP 403, PostgreSQL code `42501` |

## Public page checks
Real Chromium checks, signed out, at `/community/authority-guide`:

| Language | Viewport actually tested | Result |
| --- | --- | --- |
| English | 390 × 844 | Empty state absent; 4 ordered cards; competent body, readable type label, corrected summary, official/source links and 2026-11-26 on every card; 8 links; 0px overflow; LTR; no page errors |
| English | 1280 × 844 | Same assertions passed; 4 cards, 8 links, 0px overflow, no page errors |
| Arabic | 390 × 844 | Same assertions passed with Arabic summaries and labels; 4 cards, 8 links, 0px overflow; RTL; no page errors |
| Arabic | 1280 × 844 | Same assertions passed; 4 cards, 8 links, 0px overflow; RTL; no page errors |

All 8 external links per layout use `target="_blank"` and a `rel` value containing `noopener`. No card showed a source-warning string. The visible section notice explicitly says the content is not a government service, approval, legal opinion or recommendation of any institution.

English viewport screenshots were visually inspected. Arabic full-viewport screenshots were blank despite the DOM assertions, so separate settled main-element screenshots were captured and visually inspected at both sizes; these show the header, four Arabic cards, readable labels, corrected wording, links and dates in RTL. No application display bug was identified or changed.

Screenshots: `/tmp/browser/prompt73b/screenshots/` (`guide_en_390.png`, `guide_en_1280.png`, `guide_ar_390_main.png`, `guide_ar_1280_main.png`, plus the signed-in non-admin capture).

## Data audit
Ran the same `sourceUrlWarning` function and active-public-record hygiene rules used by Data Audit against the four rows returned by the real signed-out public API, after privileged read-back confirmed all four were active/editorial_reviewed.

- Link fields checked: `source_url` and `official_url` on 4 rows = **8 checks**.
- Source warnings: **0**.
- Active-record hygiene problems: **0**. Every row has a source URL, at least one source name, verification date, and non-empty Arabic and English topic fields.
- The administrator Data Audit screen itself was not exercised because no owner admin session is available; this report does not claim that UI check.

## Hub, menu, search and sitemap
- `/community`: unchanged; real page check found the same three section links: institution types, authority guide and partner interest. No authority records were added to the hub.
- Menu: unchanged; the existing Egyptora Community item opened in the desktop Government Directory menu at 1536 × 900 and in the Arabic mobile menu at 390 × 844.
- Search: unchanged; English `community` and Arabic `مجتمع` searches each returned the same four Community page links and no per-record entries.
- Sitemap: unchanged and **not rebuilt**, because the page list did not change. `public/sitemap.xml` still has the same four Community page URLs and existing legal disclaimer URL; no source-file diff exists for it.

## Tests and health
- Ran the full suite **once** with `bun test`: **317 passed, 0 failed, 36 files**.
- Latest build log after the work: **build OK** (2026-11-26 17:58:21 UTC). No application source files were changed and no manual build was run.
- Changed repository files for this request: only this report and the Prompt 73b section of `roadmap.md`.

## Limits and not done
- No administrator session or administrator Data Audit screen was available; the shared validators/checkers and real visitor API were used directly.
- The temporary signed-in visitor was a test user, not the requesting owner; it was not granted any role.
- Source wording is the owner-approved supplied wording. No independent claim of government approval or recommendation was added.
- No requested correction, activation, visitor API check or public-page assertion remains blocked. No publication.
