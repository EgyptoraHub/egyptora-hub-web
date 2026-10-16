import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { ItemActions, type TripItemType } from "@/lib/trip-actions";

/** One item proposed by the concierge, grounded in a real catalogue row. */
export type ItineraryItem = {
  day?: number;
  /** Primary key of the catalogue row; detail routes resolve by id. */
  id?: string;
  name: string;
  slug: string;
  type: string;
  summary?: string;
};

const FENCE = /```itinerary\s*([\s\S]*?)```/i;

/**
 * Splits a concierge reply into prose and the structured itinerary block the
 * model appends. Malformed or partial blocks simply yield no items.
 */
export function parseItinerary(content: string): { text: string; items: ItineraryItem[] } {
  const match = FENCE.exec(content);
  if (!match) {
    // Hide a half-streamed fence so the raw JSON never flashes in the bubble.
    const open = content.indexOf("```itinerary");
    return { text: open === -1 ? content : content.slice(0, open).trim(), items: [] };
  }
  const text = content.replace(FENCE, "").trim();
  try {
    const parsed: unknown = JSON.parse((match[1] ?? "").trim());
    if (!Array.isArray(parsed)) return { text, items: [] };
    const items = parsed
      .filter((i): i is ItineraryItem => {
        const row = i as ItineraryItem;
        return !!row && typeof row.name === "string" && typeof row.slug === "string";
      })
      .map((i) => ({ ...i, type: String(i.type ?? "") }));
    return { text, items };
  } catch {
    return { text, items: [] };
  }
}

const TRIP_TYPES: Record<string, TripItemType> = {
  heritage_sites: "heritage_site",
  museums: "museum",
  events: "event",
  properties: "property",
  offers: "offer",
};

const TYPE_LABEL: Record<string, string> = {
  governorates: "Governorate",
  destinations: "Destination",
  heritage_sites: "Heritage site",
  museums: "Museum",
  events: "Event",
  properties: "Property",
  offers: "Offer",
};

function ItemLink({ item, label }: { item: ItineraryItem; label: string }) {
  const cls = "text-2xs font-semibold text-gold-text hover:underline";
  // Detail routes resolve rows by primary key, so prefer the id the search returned.
  const id = item.id;
  switch (item.type) {
    case "governorates":
      return (
        <Link to="/governorates/$id" params={{ id: id ?? item.slug }} className={cls}>
          {label}
        </Link>
      );
    case "properties":
      return id ? (
        <Link to="/properties/$id" params={{ id }} className={cls}>
          {label}
        </Link>
      ) : (
        <Link to="/properties" className={cls}>
          {label}
        </Link>
      );
    case "offers":
      return id ? (
        <Link to="/offers/$id" params={{ id }} className={cls}>
          {label}
        </Link>
      ) : (
        <Link to="/offers" className={cls}>
          {label}
        </Link>
      );
    case "heritage_sites":
      return id ? (
        <Link to="/heritage-sites/$id" params={{ id }} className={cls}>
          {label}
        </Link>
      ) : (
        <Link to="/heritage-sites" className={cls}>
          {label}
        </Link>
      );
    case "museums":
      return id ? (
        <Link to="/museums/$id" params={{ id }} className={cls}>
          {label}
        </Link>
      ) : (
        <Link to="/museums" className={cls}>
          {label}
        </Link>
      );
    case "events":
      return id ? (
        <Link to="/events/$id" params={{ id }} className={cls}>
          {label}
        </Link>
      ) : (
        <Link to="/events" className={cls}>
          {label}
        </Link>
      );
    default:
      return null;
  }
}

/** Renders the concierge's proposed itinerary as cards with an Add-to-trip action. */
export function ItineraryCards({ items }: { items: ItineraryItem[] }) {
  const { t } = useI18n();
  if (items.length === 0) return null;

  return (
    <div className="grid gap-2">
      {items.map((item, i) => {
        const tripType = TRIP_TYPES[item.type];
        return (
          <article
            key={`${item.slug}-${i}`}
            className="rounded-xl border border-gold-line/60 bg-card p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-display text-[12px] leading-snug text-foreground">{item.name}</h4>
              {typeof item.day === "number" && (
                <span className="shrink-0 rounded-full border border-gold-line/60 bg-gold-soft px-2 py-0.5 text-2xs font-semibold eyebrow text-gold-text">
                  {`${t("Day")} ${item.day}`}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-2xs eyebrow text-muted-foreground">
              {t(TYPE_LABEL[item.type] ?? item.type)}
            </p>
            {item.summary && (
              <p className="mt-1.5 text-2xs leading-relaxed text-muted-foreground">
                {item.summary}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ItemLink item={item} label={t("View details")} />
              {tripType && (
                <ItemActions
                  itemType={tripType}
                  itemId={item.id ?? item.slug}
                  itemName={item.name}
                />
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
