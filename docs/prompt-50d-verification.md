# Prompt 50d — Verification

Date: 2026-11-08. No database writes, migrations, data changes or activations. Main navigation and mobile menu unchanged. Not published.

## A. Government Directory link
- Added to the chip strip on `/government-directory`, after "Emergency & Quick Numbers" and "Egypt Apps". It uses the same `Chip` component and styling, with the `MessageSquareWarning` icon.
- EN: "Complaints & Services Guide" / hint "Where to file a complaint: official channels by sector."
- AR: "دليل الشكاوى والخدمات الحكومية" / "أين تقدّم شكواك: القنوات الرسمية حسب القطاع."
- The chip strip shows only a label per chip, so the short line is a tooltip (`title`) on the link.
- Side effect: the shared key "Complaints & Services Guide" now uses the full AR title in the nav dropdown too. Before, it read "دليل الشكاوى والخدمات".
- Link target: `/government-directory/complaints`.
- Gate: `gate: "complaint_sectors"` with the new `hideIfGatedOff` option. It uses the same root-loader availability as the nav (`useNavAvailability`). When the gate is closed, the chip returns `null`, so there is no slot, no "Coming soon" button and no gap. The rule lives in `chipHiddenByGate()` in `src/lib/nav-availability.ts`.

### Signed-out Playwright checks (`/government-directory`)
| Width | Lang | Found | Size (px) | Tap ≥44 | H-scroll | dir | Click → |
|---|---|---|---|---|---|---|---|
| 390 | EN | 1 | 104×107 | yes | no | ltr | /government-directory/complaints |
| 390 | AR | 1 | 104×112 | yes | no | rtl | /government-directory/complaints |
| 768 | EN | 1 | 104×107 | yes | no | ltr | /government-directory/complaints |
| 768 | AR | 1 | 104×112 | yes | no | rtl | /government-directory/complaints |
| 1440 | EN | 1 | 104×107 | yes | no | ltr | /government-directory/complaints |
| 1440 | AR | 1 | 104×112 | yes | no | rtl | /government-directory/complaints |

The click lands on the hub, which adds the existing empty `?q=&family=` filter params. Screenshots at 1440 EN and 390 AR show no overlap and correct RTL order. The strip scrolls sideways inside its own box on phones, as it did before this change.

### Empty gate
- **Browser simulation: not conclusive.** I blocked the `complaint_sectors` request in the browser, but the chip still rendered. The availability check runs in the root loader on the server, which the browser block cannot reach. A real empty table was not used because no data changes were allowed.
- **Unit test: passes.** `src/lib/nav-availability.test.ts` (3 tests) checks that a `hideIfGatedOff` chip is hidden when the gate is missing or false and shown when it is true. Chips without the flag keep their "Coming soon" behaviour. The chip strip calls this same function.

## B. Mobile menu — report only (no change)
- `MainNav.tsx`: `flat = (entry) => !entry.items || entry.label === "Government Directory"`.
- **Why it exists:** there is no code comment. Git history shows it came in commit `7a71927` (2026-10-16, a full rewrite of the mobile menu as a slide-in dialog). The commit message is just "Changes", so no reason was recorded. The likely reason (an inference, not documented) is that the first sub-item, "Official Directory", points to the same URL as the parent. The parent was made a single tap-through link to the directory page instead of an expandable group.
- **What a mobile user can reach (below 1536px):** the menu shows "Government Directory" as one link to `/government-directory`. None of its five sub-items are listed in the mobile menu. From the directory page:
  - Official Directory: it is the page itself.
  - Digital Government Services: via the "Public Services" chip and the page's services section links.
  - Emergency & Quick Numbers: via its chip.
  - Egypt Apps: via its chip.
  - Complaints & Services Guide: via the new chip (Part A), while public sectors exist.

## C. Sitemap
- `scripts/generate-sitemap.mjs` now always excludes the `other-unknown-authority` sector slug.
- `npm run sitemap`: **225 URLs** (was 226). `/government-directory/complaints/other-unknown-authority` is not listed; `/government-directory/complaints/unknown-authority` is listed once.
- Redirect cross-check: none of the redirecting routes are listed. These are `/about`, `/live-in-egypt/healthcare`, `/live-in-egypt/utilities-services`, `/live-in-egypt/safety-security`, `/live-in-egypt/transportation`, `/do-business/licenses-permits` and the complaints alias. Merged military records stay excluded, as before.

## D. Tests and type check
- `bun test src/lib/`: **97 passed, 0 failed** (11 files; 94 before plus 3 new).
- Type check (`oj typecheck -b --noEmit --force`): clean. Build log: build OK.
