/**
 * Nav-level investment sector groups. Each maps to keywords matched against the
 * free-text `investment_opportunities.sector` column (no normalised tag exists).
 */
export type SectorGroup = { id: string; label: string; keywords: string[] };

export const SECTOR_GROUPS: SectorGroup[] = [
  { id: "industry", label: "Industry & Manufacturing", keywords: ["industr", "manufact", "petrochem", "mining", "craft", "pottery", "handicraft"] },
  { id: "tourism", label: "Tourism & Hospitality", keywords: ["touris", "hospitality", "resort", "marina", "diving", "cruis", "mice", "event", "entertainment", "hotel"] },
  { id: "energy", label: "Energy & Renewable", keywords: ["energy", "renew", "solar", "wind", "power"] },
  { id: "infrastructure", label: "Infrastructure & Transportation", keywords: ["logistic", "port", "transport", "infrastr", "new cities"] },
  { id: "agriculture", label: "Agriculture & Food Security", keywords: ["agri", "aquacult", "food", "olive", "rural", "farm"] },
  { id: "ict", label: "ICT & Innovation", keywords: ["ict", "tech", "digital", "software", "innovation", "data cent"] },
  { id: "healthcare", label: "Healthcare & Pharmaceuticals", keywords: ["health", "pharma", "medical", "hospital "] },
  { id: "finance", label: "Financial Services", keywords: ["financ", "bank", "fintech", "insur"] },
];

export function matchesSector(sector: string | null, groupId: string) {
  const g = SECTOR_GROUPS.find((s) => s.id === groupId);
  if (!g || !sector) return false;
  const s = sector.toLowerCase();
  return g.keywords.some((k) => s.includes(k));
}
