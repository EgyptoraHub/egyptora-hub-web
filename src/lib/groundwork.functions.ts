import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkRole } from "@/lib/roles.functions";

const FLAGS = ["payments.enabled", "kyc.enabled", "partner_dashboard.enabled", "ai_tools.enabled"] as const;
type Flag = (typeof FLAGS)[number];

/** Admin-only: read all feature flags (all OFF by default). */
export const getFeatureFlags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await checkRole(context, "admin"))) return { authorized: false as const };
    const { data } = await context.supabase.from("site_settings").select("key, value").in("key", [...FLAGS]);
    const flags = Object.fromEntries(FLAGS.map((f) => [f, false])) as Record<Flag, boolean>;
    for (const row of (data ?? []) as { key: Flag; value: { enabled?: boolean } }[]) flags[row.key] = row.value?.enabled === true;
    return { authorized: true as const, flags };
  });

/** Admin-only: change a feature flag. Recorded in the audit log. */
export const setFeatureFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { flag: Flag; enabled: boolean }) => {
    if (!(FLAGS as readonly string[]).includes(input?.flag)) throw new Error("Unknown flag");
    return { flag: input.flag, enabled: input.enabled === true };
  })
  .handler(async ({ data, context }) => {
    if (!(await checkRole(context, "admin"))) return { authorized: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { writeAudit } = await import("@/lib/audit.server");
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: data.flag, value: { enabled: data.enabled }, updated_at: new Date().toISOString() });
    if (error) return { authorized: true as const, ok: false, error: error.message };
    await writeAudit({ actorUserId: context.userId, action: "feature_flag.set", entityType: "site_settings", entityId: data.flag, metadata: { enabled: data.enabled } });
    return { authorized: true as const, ok: true };
  });

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const CONFIRM_WINDOW_MS = 15 * 60 * 1000;

/** Step 1: the signed-in user asks to delete their account. Returns a one-time code valid for 15 minutes. */
export const requestAccountDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const code = [...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit({
      actorUserId: context.userId,
      action: "account.deletion_requested",
      entityType: "user",
      entityId: context.userId,
      metadata: { code_hash: await sha256(`${context.userId}:${code}`), expires_at: new Date(Date.now() + CONFIRM_WINDOW_MS).toISOString() },
    });
    return { ok: true as const, code, expiresInMinutes: 15 };
  });

/** Step 2: confirm with the code. Anonymises the profile, removes personal rows, revokes all sessions. */
export const confirmAccountDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    const code = String(input?.code ?? "").trim().toUpperCase();
    if (!/^[0-9A-F]{8}$/.test(code)) throw new Error("Invalid code");
    return { code };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { writeAudit } = await import("@/lib/audit.server");
    const userId = context.userId;
    const { data: req } = await supabaseAdmin
      .from("audit_log")
      .select("metadata, created_at")
      .eq("actor_user_id", userId)
      .eq("action", "account.deletion_requested")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const meta = (req?.metadata ?? {}) as { code_hash?: string; expires_at?: string };
    if (!meta.code_hash || !meta.expires_at || Date.parse(meta.expires_at) < Date.now()) {
      return { ok: false as const, error: "No active deletion request. Please request a new code." };
    }
    if (meta.code_hash !== (await sha256(`${userId}:${data.code}`))) return { ok: false as const, error: "The code does not match." };

    await supabaseAdmin.from("saved_items").delete().eq("user_id", userId);
    await supabaseAdmin.from("user_consents").delete().eq("user_id", userId);
    await supabaseAdmin.from("notifications").delete().eq("user_id", userId);
    await supabaseAdmin
      .from("profiles")
      .update({ full_name: null, email: null, whatsapp: null, country: null, avatar_url: null, emergency_contact: null })
      .eq("id", userId);
    await writeAudit({ actorUserId: userId, action: "account.deleted", entityType: "user", entityId: userId });
    // Soft delete: blocks sign-in and revokes every session; the auth row is kept anonymised.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId, true);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
