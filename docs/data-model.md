# Data model summary

All tables live in Supabase (Lovable Cloud). Migrations are in `supabase/migrations/`. **Every public table has RLS enabled** — when adding a table, add policies in the same migration or it is locked by default.

## Public content (readable by anyone via `TO anon` SELECT policies)

| Table | Contents |
| --- | --- |
| `government_entities` | ~60 Egyptian government bodies for the Government Directory |
| `governorates` | 27 governorates (flag, history, famous food/clothing, etc.) |
| `governorate_areas` | Districts/areas per governorate (~224 rows) |
| `destinations` | Tourist destinations, tagged by category (heritage, coast, oasis, nile, desert) |
| `heritage_sites` | Heritage sites, incl. a "hidden" marker used by the Hidden Egypt filter |
| `museums` | Museums |
| `investment_opportunities` | Investment listings (free-text `sector`, min/max USD) |
| `properties` | Real-estate listings (`price_usd`) |
| `providers` | Service providers (`price_from`, currency USD) |
| `products` | Marketplace products |
| `offers` | Offers/deals |
| `countries` | Country profiles (heritage worldwide section) |
| `events` | Events |
| `legal_documents` / `legal_document_versions` | Legal center content |
| `content_translations` | Translated database content (partial coverage) |

## User-owned / sensitive (owner-scoped RLS — be careful)

| Table | Contents | Notes |
| --- | --- | --- |
| `profiles` | User profile data | Owner read/write |
| `user_roles` | Role grants (admin etc.) | Never expose; checks are server-side |
| `trips` / `bookings` | Trip Builder data | Owner-only; bookings hold amount/currency/Stripe test fields |
| `saved_items` | Heart/save feature | Owner-only |
| `notifications` | Bell notifications | Owner read; written by triggers/server fns |
| `partner_applications` | Partner applications + `verification_status` + `flagged_docs` | Applicant sees own; admins see all |

## Storage

- `partner-documents` — **private** bucket for verification documents. Access only via short-lived signed URLs for the applicant and admins. Do not make it public.

## Rules of thumb

- Public read-only queries: use a publishable-key client with narrow `TO anon` policies.
- User data: `requireSupabaseAuth` server functions; RLS enforces ownership.
- `supabaseAdmin` (service role, bypasses RLS): privileged operations only, always loaded inside handlers with `await import("@/integrations/supabase/client.server")`.
