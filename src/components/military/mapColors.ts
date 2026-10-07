import type { RecordType } from "@/lib/military";

/** Pin colours per record type (shared by the map and its legend). */
export const TYPE_COLOR: Record<RecordType, string> = {
  battle: "#0B2A45",
  war: "#7A1F1F",
  campaign: "#1F5A7A",
  siege: "#5B3A8C",
  naval: "#0E6E8C",
  air: "#3D5A80",
  operation: "#2F6B3A",
  defensive_action: "#8A5A00",
  conflict_phase: "#6B4E2E",
  other_record: "#4A4A4A",
};
