# Known limitations & intentional stubs

Accuracy note: this list reflects the codebase as of September 2026. Where something was unclear in the code, it is marked as such rather than guessed.

## Intentional stubs / scaffolds

- **Sumsub KYC/KYB** — `src/lib/verification-provider.ts` (`verifyWithSumsub`) is a deliberate no-op. Verification today is fully manual (admin document review). The file's header comment documents exactly how to wire the real Sumsub API later (createServerFn + signed webhook under `src/routes/api/public/`, keys as backend secrets).
- **Planned integrations** — `src/lib/integrations.config.ts` lists a government portal and a service-provider API as `not_connected` placeholders. Nothing calls them.
- **Stripe payments** — bookings schema has Stripe test-mode fields, but checkout is blocked: Lovable's built-in payments are unavailable for seller country EG. Needs a BYO Stripe test key or a non-EG seller entity.
- **Partner dashboard for verified partners** — deferred; verified partners currently have no self-service listing management.
- **"Partner accounts" / "Review queue" sections** at the bottom of `/admin/partners` — deferred follow-up work.

## Blocked on data/partners (not missing code)

- Live in Egypt content (residency, healthcare, jobs, cost of living) — no source data.
- Do Business sub-items — need sourced government process content.
- Nile cruise booking — needs a cruise partner with bookable inventory.
- Accessible Egypt / Heritage Passport — no accessibility survey data.
- Experience tags beyond coast/desert/oasis/nile (diving, religious, eco, family, wellness, food) — intentionally "Coming soon", not faked.

## Content gaps

- Photos missing for a share of destinations/heritage sites/museums/areas (icon placeholders shown instead).
- Some governorate tabs (Essential Services, Mobility, Research & Education) show "Coming soon".
- Database content translation into the 9 languages is partial; untranslated entries fall back to English.

## Operational notes

- The AI concierge depends on Lovable AI Gateway credits; when exhausted it shows "The concierge could not answer right now." (402).
- Site search index is English-only and must be regenerated when static content changes.
- Security scanner reports expected "anyone can read public content" findings on public tables — these are by design.
