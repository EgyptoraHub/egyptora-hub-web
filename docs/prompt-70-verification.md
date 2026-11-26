# Prompt 70 — Energy Materials discoverability

Verified on 26 November 2026 against the local preview. Code-only changes; nothing published.

## Files changed

- `src/data/navigation.ts`: Energy Materials submenu item and a tested live-only gate visibility helper.
- `src/components/layout/MainNav.tsx`: the shared leaf renderer omits unavailable live-only gated entries, covering both desktop and mobile menus.
- `src/routes/index.tsx`: Energy Materials home business card, registered industrial illustration, optional lightning-icon fallback, and two-column business grid from 400px upwards.
- `src/i18n/energy-translations.ts`: supplied Arabic informational-card description. The existing Energy Materials Arabic title already serves the menu and card.
- `src/lib/nav-availability.test.ts`: three tests for the exact item/order/gate, off/on visibility, and unchanged nine top-level labels.
- `roadmap.md`: task completion and administrator-check limitation.
- `docs/prompt-70-verification.md`: this report.

## Do Business menu: before and after

Before: All Business Services, Start a Business, Licenses & Permits, …; no Energy Materials entry.

After:

1. All Business Services → `/do-business`
2. Energy Materials / مواد الطاقة والصناعة → `/energy-materials`, `gate: "energy_materials"`, no `soon`
3. Start a Business, followed by every remaining previous item in its original order.

Desktop and mobile use the same data and leaf renderer. A missing or false Energy gate removes the new menu item entirely; true renders the link. Existing `soon` entries retain their previous placeholders. Gate-off behavior was exercised in regression tests, not by changing the live availability configuration.

The nine top-level entries are unchanged: Home, Explore Egypt, Live in Egypt, Healthcare & Medical Services (short desktop label Healthcare), Invest in Egypt, Do Business, Visit Egypt, Government Directory, About.

## Home Do Business card

- Title: Energy Materials / مواد الطاقة والصناعة.
- Description: “Informational pages for energy and industrial materials.” / “صفحات معلوماتية عن مواد الطاقة والصناعة.”
- Destination: `/energy-materials`.
- Availability: existing `open(bizCards)` path-gate filtering, with the card also declaring `energy_materials`.
- Illustration: existing registered `card-industry-factory`, obtained through `getGeneratedImage()`. Its subject is a modern factory in an industrial zone, so it clearly fits the requested industrial subject. No image added and no old home photo reused for the new card.
- Existing registry supplies descriptive EN/AR alt text; the shared AI badge provides the existing attribution, “Illustrative AI image” / “صورة توضيحية بالذكاء الاصطناعي”. It does not claim to show a verified company or facility. No separate photographer credit is registered for this AI illustration.
- If the registry image is missing or hidden, the card falls back to the banner's lightning icon, without bypassing image approval.
- Same border, surface, save control, image-height area, and arrow link as neighboring cards. Two cards currently show: the unchanged Tenders & Projects card and Energy Materials. Grid is one column at 390px and two columns at 1280/1536px; LTR/RTL checked. Description promises no service.

## Browser checks actually performed

All checks below were signed out. English and Arabic were each checked at **390×1000, 1280×1000, and 1536×1000 CSS pixels**.

| Check | Result |
| --- | --- |
| New home card present; industrial image loaded; link clicked and destination heading shown | Passed in all six combinations |
| Home business block has two cards; no page horizontal overflow; screenshots reviewed in EN/AR | Passed |
| Mobile-style menu at 390 and 1280: open Do Business, Energy second, correct destination, menu closes after clicking | Passed in four combinations |
| Desktop dropdown at 1536: Energy second with correct link; nine top-level entries | Passed in EN/AR |
| Desktop keyboard: ArrowDown opens menu, ArrowDown focuses Energy, Escape closes and restores trigger focus | Passed in EN/AR at 1536 |
| Header clusters within viewport and not overlapping | Passed at 390, 1280 and 1536, EN/AR |
| JavaScript page errors during new-card/menu flow | None in all six combinations |

**Breakpoint clarification:** the unchanged header uses the hamburger below 1536px. Therefore 1280px was tested with its actual mobile-style menu, not a forced desktop dropdown. The desktop dropdown was tested at 1536px. No breakpoint, font size, spacing, navigation label, or top-level entry was changed.

Browser scripts and screenshots were kept under `/tmp/browser/prompt70/`, not added to the repository. The first image assertion ran before lazy loading completed; waiting for image decoding resolved the check, and the full browser run then passed. Header-only screenshots exclude dropdown overflow, so separate dropdown screenshots were also taken and reviewed.

## Existing entries unchanged

- **Home wide Energy banner:** stays immediately after `LiveBusinessWhy` and before `Vision2030`, with its lightning icon, existing under-development description, existing gate, and `/energy-materials` link. Clicked successfully in all six EN/AR/width combinations.
- **Do Business page chip:** remains second after current Business Overview, uses its factory icon and existing `energy_materials` gate, links to `/energy-materials`. Clicked successfully in all six combinations.
- **Do Business page large Energy entry card:** existing wording, lightning icon, gate, and destination unchanged; clicked successfully in all six combinations.
- Home and Energy routes retain their existing page-specific titles/descriptions, Open Graph metadata, and Twitter card metadata; no route or metadata changes were required.

## Tests and preview

- Full suite run **once**: `bun test ./src` — **265 passed, 0 failed, 33 files**.
- After correcting two optional-property typing issues, final targeted run: `bun test src/lib/nav-availability.test.ts` — **9 passed, 0 failed**.
- Latest preview diagnostic after those corrections: **build OK**.

## Limitations and scope

- **Signed-in administrator checks not performed.** Requesting the owner session failed because no application account matches the requesting email. No test account or administrator role was created, preserving this code-only prompt. Administrator menu, home card, header spacing, and keyboard checks remain unverified until an intended administrator session is available.
- Gate-off rendering was verified through the tested helper; the live gate was not toggled or mocked in the browser.
- Some pre-existing Arabic menu entries retain English fallback (for example All Business Services). Only the requested Energy title/description was changed or reused; unrelated translations were not altered.
- No database writes, migrations, new pages, flags, allowlist changes, new top-level items, new images, form submissions, or publication.