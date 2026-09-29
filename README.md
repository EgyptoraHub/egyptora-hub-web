# Egyptora Hub

Egyptora Hub is a unified digital gateway to Egypt — destinations, heritage, culture, events, investment and living information in one bilingual (English/Arabic + 7 more languages) platform.

Live site: https://www.egyptora-hub.com (`egypt-one.com` is a legacy fallback domain).

## Tech stack

- **Framework:** TanStack Start v1 (React 19, Vite 8, SSR on a Cloudflare Workers target)
- **Styling:** Tailwind CSS v4 (theme tokens in `src/styles.css`)
- **Backend / database / auth / storage:** Supabase via Lovable Cloud
- **AI:** Lovable AI Gateway (powers the "EGYPTORA AI" concierge)
- **Deployment:** Lovable → two-way GitHub sync → published to the custom domain
- **Package manager:** bun (npm also works)

## Running locally

```sh
git clone https://github.com/EgyptoraHub/egyptora-hub-web.git
cd egyptora-hub-web
bun install
bun run dev
```

Other scripts: `bun run build`, `bun run lint`, `bun run format`.

### Environment variables

The app is configured through Lovable; locally you need at minimum:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (browser + server) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key for the browser client |
| `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` | Server-side equivalents used during SSR/build |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged operations (never exposed to the browser) |
| `LOVABLE_API_KEY` | Server-only; authenticates calls to Lovable's AI/connector gateways |
| `VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY` | Optional GA4 measurement ID; analytics is inactive without it |

Never commit real values. See [docs/environment.md](docs/environment.md) for the full checklist.

## Folder structure

```
src/
  routes/            File-based routes (TanStack Router). Dots = slashes,
                     $param = dynamic segment, _prefix = pathless layout.
  routes/api/        Server routes (raw HTTP endpoints, e.g. the concierge).
  components/        UI components (site/, layout/, admin/, dashboard/, ui/).
  lib/               Business logic; *.functions.ts = createServerFn modules.
  data/              Static content (governorates, encyclopedia, navigation…).
  i18n/              Translation dictionaries and language/currency providers.
  integrations/      Generated Supabase clients + Lovable helpers (do not edit
                     the generated files).
  config/            Site-wide constants (src/config/site.ts is the single
                     source of truth for name, domain, contact email).
supabase/
  migrations/        Database migrations (schema + RLS policies).
  config.toml        Supabase local config (auto-generated; do not edit).
docs/                Internal developer documentation (start here).
```

## Deployment

Changes made in the Lovable editor are committed to this repository, and pushes to `main` sync back into Lovable. Publishing from Lovable deploys to `egyptora-hub.com`. Do not force-push or rewrite published history — it breaks the two-way sync.

## Internal docs

- [docs/architecture.md](docs/architecture.md) — AI concierge, partner verification, and other non-obvious systems
- [docs/data-model.md](docs/data-model.md) — database tables and RLS notes
- [docs/known-limitations.md](docs/known-limitations.md) — intentional stubs and gaps
- [docs/environment.md](docs/environment.md) — external services & secrets checklist
