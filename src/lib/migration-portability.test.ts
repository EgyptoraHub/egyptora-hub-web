import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync("drizzle/migrations/0039_signed_in_public_column_permissions.sql", "utf8");

describe("migration 0039 portability", () => {
  it("contains no preview counts, synthetic subject, or visitor-role test block", () => {
    assert.equal(migration.includes("$permissions_test$"), false);
    assert.equal(/\bcount\s*\(|\bgap_count\b|\brow_count\b|\bcardinality\s*\(/i.test(migration), false);
    assert.equal(migration.includes("00000000-0000-4000-8000-000000000061"), false);
    assert.equal(migration.includes("set_config("), false);
  });

  it("looks up the public policy by identity rather than its pre-change role list", () => {
    const lookup = migration.split("\n").find((line) => line.includes("INTO STRICT policy_row"));
    assert.ok(lookup);
    assert.ok(lookup.includes("policyname=target_table || '_public'"));
    assert.equal(lookup.includes("roles="), false);
    assert.equal((migration.match(/AND NOT \(target_table=ANY\(widen\) AND policyname=target_table \|\| '_public'\)/g) ?? []).length, 2);
  });

  it("retains the original role change, column grants and protection checks", () => {
    for (const statement of [
      "ALTER POLICY %I ON public.%I TO anon, authenticated",
      "REVOKE SELECT ON public.%I FROM authenticated",
      "REVOKE SELECT (%s) ON public.%I FROM authenticated",
      "GRANT SELECT (%s) ON public.%I TO authenticated",
      "qual IS NOT DISTINCT FROM policy_row.qual",
      "with_check IS NOT DISTINCT FROM policy_row.with_check",
      "before_policies IS DISTINCT FROM after_policies",
      "before_grants IS DISTINCT FROM after_grants",
      "before_data IS DISTINCT FROM after_data",
    ]) assert.ok(migration.includes(statement), statement);
    assert.equal(/\b(?:INSERT INTO|UPDATE public\.|DELETE FROM)\b/i.test(migration), false);
  });
});