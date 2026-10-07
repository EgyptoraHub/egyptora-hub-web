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

export type UuidFkTable =
  | "emergency_categories"
  | "app_categories"
  | "military_eras"
  | "military_records"
  | "military_figures"
  | "military_sources";
export type FkTable = "governorates" | "eras" | UuidFkTable;
export const UUID_FK_TABLES: UuidFkTable[] = [
  "emergency_categories", "app_categories", "military_eras", "military_records", "military_figures", "military_sources",
];

export type FieldConfig = {
  name: string;
  type: FieldType;
  /** select options */
  options?: string[];
  /** foreign key source for type "fk" */
  fk?: "governorates" | "eras" | "emergency_categories" | "app_categories";
  /** governance fields render in their own section */
  governance?: boolean;
  /** optional display label override */
  label?: string;
  /** shown in the editor but never written */
  readOnly?: boolean;
};

export type ListFilter = {
  name: string;
  label: string;
  options: string[];
  /** options loaded from a category table (value = id, label = name_en) */
  fromTable?: "app_categories" | "emergency_categories" | "military_eras";
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
  /** group heading on the content index */
  group?: string;
  /** hide "Add new" */
  noCreate?: boolean;
  /** uuid primary key generated on create (no identifier input) */
  autoPk?: boolean;
  /** extra columns shown in the list table */
  listColumns?: string[];
  /** quick equality filters on the list */
  filters?: ListFilter[];
  /** table has no updated_at column */
  noUpdatedAt?: boolean;
  /** columns that can be set on many selected rows at once */
  bulk?: { name: string; options: string[] }[];
  /** show the CSV import tool (military_records only) */
  csvImport?: boolean;
  /** column whose per-value counts are shown above the list */
  countBy?: string;
};

