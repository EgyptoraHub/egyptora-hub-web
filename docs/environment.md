# Environment & secrets checklist

Every external service this project talks to, and what must be provisioned for a new environment. **Names only — never commit values.**

## Supabase (via Lovable Cloud)

Database, auth, storage, RLS. Required variables:

| Name | Scope | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | browser | Project URL for the browser client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | browser | Publishable (anon) key; RLS applies |
| `SUPABASE_URL` | server | Project URL for SSR/server functions |
| `SUPABASE_PUBLISHABLE_KEY` | server | Server-side public reads |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Privileged operations only (RLS bypass) |

## Lovable platform

| Name | Scope | Purpose |
| --- | --- | --- |
| `LOVABLE_API_KEY` | server | Authenticates AI Gateway and connector-gateway calls. Provisioned automatically by Lovable — never ask users for it. |

## Lovable AI Gateway

Powers the EGYPTORA AI concierge (`src/routes/api/concierge.ts`). No API key to manage — usage draws on workspace AI credits. If credits are exhausted the concierge returns an error message.

## Google Analytics (optional)

| Name | Scope | Purpose |
| --- | --- | --- |
| `VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY` | browser | GA4 measurement ID. Set via the Google Analytics connector; analytics code in `src/lib/analytics.ts` is inactive without it. |

## GitHub connector (optional, workspace tooling)

| Name | Scope | Purpose |
| --- | --- | --- |
| `GITHUB_API_KEY` | server | Gateway-backed GitHub API access (used for repo operations from Lovable, not by the running site). |

## Future / not yet provisioned

- `SUMSUB_APP_TOKEN`, `SUMSUB_SECRET_KEY` — for the planned Sumsub KYB integration (currently a stub; see `src/lib/verification-provider.ts`).
- Stripe test keys — blocked pending a non-EG seller entity or BYO key.

## Rules

- Server secrets: read via `process.env['NAME']` **inside** server function handlers or server routes — never at module scope, never in browser code.
- Browser values must use the `VITE_` prefix and are public by definition.
- After changing a server secret, republish the app for the published site to pick it up.

## WEBHOOK_SHARED_SECRET (server-only, not yet set)
Shared secret for `/api/public/hooks/<provider>`. Callers send `x-egyptora-signature: sha256=<hex HMAC-SHA256 of raw body>`. Without the secret every call returns 401. Nothing is processed yet.
