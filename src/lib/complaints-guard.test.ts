import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Phase 1 guard: the Complaints & Government Services Guide is informational
 * only. This test fails if any complaint intake artifact ever appears in the
 * codebase: complaint/report forms, case or reference-number tables, reporter
 * identity tables, evidence upload buckets, or fake demo reference numbers.
 */
function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (["node_modules", ".git", "dist", "routeTree.gen.ts"].includes(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.(ts|tsx|sql|mjs)$/.test(entry)) yield path;
  }
}

const FORBIDDEN = [
  /EGY-DEMO/i,
  /complaint_cases/i,
  /complaint_reports/i,
  /complaint_intake/i,
  /complaint_evidence/i,
  /complaint_tracking(?!s)/i,
  /reporter_identity/i,
];

describe("complaints phase 1 guard", () => {
  it("no complaint intake, case table, evidence bucket or demo reference number exists", () => {
    const hits: string[] = [];
    for (const root of ["src", "drizzle/migrations"]) {
      for (const file of walk(join(process.cwd(), root))) {
        const text = readFileSync(file, "utf8");
        for (const pattern of FORBIDDEN) {
          if (pattern.test(text)) hits.push(`${file}: ${pattern}`);
        }
      }
    }
    assert.deepEqual(hits, []);
  });
});
