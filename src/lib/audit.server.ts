/**
 * Server-only helpers for the inert groundwork tables: audit log, feature flags and AI usage log.
 * Writes use the service role; visitors and signed-in users can never insert into these tables.
 */

export async function writeAudit(entry: {
  actorUserId: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_log").insert({
      actor_user_id: entry.actorUserId,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      metadata: (entry.metadata ?? {}) as never,
    });
  } catch (err) {
    // Never let logging break the action it records.
    console.error("[audit] write failed", err);
  }
}

export const FEATURE_FLAGS = ["payments.enabled", "kyc.enabled", "partner_dashboard.enabled", "ai_tools.enabled"] as const;
export type FeatureFlag = (typeof FEATURE_FLAGS)[number];

/** Reads a feature flag. Missing row or any error = OFF. */
export async function isFeatureEnabled(flag: FeatureFlag): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("site_settings").select("value").eq("key", flag).maybeSingle();
    return (data?.value as { enabled?: boolean } | null)?.enabled === true;
  } catch {
    return false;
  }
}

export async function logAiUsage(entry: {
  userId?: string | null;
  feature: string;
  model: string;
  tokensIn?: number | null;
  tokensOut?: number | null;
}): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ai_usage_log").insert({
      user_id: entry.userId ?? null,
      feature: entry.feature,
      model: entry.model,
      tokens_in: entry.tokensIn ?? null,
      tokens_out: entry.tokensOut ?? null,
      cost_estimate: null,
    });
  } catch (err) {
    console.error("[ai-usage] write failed", err);
  }
}
