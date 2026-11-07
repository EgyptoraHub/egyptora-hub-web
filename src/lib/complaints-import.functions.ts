import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { COMPLAINTS_TABLES } from "./complaints-validation";
import { previewComplaintsCsv, type ComplaintsImportRow } from "./complaints-import";

export type ComplaintsImportResult = { authorized: boolean; ok: boolean; rows: ComplaintsImportRow[]; committed: number; error?: string };

/** Admin-only validated CSV import for the Complaints & Government Services Guide tables. */
export const importComplaintsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ table: z.enum(COMPLAINTS_TABLES), csv: z.string().max(3_000_000), dryRun: z.boolean().default(true) }).parse(input))
  .handler(async ({ data, context }): Promise<ComplaintsImportResult> => {
    const { data: admin, error: roleError } = await context.supabase.rpc("has_role", { check_user_id: context.userId, check_role: "admin" });
    if (roleError || admin !== true) return { authorized: false, ok: false, rows: [], committed: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let committed = 0;
    let rows: ComplaintsImportRow[] = [];
    try {
      const [existing, sectors] = await Promise.all([
        supabaseAdmin.from(data.table).select("*"),
        supabaseAdmin.from("complaint_sectors").select("slug"),
      ]);
      if (existing.error || sectors.error) throw new Error("Could not check existing entries.");
      const preview = previewComplaintsCsv(data.table, data.csv, existing.data ?? [], new Set((sectors.data ?? []).map((r) => r.slug)));
      rows = preview.rows;
      if (!data.dryRun) {
        const { writeAudit } = await import("@/lib/audit.server");
        for (const plan of preview.plans) {
          const q = plan.id
            ? supabaseAdmin.from(data.table).update(plan.payload as never).eq("id", plan.id)
            : supabaseAdmin.from(data.table).insert(plan.payload as never);
          const { data: saved, error } = await q.select("id").single();
          if (error || !saved) throw new Error("Import stopped. Re-run preview before retrying.");
          committed++;
          await writeAudit({ actorUserId: context.userId, action: "import.csv", entityType: data.table, entityId: saved.id, metadata: { operation: plan.id ? "update" : "create" } });
        }
      }
      return { authorized: true, ok: true, rows, committed };
    } catch (error) {
      return { authorized: true, ok: false, rows, committed, error: error instanceof Error ? error.message : "Import failed." };
    }
  });
