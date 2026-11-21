# Prompt 60 — Verification

## Guide correction
- Match: `procedure_guides.slug = registry-documents-digital-egypt`, id `1c1029d4-82e6-4680-a1d2-ffef52e0d0af`.
- Old value in both `official_service_url` and `source_url`: `https://digital.gov.eg/gov-services/05/%D8%A7%D9%84%D9%85%D9%84%D9%83%D9%8A%D8%A7%D8%AA`.
- New exact value in both fields: `https://digital.gov.eg/gov-services/%D8%A7%D9%84%D9%85%D9%84%D9%83%D9%8A%D8%A7%D8%AA/05`.
- `last_verified_at`: 2026-11-20 → **2026-11-21**, owner-verified date. Remains active / editorial_reviewed; no activation, import or new records.
- Received 1 correction; created 0, updated 1, rejected 0. Shared `previewTradeCsv` accepted 1 update / 0 rejected, followed by `validateTradeValues`.
- No requesting-user app account was available (`auth-session --self` failed); used the **privileged validated update path**. Audit entry: `facc62bf-d400-4fd5-ad4f-eace95a70ce2`, action `content.update`, method `privileged_validated_update`, count 1, before/after values recorded.
- Database comparison reported only the three requested fields plus trigger-maintained `updated_at` changed; all other guide content was unchanged.
- Repo CSV: changed exactly the two URL cells in `docs/prompt-58-data/procedure_guides_real_estate.csv`; its historical delivery date remains 2026-11-20 as Part A requested only the URL values there.
- Final counts: procedure_guides **10 active/editorial_reviewed**; real_estate_platforms **3 active/editorial_reviewed**. Nothing omitted or imported.

## Old URL inventory
Whole-repository search before correction found only `docs/prompt-58-data/procedure_guides_real_estate.csv:2`, twice (official and source columns). Database JSON searches found only the above procedure guide, twice (official_service_url/source_url).
- real_estate_platforms: 0 matching rows.
- procedure_guides: 1 matching row, corrected.
- procedure_steps and procedure_documents: 0 matching rows each.
- Legal page content, sitemap, remaining application code, documentation and scripts: no old URL found. No sitemap edit needed: its URLs are internal page addresses, which have not changed.
- Repeated repository search after correction returned no occurrences before this report was written. This report intentionally retains the old URL as historical evidence.

## Digital Egypt page check
The owner verified the page on 2026-11-21. Direct fetch returned HTTP 200 but only an initial shell. A separate signed-out Chromium visit hydrated successfully, HTTP 200, document title مصر الرقمية, heading الملكيات, subheading خدمات الشهر العقاري, and the six stated registry services (registered contract copy, periodic-book copy, financial circular copy, technical circular copy, real-estate-dispositions certificate, registered-contract translation). The social-housing and agriculture side-menu groups also appeared. Screenshot inspected. The link was therefore independently checked as well; no unsupported claim of verification based only on the initial shell.

## Static search cleanup
- Entries before: **259**. Removed **34**. Added **2**. Entries after: **227** (raw retained index, before live availability filtering).
- Applied existing path gates through `filterSearchEntries` in `src/lib/path-gates.ts` to **both `to` and `page`**, including children, queries and fragments. Missing/false availability hides entries; true availability restores retained entries automatically. Applied to combined search entries before scoring.
- The `.generated.ts` filename is historical: no search-index generator exists in repository scripts or package commands. Clarified the manual maintenance header and architecture rule; there is no generator to reintroduce deleted records.
- Arabic titles are stored on the two added records as optional `title_ar`, searched alongside English and displayed when Arabic is selected. No translation file was changed.

