/**
 * Government Directory chip strip (Prompt 50f): the three real section entry
 * points (Emergency, Complaints, Egypt Apps) sit directly after "All Entities"
 * so they are visible without scrolling on laptop widths. Order is covered by
 * gov-directory-chips.test.ts — do not reorder without updating it.
 */
import { Gavel, Globe2, GraduationCap, Landmark, LayoutGrid, Link2, Map as MapIcon, MessageSquareWarning, Scale, Siren, Smartphone, TrendingUp, Users } from "lucide-react";
import type { Chip } from "@/components/layout/InnerPage";

const GD = "/government-directory";

export const govDirectoryChips: Chip[] = [
  { label: "All Entities", Icon: LayoutGrid },
  { label: "Emergency & Quick Numbers", Icon: Siren, to: "/emergency-numbers" },
  {
    label: "Complaints & Services Guide",
    Icon: MessageSquareWarning,
    to: `${GD}/complaints`,
    gate: "complaint_sectors",
    hideIfGatedOff: true,
    hint: "Where to file a complaint: official channels by sector.",
  },
  { label: "Egypt Apps", Icon: Smartphone, to: "/egypt-apps" },
  { label: "Ministries", Icon: Landmark, to: `${GD}#ministries` },
  { label: "Regulatory Bodies", Icon: Scale, to: `${GD}#authorities-and-agencies` },
  { label: "Related Entities", Icon: Link2 },
  { label: "Governorates", Icon: MapIcon, to: "/explore-egypt" },
  { label: "Public Services", Icon: Users, to: `${GD}/digital-services` },
  { label: "Economic Authorities", Icon: TrendingUp, to: `${GD}#investment-and-business` },
  { label: "Judicial Bodies", Icon: Gavel },
  { label: "Diplomatic Missions", Icon: Globe2 },
  { label: "Educational Institutions", Icon: GraduationCap, to: "/research-programs" },
];
