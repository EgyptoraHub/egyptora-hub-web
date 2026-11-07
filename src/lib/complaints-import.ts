import { getTableConfig, coerceFieldValue } from "@/lib/admin-content.config";
import { COMPLAINTS_MATCH_KEYS, complaintsMatchKey, complaintSlug, complaintsImportState, complaintsForeignKeyError, validateComplaintValues, type ComplaintsTable } from "./complaints-validation";
import { parseTradeCsv, type TradeImportRow, type TradeImportPlan } from "./trade-import";

export type ComplaintsImportRow = TradeImportRow;
export type ComplaintsImportPlan = TradeImportPlan;

/**
 * Dry-run preview for the Complaints & Government Services Guide CSV import.
 * Same rules as Trade: match-key updates, forced needs_check + inactive on new
 * rows, max 1000 rows, unsupported columns rejected, sector_slug FK validated.
 */
export function previewComplaintsCsv(table: ComplaintsTable, csv: string, existing: Record<string, unknown>[], sectors: Set<string>) {
  const cfg = getTableConfig(table);
  if (!cfg) throw new Error("Unknown table.");
  const [rawHeader, ...lines] = parseTradeCsv(csv.replace(/^﻿/, ""));
  const header = rawHeader?.map((v) => v.trim());
  if (!header || !lines.length) throw new Error("CSV requires a header and data rows.");
  if (lines.length > 1000) throw new Error("Maximum 1000 rows per import.");
  const allowed = new Set(["slug", ...cfg.fields.map((f) => f.name)]);
  if (new Set(header).size !== header.length || header.some((h) => !allowed.has(h))) throw new Error("CSV contains duplicate or unsupported columns.");
  if (COMPLAINTS_MATCH_KEYS[table].some((k) => !header.includes(k))) throw new Error("CSV is missing a match column.");
  const byKey = new Map(existing.map((r) => [complaintsMatchKey(table, r), r]));
  const seen = new Set<string>();
  const slugs = new Set(existing.map((r) => String(r["slug"])));
  const rows: ComplaintsImportRow[] = [];
  const plans: ComplaintsImportPlan[] = [];
  for (const [index, cells] of lines.entries()) {
    try {
      if (cells.length !== header.length) throw new Error("Column count does not match the header.");
      const raw = Object.fromEntries(header.map((h, i) => [h, cells[i]?.trim() ?? ""]));
      const payload: Record<string, unknown> = {};
      for (const field of cfg.fields) {
        if (!(field.name in raw) || ["is_active", "review_status"].includes(field.name)) continue;
        if (field.type === "integer" && raw[field.name] && !Number.isInteger(Number(raw[field.name]))) throw new Error("Use a whole number.");
        payload[field.name] = coerceFieldValue(field, raw[field.name]);
      }
      if (header.includes("slug")) payload["slug"] = complaintSlug.parse(raw["slug"]);
      const key = complaintsMatchKey(table, { ...payload, slug: raw["slug"] });
      if (seen.has(key)) throw new Error("Duplicate match key in CSV.");
      seen.add(key);
      const ex = byKey.get(key);
      const safe = complaintsImportState(payload, !!ex);
      if (!ex && !safe["slug"]) safe["slug"] = `complaints-${crypto.randomUUID()}`;
      if (ex) delete safe["slug"];
      const full = { ...ex, ...safe };
      const error = validateComplaintValues(table, full) || complaintsForeignKeyError(table, full, sectors);
      if (error) throw new Error(error);
      if (!ex && slugs.has(String(safe["slug"]))) throw new Error("Slug already exists.");
      if (!ex) slugs.add(String(safe["slug"]));
      plans.push({ ...(ex ? { id: String(ex["id"]) } : {}), payload: safe });
      rows.push({ line: index + 2, action: ex ? "update" : "new" });
    } catch (error) {
      rows.push({ line: index + 2, action: "rejected", error: error instanceof Error ? error.message : "Invalid row." });
    }
  }
  return { rows, plans };
}
