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
