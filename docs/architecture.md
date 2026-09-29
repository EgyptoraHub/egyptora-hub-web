# Architecture overview

## AI concierge ("EGYPTORA AI")

- UI: `src/components/site/FloatingConcierge.tsx` (floating chat widget, present on all pages via `src/routes/__root.tsx`).
- Server endpoint: `src/routes/api/concierge.ts`. It builds a system prompt that describes the site's pages and features, injects search results from `src/lib/concierge-search.server.ts` (read-only queries against public content tables), and calls the model through the Lovable AI Gateway (`src/lib/ai-gateway.server.ts`).
- **Rule:** the assistant must only ever identify itself as "EGYPTORA AI". The underlying provider/model name must never be shown to visitors. This is enforced in the system prompt; keep it that way.
- The concierge never queries private tables (trips, bookings, user roles, partner applications).

## Partner verification system

End-to-end flow:

1. A company applies via `/become-a-partner` → row in `partner_applications` (status `documents_pending`).
2. The applicant uploads two documents (business registration, authorization) in the partner portal (`/partners`). Files go to the **private** Supabase Storage bucket `partner-documents`; public access is refused.
3. Once both documents are uploaded, status becomes `under_review`.
4. Admins review in `/admin/partners` ("Received applications"): **Verify**, **Reject** (note required), or **Request changes** (note + flagged documents required → status `changes_requested`; the applicant re-uploads only the flagged files, returning to `under_review`).
5. Notifications: new applications notify all admins; verify/reject/request-changes notify the applicant (bell in the top nav, including mobile).
6. Delete (admin, any status) removes the row **and** its storage files.

Key code: `src/lib/partners.functions.ts`, `src/lib/admin-partners.functions.ts`, `src/components/site/PartnerApplications.tsx`, `src/routes/admin.partners.tsx`, `src/routes/admin.partners_.new.tsx`.

**Sumsub:** integration is a documented no-op stub in `src/lib/verification-provider.ts`. See [known-limitations.md](known-limitations.md).

## Investment sector filters

`src/data/investment-sectors.ts` defines `SECTOR_GROUPS`; each Invest in Egypt nav sub-item links to `/investment-opportunities?sector=...`, filtered by keyword matching on the free-text `sector` column. Empty sectors show "No opportunities are published in this sector yet".

## Experience filters

`src/routes/experiences.$type.tsx` maps `beaches` → destinations tagged `coast`, `desert` → `desert` + `oasis`, `nile-cruises` → `nile`. Other experience types (diving, religious, eco, family, wellness, food) have no tagging yet and intentionally show "Coming soon".

## Site search

`src/lib/site-search.ts` + generated index `src/data/search-index.generated.ts` power `/search?q=...` (English only). Regenerate the index when static content changes.

## Internationalization

9 languages (en, ar + 7 more) via `src/i18n/` dictionaries; RTL supported. UI strings go through `t(...)`; database content translation is partial. A dev-only missing-key collector (`window.__i18nMissing`) exists in `src/i18n/index.tsx` for audits.

## Auth & roles

Supabase Auth (email/password + Google via the Lovable broker). Roles live in `user_roles`; admin checks happen server-side (`src/lib/roles.functions.ts`), never trust client-side role state. Protected server functions use the `requireSupabaseAuth` middleware with the bearer attacher registered in `src/start.ts`.
