# Prompt 44c — Desktop header spacing

## Scope and changes
Only spacing classes in `src/components/layout/MainNav.tsx` changed, plus this report, project preference memory and the task checklist. No data, migrations, routes, copy, images or maintenance settings changed. Nothing published.

- Logo-to-navigation gap: 24px, with navigation starting at the logo side in both LTR and RTL.
- Navigation distributes remaining space evenly between its entries (`justify-between`), rather than centering the entire group. Navigation minimum gap is compact at the tightest desktop widths and increases from 1700px.
- Navigation-to-search gap: 24px.
- Right-hand control gaps: 10px, including between the more button and Login.
- Desktop horizontal inset: 16px, preserving enough space for French and German at 1536px.
- Breakpoints unchanged: hamburger below 1536px; more popover at 1536px through widths below 1900px; direct currency control from 1900px. Signed-in notifications placement is unchanged.

## Automated browser verification
Playwright Chromium, actual homepage at localhost, signed out, 1800px viewport height. Four separate language contexts with `egyptora_lang` cookies and the rendered language/direction checked. Fonts loaded before measuring.

Checked bounding-box intersections between the logo, all nine desktop navigation triggers and every visible right-hand control; label/text bounds and clipping; text wrapping; document horizontal overflow. Controls nested inside wrappers were measured at their actual buttons. Empty icon buttons' intrinsic SVG overflow was not treated as clipped text.

| Width | English | Arabic (RTL) | French | German | Currency path |
|---|---|---|---|---|---|
| 1536 | Pass | Pass | Pass | Pass | More popover |
| 1600 | Pass | Pass | Pass | Pass | More popover |
| 1700 | Pass | Pass | Pass | Pass | More popover |
| 1899 | Pass | Pass | Pass | Pass | More popover |
| 1920 | Pass | Pass | Pass | Pass | Header directly |
| 2200 | Pass | Pass | Pass | Pass | Header directly |

All 24 combinations: zero overlaps, zero clipped labels, zero wrapped labels, no horizontal scrolling, no browser page errors. Language switcher visible throughout. Currency list opened in every combination; selecting EGP updated the visible currency button, then USD was restored. More popover visible at all four tested widths below 1900px and absent at 1920/2200px.

## Measured gaps
Values are edge-to-edge CSS pixels, measured in reading direction. Each cell is **logo → first navigation item / last navigation item → search**.

| Width | EN | AR | FR | DE |
|---|---|---|---|---|
| 1600 | 24 / 24 | 24 / 24 | 24 / 24 | 24 / 24 |
| 1920 | 24 / 24 | 24 / 24 | 24 / 24 | 24 / 24 |
| 2200 | 24 / 24 | 24 / 24 | 24 / 24 | 24 / 24 |

Adjacent visible right-hand controls were 10px apart in all 24 combinations. Header screenshots captured for each language at 1600, 1920 and 2200px; German 1600px, Arabic 1920px and English 2200px inspected visually.

## Limits — signed-in header not verified
Managed browser status was signed out. Attempting to obtain the requesting user's session with `lovable auth-session --json --self` failed because no app account matches the requesting user's email. No other user's account was selected and no fake session or dashboard button was injected.

Therefore the real My dashboard button, its spacing from More, the notifications bell and signed-in overlaps at these widths were **not tested**. Their existing rendering logic and placement were left unchanged. Signed-in verification requires the intended user's preview sign-in. Below-1536px hamburger behavior and exact 1900px transition were not re-exercised in this task; their breakpoint classes were not changed.

## Tests and current preview
`bun test`: **39 passed, 0 failed, 4 files**. Latest preview build log reports **build OK**. Homepage metadata already has its own app-specific title, description, Open Graph fields and Twitter card; no metadata changes made.

Temporary scripts, raw measurements and screenshots: `/tmp/browser/header44c/` (not persistent deliverables).