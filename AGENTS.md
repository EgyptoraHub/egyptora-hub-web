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
- public/sitemap.xml is fully rebuilt by `npm run sitemap` (static list in the script + public-role DB reads, host from src/config/site.ts); never hand-edit it. Hub chips/cards with a data gate use Chip.gate, and Coming-soon cards omit `to` — one availability check for menu and hubs.
- Traveller stories: visitors get column-level grants only (no moderation_state/internal_notes); the RLS policy shows a row only when published and, if it has a video, consent_status <> 'none' with a rights statement — pages never re-check moderation in code.
- Audit log, AI usage log and feature flags are written only through server helpers in src/lib/audit.server.ts (service role); visitors cannot insert, admins read — keeps one trusted write path.
- Feature flags (payments/kyc/partner_dashboard/ai_tools) live in site_settings; visitors may read only the maintenance row, and any future payment/KYC/partner-dashboard/AI-tool code must call isFeatureEnabled() and stay off when the row is missing.
- AI Concierge searches newer sections (emergency numbers, apps, military records, culture items) with the publishable key so database visitor rules decide visibility, and its output links are filtered to prompt or search-result links — prevents invented URLs and hidden rows.
- Inbound webhooks use /api/public/hooks/$provider with an HMAC-SHA256 signature from WEBHOOK_SHARED_SECRET; unsigned calls get 401 — one guarded entry point for future providers.
- Page-text coverage for the 7 non-AR/EN languages is checked with `bun scripts/i18n-missing.ts`; newer translations sit in src/i18n/phase1-translations.ts and existing dictionary entries take precedence.
- "Coming soon" nav items become pages only with their own original reviewed content; hubs that re-list existing directory records were removed (Prompt 30b) to avoid duplicated content.
- Industrial/Free Zones read through src/lib/economic-zones.ts (explicit public columns; anon column grants exclude internal_notes/source_note); their routes throw notFound until a public row exists, and sitemap/search/concierge link them only under the same condition — no empty or 404-linked pages.
- Government Directory shows only is_active rows (RLS policy + explicit column list); internal_notes/phone_source_url have no visitor grants and are edited via the central admin-content config — keeps unreviewed entities off public pages.
- Military records merged into a parent (merged_into_record_id) never appear standalone: loadMilitary splits them out, their URL 301-redirects to the parent, sitemap/concierge exclude them; only confirmed + public children show as the parent's "Key moments". A DB trigger blocks self-merge, chains and merging a record that has children.
- English data names are bulk-reviewed via admin-only export/import in src/lib/english-names.functions.ts (writes only the English name column, matched by id) — keeps reviewer corrections from touching other fields.
- DEMO traveller stories are hidden by the database visitor rule when site_settings.show_demo_stories is false (missing row = shown), toggled only by admins on the admin dashboard — lists, search, sitemap and concierge all obey without code checks.
- Menu availability (data-driven "Coming soon" items) is loaded in the root route loader so the first server render already has the right state.
- Source-link "Egyptian website" rule lives only in sourceUrlWarning (src/lib/protected-areas.ts) with an owner-approved allowlist; app developer websites and store links are never treated as sources.
- AI-generated images in src/assets/generated/ are read only through src/lib/generated-images.ts (getGeneratedImage/GenImage); `hidden` entries never render and culture-* images carry an "Illustrative AI image" badge — one place for alt text and approval state.
- Language is mirrored into the `egyptora_lang` cookie and read by the root loader, so the first HTML already has the right lang/dir — no LTR flash for Arabic.
- Gold text on light surfaces uses `text-gold-text` (darker token; dark surfaces reset it to brand gold via CSS), and text on gold fills uses `text-gold-foreground` — keeps contrast at 4.5:1 without changing the brand gold.
