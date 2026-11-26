# Prompt 71 — Energy Materials: remove the wide banner from the home page

Date: 26 Nov 2026 (UTC). Code-only prompt: no data changes, no migrations, no new pages, no flags, no allowlist changes, no new images.

## 1. Files changed

| File | Change |
| --- | --- |
| `src/routes/index.tsx` | Removed the `<section className="mx-auto w-full max-w-[1280px] px-4 pb-10 lg:px-8"><EnergyEntryCard /></section>` that rendered between `LiveBusinessWhy` and `Vision2030`, and removed the now-unused `EnergyEntryCard` import (was line 1). |
| `src/lib/home-energy-banner.test.ts` | New regression test (3 assertions): the home route no longer references `EnergyEntryCard`; the home Do Business block still carries the Energy Materials card (`to: "/energy-materials"`, `gate: "energy_materials"`); `src/routes/do-business.tsx` still renders `<EnergyEntryCard />`. |

Untouched, as instructed: the `EnergyEntryCard` component itself (`src/components/energy/EnergyPages.tsx`), `src/routes/do-business.tsx`, the Do Business menu item, the home Do Business card, the Do Business chip, and every gate.

## 2. Home page before and after

Before (`src/routes/index.tsx`, section order inside `<main>`):

```text
Hero → QuickStrip → HealthHomeWidget → IntroVideo → ExploreInvest
→ LiveBusinessWhy
→ <section px-4 pb-10><EnergyEntryCard /></section>   ← wide banner, removed
→ Vision2030 → GovBand → GlobalBand → ThroughTimeBand → BookingSearch
→ NewsApp → ImportantNotice
```

After:

```text
Hero → QuickStrip → HealthHomeWidget → IntroVideo → ExploreInvest
→ LiveBusinessWhy
→ Vision2030 → GovBand → GlobalBand → ThroughTimeBand → BookingSearch
→ NewsApp → ImportantNotice
```

The removed section carried its own `pb-10` (40px) on top of the surrounding sections' `py-14`. With it gone, `LiveBusinessWhy` (`bg-background py-14`) sits directly against `Vision2030` (`border-y border-border bg-background py-14`): 56px bottom padding + 56px top padding, the same pairing every other adjacent home section uses (for example `ExploreInvest` → `LiveBusinessWhy`). No double gap, no missing gap.

## 3. Checks performed (signed out, real browser, Chromium)

Viewports really tested: 390×800 and 1280×800, English and Arabic — 4 home-page combinations. Arabic was applied through the `egyptora_lang` cookie before navigation, so the first render was already Arabic/RTL.

| Check | en 390 | en 1280 | ar 390 | ar 1280 |
| --- | --- | --- | --- | --- |
| Wide banner text absent (`"Informational pages and company expressions of interest. This section is under development."` / `"صفحات معلومات وإبداء اهتمام الشركات. هذا القسم تحت التطوير."`) | yes | yes | yes | yes |
| Banner markup absent (link to `/energy-materials` with the entry-card class) | 0 | 0 | 0 | 0 |
| `main > section` count (banner section gone) | 12 | 12 | 12 | 12 |
| Do Business block shows the Energy Materials card (title + `"Informational pages for energy and industrial materials."` / `"صفحات معلوماتية عن مواد الطاقة والصناعة."`) | yes | yes | yes | yes |
| Card visible and clickable | yes | yes | yes | yes |
| Click reaches the hub | `/energy-materials` | `/energy-materials` | `/energy-materials` | `/energy-materials` |
| Gap between the Do Business section and the next section | 0px box gap, 56px + 56px padding | same | same | same |
| Horizontal scroll (scrollWidth − clientWidth) | 0 | 0 | 0 | 0 |
| Page errors | none | none | none | none |
| `html lang` / `dir` | en / ltr | en / ltr | ar / rtl | ar / rtl |

Screenshots taken at each combination (`home_en_390.png`, `home_en_1280.png`, `home_ar_390.png`, `home_ar_1280.png`) plus the Do Business page in both languages (`do-business_en.png`, `do-business_ar.png`).

Do Business page (`/do-business`), signed out:

| Check | en | ar |
| --- | --- | --- |
| Wide Energy Materials entry card still shown (title + `"This section is under development."` text) | yes | yes |
| Entry-card markup present (1 link) | 1 | 1 |
| Page errors | none | none |

## 4. Test result

No existing test asserted the home banner, so nothing had to be rewritten; the new `src/lib/home-energy-banner.test.ts` now asserts the banner is absent from the home route and the home card is present.

Full suite: **268 passed, 0 failed, 34 files** (`bun test`).

Build: `build OK` (latest entry in the build log).

## 5. Not done / could not do

- Signed-in checks were not run: this prompt is a presentation-only removal on a page that renders identically for visitors and signed-in users, and no role or permission was involved.
- The published site could not be compared: it currently serves the maintenance screen, so the live build could not be inspected.
- No data, migration, flag, allowlist, gate, image or component change was made; nothing was published.
