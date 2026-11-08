# Prompt 50f — Government Directory chip strip: verification

Date: 2026-11-08. Nothing published. No data, database, migration, flag, route, sitemap or nav changes.

## Files changed

- `src/lib/gov-directory-chips.ts` (new) — the chip list, moved out of the route so it is testable (the route module pulls in the image registry via `import.meta.glob`, which does not run under the test runner).
- `src/routes/government-directory.tsx` — uses `govDirectoryChips`; removed now-unused icon/`Chip` imports.
- `src/components/layout/InnerPage.tsx` — `ChipStrip` overflow affordance (fade + chevron buttons); no change to chip styling, active-chip style, "More" chip, gating (`chipHiddenByGate`) or click behavior; `[scrollbar-width:none]` kept.
- `src/i18n/dictionary.ts` — Arabic only: "Scroll right" → "مرّر لليمين", "Scroll left" → "مرّر لليسار" (owner rule: EN+AR only mid-phase; the other 7 languages keep the English fallback).
- `src/lib/gov-directory-chips.test.ts` (new) — 3 tests.

## Final chip order

1. All Entities (active) · 2. Emergency & Quick Numbers · 3. Complaints & Services Guide (gate `complaint_sectors`, `hideIfGatedOff`, hint — unchanged) · 4. Egypt Apps · 5. Ministries · 6. Regulatory Bodies · 7. Related Entities · 8. Governorates · 9. Public Services · 10. Economic Authorities · 11. Judicial Bodies · 12. Diplomatic Missions · 13. Educational Institutions. No chip renamed, added or removed; links, gates and labels unchanged.

## How overflow detection works

- A `ResizeObserver` on the scroll container plus `onScroll` recompute two booleans: more content at inline start / inline end. The effect also depends on `useNavAvailability()`, so a gated chip appearing/disappearing recomputes overflow.
- RTL normalization: Chrome/Safari give `scrollLeft` 0 → negative in RTL, Firefox positive → 0; `scrollFromStart` handles both (`sl <= 0 ? -sl : max - sl`).
- When an edge has hidden content: a soft fade gradient (`from-card to-transparent`, mirrored with `rtl:` variants) and a small round chevron button appear on that edge. The button scrolls 70% of the visible width (`scrollBy`, smooth), is keyboard-focusable, and its aria-label follows the physical direction ("Scroll right"/"Scroll left", swapped in RTL via the i18n `dir`). Both disappear when that end is reached; neither renders when everything fits. Overlays are absolutely positioned — no layout shift; no horizontal page scroll introduced (checked below).

## Browser checks (Playwright, signed out, maintenance preview)

`/government-directory` — 390/768/1280/1440/1920 px, EN + AR:
- All widths: overflow detected, at start only the forward chevron shows; after clicking it the strip scrolls; at the end only the back chevron shows. No horizontal page scroll, no console errors.
- 1280+ (EN and AR): Emergency & Quick Numbers, Complaints & Services Guide and Egypt Apps are all visible without scrolling (also at 768 and 390).
- AR: strip is RTL, fade and chevron mirror to the left edge, aria-labels in Arabic.

`/explore-egypt` (390/768/1280/1440/1920 EN; 390/1280 AR), `/government-directory/digital-services` (same matrix), `/visit-egypt` (390/1280 EN+AR): same correct behavior — chevron appears only on the edge with hidden content, disappears at that end, mirrors in RTL, no page scroll, no console errors.

`/health`: does **not** use `ChipStrip` (the Health pages are not built on `InnerPage`), so there was nothing to check there — `/visit-egypt` was checked as the additional strip page instead.

Keyboard: Tab focus reaches the chevron (aria-label "Scroll right"), Enter activates it and the strip scrolls.

Gated chip: still hidden when the gate is closed — covered by the existing `chipHiddenByGate`/`hideIfGatedOff` tests (Prompt 50d) plus the new test asserting the Complaints chip keeps `gate: "complaint_sectors"` and `hideIfGatedOff: true`.

## Tests

`bun test src/lib/`: **103 passed, 0 failed** (12 files; +3 new: chip order, Complaints chip gate/hideIfGatedOff/link/hint, 13 unique chips). Type check clean. Build OK.

## Differences from the prompt text

- `/health` has no chip strip (see above); `/visit-egypt` checked instead.
- The two aria labels were added through the existing `t()` English-key pattern, with Arabic translations only, per the owner workflow rule (the other 7 languages keep English fallback until the final pre-launch pass).
- The chip list moved from the route file into `src/lib/gov-directory-chips.ts` purely so the order test can import it; content identical.