### Removed entries
- Investment: **Real Estate & New Cities**
- Investment: **New Administrative Capital** — Mixed-use development
- Investment: **Ain Sokhna Industrial Zone** — Industrial & logistics hub
- Investment: **Red Sea Tourism Development** — Resorts & eco-tourism
- Investment: **Renewable Energy Projects** — Solar & wind energy
- Real Estate: **All Properties**
- Real Estate: **Apartments**
- Real Estate: **Villas**
- Real Estate: **Compounds & Gated Communities**
- Real Estate: **Commercial Properties**
- Real Estate: **New Developments**
- Real Estate: **Coastal & Vacation Homes**
- Real Estate: **Land & Plots**
- Real Estate: **Off-Plan Projects**
- Real Estate: **New Capital Residence** — Apartment
- Real Estate: **North Coast Villa** — Villa
- Real Estate: **Zamalek Apartment** — Apartment
- Real Estate: **Al Rehab City Compound Unit** — Apartment
- Real Estate: **Sahl Hasheesh Chalet** — Chalet
- Real Estate: **Urban Living** — City apartments close to work and culture.
- Real Estate: **Coastal Living** — Homes on the Mediterranean and Red Sea.
- Real Estate: **Gated Communities** — Secure compounds with shared amenities.
- Real Estate: **Family Homes** — Space, schools and green areas nearby.
- Real Estate: **Investment Properties** — Units with strong rental potential.
- Real Estate: **New Cities** — Modern planned cities across Egypt.
- Real Estate: **Luxury Living** — Premium villas and penthouses.
- Real Estate: **Affordable Housing** — Accessible homes and payment plans.
- Real Estate: **Mortgage & Financing**
- Real Estate: **Legal & Title Services**
- Real Estate: **Property Management**
- Real Estate: **Interior Design**
- Real Estate: **Relocation Support**
- Real Estate: **Real Estate Consultancy**
- Real Estate: **Real Estate & Property** — Explore Egypt's real estate market — from city apartments to coastal homes and new cities.

### Added entries
- Real estate information hub / دليل المعلومات العقارية → `/real-estate`; category Real Estate; empty description/tag, no prices or marketing claims.
- Official property platforms / المنصات العقارية الرسمية → `/real-estate/platforms`; category Real Estate; empty description/tag, no prices or marketing claims.

## Remaining demo-name locations (report only)
No visitor-rendered file other than the dictionaries and the gated investment array contains the eight requested names after index cleanup. Translation dictionaries were deliberately not changed.

| Name | Remaining location | Currently visitor-reachable? |
|---|---|---|
| New Capital Residence | `src/i18n/dictionary.ts` lines 2756, 5646, 8534, 11422, 14310, 17198, 20086, 22974 | No: dictionary strings have no remaining rendering caller. |
| North Coast Villa | `src/i18n/dictionary.ts` lines 2768, 5658, 8546, 11434, 14322, 17210, 20098, 22986 | No: dictionary strings have no remaining rendering caller. |
| Zamalek Apartment | `src/i18n/dictionary.ts` lines 3071, 5961, 8849, 11737, 14625, 17513, 20401, 23289 | No: dictionary strings have no remaining rendering caller. |
| Al Rehab City Compound Unit | `src/i18n/dictionary.ts` lines 2259, 5153, 8041, 10929, 13817, 16705, 19593, 22481 | No: dictionary strings have no remaining rendering caller. |
| Sahl Hasheesh Chalet | `src/i18n/dictionary.ts` lines 2877, 5767, 8655, 11543, 14431, 17319, 20207, 23095 | No: dictionary strings have no remaining rendering caller. |
| Ain Sokhna Industrial Zone | `src/i18n/dictionary.ts` lines 2257, 5151, 8039, 10927, 13815, 16703, 19591, 22479; `src/routes/invest-in-egypt.tsx:66` | No while investment gate is closed: entire featured section and its cards are hidden; could return if gate reopens. Dictionary entries alone do not render. |
| Red Sea Tourism Development | `src/i18n/dictionary.ts` lines 2838, 5728, 8616, 11504, 14392, 17280, 20168, 23056; `src/routes/invest-in-egypt.tsx:67` | No while investment gate is closed: entire featured section and its cards are hidden; could return if gate reopens. Dictionary entries alone do not render. |
| Renewable Energy Projects | `src/i18n/dictionary.ts` lines 2851, 5741, 8629, 11517, 14405, 17293, 20181, 23069; `src/routes/invest-in-egypt.tsx:68` | No while investment gate is closed: entire featured section and its cards are hidden; could return if gate reopens. Dictionary entries alone do not render. |

## Menu and card targets
- Invest in Egypt menu **Real Estate & New Cities**: `/real-estate` (`src/data/navigation.ts:94`). Clicked signed out in EN and AR; live hub heading appeared, not a not-found page.
- `/invest-in-egypt` **Real Estate** sector card: `/real-estate` (`src/routes/invest-in-egypt.tsx:72`). Its arrow link was clicked in EN/AR at 390/1280px and the hub appeared, not not-found. The corresponding chip also targets `/real-estate`.

