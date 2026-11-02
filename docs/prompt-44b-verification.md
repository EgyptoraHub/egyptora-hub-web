# Prompt 44b — Currency switcher and notifications bell at 1536–1899px

## Change
- `src/components/layout/MainNav.tsx`: new `HeaderMore` "…" button (option a), shown only at 1536–1900px (`hidden 2xl:max-[1900px]:block`). Its popover holds `CurrencySwitcher` (compact) and `NotificationsBell`. Closes on outside click and Escape.
- ≥1900px: currency and bell sit directly in the header (unchanged). <1536px: hamburger menu unchanged.
- Language switcher stays visible at all widths.
- `src/i18n/phase40-translations.ts`: "More options" label in 8 languages (machine-assisted draft).

## Automated check (Playwright, homepage, signed out, header height 1000px viewport)
Measured: bounding-box overlap between logo, every visible nav item and every right-cluster control; clipped nav labels; horizontal scroll. Then opened the path that holds currency and confirmed it shows controls.

| Width | EN | AR | FR | DE | Currency reached via |
|---|---|---|---|---|---|
| 1024 | 0 overlaps | 0 | 0 | 0 | hamburger menu |
| 1280 | 0 | 0 | 0 | 0 | hamburger menu |
| 1440 | 0 | 0 | 0 | 0 | hamburger menu |
| 1536 | 0 | 0 | 0 | 0 | "…" popover |
| 1600 | 0 | 0 | 0 | 0 | "…" popover |
| 1700 | 0 | 0 | 0 | 0 | "…" popover |
| 1899 | 0 | 0 | 0 | 0 | "…" popover |
| 1920 | 0 | 0 | 0 | 0 | header directly |

All 32 combinations: 0 overlaps, 0 clipped labels, no horizontal scroll, currency reachable.

## Notifications bell — what was and was not tested
The bell renders only for signed-in users (by design). These checks ran signed out, so the bell itself was **not** seen on screen. It is placed in the same container as the currency switcher in each path (hamburger menu, "…" popover, header ≥1900px), confirmed by code. A signed-in session could not be created in this environment (no account matches the owner email).

## Bugs found during testing
- Tailwind `max-[1899px]` means width < 1899px, so 1899px showed neither; changed to `max-[1900px]`.
- `2xl:block` overrode `min-[1900px]:hidden` (ordering), so 1920px showed both; fixed with the single range variant.

## Tests
`bun test`: 39 pass, 0 fail (4 files).
