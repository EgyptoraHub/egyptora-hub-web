# Prompt 69 — Energy Materials display and navigation fixes

## Scope
Code-only changes. No data changes, migrations, new pages, flags, allowlist changes, form submissions or publication. English and Arabic only. `ChipStrip`, the Energy schemas, database and server function were not changed.

## Files changed
- `src/routes/do-business.tsx` — uses the extracted Do Business chip array; no other page content changed.
- `src/data/do-business-chips.ts` — chip array with Business Overview first and Energy Materials second.
- `src/components/energy/EnergyPages.tsx` — Circular card hash, Circular section anchor/scroll margin, role-label rendering, required-field note/marks and `aria-required` attributes.
- `src/i18n/energy-translations.ts` — bilingual role display labels and the required-fields note.
- `src/lib/do-business-chips.test.ts` — chip order/link regression test.
- `src/lib/energy-role-label.test.ts` — English, Arabic, unknown-key and submitted-key tests.
- `docs/prompt-69-verification.md` — this report.
- `roadmap.md` — task status.

## Four fixes: before and after

### 1. Do Business chip strip
Before: Energy Materials was first. Because the shared strip treats index 0 as current, its `/energy-materials` link was rendered as the active button and Business Overview was second.

After: Business Overview is first and current; Energy Materials is immediately second, with `to: "/energy-materials"` and its existing `energy_materials` gate. No other chip order or `ChipStrip` code changed. The array was extracted only to make the order directly unit-testable.

### 2. Readable company-role labels
Before: English options displayed the raw keys, including `buyer/operator` and `other`; Arabic translations were already readable.

After: the six options display the exact requested English and Arabic labels. Unknown keys still display unchanged. Option values remain the original `ENERGY_ROLES` keys. The test parses a submission with the Buyer / operator label's underlying key and confirms `company_role === "buyer/operator"`; no schema, database or server-function change was made.

### 3. Circular Materials deep link
Before: both hub cards opened `/energy-materials/disciplines`, and the Circular section had no anchor.

After: Engineering Materials still opens `/energy-materials/disciplines`; Circular Materials opens `/energy-materials/disciplines#circular`. The Circular section has `id="circular"` and a 128px scroll margin.

### 4. Required fields
Before: the fields had their existing validation, but no visible required marks, explanatory line or `aria-required` attributes.

After: Company name, Country, Contact name, Contact email, Message and consent each have a visible `*` hidden from screen readers with `aria-hidden="true"`, plus `aria-required="true"` on the input. The exact EN/AR line appears above the form. Existing validation rules, limits, messages and server logic are unchanged.

Known limitation retained as requested: native browser validation bubbles may appear in English on the Arabic page; this prompt does not change them.

## Report-only chip audit
No other page has a linked chip in first position. None of these arrays was changed:

| Page / shared array | First chip | First chip has `to`? |
|---|---|---|
| Explore Egypt | All Experiences | No |
| Government Directory | All Entities | No |
| Digital Government Services | All Services | No |
| Invest in Egypt | All Sectors | No |
| Live in Egypt | All Living Options | No |
| Visit Egypt and Travel & Tourism (`visitChips`) | All Destinations | No |
| Real Estate & Property | Empty chip array | Not applicable |
| Shipping & Logistics | Empty chip array | Not applicable |

## Browser checks actually performed
Final successful Playwright run used signed-out fresh browser contexts at **390×1000** and **1280×1000**, in **English and Arabic**. It recorded 24 preview checks and one published-site attempt, with **0 page errors**. Screenshots were inspected for mobile/desktop, LTR/RTL, chips, hub cards, Circular anchors, forms and official-body cards.

### Do Business strip — all four EN/AR × 390/1280 combinations
- Business Overview was the current `aria-pressed="true"` button.
- Energy Materials was a normal link to `/energy-materials`; clicking it opened the Energy hub.
- Page/HTML width exactly matched the viewport: 390px or 1280px, with no horizontal page overflow.
- The scroll arrows moved the strip and returned it to its start. LTR positions were 0 → 249 → 0 at 390px and 0 → 138 → 0 at 1280px; RTL positions were 0 → −249 → 0 and 0 → −138 → 0. At desktop the first click reached the strip end, so the end arrow correctly disappeared.

### Hub cards and Circular anchor — all four combinations
- Engineering href remained `/energy-materials/disciplines` without a hash.
- Circular href was `/energy-materials/disciplines#circular`.
- Both clicking Circular from the hub and directly visiting the hash URL landed on the Circular section in EN and AR, mobile and desktop.
- Measured section top after scrolling: 127.8px EN mobile, 127.5px EN desktop, 128.2px AR mobile and 128.1px AR desktop. Computed scroll margin was 128px in every case.

### Partner form — all four combinations
- The exact localized required-fields line was visible.
- All six specified fields had one visible `*` with `aria-hidden="true"` and `aria-required="true"` on the field.
- All six option labels matched the requested language strings exactly.
- All six underlying option values remained the original keys.
- HTML direction was LTR for English and RTL for Arabic; no horizontal page overflow occurred.
- **The form was not submitted.** Consequently no test row was created and no cleanup was needed. Stored-key behavior was checked by the unit test and option values instead.

## ECHEM and EEAA on the latest preview
Checked `/energy-materials/official-bodies` in all four EN/AR × 390/1280 combinations:
- Six official-body cards rendered.
- ECHEM showed its name, **Holding company / شركة قابضة**, summary, languages, official/source links and verification date, with **no source warning**.
- EEAA showed **Agency** in English and **جهاز** in Arabic.
- No horizontal overflow or page runtime errors occurred.

## Published-site information
A separate signed-out visit to `https://www.egyptora-hub.com/energy-materials/official-bodies` showed the public maintenance screen, not the official-body cards. Therefore the published ECHEM/EEAA rendering could not be compared with the preview. The public response exposed a deployment identifier but no human-readable last-published build time, so **whether the published build is behind the repository, and when it was last published, could not be determined**. No publish action was attempted.

## Tests and build
- New targeted tests: **4 passed, 0 failed** across 2 files.
- Full suite run once with `bun test ./src`: **262 passed, 0 failed, 33 files**.
- Latest preview build log: **build OK**.
- `git diff --check`: clean.

## Not done / limitations
- No real or fake partner-interest submission, by design; database cleanup was therefore unnecessary.
- Published cards and publish timestamp could not be inspected because the public site is in maintenance and exposes no readable build time.
- Native browser validation language remains a known limitation, unchanged as instructed.
