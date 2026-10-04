/**
 * Explicit per-table configuration for the generic admin content manager.
 *
 * This is an allowlist on purpose: no runtime schema introspection. Any column that
 * is not listed here can never be written by the editor, whatever the client sends.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "integer"
  | "boolean"
  | "date"
  | "tags"
  | "images"
  | "json"
  | "select"
  | "fk";

export type FieldConfig = {
  name: string;
  type: FieldType;
  /** select options */
  options?: string[];
  /** foreign key source for type "fk" */
  fk?: "governorates" | "eras";
  /** governance fields render in their own section */
  governance?: boolean;
  /** optional display label override */
  label?: string;
};

export type TableConfig = {
  table: string;
  label: string;
  pk: string;
  /** slug column, when the table has one (read-only after creation) */
  slugColumn?: string;
  /** column used as the human label in lists */
  displayColumn: string;
  fields: FieldConfig[];
};

const GOVERNANCE: FieldConfig[] = [
  { name: "source_status", type: "select", options: ["DEMO", "VERIFIED", "OFFICIAL"], governance: true },
  { name: "source_owner", type: "text", governance: true },
  { name: "verified_at", type: "date", governance: true },
  { name: "data_class", type: "select", options: ["PUBLIC", "SENSITIVE"], governance: true },
  {
    name: "governance_status",
    type: "select",
    options: ["PUBLIC_CONTENT", "PENDING_GOVERNMENT_LINK"],
    governance: true,
  },
];

const t = (name: string): FieldConfig => ({ name, type: "text" });
const ta = (name: string): FieldConfig => ({ name, type: "textarea" });
const num = (name: string): FieldConfig => ({ name, type: "number" });
const int = (name: string): FieldConfig => ({ name, type: "integer" });
const bool = (name: string): FieldConfig => ({ name, type: "boolean" });
const date = (name: string): FieldConfig => ({ name, type: "date" });
const tags = (name: string): FieldConfig => ({ name, type: "tags" });
const images: FieldConfig = { name: "images", type: "images" };
const gov: FieldConfig = { name: "governorate_slug", type: "fk", fk: "governorates" };
const eraFk: FieldConfig = { name: "era", type: "fk", fk: "eras" };

