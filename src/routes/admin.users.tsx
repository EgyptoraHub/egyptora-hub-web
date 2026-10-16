import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import {
  listAdminUsers,
  setUserDisabled,
  setUserAdminRole,
  type AdminUser,
  type AdminUsersPage,
} from "@/lib/admin-users.functions";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/config/site";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  component: AdminUsers,
  head: () => ({
    meta: [
      { title: `Users admin — ${SITE.name}` },
      { name: "description", content: "Internal user management." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: `Users admin — ${SITE.name}` },
      { property: "og:description", content: "Internal user management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Pending =
  | { kind: "disable"; user: AdminUser; disabled: boolean }
  | { kind: "role"; user: AdminUser; makeAdmin: boolean };

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toISOString().replace("T", " ").slice(0, 16);
  } catch {
    return value;
  }
}

function AdminUsers() {
  const { t } = useI18n();
  const load = useServerFn(listAdminUsers);
  const toggleDisabled = useServerFn(setUserDisabled);
  const toggleRole = useServerFn(setUserAdminRole);

  const [state, setState] = useState<"loading" | "denied" | "ready">("loading");
  const [data, setData] = useState<AdminUsersPage | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchPage = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setState("denied");
      return;
    }
    const result = await load({ data: { search, page } });
    if (!result.authorized) {
      setState("denied");
      return;
    }
    setData(result.data);
    setState("ready");
  }, [load, search, page]);

  useEffect(() => {
    let active = true;
    fetchPage().catch(() => {
      if (active) setState("denied");
    });
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const apply = async () => {
    if (!pending) return;
    setBusy(true);
    setNotice(null);
    try {
      const result =
        pending.kind === "disable"
          ? await toggleDisabled({
              data: { userId: pending.user.id, disabled: pending.disabled },
            })
          : await toggleRole({
              data: { userId: pending.user.id, makeAdmin: pending.makeAdmin },
            });

      if (!result.authorized) {
        setState("denied");
        return;
      }
      if (!result.ok) {
        setNotice(t(result.error ?? "Something went wrong. Please try again."));
        return;
      }
      setNotice(
        pending.kind === "disable"
          ? pending.disabled
            ? t("Account disabled. Their data was not changed.")
            : t("Account enabled.")
          : pending.makeAdmin
            ? t("Admin access granted.")
            : t("Admin access revoked."),
      );
      setPending(null);
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
        <h1 className="mt-3 font-display text-3xl text-foreground">{t("User management")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Disable sign-in access or manage admin privileges. No account is ever deleted here.")}
        </p>

        <form
          className="mt-6 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput);
          }}
        >
          <label className="text-xs eyebrow text-muted-foreground">
            {t("Search by email")}
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("Search by email")}
              className="mt-1 block w-72 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm normal-case tracking-normal text-foreground"
            />
          </label>
          <button
            type="submit"
            className="rounded-full border border-gold/40 px-4 py-2 text-xs text-gold-text"
          >
            {t("Search")}
          </button>
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
              className="rounded-full border border-border px-4 py-2 text-xs text-foreground"
            >
              {t("Clear")}
            </button>
          ) : null}
          <p className="pb-2 text-xs text-muted-foreground">
            {t("Total users")}: {data.total}
          </p>
        </form>

        {notice ? <p className="mt-4 text-sm text-gold-text">{notice}</p> : null}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-card/60 text-2xs eyebrow text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("Email")}</th>
                <th className="px-4 py-3">{t("Signed up")}</th>
                <th className="px-4 py-3">{t("Last sign-in")}</th>
                <th className="px-4 py-3">{t("Account status")}</th>
                <th className="px-4 py-3">{t("Admin role")}</th>
                <th className="px-4 py-3">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    {t("No users found.")}
                  </td>
                </tr>
              ) : null}

              {data.rows.map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="text-foreground">{row.email ?? "—"}</p>
                    <p className="break-all text-xs text-muted-foreground">{row.id}</p>
                    {row.is_self ? (
                      <p className="mt-1 text-xs text-gold-text">{t("This is you")}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(row.last_sign_in_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-2xs eyebrow ${
                        row.disabled
                          ? "border-destructive/40 text-destructive"
                          : "border-emerald-500/40 text-emerald-400"
                      }`}
                    >
                      {row.disabled ? t("Disabled") : t("Active")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-2xs eyebrow ${
                        row.is_admin ? "border-gold/40 text-gold-text" : "border-border text-muted-foreground"
                      }`}
                    >
                      {row.is_admin ? t("Admin") : t("Standard")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {row.is_self ? null : (
                        <button
                          type="button"
                          onClick={() =>
                            setPending({ kind: "disable", user: row, disabled: !row.disabled })
                          }
                          className="rounded-full border border-border px-3 py-1 text-xs text-foreground"
                        >
                          {row.disabled ? t("Enable") : t("Disable")}
                        </button>
                      )}

                      {row.is_admin && row.is_self ? (
                        <p className="max-w-xs text-xs text-muted-foreground">
                          {t(
                            "You can't remove your own admin access here — this has to be done directly in the database to avoid locking everyone out.",
                          )}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setPending({ kind: "role", user: row, makeAdmin: !row.is_admin })
                          }
                          className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-text"
                        >
                          {row.is_admin ? t("Revoke admin") : t("Grant admin")}
                        </button>
                      )}
                    </div>
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

      {pending ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-5">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-xl text-foreground">{t("Please confirm")}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {pending.kind === "disable"
                ? pending.disabled
                  ? t(
                      "This blocks future sign-in for this account. Their trips and booking requests stay untouched.",
                    )
                  : t("This restores sign-in access for this account.")
                : pending.makeAdmin
                  ? t("This gives the account full admin access to this panel.")
                  : t("This removes admin access from the account.")}
            </p>
            <p className="mt-2 break-all text-sm text-foreground">{pending.user.email ?? pending.user.id}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPending(null)}
                className="rounded-full border border-border px-4 py-2 text-sm text-foreground"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={apply}
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
