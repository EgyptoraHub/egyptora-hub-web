import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import {
  listAdminBookings,
  updateBookingStatus,
  type AdminBooking,
  type AdminBookingsPage,
} from "@/lib/admin-bookings.functions";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/bookings")({
  ssr: false,
  component: AdminBookings,
  head: () => ({
    meta: [
      { title: `Bookings admin — ${SITE.name}` },
      { name: "description", content: "Internal booking management." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Bookings admin — ${SITE.name}` },
      { property: "og:description", content: "Internal booking management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const STATUSES = ["pending", "confirmed", "cancelled"] as const;

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toISOString().replace("T", " ").slice(0, 16);
  } catch {
    return value;
  }
}

function formatAmount(row: AdminBooking) {
  if (row.amount === null || row.amount === undefined) return "—";
  return `${Number(row.amount).toLocaleString()} ${(row.currency ?? "usd").toUpperCase()}`;
}

function StatusPill({ status, label }: { status: string; label: string }) {
  const tone =
    status === "confirmed"
      ? "border-emerald-500/40 text-emerald-400"
      : status === "cancelled"
        ? "border-destructive/40 text-destructive"
        : "border-gold/40 text-gold-text";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-2xs eyebrow ${tone}`}>
      {label}
    </span>
  );
}

function AdminBookings() {
  const { t } = useI18n();
  const load = useServerFn(listAdminBookings);
  const update = useServerFn(updateBookingStatus);

  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [data, setData] = useState<AdminBookingsPage | null>(null);
  const [status, setStatus] = useState("all");
  const [itemType, setItemType] = useState("all");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ id: string; status: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setState("denied");
      return;
    }
    const result = await load({ data: { status, itemType, page } });
    if (!result.authorized) {
      setState("denied");
      return;
    }
    setData(result.data);
    setState("ready");
  }, [load, status, itemType, page]);

  useEffect(() => {
    let active = true;
    fetchPage().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const applyStatus = async () => {
    if (!confirming) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await update({ data: { id: confirming.id, status: confirming.status } });
      if (!result.authorized) {
        setState("denied");
        return;
      }
      if (!result.ok) {
        setNotice(t("Something went wrong. Please try again."));
        return;
      }
      setNotice(t("Booking status updated."));
      setConfirming(null);
      await fetchPage();
    } catch {
      setNotice(t("Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <p className="text-sm text-muted-foreground">{t("Checking your access…")}</p>
      </div>
    );
  }

  if (state === "denied" || !data) {
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

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="min-h-screen bg-background px-5 py-14">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-2xs font-semibold eyebrow text-gold-text">{SITE.name}</p>
        <h1 className="mt-3 font-display text-3xl text-foreground">{t("Bookings management")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Review booking requests and update their status.")}
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="text-xs eyebrow text-muted-foreground">
            {t("Status")}
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="mt-1 block rounded-xl border border-border bg-card/60 px-3 py-2 text-sm normal-case tracking-normal text-foreground"
            >
              <option value="all">{t("All statuses")}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs eyebrow text-muted-foreground">
            {t("Item type")}
            <select
              value={itemType}
              onChange={(e) => {
                setPage(1);
                setItemType(e.target.value);
              }}
              className="mt-1 block rounded-xl border border-border bg-card/60 px-3 py-2 text-sm normal-case tracking-normal text-foreground"
            >
              <option value="all">{t("All item types")}</option>
              {data.itemTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <p className="pb-2 text-xs text-muted-foreground">
            {t("Total booking requests")}: {data.total}
          </p>
        </div>

        {notice ? <p className="mt-4 text-sm text-gold-text">{notice}</p> : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-card/60 text-2xs eyebrow text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Requested")}</th>
                <th className="px-4 py-3">{t("Requester")}</th>
                <th className="px-4 py-3">{t("Item")}</th>
                <th className="px-4 py-3">{t("Amount")}</th>
                <th className="px-4 py-3">{t("Status")}</th>
                <th className="px-4 py-3">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    {t("No booking requests found.")}
                  </td>
                </tr>
              ) : null}

              {data.rows.map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(row.requested_at)}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{row.contact_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{row.contact_email || "—"}</p>
                    <p className="text-xs text-muted-foreground">{row.contact_phone || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{row.item_name || row.item_id}</p>
                    <p className="text-xs text-muted-foreground">{row.item_type}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{formatAmount(row)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={row.status} label={t(row.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                        className="rounded-full border border-border px-3 py-1 text-xs text-foreground"
                      >
                        {expanded === row.id ? t("Hide details") : t("View details")}
                      </button>
                      {STATUSES.filter((s) => s !== row.status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setConfirming({ id: row.id, status: s })}
                          className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-text"
                        >
                          {t("Mark as")} {t(s)}
                        </button>
                      ))}
                    </div>

                    {expanded === row.id ? (
                      <dl className="mt-3 grid gap-1 rounded-xl border border-border bg-card/40 p-3 text-xs">
                        {(
                          [
                            [t("Booking ID"), row.id],
                            [t("User ID"), row.user_id],
                            [t("Trip"), row.trip_id ?? "—"],
                            [t("Trip item"), row.trip_item_id ?? "—"],
                            [t("Item type"), row.item_type],
                            [t("Item ID"), row.item_id],
                            [t("Item"), row.item_name ?? "—"],
                            [t("Amount"), formatAmount(row)],
                            [t("Payment session"), row.stripe_session_id ?? "—"],
                            [t("Payment intent"), row.stripe_payment_intent_id ?? "—"],
                            [t("Paid at"), formatDate(row.paid_at)],
                            [t("Requested"), formatDate(row.requested_at)],
                          ] as [string, string][]
                        ).map(([label, value]) => (
                          <div key={label} className="flex gap-2">
                            <dt className="w-40 shrink-0 text-muted-foreground">{label}</dt>
                            <dd className="break-all text-foreground">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-border px-4 py-1.5 text-xs text-foreground disabled:opacity-40"
          >
            {t("Previous")}
          </button>
          <p className="text-xs text-muted-foreground">
            {t("Page")} {data.page} / {totalPages}
          </p>
          <button
            type="button"
            disabled={data.page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-border px-4 py-1.5 text-xs text-foreground disabled:opacity-40"
          >
            {t("Next")}
          </button>
        </div>
      </div>

      {confirming ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-5">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-xl text-foreground">{t("Confirm status change")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("This will change the booking status to")} “{t(confirming.status)}”.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="rounded-full border border-border px-4 py-2 text-sm text-foreground"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={applyStatus}
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground disabled:opacity-50"
              >
                {busy ? t("Saving…") : t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