export const EMERGENCY_GROUP = "Emergency & Quick Numbers";
export const MILITARY_GROUP = "Egypt Through Time — Military History";
const REVIEW = ["needs_check", "editorial_reviewed", "verified"];
const MIL_TYPES = ["battle", "war", "campaign", "siege", "naval", "air", "operation", "defensive_action", "conflict_phase", "other_record"];
const milEra: FieldConfig = { name: "era_id", type: "fk", fk: "military_eras", label: "Era" };
export const APPS_GROUP = "Egypt Apps";

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
    table: "military_eras",
    label: "Military eras",
    group: MILITARY_GROUP,
    pk: "id",
    autoPk: true,
    slugColumn: "slug",
    displayColumn: "name_en",
    listColumns: ["number", "start_label_en", "is_active"],
    fields: [
      int("number"), t("name_ar"), t("name_en"), t("start_label_ar"), t("start_label_en"), t("end_label_ar"), t("end_label_en"),
      int("sort_order"), ta("rulers_ar"), ta("rulers_en"), ta("key_leadership_ar"), ta("key_leadership_en"), ta("intro_ar"), ta("intro_en"),
      { name: "egypt_era_id", type: "fk", fk: "eras", label: "Matching encyclopedia era (optional)" }, bool("is_active"),
    ],
  },
  {
    table: "military_records",
    label: "Military records",
    group: MILITARY_GROUP,
    pk: "id",
    autoPk: true,
    slugColumn: "slug",
    displayColumn: "title_en",
    listColumns: ["register_no", "record_type", "review_status", "is_active"],
    filters: [
      { name: "era_id", label: "Era", options: [], fromTable: "military_eras" },
      { name: "record_type", label: "Record type", options: MIL_TYPES },
      { name: "review_status", label: "Review status", options: REVIEW },
      { name: "is_active", label: "Active", options: ["true", "false"] },
    ],
    bulk: [
      { name: "review_status", options: REVIEW },
      { name: "is_active", options: ["true", "false"] },
    ],
    csvImport: true,
    countBy: "review_status",
    fields: [
      int("register_no"), milEra, { name: "record_type", type: "select", options: MIL_TYPES },
      t("title_ar"), t("title_en"), t("alt_names"), t("date_label_ar"), t("date_label_en"),
      { name: "year_from", type: "integer", label: "Year from (negative = BCE)" },
      { name: "year_to", type: "integer", label: "Year to (negative = BCE)" },
      t("place_ar"), t("place_en"),
      { name: "lat", type: "number", min: -90, max: 90, label: "Latitude (−90 to 90)" },
      { name: "lng", type: "number", min: -180, max: 180, label: "Longitude (−180 to 180)" },
      t("egyptian_leadership_ar"), t("egyptian_leadership_en"), t("opposing_side_ar"), t("opposing_side_en"),
      { name: "outcome", type: "select", options: ["not_assessed", "egyptian_victory", "defeat", "inconclusive", "disputed", "strategic_withdrawal"] },
      ta("note_ar"), ta("note_en"), ta("significance_ar"), ta("significance_en"),
      { name: "review_status", type: "select", options: REVIEW }, t("source_url"), date("last_verified_at"),
      bool("is_featured"), bool("is_active"),
      { name: "internal_notes", type: "textarea", label: "Internal notes — never shown publicly" },
    ],
  },
  {
    table: "military_figures",
    label: "Military figures",
    group: MILITARY_GROUP,
    pk: "id",
    autoPk: true,
    slugColumn: "slug",
    displayColumn: "name_en",
    listColumns: ["review_status", "is_active"],
    filters: [
      { name: "era_id", label: "Era", options: [], fromTable: "military_eras" },
      { name: "review_status", label: "Review status", options: REVIEW },
      { name: "is_active", label: "Active", options: ["true", "false"] },
    ],
    bulk: [
      { name: "review_status", options: REVIEW },
      { name: "is_active", options: ["true", "false"] },
    ],
    fields: [
      t("name_ar"), t("name_en"), t("role_ar"), t("role_en"), milEra, t("years_label_ar"), t("years_label_en"),
      ta("bio_ar"), ta("bio_en"), { name: "review_status", type: "select", options: REVIEW }, bool("is_active"),
      { name: "internal_notes", type: "textarea", label: "Internal notes — never shown publicly" },
    ],
  },
  {
    table: "military_record_figures",
    label: "Record ↔ figure links",
    group: MILITARY_GROUP,
    pk: "id",
    autoPk: true,
    noUpdatedAt: true,
    displayColumn: "role_label",
    listColumns: ["record_id", "figure_id"],
    fields: [
      { name: "record_id", type: "fk", fk: "military_records", label: "Record" },
      { name: "figure_id", type: "fk", fk: "military_figures", label: "Figure" },
      t("role_label"),
    ],
  },
  {
    table: "military_media",
    label: "Military media",
    group: MILITARY_GROUP,
    pk: "id",
    autoPk: true,
    displayColumn: "title_en",
    listColumns: ["kind", "origin_type", "is_active"],
    filters: [{ name: "is_active", label: "Active", options: ["true", "false"] }],
    fields: [
      { name: "record_id", type: "fk", fk: "military_records", label: "Record (optional)" },
      { name: "figure_id", type: "fk", fk: "military_figures", label: "Figure (optional)" },
      { name: "era_id", type: "fk", fk: "military_eras", label: "Era (optional)" },
      { name: "kind", type: "select", options: ["image", "video", "map", "document"] },
      t("url"), t("title_ar"), t("title_en"), ta("caption_ar"), ta("caption_en"),
      { name: "institution", type: "text", label: "Institution (required to show publicly)" },
      t("accession_id"),
      { name: "rights_statement", type: "textarea", label: "Rights statement (required)" },
      { name: "origin_type", type: "select", options: ["original_artifact", "archival_photo", "historical_artwork", "map", "editorial_reconstruction"] },
      bool("is_active"),
    ],
  },
  {
    table: "military_sources",
    label: "Military sources",
    group: MILITARY_GROUP,
    pk: "id",
    autoPk: true,
    displayColumn: "title",
    listColumns: ["kind", "review_status", "is_active"],
    filters: [
      { name: "review_status", label: "Review status", options: REVIEW },
      { name: "is_active", label: "Active", options: ["true", "false"] },
    ],
    bulk: [
      { name: "review_status", options: REVIEW },
      { name: "is_active", options: ["true", "false"] },
    ],
    fields: [
      { name: "kind", type: "select", options: ["primary", "scholarly", "institutional"] },
      t("title"), t("author"), t("publisher"), t("year"), t("url"),
      { name: "notes", type: "textarea", label: "Internal notes — never shown publicly" },
      { name: "review_status", type: "select", options: REVIEW }, bool("is_active"),
    ],
  },
  {
    table: "military_record_sources",
    label: "Record ↔ source links",
    group: MILITARY_GROUP,
    pk: "id",
    autoPk: true,
    noUpdatedAt: true,
    displayColumn: "citation_detail",
    listColumns: ["record_id", "source_id"],
    fields: [
      { name: "record_id", type: "fk", fk: "military_records", label: "Record" },
      { name: "source_id", type: "fk", fk: "military_sources", label: "Source" },
      t("citation_detail"),
    ],
  },
  {
    table: "military_reports",
    label: "Military record reports",
    group: MILITARY_GROUP,
    pk: "id",
    noCreate: true,
    noUpdatedAt: true,
    displayColumn: "message",
    listColumns: ["contact_email", "handled", "created_at"],
    fields: [
      { name: "message", type: "textarea", readOnly: true },
      { name: "contact_email", type: "text", readOnly: true },
      bool("handled"),
    ],
  },
  {
    table: "emergency_categories",
    label: "Emergency categories",
    group: EMERGENCY_GROUP,
    pk: "id",
    autoPk: true,
    noUpdatedAt: true,
    slugColumn: "slug",
    displayColumn: "name_en",
    listColumns: ["color", "sort_order", "is_active"],
    fields: [t("name_ar"), t("name_en"), t("color"), int("sort_order"), bool("is_active")],
  },
  {
    table: "emergency_numbers",
    label: "Emergency numbers",
    group: EMERGENCY_GROUP,
    pk: "id",
    autoPk: true,
    displayColumn: "name_en",
    listColumns: ["number", "status", "is_active"],
    filters: [
      { name: "status", label: "Status", options: ["verified", "needs_check"] },
      { name: "is_active", label: "Active", options: ["true", "false"] },
    ],
    fields: [
      t("name_ar"),
      t("name_en"),
      t("number"),
      t("dial_string"),
      { name: "category_id", type: "fk", fk: "emergency_categories", label: "Category" },
      t("availability_ar"),
      t("availability_en"),
      ta("public_note_ar"),
      ta("public_note_en"),
      { name: "status", type: "select", options: ["verified", "needs_check"] },
      t("source_url"),
      bool("is_primary"),
      bool("is_active"),
      int("sort_order"),
      date("last_verified_at"),
      { name: "notes", type: "textarea", label: "Internal notes — never shown publicly" },
    ],
  },
  {
    table: "emergency_reports",
    label: "Emergency number reports",
    group: EMERGENCY_GROUP,
    pk: "id",
    noCreate: true,
    noUpdatedAt: true,
    displayColumn: "message",
    listColumns: ["contact_email", "handled", "created_at"],
    fields: [
      { name: "message", type: "textarea", readOnly: true },
      { name: "contact_email", type: "text", readOnly: true },
      bool("handled"),
    ],
  },
  {
    table: "app_categories",
    label: "App categories",
    group: APPS_GROUP,
    pk: "id",
    autoPk: true,
    noUpdatedAt: true,
    slugColumn: "slug",
    displayColumn: "name_en",
    listColumns: ["icon", "sort_order", "is_active"],
    fields: [t("name_ar"), t("name_en"), t("icon"), int("sort_order"), bool("is_active")],
  },
  {
    table: "egypt_apps",
    label: "Egypt apps",
    group: APPS_GROUP,
    pk: "id",
    autoPk: true,
    displayColumn: "name_en",
    listColumns: ["app_type", "status", "is_active"],
    filters: [
      { name: "status", label: "Status", options: ["verified", "needs_check"] },
      { name: "is_active", label: "Active", options: ["true", "false"] },
      { name: "app_type", label: "Type", options: ["government", "service", "private"] },
      { name: "category_id", label: "Category", options: [], fromTable: "app_categories" },
    ],
    fields: [
      t("name_ar"),
      t("name_en"),
      { name: "category_id", type: "fk", fk: "app_categories", label: "Category" },
      { name: "app_type", type: "select", options: ["government", "service", "private"] },
      t("publisher"),
      t("google_play_url"),
      t("app_store_url"),
      t("website_url"),
      ta("description_ar"),
      ta("description_en"),
      { name: "status", type: "select", options: ["verified", "needs_check"] },
      bool("is_active"),
      bool("is_featured"),
      int("sort_order"),
      date("last_verified_at"),
      date("last_link_check"),
      t("governance_status"),
      { name: "internal_notes", type: "textarea", label: "Internal notes — never shown publicly" },
    ],
  },
  {
    table: "app_reports",
    label: "App reports",
    group: APPS_GROUP,
    pk: "id",
    noCreate: true,
    noUpdatedAt: true,
    displayColumn: "message",
    listColumns: ["contact_email", "handled", "created_at"],
    fields: [
      { name: "message", type: "textarea", readOnly: true },
      { name: "contact_email", type: "text", readOnly: true },
      bool("handled"),
    ],
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
