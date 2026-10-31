import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkRole } from "@/lib/roles.functions";
import { requireMaintenanceAdmin } from "@/config/maintenance";
import { z } from "zod";

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
  const { data, error } = await client.from("site_settings").select("value").eq("key", KEY).maybeSingle();
  if (error) throw new Error("Maintenance status unavailable");
  const value = (data?.value ?? {}) as { enabled?: boolean };
  return { enabled: value.enabled === true };
});

/** Session-authenticated toggle; role validation precedes privileged access. */
export const setMaintenance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ enabled: z.boolean() }).strict())
  .handler(async ({ data, context }) => {
    requireMaintenanceAdmin(Boolean(context.userId), await checkRole(context, "admin"));

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: KEY, value: { enabled: data.enabled }, updated_at: new Date().toISOString() });
    if (error) throw new Error("Maintenance change could not be saved");
    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit({ actorUserId: context.userId, action: "maintenance.toggle", entityType: "site_settings", entityId: KEY, metadata: { enabled: data.enabled, via: "admin_session" } });
    return { ok: true as const, enabled: data.enabled };
  });