export const CONTENT_TABLES: TableConfig[] = [
  {
    table: "emergency_categories",
    label: "Emergency categories",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name_en",
    fields: [t("name_en"), t("name_ar"), t("color"), int("sort_order"), bool("is_active")],
  },
  {
    table: "emergency_numbers",
    label: "Emergency numbers",
    pk: "id",
    displayColumn: "name_en",
    fields: [
      t("category_id"),
      t("name_en"),
      t("name_ar"),
      t("number"),
      t("dial_string"),
      t("availability_ar"),
      t("availability_en"),
      ta("public_note_ar"),
      ta("public_note_en"),
      { name: "status", type: "select", options: ["verified", "needs_check"] },
      bool("is_active"),
      bool("is_primary"),
      int("sort_order"),
      date("last_verified_at"),
      t("source_url"),
      { name: "notes", type: "textarea", label: "Internal notes" },
      t("governance_status"),
    ],
  },
  {
    table: "emergency_reports",
    label: "Emergency number reports",
    pk: "id",
    displayColumn: "message",
    fields: [ta("message"), t("contact_email"), bool("handled")],
  },
  {
    table: "governorates",
    label: "Governorates",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      t("name_ar"),
      t("code"),
      t("capital"),
      t("region"),
      num("area_km2"),
      num("population_m"),
      num("lat"),
      num("lng"),
      tags("highlights"),
      tags("cities"),
      tags("heritage_eras"),
      tags("cuisine"),
      tags("crafts"),
      tags("nature"),
      tags("investment_sectors"),
      bool("has_coast"),
      bool("has_nile"),
      int("annual_visitors"),
      int("hotels"),
      int("heritage_sites"),
      int("guides"),
      int("occupancy_pct"),
      ta("summary"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "destinations",
    label: "Destinations",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      gov,
      t("category"),
      t("best_season"),
      num("lat"),
      num("lng"),
      ta("summary"),
      ta("description"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "heritage_sites",
    label: "Heritage sites",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      gov,
      t("era"),
      t("classification"),
      t("access"),
      t("restoration_status"),
      bool("hidden"),
      num("lat"),
      num("lng"),
      ta("summary"),
      ta("description"),
      tags("academic_references"),
      tags("related_figures"),
      tags("accessibility"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "museums",
    label: "Museums",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      gov,
      t("opened"),
      tags("highlights"),
      t("access"),
      int("collections_count"),
      ta("summary"),
      ta("description"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "events",
    label: "Events",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      gov,
      t("category"),
      date("start_date"),
      date("end_date"),
      t("venue"),
      t("organiser"),
      bool("ticketed"),
      tags("languages"),
      ta("summary"),
      ta("description"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "eras",
    label: "Eras",
    pk: "key",
    displayColumn: "name",
    fields: [
      t("name"),
      t("from_period"),
      t("to_period"),
      t("colour"),
      ta("summary"),
      tags("monuments"),
      tags("museums"),
      tags("rulers"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "rulers",
    label: "Rulers",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      eraFk,
      t("dynasty"),
      t("reign"),
      tags("achievements"),
      tags("monuments"),
      ta("summary"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "heritage_worldwide",
    label: "Heritage held abroad",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      t("object"),
      eraFk,
      t("institution"),
      t("country"),
      ta("provenance_note"),
      ta("summary"),
      ta("description"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "research_programs",
    label: "Research programmes",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      t("university"),
      gov,
      t("field"),
      t("degree"),
      tags("languages"),
      ta("summary"),
      ta("description"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "traveller_stories",
    label: "Traveller stories",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      t("country"),
      { name: "group_type", type: "select", options: ["Solo", "Couple", "Family", "Group", "Business"] },
      tags("destinations"),
      int("rating"),
      tags("positives"),
      tags("negatives"),
      tags("suggestions"),
      { name: "media_type", type: "select", options: ["text", "video"] },
      { name: "moderation_state", type: "select", options: ["IN_REVIEW", "PUBLISHED"] },
      ta("summary"),
      ta("description"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "properties",
    label: "Properties",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      gov,
      t("property_type"),
      num("price_usd"),
      num("area_m2"),
      t("city"),
      ta("summary"),
      ta("description"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "offers",
    label: "Offers",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [t("name"), t("kind"), ta("summary"), ta("description"), images, tags("tags"), ...GOVERNANCE],
  },
  {
    table: "countries",
    label: "Countries",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      t("iso2"),
      t("region"),
      t("currency"),
      t("language"),
      bool("has_egyptian_mission"),
      ta("mission_note"),
      t("visa_route"),
      tags("direct_flights"),
      tags("suggested_routes"),
      int("travellers_to_egypt"),
      ta("summary"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "investment_opportunities",
    label: "Investment opportunities",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      t("sector"),
      gov,
      t("stage"),
      num("investment_min_usd"),
      num("investment_max_usd"),
      num("land_requirement_ha"),
      t("competent_entity"),
      tags("restrictions"),
      { name: "documents", type: "json" },
      tags("demand_signals"),
      tags("risks"),
      ta("summary"),
      ta("description"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "providers",
    label: "Providers",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      t("type"),
      gov,
      t("demo_verification_label"),
      t("licence_ref"),
      num("rating"),
      int("review_count"),
      num("price_from"),
      t("currency"),
      ta("summary"),
      images,
      tags("amenities"),
      tags("accessibility"),
      tags("specialties"),
      tags("languages"),
      tags("availability"),
      ...GOVERNANCE,
    ],
  },
  {
    table: "products",
    label: "Products",
    pk: "id",
    slugColumn: "slug",
    displayColumn: "name",
    fields: [
      t("name"),
      gov,
      t("category"),
      num("price_egp"),
      t("maker"),
      t("collection"),
      ta("summary"),
      ta("description"),
      images,
      tags("tags"),
      ...GOVERNANCE,
    ],
  },
];

export const CONTENT_TABLE_MAP: Record<string, TableConfig> = Object.fromEntries(
  CONTENT_TABLES.map((c) => [c.table, c]),
);

export function getTableConfig(table: string): TableConfig | null {
  return CONTENT_TABLE_MAP[table] ?? null;
}

/** Turn a typed name into a suggested id/slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

/**
 * Coerce one submitted value to the shape the column expects.
 * Shared with the partner portal so both paths validate identically.
 */
export function coerceFieldValue(field: FieldConfig, raw: unknown): unknown {
  if (raw === undefined) return undefined;
  switch (field.type) {
    case "number":
    case "integer": {
      if (raw === "" || raw === null) return null;
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new Error(`${field.name}: not a number`);
      return field.type === "integer" ? Math.trunc(n) : n;
    }
    case "boolean":
      return raw === true || raw === "true";
    case "date":
      return raw === "" || raw === null ? null : String(raw);
    case "tags":
    case "images": {
      if (raw === null) return null;
      if (!Array.isArray(raw)) throw new Error(`${field.name}: expected a list`);
      return raw.map((v) => String(v)).filter((v) => v.trim() !== "");
    }
    case "json": {
      if (raw === null || raw === "" || raw === undefined) return null;
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          throw new Error(`${field.name}: not valid JSON`);
        }
      }
      return raw;
    }
    default: {
      if (raw === null) return null;
      const s = String(raw);
      return s === "" ? null : s;
    }
  }
}
