<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Public directory pages that read category/item tables (emergency numbers, Egypt Apps) select explicit public columns, and anon gets column-level SELECT grants so admin-only note columns are unreadable — RLS alone hides rows, not columns.
- Military History pages read through src/lib/military.ts (explicit public columns); admin edits go through the central admin-content config, with bulk updates and CSV import limited to allow-listed columns — keeps one admin path and no internal notes on public pages.
- Live Like an Egyptian reads through src/lib/culture.ts (explicit public columns; anon has column grants that exclude internal_notes/access_level) and is admin-edited via the central admin-content config plus a dry-run CSV importer — same safety model as Military History.
- public/sitemap.xml dynamic entries (military records/figures, culture pages) are regenerated with `npm run sitemap`, which reads as the public role so only visible rows are listed.
- Traveller stories: visitors get column-level grants only (no moderation_state/internal_notes); the RLS policy shows a row only when published and, if it has a video, consent_status <> 'none' with a rights statement — pages never re-check moderation in code.
- Audit log, AI usage log and feature flags are written only through server helpers in src/lib/audit.server.ts (service role); visitors cannot insert, admins read — keeps one trusted write path.
- Feature flags (payments/kyc/partner_dashboard/ai_tools) live in site_settings; visitors may read only the maintenance row, and any future payment/KYC/partner-dashboard/AI-tool code must call isFeatureEnabled() and stay off when the row is missing.
- AI Concierge searches newer sections (emergency numbers, apps, military records, culture items) with the publishable key so database visitor rules decide visibility, and its output links are filtered to prompt or search-result links — prevents invented URLs and hidden rows.
- Inbound webhooks use /api/public/hooks/$provider with an HMAC-SHA256 signature from WEBHOOK_SHARED_SECRET; unsigned calls get 401 — one guarded entry point for future providers.
- Page-text coverage for the 7 non-AR/EN languages is checked with `bun scripts/i18n-missing.ts`; newer translations sit in src/i18n/phase1-translations.ts and existing dictionary entries take precedence.
