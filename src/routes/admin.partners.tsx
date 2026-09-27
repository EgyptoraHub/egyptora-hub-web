import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminChecking, AdminDenied, adminHead } from "@/components/admin/AdminStates";
import { PartnerApplicationsList } from "@/components/site/PartnerApplications";
import {
  PARTNER_TYPES,
  listPartners,
  listReviewQueue,
  reviewItem,
  savePartner,
  setPartnerActive,
  setPartnerAssignment,
  type CatalogueOption,
  type PartnerRecord,
  type ReviewItem,
} from "@/lib/admin-partners.functions";
import type { PartnerItemType } from "@/lib/partners.config";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/partners")({
  ssr: false,
  head: () => adminHead(`Partners — ${SITE.name}`, "Partner accounts and review queue."),
  component: AdminPartnersPage,
});

const TYPE_LABEL: Record<string, string> = {
  real_estate: "Real estate",
  investment: "Investment",
  government: "Government",
};

type Confirm = { message: string; run: () => Promise<void> } | null;

function AdminPartnersPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const load = useServerFn(listPartners);
  const loadQueue = useServerFn(listReviewQueue);
  const save = useServerFn(savePartner);
  const toggleActive = useServerFn(setPartnerActive);
  const setAssignment = useServerFn(setPartnerAssignment);
  const review = useServerFn(reviewItem);

  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [catalogue, setCatalogue] = useState<CatalogueOption[]>([]);
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [editing, setEditing] = useState<PartnerRecord | null>(null);
  const [form, setForm] = useState({ orgName: "", partnerType: "real_estate", contactEmail: "", userEmail: "" });
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const refresh = useCallback(async () => {
    const [result, queueResult] = await Promise.all([
      load({ data: {} as never }),
      loadQueue({ data: {} as never }),
    ]);
    if (!result.authorized || !queueResult.authorized) {
      setState("denied");
      return;
    }
    setPartners(result.partners);
    setCatalogue(result.catalogue);
    setQueue(queueResult.items);
    setState("ready");
  }, [load, loadQueue]);

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

  const startCreate = () => {
    setEditing(null);
    setForm({ orgName: "", partnerType: "real_estate", contactEmail: "", userEmail: "" });
  };

  const startEdit = (partner: PartnerRecord) => {
    setEditing(partner);
    setForm({
      orgName: partner.orgName,
      partnerType: partner.partnerType,
      contactEmail: partner.contactEmail ?? "",
      userEmail: partner.userEmail ?? "",
    });
  };

  const submitPartner = async () => {
    setBusy(true);
    setError(null);
    const result = await save({
      data: {
        id: editing?.id ?? null,
        orgName: form.orgName,
        partnerType: form.partnerType,
        contactEmail: form.contactEmail,
        userEmail: form.userEmail,
      },
    });
    setBusy(false);
    if (!result.authorized) return setState("denied");
    if (!result.ok) return setError(result.error ?? "Could not save.");
    toast.success(editing ? t("Partner updated.") : t("Partner created."));
    startCreate();
    await refresh();
  };

  const runConfirmed = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    await fn();
    setBusy(false);
    setConfirm(null);
    await refresh();
  };

  if (state === "loading") return <AdminChecking />;
  if (state === "denied") return <AdminDenied />;

  const assignPartner = partners.find((p) => p.id === assignFor) ?? null;
  const assignOptions = catalogue
    .filter((c) => c.name.toLowerCase().includes(assignSearch.toLowerCase()))
    .slice(0, 40);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <h1 className="font-display text-3xl text-foreground">{t("Partners")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("Partner accounts, what they may edit, and everything waiting for review.")}
      </p>

      {error && <p className="mt-4 text-sm text-destructive">{t(error)}</p>}

      {/* ==== Part 1: received applications ==== */}
      <div className="mt-10 rounded-3xl border border-border p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-foreground">{t("Received applications")}</h2>
          <Link
            to="/admin/partners/new"
            className="rounded-full border border-gold/60 bg-gold/10 px-4 py-1.5 text-xs font-semibold text-gold"
          >
            + {t("Add partner directly")}
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("Everything sent through the public Become a Partner form.")}
        </p>
        <PartnerApplicationsList />
      </div>

      {/* ---- partner list ---- */}
      <h2 className="mt-12 font-display text-2xl text-foreground">{t("Partner accounts")}</h2>
      <section className="mt-4 space-y-3">
        {partners.map((partner) => (
          <div key={partner.id} className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-foreground">
                  {partner.orgName}{" "}
                  <span className="text-xs text-muted-foreground">
                    · {t(TYPE_LABEL[partner.partnerType] ?? partner.partnerType)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {partner.contactEmail ?? t("No contact email")} ·{" "}
                  {partner.userEmail ?? t("No login account linked")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px]",
                    partner.active
                      ? "border-gold/50 text-gold"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {partner.active ? t("Active") : t("Inactive")}
                </span>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/admin/partners/new", search: { id: partner.id } })}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("Edit")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirm({
                      message: partner.active
                        ? `Deactivate ${partner.orgName}? They will lose access to the partner portal.`
                        : `Reactivate ${partner.orgName}?`,
                      run: async () => {
                        await toggleActive({ data: { id: partner.id, active: !partner.active } });
                      },
                    })
                  }
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {partner.active ? t("Deactivate") : t("Activate")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssignFor(assignFor === partner.id ? null : partner.id);
                    setAssignSearch("");
                  }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("Assignments")} ({partner.assignments.length})
                </button>
              </div>
            </div>

            {assignFor === partner.id && assignPartner && (
              <div className="mt-4 rounded-xl border border-border/60 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("Assigned items")}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {partner.assignments.map((a) => (
                    <li key={`${a.itemType}:${a.itemId}`}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void runConfirmed(async () => {
                            await setAssignment({
                              data: {
                                partnerId: partner.id,
                                itemType: a.itemType,
                                itemId: a.itemId,
                                assigned: false,
                              },
                            });
                          })
                        }
                        className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold"
                      >
                        {a.name} ×
                      </button>
                    </li>
                  ))}
                  {partner.assignments.length === 0 && (
                    <li className="text-xs text-muted-foreground">{t("Nothing assigned yet.")}</li>
                  )}
                </ul>

                <input
                  value={assignSearch}
                  onChange={(e) => setAssignSearch(e.target.value)}
                  placeholder={t("Search properties and opportunities…")}
                  className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <ul className="mt-2 max-h-60 space-y-1 overflow-y-auto">
                  {assignOptions.map((option) => {
                    const already = partner.assignments.some(
                      (a) => a.itemType === option.itemType && a.itemId === option.itemId,
                    );
                    return (
                      <li key={`${option.itemType}:${option.itemId}`}>
                        <button
                          type="button"
                          disabled={busy || already}
                          onClick={() =>
                            void runConfirmed(async () => {
                              await setAssignment({
                                data: {
                                  partnerId: partner.id,
                                  itemType: option.itemType,
                                  itemId: option.itemId,
                                  assigned: true,
                                },
                              });
                            })
                          }
                          className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-card/70 hover:text-foreground disabled:opacity-40"
                        >
                          {option.name}{" "}
                          <span className="text-[10px] uppercase">
                            {option.itemType === "property" ? t("Property") : t("Investment")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
        {partners.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("No partner accounts yet.")}</p>
        )}
      </section>

      {/* ---- review queue ---- */}
      <section className="mt-12">
        <h2 className="font-display text-2xl text-foreground">{t("Review queue")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Items in review are hidden from the public site until approved.")}
        </p>

        <div className="mt-4 space-y-3">
          {queue.map((item) => {
            const key = `${item.itemType}:${item.itemId}`;
            return (
              <div key={key} className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.itemType === "property" ? t("Property") : t("Investment opportunity")}
                      {item.lastSubmittedAt
                        ? ` · ${t("Submitted")} ${new Date(item.lastSubmittedAt).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/admin/content/$table"
                      params={{
                        table: item.itemType === "property" ? "properties" : "investment_opportunities",
                      }}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t("See the entry")}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({
                          message: `Publish "${item.name}"? It becomes visible on the public site.`,
                          run: async () => {
                            await review({
                              data: {
                                itemType: item.itemType as PartnerItemType,
                                itemId: item.itemId,
                                action: "approve",
                                note: notes[key] ?? "",
                              },
                            });
                          },
                        })
                      }
                      className="rounded-full border border-gold/60 bg-gold/10 px-3 py-1 text-xs text-gold"
                    >
                      {t("Approve")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setConfirm({
                          message: `Send "${item.name}" back to the partner? It stays hidden from the public site.`,
                          run: async () => {
                            await review({
                              data: {
                                itemType: item.itemType as PartnerItemType,
                                itemId: item.itemId,
                                action: "send_back",
                                note: notes[key] ?? "",
                              },
                            });
                          },
                        })
                      }
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t("Send back")}
                    </button>
                  </div>
                </div>
                <input
                  value={notes[key] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [key]: e.target.value })}
                  placeholder={t("Optional note for the activity log…")}
                  className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            );
          })}
          {queue.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("Nothing is waiting for review.")}</p>
          )}
        </div>
      </section>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-5">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-foreground">{t(confirm.message)}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void runConfirmed(confirm.run)}
                className="rounded-full border border-gold/60 bg-gold/10 px-4 py-1.5 text-xs text-gold disabled:opacity-50"
              >
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
