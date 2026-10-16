import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MapPin,
  Landmark,
  ArrowRight,
  Plus,
  Minus,
  Maximize2,
  Crosshair,
  Search,
  Layers,
  X,

} from "lucide-react";
import { useI18n } from "@/i18n";
import {
  governorates,
  egyptOutline,
  nileCourse,
  projectX,
  projectY,
  type Governorate,
} from "@/data/governorates";
import { governorateProfiles } from "@/data/governorate-profiles";

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const toPath = (pts: [number, number][], close: boolean) =>
  pts
    .map(([lon, lat], i) => `${i === 0 ? "M" : "L"}${projectX(lon).toFixed(2)} ${projectY(lat).toFixed(2)}`)
    .join(" ") + (close ? " Z" : "");

/** Deterministic pseudo-random city lights scattered along the inhabited strip. */
function buildCityLights() {
  const lights: { x: number; y: number; r: number; o: number }[] = [];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (const g of governorates) {
    const cx = projectX(g.lon);
    const cy = projectY(g.lat);
    const count = 14;
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const d = rnd() * 3.4;
      lights.push({
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d * 0.8,
        r: 0.12 + rnd() * 0.22,
        o: 0.18 + rnd() * 0.5,
      });
    }
  }
  return lights;
}

export function EgyptMap() {
  const { t, lang } = useI18n();
  const [activeId, setActiveId] = useState<string>("cairo");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showLabels, setShowLabels] = useState(true);
  const [cardOpen, setCardOpen] = useState(false);


  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const outlinePath = useMemo(() => toPath(egyptOutline, true), []);
  const nilePath = useMemo(() => toPath(nileCourse, false), []);
  const cityLights = useMemo(buildCityLights, []);

  const active = (governorates.find((g) => g.id === activeId) ?? governorates[0]!) as Governorate;
  const labelled = hoverId ?? activeId;
  const labelGov = (governorates.find((g) => g.id === labelled) ?? active) as Governorate;
  const profile = governorateProfiles[active.id];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return governorates;
    return governorates.filter(
      (g) => g.name.toLowerCase().includes(q) || t(g.name).toLowerCase().includes(q),
    );
  }, [query, t]);

  /** px -> svg(0..100) conversion for the viewBox with preserveAspectRatio="meet". */
  const svgMetrics = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 600;
    const h = rect?.height ?? 520;
    const s = Math.min(w, h) / 100;
    return { w, h, s, ox: (w - 100 * s) / 2, oy: (h - 100 * s) / 2, left: rect?.left ?? 0, top: rect?.top ?? 0 };
  }, []);

  /** zoom anchored at a point given in svg units */
  const zoomAt = useCallback((factor: number, sx: number, sy: number) => {
    setView((v) => {
      const next = clamp(v.z * factor, MIN_ZOOM, MAX_ZOOM);
      const k = next / v.z;
      return { z: next, x: sx - (sx - v.x) * k, y: sy - (sy - v.y) * k };
    });
  }, []);

  const zoomButton = useCallback((factor: number) => zoomAt(factor, 50, 50), [zoomAt]);

  // composed transform: translate(v.x v.y) scale(z) translate(50 50) scale(0.9) translate(-50 -50)
  const focusGovernorate = useCallback((g: Governorate, zoom = 3) => {
    const gx = 50 + 0.9 * (projectX(g.lon) - 50);
    const gy = 50 + 0.9 * (projectY(g.lat) - 50);
    setView({ z: zoom, x: 50 - zoom * gx, y: 50 - zoom * gy });
  }, []);

  // Non-passive wheel listener (React's onWheel is passive).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const m = svgMetrics();
      zoomAt(
        Math.exp(-dy * 0.0018),
        (e.clientX - m.left - m.ox) / m.s,
        (e.clientY - m.top - m.oy) / m.s,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, svgMetrics]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const v = viewRef.current;
    dragRef.current = { px: e.clientX, py: e.clientY, ox: v.x, oy: v.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const { s } = svgMetrics();
    setView((v) => ({ ...v, x: d.ox + (e.clientX - d.px) / s, y: d.oy + (e.clientY - d.py) / s }));
  };
  const endDrag = () => {
    dragRef.current = null;
  };


  const pinScale = 1 / Math.sqrt(view.z);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      {/* ---------------- Map canvas ---------------- */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="relative h-[520px] touch-none select-none overflow-hidden rounded-2xl border border-gold-line/60 bg-surface-2"
        style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("Interactive map of Egypt's 27 governorates")}
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="egSea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.28 0.05 235)" />
              <stop offset="100%" stopColor="oklch(0.16 0.035 250)" />
            </linearGradient>
            <linearGradient id="egLand" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="oklch(0.30 0.022 75)" />
              <stop offset="55%" stopColor="oklch(0.235 0.018 65)" />

              <stop offset="100%" stopColor="oklch(0.175 0.015 60)" />
            </linearGradient>
            <radialGradient id="egDeltaGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="oklch(0.85 0.13 85 / 45%)" />
              <stop offset="100%" stopColor="oklch(0.85 0.13 85 / 0%)" />
            </radialGradient>
            <linearGradient id="egNile" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.72 0.13 215 / 90%)" />
              <stop offset="100%" stopColor="oklch(0.52 0.10 225 / 70%)" />
            </linearGradient>
            <filter id="egGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="0.9" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="egSoft" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <pattern id="egGraticule" width="6.25" height="6.25" patternUnits="userSpaceOnUse">
              <path d="M6.25 0H0V6.25" fill="none" stroke="var(--gold-line)" strokeWidth="0.08" opacity="0.5" />
            </pattern>
            <clipPath id="egClip">
              <path d={outlinePath} />
            </clipPath>
          </defs>

          {/* sea + graticule backdrop */}
          <rect width="100" height="100" fill="url(#egSea)" />
          <rect width="100" height="100" fill="url(#egGraticule)" opacity="0.55" />

          <g
            transform={`translate(${view.x} ${view.y}) scale(${view.z}) translate(50 50) scale(0.9) translate(-50 -50)`}
          >

            {/* land */}
            <path d={outlinePath} fill="url(#egLand)" />
            <path d={outlinePath} fill="url(#egGraticule)" opacity="0.4" />

            <g clipPath="url(#egClip)">
              {/* nile valley haze */}
              <path
                d={nilePath}
                fill="none"
                stroke="oklch(0.60 0.10 190 / 22%)"
                strokeWidth="6"
                filter="url(#egSoft)"
              />
              {/* delta glow */}
              <ellipse cx={projectX(31.0)} cy={projectY(30.9)} rx="9" ry="6" fill="url(#egDeltaGlow)" />
              {/* city lights */}
              {cityLights.map((l, i) => (
                <circle key={i} cx={l.x} cy={l.y} r={l.r} fill="oklch(0.9 0.11 85)" opacity={l.o} />
              ))}
              {/* nile + branches */}
              <path d={nilePath} fill="none" stroke="url(#egNile)" strokeWidth="0.55" strokeLinecap="round" />
              <path
                d={`M${projectX(30.95)} ${projectY(30.45)} L${projectX(30.4)} ${projectY(31.45)}`}
                stroke="url(#egNile)"
                strokeWidth="0.4"
                fill="none"
              />
              <path
                d={`M${projectX(30.95)} ${projectY(30.45)} L${projectX(31.85)} ${projectY(31.42)}`}
                stroke="url(#egNile)"
                strokeWidth="0.4"
                fill="none"
              />
              {/* lake nasser */}
              <ellipse
                cx={projectX(32.0)}
                cy={projectY(22.9)}
                rx="0.9"
                ry="3.2"
                fill="oklch(0.55 0.10 225 / 65%)"
              />
            </g>

            <path d={outlinePath} fill="none" stroke="var(--gold)" strokeWidth="0.28" opacity="0.75" />

            {/* neighbour labels */}
            <g fill="oklch(0.72 0.01 260 / 60%)" fontSize="2" letterSpacing="0.4">
              <text x="4" y="55">{t("LIBYA")}</text>
              <text x="70" y="96">{t("SUDAN")}</text>
              <text x="86" y="30">{t("SAUDI ARABIA")}</text>
              <text x="34" y="6" fill="oklch(0.78 0.05 220 / 70%)">
                {t("Mediterranean Sea")}
              </text>
              <text x="80" y="62" fill="oklch(0.78 0.05 220 / 70%)">
                {t("Red Sea")}
              </text>
            </g>

            {/* site markers of active governorate */}
            {active.sites.map((s) => (
              <g key={s.name} pointerEvents="none">
                <circle cx={projectX(s.lon)} cy={projectY(s.lat)} r={0.45 * pinScale} fill="oklch(0.78 0.15 155)" />
                <circle
                  cx={projectX(s.lon)}
                  cy={projectY(s.lat)}
                  r={1.3 * pinScale}
                  fill="none"
                  stroke="oklch(0.78 0.15 155 / 45%)"
                  strokeWidth={0.14 * pinScale}
                />
              </g>
            ))}

            {/* governorate pins */}
            {governorates.map((g) => {
              const isActive = g.id === activeId;
              const isHover = g.id === hoverId;
              const x = projectX(g.lon);
              const y = projectY(g.lat);
              const s = pinScale * (isActive ? 1.25 : isHover ? 1.12 : 1);
              return (
                <g
                  key={g.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverId(g.id)}
                  onMouseLeave={() => setHoverId((h) => (h === g.id ? null : h))}
                  onClick={() => {
                    setActiveId(g.id);
                    setCardOpen(true);
                  }}

                >
                  <ellipse cx={x} cy={y} rx={1.1 * s} ry={0.4 * s} fill="oklch(0 0 0 / 45%)" />
                  <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
                    <path
                      d={`M${x} ${y} C ${x - 1.9} ${y - 2.6}, ${x - 1.7} ${y - 5.2}, ${x} ${y - 5.2} C ${
                        x + 1.7
                      } ${y - 5.2}, ${x + 1.9} ${y - 2.6}, ${x} ${y} Z`}
                      fill={isActive || isHover ? "var(--gold)" : "oklch(0.80 0.10 85 / 78%)"}
                      stroke="oklch(0.18 0.02 255 / 70%)"
                      strokeWidth="0.14"
                      filter={isActive ? "url(#egGlow)" : undefined}
                    />
                    <circle cx={x} cy={y - 3.5} r="0.75" fill="oklch(0.16 0.02 255)" />
                  </g>
                  {showLabels && (isActive || isHover || view.z > 2.2) && (
                    <text
                      x={x + 2 * s}
                      y={y - 5 * s}
                      fill={isActive ? "var(--gold)" : "oklch(0.9 0.01 260 / 85%)"}
                      fontSize={2.2 * pinScale}
                      className="font-semibold"
                      pointerEvents="none"
                    >
                      {t(g.name)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 50%, transparent 45%, oklch(0.08 0.015 255 / 75%) 100%)",
          }}
        />

        {/* zoom / view controls */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {[
            { icon: Plus, label: t("Zoom in"), onClick: () => zoomButton(1.35), on: false },
            { icon: Minus, label: t("Zoom out"), onClick: () => zoomButton(1 / 1.35), on: false },
            {
              icon: Maximize2,
              label: t("Reset view"),
              onClick: () => {
                setView({ z: 1, x: 0, y: 0 });
                setCardOpen(false);
              },
              on: false,
            },
            {
              icon: Crosshair,
              label: t("Focus"),
              onClick: () => {
                focusGovernorate(active);
                setCardOpen(true);
              },
              on: false,
            },
            {
              icon: Layers,
              label: t("Toggle labels"),
              onClick: () => setShowLabels((s) => !s),
              on: showLabels,
            },
          ].map(({ icon: Icon, label, onClick, on }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={on}
              onClick={onClick}
              onPointerDown={(e) => e.stopPropagation()}
              className={`grid size-9 place-items-center rounded-xl border backdrop-blur transition-colors hover:bg-gold-soft ${
                on
                  ? "border-gold bg-gold-soft text-gold-text"
                  : "border-gold-line/60 bg-background/70 text-gold-text"
              }`}
            >
              <Icon className="size-4" />
            </button>
          ))}

        </div>

        {/* compass */}
        <div className="pointer-events-none absolute bottom-16 left-4 opacity-80">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="23" fill="none" stroke="var(--gold-line)" strokeWidth="1" />
            <path d="M26 6 L30 26 L26 22 L22 26 Z" fill="var(--gold)" />
            <path d="M26 46 L22 26 L26 30 L30 26 Z" fill="oklch(0.7 0.01 260 / 60%)" />
            <text x="26" y="5" textAnchor="middle" fontSize="7" fill="var(--gold)">
              N
            </text>
          </svg>
        </div>

        {/* scale bar + legend */}
        <div className="pointer-events-none absolute bottom-0 left-0 flex flex-wrap items-end gap-6 p-3 text-2xs eyebrow text-muted-foreground">
          <div>
            <div className="flex items-end gap-0 text-2xs">
              <span>0</span>
              <span className="mx-auto" />
            </div>
            <div className="mt-1 h-1.5 w-28 rounded-sm border border-gold-line/70 bg-[linear-gradient(90deg,var(--gold)_50%,transparent_50%)]" />
            <div className="mt-0.5 flex w-28 justify-between text-2xs">
              <span>0</span>
              <span>{Math.round(400 / view.z)} km</span>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-gold" /> {t("Governorate")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success" /> {t("Tourist site")}
            </span>
          </div>
        </div>

        {/* floating detail card — only after clicking a pin */}
        {cardOpen && (
        <div
          className="absolute bottom-3 right-3 w-[248px] overflow-hidden rounded-2xl border border-gold-line/60 bg-background/85 shadow-2xl backdrop-blur-md"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label={t("Close")}
            title={t("Close")}
            onClick={() => setCardOpen(false)}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full border border-gold-line/60 bg-background/80 text-gold-text backdrop-blur"
          >
            <X className="size-3.5" />
          </button>
          {profile?.image && (
            <img
              src={profile.image}
              alt={t(active.name)}
              width={480}
              height={280}
              className="h-24 w-full object-cover"
              loading="lazy"
            />
          )}
          <div className="space-y-2 p-3">
            <div>
              <h4 className="font-display text-lg leading-tight text-gold-text">{t(active.name)}</h4>
              <p className="text-2xs text-muted-foreground">
                {profile ? profile.tagline[lang === "ar" ? "ar" : "en"] : t(active.region)}
              </p>
            </div>
            <dl className="grid gap-1 text-2xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{t("Zone")}</dt>
                <dd className="text-foreground/90">{t(active.region)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{t("Capital")}</dt>
                <dd className="text-foreground/90">{t(active.capital)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">{t("Top attractions")}</dt>
                <dd className="text-foreground/90">{active.sites.length}</dd>
              </div>
            </dl>
            <Link
              to="/governorates/$id"
              params={{ id: active.id }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gold-line bg-gold-soft px-3 py-2 text-xs font-semibold text-gold-text"
            >
              {t("Explore Governorate")} <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
        )}


        {/* hover chip */}
        {hoverId && hoverId !== activeId && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-gold-line/60 bg-background/80 px-3 py-1 text-2xs text-gold-text backdrop-blur">
            {t(labelGov.name)}
          </div>
        )}
      </div>

      {/* ---------------- Side panel ---------------- */}
      <div className="grid content-start gap-3 rounded-2xl border border-border/70 bg-card p-5">
        <div>
          <p className="text-2xs eyebrow text-muted-foreground">
            {t(active.region)}
          </p>
          <h3 className="font-display text-xl text-gold-text">{t(active.name)}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("Capital")}: {t(active.capital)}
          </p>
        </div>

        <label className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2 px-3 py-2">
          <Search className="size-3.5 text-gold-text" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Filter governorates")}
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </label>

        <ul className="grid gap-2">
          {active.sites.map((s) => (
            <li
              key={s.name}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface-2 px-3 py-2 text-xs text-foreground/85"
            >
              <Landmark className="size-3.5 shrink-0 text-gold-text" />
              {t(s.name)}
            </li>
          ))}
        </ul>

        <div className="max-h-40 overflow-y-auto rounded-xl border border-border/60 p-2">
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setActiveId(g.id);
                  focusGovernorate(g);
                }}
                onMouseEnter={() => setHoverId(g.id)}
                onMouseLeave={() => setHoverId(null)}
                className={`rounded-full border px-2.5 py-1 text-2xs transition-colors ${
                  g.id === activeId
                    ? "border-gold-line bg-gold-soft text-gold-text"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(g.name)}
              </button>
            ))}
          </div>
        </div>

        <Link
          to="/governorates/$id"
          params={{ id: active.id }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold-line bg-gold-soft px-4 py-2 text-sm font-semibold text-gold-text"
        >
          <MapPin className="size-4" /> {t("Discover")} {t(active.name)} <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
