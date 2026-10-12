/** Admin-only site switches stored in site_settings (currently: show_demo_stories). */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const KEY = "show_demo_stories";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { check_user_id: context.userId, check_role: "admin" });
  if (error || data !== true) throw new Error("Admins only");
}

export const getDemoStoriesSwitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("site_settings").select("value").eq("key", KEY).maybeSingle();
    // Missing row = ON (matches the database rule).
    return { enabled: (data?.value as { enabled?: boolean } | null)?.enabled !== false };
  });

export const setDemoStoriesSwitch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { enabled: boolean }) => ({ enabled: d?.enabled === true }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: KEY, value: { enabled: data.enabled }, updated_at: new Date().toISOString() } as never);
    if (error) throw new Error(error.message);
    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit({ actorUserId: context.userId, action: "show_demo_stories.toggle", entityType: "site_settings", entityId: KEY, metadata: { enabled: data.enabled } });
    return { enabled: data.enabled };
  });
