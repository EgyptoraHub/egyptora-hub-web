import type { Chip } from "@/components/layout/InnerPage";
import {
  BadgePercent,
  ClipboardList,
  Factory,
  FileCheck2,
  Gavel,
  Globe2,
  LayoutDashboard,
  LifeBuoy,
  PieChart,
  Rocket,
  Scale,
  Ship,
  Sprout,
  Store,
  Warehouse,
} from "lucide-react";

const IO = "/investment-opportunities";

export const doBusinessChips: Chip[] = [
  { label: "Business Overview", Icon: LayoutDashboard },
  { label: "Energy Materials", Icon: Factory, to: "/energy-materials", gate: "energy_materials" },
  { label: "Start a Business", Icon: Rocket },
  { label: "Licenses & Permits", Icon: FileCheck2 },
  { label: "Laws & Regulations", Icon: Scale, to: "/legal" },
  { label: "Investment Incentives", Icon: BadgePercent, to: IO },
  { label: "Sectors & Opportunities", Icon: PieChart, to: IO },
  { label: "Business Support", Icon: LifeBuoy, to: "/providers" },
  { label: "Industrial Zones", Icon: Factory, to: "/do-business/industrial-zones", gate: "industrial_zones" },
  { label: "Free Zones", Icon: Warehouse, to: "/do-business/free-zones", gate: "free_zones" },
  { label: "Trade & Export", Icon: Ship, to: "/products" },
  { label: "Made in Egypt Marketplace", Icon: Store, to: "/marketplace" },
  { label: "Industry & Agriculture", Icon: Sprout, to: "/do-business/industry-agriculture", gate: "trade_sectors" },
  { label: "World Gateway", Icon: Globe2, to: "/do-business/world-gateway", gate: "trade_country_profiles" },
  { label: "Procedure Guides", Icon: ClipboardList, to: "/do-business/procedure-guides", gate: "procedure_guides" },
  { label: "Public Procurement", Icon: Gavel },
];
