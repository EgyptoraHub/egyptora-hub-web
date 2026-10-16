import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { AdminChecking, AdminDenied } from "@/components/admin/AdminStates";
import {
  CRM_PRIORITIES,
  CRM_STAGES,
  addCrmNote,
  getCrmItem,
  listCrmItems,
  updateCrmPipeline,
  type CrmItemType,
  type CrmNote,
  type CrmPriority,
  type CrmRow,
  type CrmStaff,
  type CrmStage,
} from "@/lib/crm.functions";

const STAGE_LABEL: Record<CrmStage, string> = {
  new: "New",
  contacted: "Contacted",
  negotiating: "Negotiating",
  closed: "Closed",
  lost: "Lost",
};

const PRIORITY_LABEL: Record<CrmPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function CrmBoard({ itemType, heading }: { itemType: CrmItemType; heading: string }) {
  const { t } = useI18n();
  const load = useServerFn(listCrmItems);
  const loadDetail = useServerFn(getCrmItem);
  const savePipeline = useServerFn(updateCrmPipeline);
  const saveNote = useServerFn(addCrmNote);

  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [rows, setRows] = useState<CrmRow[]>([]);
  const [staff, setStaff] = useState<CrmStaff[]>([]);
  const [stageFilter, setStageFilter] = useState<CrmStage | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState<CrmNote[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await load({ data: { itemType } });
    if (!result.authorized) {
      setState("denied");
      return;
    }
    setRows(result.rows);
    setStaff(result.staff);
    setState("ready");
  }, [load, itemType]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        if (active) setState("denied");
        return;
      }
      if (active) await refresh();
    })().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  const openItem = useCallback(
    async (itemId: string) => {
      setSelected(itemId);
      setNotes([]);
      setNoteDraft("");
      const result = await loadDetail({ data: { itemType, itemId } });
      if (result.authorized) setNotes(result.notes);
    },
    [loadDetail, itemType],
  );

  const counts = useMemo(() => {
    const map = new Map<CrmStage, number>(CRM_STAGES.map((s) => [s, 0]));
    for (const row of rows) map.set(row.stage, (map.get(row.stage) ?? 0) + 1);
    return map;
  }, [rows]);

  const visible = stageFilter ? rows.filter((r) => r.stage === stageFilter) : rows;
  const current = rows.find((r) => r.id === selected) ?? null;

  const applyPipeline = async (patch: {
    stage?: CrmStage;
    priority?: CrmPriority;
    assignedTo?: string | null;
  }) => {
    if (!current) return;
    setBusy(true);
    setError(null);
    const result = await savePipeline({ data: { itemType, itemId: current.id, ...patch } });
    setBusy(false);
    if (!result.authorized) {
      setState("denied");
      return;
    }
    if (!result.ok) {
      setError(result.error ?? "Could not save.");
      return;
    }
    toast.success(t("Saved — the pipeline has been updated."));
    await refresh();
  };

  const submitNote = async () => {
    if (!current || !noteDraft.trim()) return;
    setBusy(true);
    setError(null);
    const result = await saveNote({ data: { itemType, itemId: current.id, note: noteDraft.trim() } });
    setBusy(false);
    if (!result.authorized) {
      setState("denied");
      return;
    }
    if (!result.ok) {
      setError(result.error ?? "Could not save the note.");
      return;
    }
    toast.success(t("Note added."));
    setNoteDraft("");
    await openItem(current.id);
  };

  if (state === "loading") return <AdminChecking />;
  if (state === "denied") return <AdminDenied />;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <h1 className="font-display text-3xl text-foreground">{t(heading)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("Internal tracking only. Editing the entry itself still happens in Content.")}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStageFilter(null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs transition-colors",
            stageFilter === null
              ? "border-gold/60 bg-gold/10 text-gold-text"
              : "border-border/60 text-muted-foreground hover:text-foreground",
          )}
        >
          {t("All")} ({rows.length})
        </button>
        {CRM_STAGES.map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => setStageFilter(stage)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              stageFilter === stage
                ? "border-gold/60 bg-gold/10 text-gold-text"
                : "border-border/60 text-muted-foreground hover:text-foreground",
            )}
          >
            {t(STAGE_LABEL[stage])} ({counts.get(stage) ?? 0})
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Item")}</th>
                <th className="px-4 py-3">{t("Stage")}</th>
                <th className="px-4 py-3">{t("Priority")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => void openItem(row.id)}
                  className={cn(
                    "cursor-pointer border-t border-border/60 transition-colors hover:bg-card/60",
                    selected === row.id && "bg-card/70",
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="text-foreground">{row.name}</span>
                    {row.subtitle && (
                      <span className="block text-xs text-muted-foreground">{row.subtitle}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t(STAGE_LABEL[row.stage])}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t(PRIORITY_LABEL[row.priority])}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={3}>
                    {t("Nothing at this stage yet.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="rounded-2xl border border-border bg-card/40 p-5">
          {!current ? (
            <p className="text-sm text-muted-foreground">{t("Select an item to see its details.")}</p>
          ) : (
            <div className="space-y-4">
              <h2 className="font-display text-xl text-foreground">{current.name}</h2>

              <label className="block text-xs text-muted-foreground">
                {t("Stage")}
                <select
                  value={current.stage}
                  disabled={busy}
                  onChange={(e) => void applyPipeline({ stage: e.target.value as CrmStage })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {CRM_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {t(STAGE_LABEL[s])}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs text-muted-foreground">
                {t("Priority")}
                <select
                  value={current.priority}
                  disabled={busy}
                  onChange={(e) => void applyPipeline({ priority: e.target.value as CrmPriority })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {CRM_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {t(PRIORITY_LABEL[p])}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs text-muted-foreground">
                {t("Assigned to")}
                <select
                  value={current.assignedTo ?? ""}
                  disabled={busy}
                  onChange={(e) => void applyPipeline({ assignedTo: e.target.value || null })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">{t("Unassigned")}</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.email ?? s.id}
                    </option>
                  ))}
                </select>
              </label>

              {error && <p className="text-xs text-destructive">{t(error)}</p>}

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("Activity log")}
                </p>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  placeholder={t("Add a note…")}
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <button
                  type="button"
                  disabled={busy || !noteDraft.trim()}
                  onClick={() => void submitNote()}
                  className="mt-2 rounded-full border border-gold/60 bg-gold/10 px-4 py-1.5 text-xs text-gold-text disabled:opacity-50"
                >
                  {t("Add note")}
                </button>

                <ul className="mt-4 space-y-3">
                  {notes.map((note) => (
                    <li key={note.id} className="rounded-lg border border-border/60 p-3">
                      <p className="text-sm text-foreground">{note.note}</p>
                      <p className="mt-1 text-2xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleString()}
                        {note.createdByEmail ? ` · ${note.createdByEmail}` : ""}
                      </p>
                    </li>
                  ))}
                  {notes.length === 0 && (
                    <li className="text-xs text-muted-foreground">{t("No notes yet.")}</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
