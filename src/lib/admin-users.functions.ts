import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  disabled: boolean;
  is_admin: boolean;
  is_self: boolean;
};

export type AdminUsersPage = {
  rows: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
};

export type Denied = { authorized: false };
export type AdminUsersResult = Denied | { authorized: true; data: AdminUsersPage };
export type AdminUserActionResult =
  | Denied
  | { authorized: true; ok: boolean; error?: string };

export const USERS_PAGE_SIZE = 20;

/** Permanent-ish ban window used for "disable". Reversible via "none". */
const BAN_DURATION = "876000h";

const MAX_FETCH_PAGES = 25;
const FETCH_PER_PAGE = 200;

async function isAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    check_user_id: context.userId,
    check_role: "admin",
  });
  return !error && data === true;
}

type RawUser = {
  id: string;
  email?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
};

function isBanned(user: RawUser) {
  if (!user.banned_until) return false;
  const until = Date.parse(user.banned_until);
  return Number.isFinite(until) ? until > Date.now() : true;
}

/** Admin-only: searchable, paginated list of auth users joined with the admin role. */
export const listAdminUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { search?: string; page?: number }) => input ?? {})
  .handler(async ({ data, context }): Promise<AdminUsersResult> => {
    if (!(await isAdmin(context))) return { authorized: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const all: RawUser[] = [];
    for (let p = 1; p <= MAX_FETCH_PAGES; p++) {
      const { data: chunk, error } = await supabaseAdmin.auth.admin.listUsers({
        page: p,
        perPage: FETCH_PER_PAGE,
      });
      if (error) break;
      const users = (chunk?.users ?? []) as unknown as RawUser[];
      all.push(...users);
      if (users.length < FETCH_PER_PAGE) break;
    }

    const search = (data.search ?? "").trim().toLowerCase();
    const filtered = search
      ? all.filter((u) => (u.email ?? "").toLowerCase().includes(search))
      : all;

    filtered.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    const page = Math.max(1, Math.floor(data.page ?? 1));
    const from = (page - 1) * USERS_PAGE_SIZE;
    const slice = filtered.slice(from, from + USERS_PAGE_SIZE);

    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const admins = new Set(
      ((roleRows ?? []) as { user_id: string }[]).map((r) => r.user_id),
    );

    return {
      authorized: true,
      data: {
        rows: slice.map((u) => ({
          id: u.id,
          email: u.email ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          disabled: isBanned(u),
          is_admin: admins.has(u.id),
          is_self: u.id === context.userId,
        })),
        total: filtered.length,
        page,
        pageSize: USERS_PAGE_SIZE,
      },
    };
  });

/** Admin-only: ban (disable) or unban (enable) a user. Never deletes data. */
export const setUserDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; disabled: boolean }) => {
    if (!input?.userId) throw new Error("Missing user id");
    if (typeof input.disabled !== "boolean") throw new Error("Missing state");
    return input;
  })
  .handler(async ({ data, context }): Promise<AdminUserActionResult> => {
    if (!(await isAdmin(context))) return { authorized: false };

    // Safety: an admin cannot lock themselves out of their own account.
    if (data.userId === context.userId && data.disabled) {
      return {
        authorized: true,
        ok: false,
        error: "You can't disable your own account here.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.disabled ? BAN_DURATION : "none",
    } as { ban_duration: string });

    if (error) return { authorized: true, ok: false, error: error.message };
    return { authorized: true, ok: true };
  });

/** Admin-only: grant or revoke the 'admin' role. Self-revoke is blocked server-side. */
export const setUserAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; makeAdmin: boolean }) => {
    if (!input?.userId) throw new Error("Missing user id");
    if (typeof input.makeAdmin !== "boolean") throw new Error("Missing state");
    return input;
  })
  .handler(async ({ data, context }): Promise<AdminUserActionResult> => {
    if (!(await isAdmin(context))) return { authorized: false };

    // CRITICAL SAFETY RAIL: never allow removing your own admin role.
    if (!data.makeAdmin && data.userId === context.userId) {
      return {
        authorized: true,
        ok: false,
        error:
          "You can't remove your own admin access here — this has to be done directly in the database to avoid locking everyone out.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.makeAdmin) {
      const { data: existing } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", data.userId)
        .eq("role", "admin")
        .maybeSingle();
      if (existing) return { authorized: true, ok: true };

      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: "admin" });
      if (error) return { authorized: true, ok: false, error: error.message };
      const { writeAudit } = await import("@/lib/audit.server");
      await writeAudit({ actorUserId: context.userId, action: "role.admin_granted", entityType: "user", entityId: data.userId });
      return { authorized: true, ok: true };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "admin");
    if (error) return { authorized: true, ok: false, error: error.message };
    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit({ actorUserId: context.userId, action: "role.admin_revoked", entityType: "user", entityId: data.userId });
    return { authorized: true, ok: true };
  });
