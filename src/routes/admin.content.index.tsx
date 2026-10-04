import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listContentTables, type ContentTableSummary } from "@/lib/admin-content.functions";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/content/")({
  ssr: false,
  component: AdminContentIndex,
  head: () => ({
    meta: [
      { title: `Content admin — ${SITE.name}` },
      { name: "description", content: "Internal content management." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Content admin — ${SITE.name}` },
      { property: "og:description", content: "Internal content management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function AdminContentIndex() {
  const { t } = useI18n();
  const load = useServerFn(listContentTables);
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [tables, setTables] = useState<ContentTableSummary[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setState("denied");
        return;
      }
      const result = await load({ data: {} as never });
      if (!active) return;
      if (!result.authorized) {
        setState("denied");
        return;
      }
      setTables(result.tables);
      setState("ready");
    })().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [load]);

  if (state === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <p className="text-sm text-muted-foreground">{t("Checking your access…")}</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card/60 p-8 text-center">
          <h1 className="font-display text-3xl text-foreground">{t("Not authorized")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("You do not have permission to view this page.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-5 py-14">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/80">{SITE.name}</p>
        <h1 className="mt-3 font-display text-3xl text-foreground">{t("Content management")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Choose a content set to view, edit, add or remove entries.")}
        </p>

        {Array.from(new Set(tables.map((x) => x.group))).map((group) => (
        <section key={group} className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold/80">{t(group)}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {tables.filter((x) => x.group === group).map((entry) => (
            <Link
              key={entry.table}
              to="/admin/content/$table"
              params={{ table: entry.table }}
              className="flex items-center justify-between rounded-2xl border border-border bg-card/50 px-5 py-4 transition-colors hover:border-gold/50"
            >
              <span className="text-sm text-foreground">{t(entry.label)}</span>
              <span className="text-xs text-muted-foreground">
                {entry.count} {t("entries")}
              </span>
            </Link>
          ))}
        </div>
        </section>
        ))}
      </div>
    </div>
  );
}