## Visitor verification
Fresh signed-out contexts, EN/AR, 390/1280px (16 search checks). For every requested query: no `/properties`, `/offers`, `/investment-opportunities`, `/providers` or child results; none of the eight removed demo names visible; document width equals viewport width.

| Query | English result links (1280px) | Outcome |
|---|---|---|
| `/search?q=apartment` | No results | No hidden-page results |
| `/search?q=property` | Property Registration → `/government-directory`; Buying PropertyTitle registration and real estate procedures. → `/real-estate`; Official property platforms → `/real-estate/platforms` | No hidden-page results |
| `/search?q=investment` | Investment OpportunitiesDiscover investment opportunities across key sectors in Egypt. A strategic location, a growing economy, and a supportive environment for investors. → `/invest-in-egypt`; Investment Guide → `/invest-in-egypt`; All Sectors → `/invest-in-egypt`; Industry & Manufacturing → `/invest-in-egypt`; Tourism & Hospitality → `/invest-in-egypt`; Energy & Renewable → `/invest-in-egypt`; Infrastructure & Transportation → `/invest-in-egypt`; Agriculture & Food Security → `/invest-in-egypt`; ICT & Innovation → `/invest-in-egypt`; Healthcare & Pharmaceuticals → `/invest-in-egypt`; Education & Research → `/research-programs`; Financial Services → `/invest-in-egypt`; IndustryManufacturing and industrial zones → `/invest-in-egypt`; TourismHotels, resorts and experience projects → `/invest-in-egypt`; EnergyRenewable and traditional energy → `/invest-in-egypt`; InfrastructureTransport, ports and logistics → `/invest-in-egypt`; AgricultureModern agriculture and food industries → `/invest-in-egypt`; HealthcareHospitals and medical industries → `/invest-in-egypt`; Laws & Regulations → `/legal`; Incentives & Tax Benefits → `/invest-in-egypt`; How to Start → `/do-business`; Success Stories → `/traveler-stories`; Investment Incentives → `/do-business`; Solar Energy ProjectRenewable energy investment opportunities. → `/do-business`; Agri-Food ProcessingInvestment in food processing and export. → `/do-business`; AuthorityGeneral Authority for Investment (GAFI)The official gateway for investors and company setup. → `/government-directory`; Investment & Foreign Trade → `/government-directory`; Authorities & AgenciesGeneral Authority for Investment and Free Zones (GAFI)الهيئة العامة للاستثمار والمناطق الحرة — One-stop authority for company incorporation and investment licensing. → `https://www.gafi.gov.eg`; Investment & BusinessSuez Canal Economic Zone (SCZone)الهيئة الاقتصادية لقناة السويس — Special economic zone spanning Suez Canal corridor ports and industrial areas. → `https://www.sczone.eg`; Investment & BusinessFederation of Egyptian Industries (FEI)اتحاد الصناعات المصرية — Private-sector industry federation (semi-official, not a government body). → `https://www.fei.org.eg`; Investment Services → `/invest-in-egypt`; Investment & Business → `/`; Egypt's Growing Investment Opportunities → `/`; All in One PlaceTourism, investment, living and more → `/`; Opportunities for AllInvestment, tourism and sustainable growth → `/` | No hidden-page results |
| `/search?q=mortgage` | No results | No hidden-page results |

- End-to-end: property search → official platforms (4 language/width combinations), invest card → hub (4), corrected guide read-back (4), menu → hub (2).
- Guide shows both exact encoded hrefs and the date as 21/11/2026 / ٢١‏/١١‏/٢٠٢٦; guide text unchanged.
- Visitor `procedure_guides.internal_notes` read refused (401). No browser page errors during successful local verification.
- Added 4 rule tests in `src/lib/search-gating.test.ts`: no empty gated target/source, child and source-page handling, automatic reopening, and exact two real-estate destinations/no removed records. Existing gate rules remain unchanged.
- Full suite: **175 passed, 0 failed, 24 files**, run once. Latest build log: **build OK** (earlier transient title_ar errors cleared once the dependent index edit completed).

## Limits and unchanged scope
Authenticated admin editor was not exercised because there is no requesting-user app account; the validated privileged update, audit and signed-out UI read-back were checked instead. Automatic gate reopening was tested with explicit true availability, not by making hidden data public. No hidden tables, flags, translations, new pages, guide steps, tourism cards, visa pages or sitemap were changed. Nothing published; maintenance unchanged.
