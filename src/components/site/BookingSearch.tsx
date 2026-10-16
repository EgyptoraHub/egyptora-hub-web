import { useEffect, useRef, useState } from "react";
import { searchTabs } from "@/data/site";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

// Official Travelpayouts widget script, generated from our Travelpayouts
// account (marker 777434). Used for both the Flights and Hotels tabs.
export const TP_WIDGET_SRC =
  "https://tpwgts.com/content?currency=usd&trs=574096&shmarker=777434&show_hotels=true&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%23D9B15B&color_button=%23D9B15B&color_icons=%23D9B15B&dark=%23F3F2ED&light=%230F1721&secondary=%230F1721&special=%23303944&color_focused=%23D9B15B&border_radius=12&plain=true&promo_id=7879&campaign_id=100";

// Transfers (promo 4674), car rental (promo 4480), attractions (Klook, promo 4497)
// and eSIM (promo 8588) widgets — same account marker, one script per product.
export const TP_TRANSFERS_SRC =
  "https://tpwgts.com/content?trs=574096&shmarker=777434&locale=en&powered_by=true&border_radius=16&plain=true&color_background=%230F1721&color_button=%23D9B15B&promo_id=4674&campaign_id=22";

export const TP_CAR_RENTAL_SRC =
  "https://tpwgts.com/content?trs=574096&shmarker=777434&locale=en&powered_by=true&border_radius=16&plain=true&show_logo=false&color_background=%230F1721&color_button=%23D9B15B&color_text=%23F5EFE0&color_input_text=%23000000&color_button_text=%230F1721&promo_id=4480&campaign_id=10";

// Klook widget: no confirmed colour-override parameters for this product, so it
// renders with its default styling rather than risk breaking it with guesses.
export const TP_ATTRACTIONS_SRC =
  "https://tpwgts.com/content?currency=USD&trs=574096&shmarker=777434&locale=en&city_id=284&category=3&amount=3&powered_by=true&campaign_id=137&promo_id=4497";

export const TP_ESIM_SRC =
  "https://tpwgts.com/content?trs=574096&shmarker=777434&locale=en&country=Egypt&powered_by=true&color_button=%23D9B15B&color_focused=%23D9B15B&secondary=%230F1721&dark=%23F5EFE0&light=%23FFFFFF&special=%233A4657&border_radius=16&plain=true&no_labels=&promo_id=8588&campaign_id=541";

// The widget's flight search already opens in a new tab (its form targets
// _blank). Its "Show hotels" option, however, sends the *current* tab to the
// Hotellook deeplink. The widget renders into an open shadow root on our own
// page (no cross-origin iframe), so we intercept that one interaction: on
// submit with "Show hotels" ticked we untick it (widget then only runs the
// flight search), open the identical Hotellook deeplink in a new tab, and
// restore the tick. Marker/tracking parameters are copied from the widget's
// own hidden fields, never altered.
function buildHotelDeeplink(root: ShadowRoot): string | null {
  const val = (name: string) =>
    (root.querySelector(`input[name="${name}"]`) as HTMLInputElement | null)?.value?.trim() ?? "";
  const destination = val("destination_slug");
  const checkIn = val("DateRange_from_name");
  const checkOut = val("DateRange_to_name");
  const marker = val("marker");
  const promo = val("p");
  if (!destination || !checkIn || !marker) return null;

  const params = new URLSearchParams({
    gateId: "2",
    skipRulerCheck: "skip",
    utm_campaign: "checkbox",
    "flags[utm]": `tp_cascoon_${promo}`,
    utm_source: "tp_cascoon",
    utm_medium: `campaign_${promo}`,
    destination,
    selectedHotelId: destination,
    language: val("locale") || "en",
    currency: val("currency") || "usd",
    marker,
    adults: val("passengers_adults") || "1",
    checkIn,
  });
  if (checkOut) params.set("checkOut", checkOut);
  return `https://yasen.hotellook.com/adaptors/location_deeplink?${params.toString()}`;
}

export function TravelpayoutsWidget({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.charset = "utf-8";
    host.appendChild(script);

    let attached: ShadowRoot | null = null;
    let bypass = false;
    const onCapture = (event: Event) => {
      const root = attached;
      if (!root || bypass) return;
      const path = (event as MouseEvent).composedPath();
      const submit = path.find(
        (n) =>
          n instanceof HTMLElement &&
          (n.tagName === "BUTTON" || n.tagName === "INPUT") &&
          (n as HTMLButtonElement).type === "submit",
      ) as HTMLElement | undefined;
      if (!submit) return;
      const checkbox = root.querySelector(
        'input[name="Show_hotels"]',
      ) as HTMLInputElement | null;
      if (!checkbox || !checkbox.checked) return;
      const url = buildHotelDeeplink(root);
      if (!url) return;

      // Hold this submit, untick "Show hotels" so the widget performs only the
      // flight search (its own new-tab behaviour), open the hotel deeplink in a
      // new tab while we still have the click gesture, then replay the submit.
      event.preventDefault();
      event.stopImmediatePropagation();
      checkbox.click();
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => {
        bypass = true;
        submit.click();
        window.setTimeout(() => {
          bypass = false;
          if (!checkbox.checked) checkbox.click();
        }, 600);
      }, 200);
    };

    const timer = window.setInterval(() => {
      const el = host.querySelector("tp-cascoon");
      const root = el?.shadowRoot ?? null;
      if (!root || attached) return;
      attached = root;
      root.addEventListener("click", onCapture, true);
    }, 400);

    return () => {
      window.clearInterval(timer);
      attached?.removeEventListener("click", onCapture, true);
      host.innerHTML = "";
    };
  }, [src]);

  return <div ref={ref} className="w-full min-w-0 overflow-x-hidden [&_iframe]:!w-full" />;
}


/** Real Travelpayouts booking search (marker 777434), restyled for the navy/gold homepage. */
export function BookingSearch() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<(typeof searchTabs)[number]>(searchTabs[0]);

  return (
    <section id="book" className="scroll-mt-24 bg-background pb-8 pt-10 lg:pt-12">
      <div className="mx-auto w-full max-w-[1280px] px-5 lg:px-10">
        <div className="overflow-hidden rounded-[14px] border border-shell-gold/40 bg-navy p-4 shadow-[var(--shadow-card)] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg text-primary-foreground sm:text-xl">
              {t("Book your trip")}
            </h2>
            <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
              {searchTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                  className={cn(
                    "hit-44 shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                    activeTab === tab
                      ? "bg-gold-cta text-navy"
                      : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                  )}
                >
                  {t(tab)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "Flights" ? (
            <TravelpayoutsWidget key="tp-flights" src={TP_WIDGET_SRC} />
          ) : activeTab === "Hotels" ? (
            <TravelpayoutsWidget key="tp-hotels" src={TP_WIDGET_SRC} />
          ) : activeTab === "Transfers" ? (
            <TravelpayoutsWidget key="tp-transfers" src={TP_TRANSFERS_SRC} />
          ) : activeTab === "Car Rental" ? (
            <TravelpayoutsWidget key="tp-car-rental" src={TP_CAR_RENTAL_SRC} />
          ) : activeTab === "Attractions" ? (
            <TravelpayoutsWidget key="tp-attractions" src={TP_ATTRACTIONS_SRC} />
          ) : (
            <TravelpayoutsWidget key="tp-esim" src={TP_ESIM_SRC} />
          )}
        </div>
      </div>
    </section>
  );
}
