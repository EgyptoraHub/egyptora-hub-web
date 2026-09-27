import { useRouterState } from "@tanstack/react-router";
import { governorates } from "@/data/governorates";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import avatar from "@/assets/concierge-avatar.jpg";
import { ItineraryCards, parseItinerary } from "@/components/site/ConciergeItinerary";
import { useI18n } from "@/i18n";

type Pos = { x: number; y: number };
type ChatMessage = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "egyptora-hub:concierge-pos";
const SIZE = 68;
const MARGIN = 16;

const SUGGESTIONS = [
  "Plan 5 days in Cairo & Luxor",
  "Best time for a Nile cruise",
  "Family-friendly Red Sea stays",
];

/**
 * Floating, draggable AI Concierge launcher with a live chat panel backed by
 * the Lovable AI Gateway (`POST /api/concierge`, streamed plain text).
 */
export function FloatingConcierge() {
  const { t } = useI18n();
  const [pos, setPos] = useState<Pos | null>(null);
  const [open, setOpen] = useState(false);
  const dragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef<Pos>({ x: 0, y: 0 });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Governorate pages scope answers to the governorate being viewed.
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const govMatch = /^\/governorates\/([a-z-]+)/.exec(pathname);
  const scope = govMatch ? governorates.find((g) => g.id === govMatch[1]) : undefined;

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("egyptora:open-concierge", onOpen);
    return () => window.removeEventListener("egyptora:open-concierge", onOpen);
  }, []);

  // Default placement (bottom-right) + restore any saved position.
  useEffect(() => {
    const clamp = (p: Pos): Pos => ({
      x: Math.min(Math.max(p.x, MARGIN), window.innerWidth - SIZE - MARGIN),
      y: Math.min(Math.max(p.y, MARGIN), window.innerHeight - SIZE - MARGIN),
    });
    let start: Pos = {
      x: window.innerWidth - SIZE - 24,
      y: window.innerHeight - SIZE - 24,
    };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) start = JSON.parse(raw) as Pos;
    } catch {
      /* ignore malformed storage */
    }
    setPos(clamp(start));

    const onResize = () => setPos((p) => (p ? clamp(p) : p));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, busy]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;
      setError(null);
      setInput("");
      const history: ChatMessage[] = [...messages, { role: "user", content: question }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setBusy(true);

      try {
        const res = await fetch("/api/concierge", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: history.slice(-12),
            ...(scope ? { scope: { slug: scope.id, name: scope.name } } : {}),
          }),
        });

        if (!res.ok || !res.body) {
          const payload = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "The concierge could not answer right now.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          answer += decoder.decode(value, { stream: true });
          setMessages([...history, { role: "assistant", content: answer }]);
        }
        if (!answer.trim()) {
          throw new Error("The concierge could not answer right now.");
        }
      } catch (err) {
        setMessages(history);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, scope],
  );

  // The homepage hero search field hands its question to the concierge.
  useEffect(() => {
    const onAsk = (e: Event) => {
      const question = (e as CustomEvent<string>).detail;
      if (!question) return;
      setOpen(true);
      void send(question);
    };
    window.addEventListener("egyptora:ask-concierge", onAsk);
    return () => window.removeEventListener("egyptora:ask-concierge", onAsk);
  }, [send]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {

    dragging.current = true;
    moved.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging.current) return;
    moved.current = true;
    const next: Pos = {
      x: Math.min(
        Math.max(e.clientX - offset.current.x, MARGIN),
        window.innerWidth - SIZE - MARGIN,
      ),
      y: Math.min(
        Math.max(e.clientY - offset.current.y, MARGIN),
        window.innerHeight - SIZE - MARGIN,
      ),
    };
    setPos(next);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragging.current) return;
      dragging.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (pos) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
        } catch {
          /* storage unavailable */
        }
      }
      if (!moved.current) setOpen((v) => !v);
    },
    [pos],
  );

  if (!pos) return null;

  const panelOnLeft = pos.x > window.innerWidth / 2;
  const panelAbove = pos.y > window.innerHeight / 2;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-live="polite">
      {open && (
        <div
          dir="auto"
          className="pointer-events-auto absolute w-[min(340px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-gold-line bg-popover shadow-[var(--shadow-card)]"
          style={{
            left: panelOnLeft ? undefined : pos.x,
            right: panelOnLeft ? window.innerWidth - pos.x - SIZE : undefined,
            top: panelAbove ? undefined : pos.y + SIZE + 12,
            bottom: panelAbove ? window.innerHeight - pos.y + 12 : undefined,
          }}
        >
          <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 bg-gold-soft px-4 py-3">
            <img
              src={avatar}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover ring-1 ring-gold-line"
            />
            <span className="min-w-0">
              <span className="block truncate font-display text-sm text-gold">
                EGYPTORA AI
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {t("Your personal assistant for everything Egypt")}
              </span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("Close")}
              className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </header>

          <div ref={scrollRef} className="max-h-[46vh] min-h-[132px] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="grid gap-2">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t(
                    "Ask for a 7-day itinerary, a Nile cruise window or a quiet heritage route — the concierge drafts it, you refine it.",
                  )}
                </p>
                <div className="mt-1 grid gap-1.5">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(t(q))}
                      className="rounded-lg border border-border/70 bg-card px-3 py-2 text-start text-[11px] text-muted-foreground transition-colors hover:border-gold-line hover:text-foreground"
                    >
                      {t(q)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {messages.map((m, i) => {
                  if (m.role === "user") {
                    return (
                      <div
                        key={i}
                        className="ms-auto max-w-[85%] rounded-xl rounded-ee-sm bg-gold px-3 py-2 text-[11px] leading-relaxed text-primary-foreground"
                      >
                        {m.content}
                      </div>
                    );
                  }
                  const { text, items } = parseItinerary(m.content);
                  return (
                    <div key={i} className="grid gap-2">
                      {(text || items.length === 0) && (
                        <div className="me-auto max-w-[92%] whitespace-pre-wrap rounded-xl rounded-es-sm border border-border/70 bg-card px-3 py-2 text-[11px] leading-relaxed text-foreground">
                          {(text && <LinkifiedText text={text} />) ||
                            (busy && i === messages.length - 1 ? (
                              <Loader2 className="size-3.5 animate-spin text-gold" />
                            ) : null)}
                        </div>
                      )}
                      <ItineraryCards items={items} />
                    </div>
                  );
                })}
              </div>
            )}
            {error && (
              <p className="mt-2 text-[11px] text-destructive" role="alert">
                {t(error)}
              </p>
            )}
          </div>

          <div className="grid gap-2 border-t border-border/70 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("Ask the concierge…")}
                aria-label={t("Ask the concierge…")}
                className="h-10 w-full min-w-0 rounded-xl border border-border bg-card px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-gold-line"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label={t("Send")}
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold text-primary-foreground transition-opacity disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4 rtl:-scale-x-100" />
                )}
              </button>
            </form>
            <p className="text-[10px] leading-relaxed text-muted-foreground/80">
              {t(
                "You are talking to an AI system, not a human agent or a government official. Its answers are not legal, medical or investment advice and never replace official emergency services — for emergencies contact the official authorities.",
              )}{" "}
              <Link
                to="/legal/$slug"
                params={{ slug: "ai-transparency" }}
                className="text-gold hover:underline"
              >
                {t("AI Transparency Policy")}
              </Link>
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={t("AI Concierge")}
        aria-expanded={open}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ left: pos.x, top: pos.y, width: SIZE, height: SIZE }}
        className="pointer-events-auto absolute grid touch-none place-items-center rounded-full border-2 border-gold bg-background shadow-[0_10px_30px_-8px_rgba(0,0,0,0.9)] transition-transform hover:scale-105 active:scale-95"
      >
        <span className="absolute inset-0 animate-ping rounded-full border border-gold/40" />
        <img
          src={avatar}
          alt=""
          width={68}
          height={68}
          className="size-full rounded-full object-cover"
        />
        <span className="absolute -top-1 -end-1 grid size-6 place-items-center rounded-full bg-gold text-primary-foreground">
          <Sparkles className="size-3.5" />
        </span>
      </button>
    </div>
  );
}

const URL_RE = /(\[[^\]]+\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"*])/g;

/** Renders plain URLs and markdown links in a reply as clickable links. */
function LinkifiedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(URL_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) parts.push(text.slice(last, idx));
    const md = /^\[([^\]]+)\]\((.+)\)$/.exec(m[0]);
    const href = md ? md[2] : m[0];
    parts.push(
      <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-gold underline underline-offset-2">
        {md ? md[1] : m[0]}
      </a>,
    );
    last = idx + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.flatMap((p, i) => (typeof p === "string" ? renderBold(p, i) : [p]))}</>;
}

/** Renders **bold** markers as <strong>; strips any unpaired leftover asterisks. */
function renderBold(s: string, k: number): ReactNode[] {
  return s.split(/\*\*([^*]+?)\*\*/g).map((seg, j) =>
    j % 2 === 1 ? (
      <strong key={`${k}-${j}`} className="font-semibold">
        {seg}
      </strong>
    ) : (
      seg.replace(/\*\*/g, "")
    ),
  );
}
