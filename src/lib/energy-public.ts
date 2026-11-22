export const ENERGY_INTRO = "A planned B2B platform to connect companies that buy, sell, reuse and recycle materials for oil and gas, energy and industrial projects. This section is under development.";
export const ENERGY_NOTICE = "Under development. No buying, selling, quotations, supplier verification or payments are available yet. Nothing here is an approval, certification or recommendation of any company.";
export const ENERGY_FORM_NOTICE = "Company data only. No files or confidential project documents. This is an expression of interest and creates no obligation or promise of service.";
export const ENERGY_CONSENT = "The company agrees that Egyptora Hub stores these details to contact it about this section.";
export const ENERGY_STANDARDS = "Technical standards (for example international piping and pressure codes) are owned by their publishers and may require licences. Egyptora Hub does not reproduce or certify them.";
export const ENERGY_LABELS = { civil: "Civil", mechanical: "Mechanical", electrical: "Electrical", instrumentation_control: "Instrumentation and control", telecommunications: "Telecommunications", circular: "Circular" } as const;
export const ENERGY_CATEGORIES = {
 civil: ["Structural steel", "Concrete and reinforcement", "Piling and foundations", "Roads and drainage"],
 mechanical: ["Piping and pipelines (above-ground, underground)", "Valves", "Flanges and fittings", "Pumps and compressors", "Pressure vessels and tanks", "Heat exchangers"],
 electrical: ["Cables", "Switchgear", "Transformers", "Motors", "Lighting and earthing"],
 instrumentation_control: ["Transmitters and gauges", "Control valves", "Analyzers", "Control panels"],
 telecommunications: ["Fibre and cables", "Network and radio equipment"],
 circular: ["Surplus materials", "Reusable equipment", "Scrap and recycling streams"],
} as const;
export const ENERGY_LATER = ["Company registration", "Supplier qualification", "Material take-off analysis", "Requests for quotation", "Inventory", "Logistics", "Surplus listings", "Reports"] as const;
