import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";

const KEY = "maintenance";

/** Public read of the maintenance flag (anon-readable row). */
export const getMaintenance = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const client = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data } = await client.from("site_settings").select("value").eq("key", KEY).maybeSingle();
  const value = (data?.value ?? {}) as { enabled?: boolean };
  return { enabled: value.enabled === true };
});

function matches(input: string, expected: string) {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** Owner-only toggle, protected by the MAINTENANCE_ADMIN_PASSWORD secret. */
export const setMaintenance = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string; enabled: boolean }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["MAINTENANCE_ADMIN_PASSWORD"];
    if (!expected) throw new Error("MAINTENANCE_ADMIN_PASSWORD is not set");
    if (!matches(data.password, expected)) return { ok: false as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("site_settings")
      .upsert({ key: KEY, value: { enabled: data.enabled }, updated_at: new Date().toISOString() });
    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit({ actorUserId: null, action: "maintenance.toggle", entityType: "site_settings", entityId: KEY, metadata: { enabled: data.enabled, via: "owner_password" } });
    return { ok: true as const, enabled: data.enabled };
  });
