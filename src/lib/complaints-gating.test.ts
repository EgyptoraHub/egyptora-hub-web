import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Route and nav gating for the Complaints & Government Services Guide:
 * with zero public sectors the hub and sector routes return notFound, the nav
 * item stays an inert "Coming soon", and the pages stay out of the sitemap.
 */
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("complaints gating", () => {
  it("the nav item is gated on public complaint sectors", () => {
    const nav = read("src/data/navigation.ts");
    assert.match(nav, /label: "Complaints & Services Guide", soon: true, to: "\/government-directory\/complaints", gate: "complaint_sectors"/);
    const avail = read("src/lib/nav-availability.ts");
    assert.match(avail, /"complaint_sectors"/);
    assert.match(avail, /supabase\.from\("complaint_sectors"\)/);
  });
  it("hub and sector routes throw notFound when nothing is public", () => {
    assert.match(read("src/routes/government-directory_.complaints.tsx"), /if \(sectors\.length === 0\) throw notFound\(\)/);
    assert.match(read("src/routes/government-directory_.complaints_.$slug.tsx"), /if \(!detail\.sector\) throw notFound\(\)/);
    assert.match(read("src/routes/government-directory_.complaints_.unknown-authority.tsx"), /if \(sectors\.length === 0\) throw notFound\(\)/);
  });
  it("the unknown-authority slug redirects to the guide page", () => {
    assert.match(read("src/routes/government-directory_.complaints_.$slug.tsx"), /redirect\(\{ to: "\/government-directory\/complaints\/unknown-authority" \}\)/);
  });
  it("sector pages are noindex without a public channel", () => {
    assert.match(read("src/routes/government-directory_.complaints_.$slug.tsx"), /channels\.length === 0\) head\.meta\.push\(\{ name: "robots", content: "noindex" \}\)/);
  });
  it("the sitemap lists sector pages only when they have a public channel", () => {
    const sitemap = read("scripts/generate-sitemap.mjs");
    assert.match(sitemap, /complaint_channels\?select=sector_slug&is_active=eq\.true/);
    assert.match(sitemap, /complaintChannelSectors\.has\(s\.slug\)/);
    assert.match(sitemap, /gated\.push\("\/government-directory\/complaints", "\/government-directory\/complaints\/unknown-authority"\)/);
  });
});
