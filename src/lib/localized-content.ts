/**
 * Content localisation.
 *
 * The content tables (museums, events, providers, …) store their text in English.
 * Translations for every supported language live in `public.content_translations`,
 * one row per (table, row id, language) with the translated text fields in `fields`.
 *
 * These hooks fetch the translation set for the visible table in the active language
 * once, cache it in module memory, and merge it over the English rows. Any field that
 * is missing a translation keeps its English value, so nothing ever renders blank.
 * English rows are returned untouched (English is the source language).
 */
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

export type ContentTable =
  | "governorates"
  | "destinations"
  | "museums"
  | "heritage_sites"
  | "heritage_worldwide"
  | "events"
  | "research_programs"
  | "traveller_stories"
  | "countries"
  | "products"
  | "properties"
  | "providers"
  | "offers"
  | "investment_opportunities"
  | "eras"
  | "rulers";

type FieldMap = Record<string, string>;
type TableMap = Map<string, FieldMap>;

const cache = new Map<string, TableMap>();
const inflight = new Map<string, Promise<TableMap>>();

async function loadTable(table: ContentTable, lang: string): Promise<TableMap> {
  const key = `${table}:${lang}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const running = typeof window !== "undefined" ? inflight.get(key) : undefined;
  if (running) return running;

  const promise = (async () => {
    const map: TableMap = new Map();
    try {
      const { data, error } = await supabase
        .from("content_translations")
        .select("row_id, fields")
        .eq("table_name", table)
        .eq("lang", lang);
      if (error) {
        console.error(`[i18n-content] ${table}/${lang}:`, error.message);
      } else {
        for (const row of data ?? []) {
          const fields = (row.fields ?? {}) as FieldMap;
          map.set(String(row.row_id), fields);
        }
      }
    } catch (err) {
      console.error(`[i18n-content] unexpected error for ${table}/${lang}:`, err);
    }
    cache.set(key, map);
    inflight.delete(key);
    return map;
  })();

  if (typeof window !== "undefined") inflight.set(key, promise);
  return promise;
}

function merge<T extends Record<string, unknown>>(row: T, fields: FieldMap | undefined): T {
  if (!fields) return row;
  const next: Record<string, unknown> = { ...row };
  for (const [field, value] of Object.entries(fields)) {
    if (field === "id") continue;
    // Only override when the row actually has that field and the translation is non-empty.
    if (typeof value === "string" && value.trim() && field in row) next[field] = value;
  }
  return next as T;
}

/** Merge translations for the active language over a list of content rows. */
export function useLocalizedRows<T extends Record<string, unknown>>(
  table: ContentTable,
  rows: T[],
  idKey: keyof T = "id" as keyof T,
): T[] {
  const { lang } = useI18n();
  const [translations, setTranslations] = useState<TableMap | null>(
    lang === "en" ? null : (cache.get(`${table}:${lang}`) ?? null),
  );

  useEffect(() => {
    if (lang === "en") {
      setTranslations(null);
      return;
    }
    let active = true;
    loadTable(table, lang).then((map) => {
      if (active) setTranslations(map);
    });
    return () => {
      active = false;
    };
  }, [table, lang]);

  if (lang === "en" || !translations) return rows;
  return rows.map((row) => merge(row, translations.get(String(row[idKey]))));
}

/** Single-row variant, for detail pages. */
export function useLocalizedRow<T extends Record<string, unknown>>(
  table: ContentTable,
  row: T,
  idKey: keyof T = "id" as keyof T,
): T {
  return useLocalizedRows(table, [row], idKey)[0] ?? row;
}
