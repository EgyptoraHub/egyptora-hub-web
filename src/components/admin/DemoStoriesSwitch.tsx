import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getDemoStoriesSwitch, setDemoStoriesSwitch } from "@/lib/site-switches.functions";

/** Owner switch: when OFF, DEMO traveller stories disappear everywhere (enforced by the database). */
export function DemoStoriesSwitch() {
  const load = useServerFn(getDemoStoriesSwitch);
  const save = useServerFn(setDemoStoriesSwitch);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { load({ data: {} as never }).then((r) => setEnabled(r.enabled)).catch(() => setEnabled(null)); }, [load]);

  const toggle = async () => {
    if (enabled === null) return;
    const next = !enabled;
    if (!next && !window.confirm("Hide all DEMO traveller stories from the public site?")) return;
    setBusy(true);
    try { setEnabled((await save({ data: { enabled: next } })).enabled); } finally { setBusy(false); }
  };

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card/60 p-5">
      <h2 className="text-sm font-semibold eyebrow text-muted-foreground">Site settings</h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="me-auto">
          <p className="text-foreground">Show demo traveller stories</p>
          <p className="text-sm text-muted-foreground">Keep ON until launch. When OFF, DEMO stories disappear from lists, search, sitemap and the AI assistant (nothing is deleted).</p>
        </div>
        <button type="button" role="switch" aria-checked={enabled === true} disabled={busy || enabled === null} onClick={toggle}
          className="min-h-11 min-w-20 rounded-full border border-gold/60 px-4 text-sm text-gold-text disabled:opacity-40 aria-checked:bg-gold aria-checked:text-primary-foreground">
          {enabled === null ? "…" : enabled ? "ON" : "OFF"}
        </button>
      </div>
    </section>
  );
}
