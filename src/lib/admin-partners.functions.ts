import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkRole } from "@/lib/roles.functions";
import { getPartnerItemConfig, type PartnerItemType } from "@/lib/partners.config";

export type Denied = { authorized: false };
export type Ok<T> = { authorized: true } & T;

export const PARTNER_TYPES = ["real_estate", "investment", "government"] as const;

export type PartnerAssignment = { itemType: PartnerItemType; itemId: string; name: string };

export type PartnerRecord = {
  id: string;
  orgName: string;
  partnerType: string;
  contactEmail: string | null;
  userId: string | null;
  userEmail: string | null;
  active: boolean;
  assignments: PartnerAssignment[];
};

export type ReviewItem = {
  itemType: PartnerItemType;
  itemId: string;
  name: string;
  lastSubmittedAt: string | null;
};

export type CatalogueOption = { itemType: PartnerItemType; itemId: string; name: string };

async function isAdmin(context: { supabase: any; userId: string }) {
  return checkRole(context, "admin");
}

async function nameMap(itemType: PartnerItemType, ids: string[]) {
  const map = new Map<string, string>();
  if (ids.length === 0) return map;
  const cfg = getPartnerItemConfig(itemType)!;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from(cfg.table as any).select("id, name").in("id", ids);
  for (const row of (data ?? []) as any[]) map.set(String(row.id), String(row.name ?? row.id));
  return map;
}

/** Admin-only: partner accounts, their assignments, and the catalogue to assign from. */
export const listPartners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<Denied | Ok<{ partners: PartnerRecord[]; catalogue: CatalogueOption[] }>> => {
      if (!(await isAdmin(context))) return { authorized: false };
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const [{ data: partnerRows }, { data: assignmentRows }] = await Promise.all([
        supabaseAdmin
          .from("partners")
          .select("id, org_name, partner_type, contact_email, user_id, active")
          .order("org_name"),
        supabaseAdmin.from("partner_assignments").select("partner_id, item_type, item_id"),
      ]);

      const assignments = (assignmentRows ?? []) as any[];
      const propNames = await nameMap(
        "property",
        assignments.filter((a) => a.item_type === "property").map((a) => String(a.item_id)),
      );
      const invNames = await nameMap(
        "investment_opportunity",
        assignments
          .filter((a) => a.item_type === "investment_opportunity")
          .map((a) => String(a.item_id)),
      );

      const emails = new Map<string, string | null>();
      await Promise.all(
        ((partnerRows ?? []) as any[])
          .filter((p) => p.user_id)
          .map(async (p) => {
            try {
              const { data } = await supabaseAdmin.auth.admin.getUserById(String(p.user_id));
              emails.set(String(p.user_id), data?.user?.email ?? null);
            } catch {
              emails.set(String(p.user_id), null);
            }
          }),
      );

      const partners: PartnerRecord[] = ((partnerRows ?? []) as any[]).map((p) => ({
        id: String(p.id),
        orgName: String(p.org_name),
        partnerType: String(p.partner_type),
        contactEmail: p.contact_email ?? null,
        userId: p.user_id ?? null,
        userEmail: p.user_id ? (emails.get(String(p.user_id)) ?? null) : null,
        active: p.active === true,
        assignments: assignments
          .filter((a) => String(a.partner_id) === String(p.id))
          .map((a) => ({
            itemType: a.item_type as PartnerItemType,
            itemId: String(a.item_id),
            name:
              (a.item_type === "property" ? propNames : invNames).get(String(a.item_id)) ??
              String(a.item_id),
          })),
      }));

      const [{ data: props }, { data: invs }] = await Promise.all([
        supabaseAdmin.from("properties").select("id, name").order("name").limit(500),
        supabaseAdmin.from("investment_opportunities").select("id, name").order("name").limit(500),
      ]);

      const catalogue: CatalogueOption[] = [
        ...((props ?? []) as any[]).map((r) => ({
          itemType: "property" as PartnerItemType,
          itemId: String(r.id),
          name: String(r.name ?? r.id),
        })),
        ...((invs ?? []) as any[]).map((r) => ({
          itemType: "investment_opportunity" as PartnerItemType,
          itemId: String(r.id),
          name: String(r.name ?? r.id),
        })),
      ];

      return { authorized: true, partners, catalogue };
    },
  );

/** Admin-only: create or update a partner account. */
export const savePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id?: string | null;
      orgName: string;
      partnerType: string;
      contactEmail?: string | null;
      userEmail?: string | null;
    }) => {
      if (!input?.orgName?.trim()) throw new Error("Organisation name is required");
      if (!(PARTNER_TYPES as readonly string[]).includes(input?.partnerType))
        throw new Error("Invalid partner type");
      return input;
    },
  )
  .handler(async ({ data, context }): Promise<Denied | Ok<{ ok: boolean; error?: string }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let userId: string | null = null;
    const wanted = data.userEmail?.trim().toLowerCase();
    if (wanted) {
      let page = 1;
      while (page <= 25 && !userId) {
        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
        const users = list?.users ?? [];
        const hit = users.find((u) => (u.email ?? "").toLowerCase() === wanted);
        if (hit) userId = hit.id;
        if (users.length < 200) break;
        page += 1;
      }
      if (!userId) {
        return {
          authorized: true,
          ok: false,
          error: `No account found for ${data.userEmail}. Ask them to sign up first.`,
        };
      }
    }

    const payload: Record<string, any> = {
      org_name: data.orgName.trim(),
      partner_type: data.partnerType,
      contact_email: data.contactEmail?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (wanted) payload["user_id"] = userId;

    if (data.id) {
      const { error } = await supabaseAdmin.from("partners").update(payload as any).eq("id", data.id);
      if (error) return { authorized: true, ok: false, error: error.message };
    } else {
      const { error } = await supabaseAdmin.from("partners").insert(payload as any);
      if (error) return { authorized: true, ok: false, error: error.message };
    }
    return { authorized: true, ok: true };
  });

