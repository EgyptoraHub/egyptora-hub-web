import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminChecking, AdminDenied, adminHead } from "@/components/admin/AdminStates";
import { getPartnerItem, savePartnerItem } from "@/lib/partners.functions";
import {
  MODERATION_LABEL,
  getPartnerItemConfig,
  type PartnerItemType,
} from "@/lib/partners.config";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/partners/$type/$id")({
  ssr: false,
  head: () => adminHead(`Edit entry — ${SITE.name}`, "Partner content editor."),
  component: PartnerItemPage,
});

function labelOf(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function PartnerItemPage() {
  const { t } = useI18n();
  const params = useParams({ from: "/partners/$type/$id" });
  const load = useServerFn(getPartnerItem);
  const save = useServerFn(savePartnerItem);

  const cfg = getPartnerItemConfig(params.type);
  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [values, setValues] = useState<Record<string, any>>({});
  const [name, setName] = useState("");
  const [moderationState, setModerationState] = useState("PUBLISHED");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!cfg) {
        if (active) setState("denied");
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setState("denied");
        return;
      }
      const result = await load({
        data: { itemType: params.type as PartnerItemType, itemId: params.id },
      });
      if (!active) return;
      if (!result.authorized) {
        setState("denied");
        return;
      }
      setValues(result.values);
      setName(result.name);
      setModerationState(result.moderationState);
      setState("ready");
    })().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [load, params.type, params.id, cfg]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const result = await save({
      data: { itemType: params.type as PartnerItemType, itemId: params.id, values },
    });
    setBusy(false);
    if (!result.authorized) return setState("denied");
    if (!result.ok) return setError(result.error ?? "Could not save.");
    setModerationState("IN_REVIEW");
    setMessage("Submitted. An administrator will review it before it goes live.");
  };

  if (state === "loading") return <AdminChecking />;
  if (state === "denied" || !cfg) return <AdminDenied />;

  return (
    <div className="min-h-screen bg-background px-5 py-14">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/partners"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold-text"
        >
          <ArrowLeft className="size-3.5 rtl:rotate-180" />
          {t("Back to your entries")}
        </Link>

        <h1 className="mt-5 font-display text-3xl text-foreground">{name}</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("Status")}: {t(MODERATION_LABEL[moderationState] ?? moderationState)}
        </p>

        <div className="mt-8 space-y-4">
          {cfg.fields.map((field) => {
            const value = values[field.name];
            const set = (v: any) => setValues({ ...values, [field.name]: v });
            return (
              <label key={field.name} className="block text-xs text-muted-foreground">
                {t(labelOf(field.name))}
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={value ?? ""}
                    onChange={(e) => set(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                ) : field.type === "tags" || field.type === "images" ? (
                  <textarea
                    rows={3}
                    value={Array.isArray(value) ? value.join("\n") : ""}
                    onChange={(e) =>
                      set(
                        e.target.value
                          .split("\n")
                          .map((v) => v.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder={t("One per line")}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    value={value ?? ""}
                    onChange={(e) => set(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                )}
              </label>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{t(error)}</p>}
        {message && <p className="mt-4 text-sm text-gold-text">{t(message)}</p>}

        <button
          type="button"
          disabled={busy}
          onClick={() => void submit()}
          className="mt-6 rounded-full border border-gold/60 bg-gold/10 px-5 py-2 text-sm text-gold-text disabled:opacity-50"
        >
          {t("Submit for review")}
        </button>
      </div>
    </div>
  );
}
