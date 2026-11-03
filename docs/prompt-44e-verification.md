# Prompt 44e — Verification: currency switcher next to language switcher (desktop ≥1536px)

Date: 2026-11-03. Scope: `src/components/layout/MainNav.tsx` only. No data, routes, migrations or copy changes. Maintenance flag unchanged; nothing published.

## Changes

1. **Currency switcher in the header from 1536px up**: the compact `CurrencySwitcher` wrapper changed from `hidden min-[1900px]:block` to `hidden 2xl:block`, so it renders directly in the header, immediately next to the compact `LanguageSwitcher`, from 1536px up. It is no longer inside the "…" popover or behind the 1900px breakpoint.
2. **Notifications bell**: stays in the "…" popover for 1536–1899px (signed-in users only); from 1900px up it renders directly in the header, unchanged.
3. **"…" more button only renders when it has content**: `HeaderMore` now uses `useAuth()` and returns `null` when signed out. The popover now contains only `NotificationsBell` (currency removed). Signed-out users see no "…" button at any width.
4. **Space made for the extra control without touching labels or font sizes**:
   - Fluid nav gap: `clamp(2px, calc(5.73vw - 86px), 24px)` → `clamp(0px, calc(5.73vw - 88px), 24px)` (≈0px at 1536px, unchanged 24px at 1920px+).
   - Right-cluster gap 1536–1699px: `gap-2.5` (10px) → `gap-1.5` (6px). From 1700px up it stays 16px.
   - Container gap 1536–1699px: `2xl:gap-6` (24px) → `2xl:max-[1700px]:gap-3` (12px).
5. **Below 1536px unchanged**: hamburger menu with language, currency and notifications inside.

## French/German fallback

**Not needed.** After the first pass, French overflowed by 5px and German by 32px at 1536px. Tightening the fluid nav gap to ≈0px and the right-cluster/container gaps (above) removed all overflow, so the hamburger fallback for FR/DE below 1700px was **not** used. All four languages show the full desktop nav from 1536px up.

## Automated checks (signed out, Playwright, Chromium)

Widths 1536, 1600, 1700, 1899, 1920, 2200px × languages EN, AR, FR, DE = **24 combinations, all OK**:

- Currency switcher visible next to the language switcher at every width/language (measured gap between them: 6px at 1536–1600px, 16px from 1700px up).
- "…" more button hidden at every width/language (signed out).
- Zero overlapping header blocks, zero clipped labels, no horizontal scroll (`scrollWidth === innerWidth` everywhere, re-measured explicitly for FR/DE at 1536px).
- `dir` correct: `ltr` for EN/FR/DE, `rtl` for AR.
- Screenshot confirmation: `/tmp/browser/nav44e/header-1536-en.png` shows EN + USD side by side, no "…" button, no overlap.

## Tests

`bun test` on the four test files (`maintenance`, `health-public`, `health-validation`, `concierge-health`): **39 tests, 0 failures**. Build log: `build OK`.

## Not tested

- **Signed-in state**: no session available in this environment, so the notifications bell (header ≥1900px, "…" popover 1536–1899px) and the signed-in "…" button were verified by code review only, not on screen. The signed-in cluster is the signed-out cluster plus the bell, and the bell only appears where the currency switcher used to sit, so the space budget is unchanged from the verified Prompt 44d layout.
- Exact 1899/1900px boundary behaviour for the bell is inherited unchanged from Prompt 44b/44d.
