# Prompt 50e — Mobile menu: expand "Government Directory" — verification

Date: 2026-11-08. Reply language: English (project rule).

## What changed

1. `src/components/layout/MainNav.tsx` (was line 249): the mobile-menu flat-link rule
   `const flat = (entry: NavEntry) => !entry.items || entry.label === "Government Directory";`
   lost its `entry.label === "Government Directory"` exception. The rule is now
   `const flat = isFlatMobileNavEntry;`.
2. `src/data/navigation.ts` (end of file): new exported pure helper
   `isFlatMobileNavEntry(entry)` returns `!entry.items` — an entry renders as a flat
   single link only when it has no sub-items. Extracted so the rule is unit-testable;
   imported by `MainNav.tsx`.
3. `src/lib/nav-availability.test.ts`: three new tests (see below).

Nothing else changed: no routes, data, database, migrations, feature flags,
translation files, desktop menu (≥1536px), or other components.

## What the old exception was for

The exception was introduced with the 16 Oct 2026 mobile-menu rewrite (noted in the
Prompt 50d report); no reason was recorded in code or docs. The likely reason: the
"Government Directory" parent link points to `/government-directory`, the same page
as its first sub-item "Official Directory", so a flat link avoided an apparently
redundant group. After the change the parent stays reachable through the
"Official Directory" sub-item (verified: it navigates to `/government-directory` and
closes the menu). No other behavior depended on the exception — gating lives in
`LeafLink` and is untouched.

## Gating

"Complaints & Services Guide" keeps its existing gate (`complaint_sectors`): it is a
normal link while public sectors exist and shows "Coming soon" behavior otherwise.
Gating logic was not changed.

## Browser checks (Playwright, signed out)

Mobile menu (<1536px), EN and AR, at 390 / 768 / 1280 / 1440px:

- Government Directory expands like other sections; exactly 5 sub-items render:
  Official Directory, Digital Government Services, Complaints & Services Guide,
  Emergency & Quick Numbers, Egypt Apps (all five found by text in EN; AR group
  verified with 5 menuitems and Arabic labels, screenshot-checked).
- Tapping "Official Directory" / "الدليل الرسمي" navigates to
  `/government-directory` and closes the menu (all 8 runs).
- AR: `dir="rtl"`, group renders right-to-left, chevron at the inline-end (left)
  side, rotate-180 when open — screenshot `mobile_390_ar.png`.
- Other sections still expand/collapse: "Explore Egypt" opens with 21 items
  (`aria-expanded=true`) and collapses back to 0 (`aria-expanded=false`).

Desktop (≥1536px), EN and AR, at 1536 and 1920px:

- Hamburger hidden; hovering the "Government Directory" nav link opens the desktop
  dropdown with the same 5 items as before — unchanged.

## Tests and build

- `bun test src/lib/`: **100 passed, 0 failed** (11 files; was 97 — 3 new):
  - Government Directory is not treated as flat (`isFlatMobileNavEntry` → false).
  - Its five sub-items are in the required order with "Official Directory" first.
  - Entries without sub-items remain flat.
- `oj typecheck -b --noEmit`: clean.
- Build log: `build OK`.

## Differences between this report and the code

None. The flat rule moved from an inline lambda in `MainNav.tsx` to the exported
`isFlatMobileNavEntry` helper in `src/data/navigation.ts` so it could be unit-tested;
behavior is identical (`!entry.items`).

Maintenance stays ON; nothing published.