/** Admin-only: activate or deactivate a partner. */
export const setPartnerActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; active: boolean }) => {
    if (!input?.id) throw new Error("Missing partner");
    return { id: String(input.id), active: input.active === true };
  })
  .handler(async ({ data, context }): Promise<Denied | Ok<{ ok: boolean; error?: string }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("partners")
      .update({ active: data.active, updated_at: new Date().toISOString() } as any)
      .eq("id", data.id);
    if (error) return { authorized: true, ok: false, error: error.message };
    return { authorized: true, ok: true };
  });

/** Admin-only: assign or unassign one item to a partner. */
export const setPartnerAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { partnerId: string; itemType: PartnerItemType; itemId: string; assigned: boolean }) => {
      if (!input?.partnerId) throw new Error("Missing partner");
      if (!getPartnerItemConfig(input?.itemType)) throw new Error("Unknown item type");
      if (!input?.itemId) throw new Error("Missing item");
      return { ...input, itemId: String(input.itemId) };
    },
  )
  .handler(async ({ data, context }): Promise<Denied | Ok<{ ok: boolean; error?: string }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.assigned) {
      const { error } = await supabaseAdmin.from("partner_assignments").upsert(
        {
          partner_id: data.partnerId,
          item_type: data.itemType,
          item_id: data.itemId,
        } as any,
        { onConflict: "partner_id,item_type,item_id" },
      );
      if (error) return { authorized: true, ok: false, error: error.message };
    } else {
      const { error } = await supabaseAdmin
        .from("partner_assignments")
        .delete()
        .eq("partner_id", data.partnerId)
        .eq("item_type", data.itemType)
        .eq("item_id", data.itemId);
      if (error) return { authorized: true, ok: false, error: error.message };
    }
    return { authorized: true, ok: true };
  });

/** Admin-only: everything currently waiting for review. */
export const listReviewQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Denied | Ok<{ items: ReviewItem[] }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const items: ReviewItem[] = [];
    for (const type of ["property", "investment_opportunity"] as PartnerItemType[]) {
      const cfg = getPartnerItemConfig(type)!;
      const { data } = await supabaseAdmin
        .from(cfg.table as any)
        .select("id, name, last_submitted_at")
        .eq("moderation_state", "IN_REVIEW")
        .order("name");
      for (const row of (data ?? []) as any[]) {
        items.push({
          itemType: type,
          itemId: String(row.id),
          name: String(row.name ?? row.id),
          lastSubmittedAt: row.last_submitted_at ?? null,
        });
      }
    }
    return { authorized: true, items };
  });

/** Admin-only: approve (publish) or send back an item awaiting review. */
export const reviewItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      itemType: PartnerItemType;
      itemId: string;
      action: "approve" | "send_back";
      note?: string;
    }) => {
      if (!getPartnerItemConfig(input?.itemType)) throw new Error("Unknown item type");
      if (!input?.itemId) throw new Error("Missing item");
      if (input?.action !== "approve" && input?.action !== "send_back")
        throw new Error("Invalid action");
      return { ...input, itemId: String(input.itemId) };
    },
  )
  .handler(async ({ data, context }): Promise<Denied | Ok<{ ok: boolean; error?: string }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const cfg = getPartnerItemConfig(data.itemType)!;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.action === "approve") {
      const { error } = await supabaseAdmin
        .from(cfg.table as any)
        .update({ moderation_state: "PUBLISHED", updated_at: new Date().toISOString() } as any)
        .eq("id", data.itemId);
      if (error) return { authorized: true, ok: false, error: error.message };
    }

    const note = String(data.note ?? "").trim();
    if (note) {
      await supabaseAdmin.from("crm_activity_log").insert({
        item_type: data.itemType,
        item_id: data.itemId,
        note: `${data.action === "approve" ? "Approved" : "Sent back"}: ${note}`.slice(0, 2000),
        created_by: context.userId,
      } as any);
    }

    return { authorized: true, ok: true };
  });

/** Admin-only: permanently delete a received application and its uploaded files. */
export const deletePartnerApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    const id = String(input?.id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Invalid application");
    return { id };
  })
  .handler(async ({ data, context }): Promise<Denied | Ok<{ ok: boolean; removedFiles: number; error?: string }>> => {
    if (!(await isAdmin(context))) return { authorized: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bucket = supabaseAdmin.storage.from("partner-documents");
    const { data: files, error: listErr } = await bucket.list(data.id, { limit: 1000 });
    if (listErr) return { authorized: true, ok: false, removedFiles: 0, error: listErr.message };
    const paths = (files ?? []).map((f) => `${data.id}/${f.name}`);
    if (paths.length) {
      const { error } = await bucket.remove(paths);
      if (error) return { authorized: true, ok: false, removedFiles: 0, error: error.message };
    }
    const { error } = await supabaseAdmin.from("partner_applications").delete().eq("id", data.id);
    if (error) return { authorized: true, ok: false, removedFiles: paths.length, error: error.message };
    return { authorized: true, ok: true, removedFiles: paths.length };
  });
