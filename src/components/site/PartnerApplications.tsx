import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { verifyWithSumsub } from "@/lib/verification-provider";
import { useI18n } from "@/i18n";

/** Only "submitted" is used today; the others are reserved for future badges. */
const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  verified: "Verified",
  strategic: "Strategic",
  technology: "Technology",
  sponsor: "Sponsor",
};

export function PartnerStatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return (
    <span className="inline-block rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
      {t(STATUS_LABEL[status] ?? status)}
    </span>
  );
}

const VERIFICATION_LABEL: Record<string, string> = {
  documents_pending: "Documents Pending",
  under_review: "Under Review",
  verified: "Verified",
  rejected: "Rejected",
};

export function VerificationBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const tone =
    status === "verified"
      ? "border-primary bg-primary text-primary-foreground"
      : status === "rejected"
        ? "border-destructive text-destructive"
        : "border-gold/60 text-gold";
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${tone}`}>
      {t(VERIFICATION_LABEL[status] ?? status)}
    </span>
  );
}

type App = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  company_name: string;
  partnership_type: string;
  description: string | null;
  status: string;
  created_at: string;
  verification_status: string;
  verification_note: string | null;
  registration_doc_path: string | null;
  authorization_doc_path: string | null;
};

const DOCS = [
  { kind: "registration", col: "registration_doc_path", label: "Business registration / commercial registry" },
  { kind: "authorization", col: "authorization_doc_path", label: "Authorization to represent the company" },
] as const;

const ACCEPT = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024;

async function openDoc(path: string) {
  const { data } = await supabase.storage.from("partner-documents").createSignedUrl(path, 120);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
}

function DocRow({ app, doc, canUpload, onDone }: { app: App; doc: (typeof DOCS)[number]; canUpload: boolean; onDone: () => void }) {
  const { t } = useI18n();
  const path = app[doc.col];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (file: File) => {
    setErr(null);
    if (!ACCEPT.includes(file.type)) return setErr(t("Please upload a PDF, JPG or PNG file."));
    if (file.size > MAX_BYTES) return setErr(t("The file must be 10 MB or smaller."));
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const key = `${app.id}/${doc.kind}-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("partner-documents").upload(key, file, { contentType: file.type });
    if (up.error) {
      setBusy(false);
      return setErr(t("Upload failed. Please try again."));
    }
    const { data: status, error } = await supabase.rpc("submit_partner_document", {
      app_id: app.id,
      doc_kind: doc.kind,
      doc_path: key,
    });
    if (!error && status === "under_review") await verifyWithSumsub(app.id);
    setBusy(false);
    if (error) setErr(t("Upload failed. Please try again."));
    else onDone();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/60 px-3 py-2">
      <div className="text-xs">
        <p className="text-foreground">{t(doc.label)}</p>
        <p className={path ? "text-primary" : "text-muted-foreground"}>{path ? t("Uploaded") : t("Missing")}</p>
        {err && <p className="text-destructive" role="alert">{err}</p>}
      </div>
      <div className="flex items-center gap-2">
        {path && (
          <button type="button" onClick={() => openDoc(path)} className="text-xs font-semibold text-gold hover:underline">
            {t("View")}
          </button>
        )}
        {canUpload && (
          <label className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-gold">
            {busy ? t("Uploading…") : path ? t("Replace") : t("Upload")}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void upload(f);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

function AdminReview({ app, onDone }: { app: App; onDone: () => void }) {
  const { t } = useI18n();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const decide = async (decision: "verified" | "rejected") => {
    setBusy(true);
    await supabase.rpc("review_partner_application", { app_id: app.id, decision, note });
    setBusy(false);
    setNote("");
    onDone();
  };
  return (
    <div className="mt-3 grid gap-2 border-t border-border/60 pt-3">
      <textarea
        rows={2}
        maxLength={2000}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("Note for the applicant (optional, shown on rejection)")}
        className="w-full rounded-xl border border-border bg-card p-2 text-xs text-foreground outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button disabled={busy} onClick={() => decide("verified")} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60">
          {t("Mark Verified")}
        </button>
        <button disabled={busy} onClick={() => decide("rejected")} className="rounded-lg border border-destructive px-4 py-1.5 text-xs font-semibold text-destructive disabled:opacity-60">
          {t("Reject")}
        </button>
      </div>
    </div>
  );
}

function AppCard({ r, uid, isAdmin, reload }: { r: App; uid: string | null; isAdmin: boolean; reload: () => void }) {
  const { t } = useI18n();
  const isOwner = !!uid && r.user_id === uid;
  const canUpload = isOwner && r.verification_status !== "verified" && r.verification_status !== "under_review";
  return (
    <div className="rounded-2xl border border-border bg-card/40 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-foreground">
          {r.company_name} <span className="text-muted-foreground">· {r.partnership_type.replace("_", " ")}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <PartnerStatusBadge status={r.status} />
          <VerificationBadge status={r.verification_status} />
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {r.full_name} · {r.email} · {new Date(r.created_at).toLocaleDateString()}
      </p>
      {r.description && <p className="mt-2 text-xs text-foreground/80">{r.description}</p>}

      {isOwner && r.verification_status === "documents_pending" && (
        <p className="mt-3 text-xs text-foreground">
          {t("Company accounts need two documents before they can receive the Verified badge. Upload them below (PDF, JPG or PNG, up to 10 MB each).")}
        </p>
      )}
      {r.verification_status === "rejected" && r.verification_note && (
        <p className="mt-3 text-xs text-destructive">{t("Reviewer note")}: {r.verification_note}</p>
      )}
      {!r.user_id && !isAdmin && (
        <p className="mt-3 text-xs text-muted-foreground">
          {t("This application was sent without signing in, so documents cannot be uploaded to it. Sign in and apply again to upload documents.")}
        </p>
      )}

      {(isOwner || isAdmin) && (
        <div className="mt-3 grid gap-2">
          {DOCS.map((d) => (
            <DocRow key={d.kind} app={r} doc={d} canUpload={canUpload} onDone={reload} />
          ))}
        </div>
      )}
      {isAdmin && r.verification_status === "under_review" && <AdminReview app={r} onDone={reload} />}
    </div>
  );
}

/** Lists applications visible to the viewer (RLS: own rows, or all for admins). */
export function PartnerApplicationsList() {
  const { t } = useI18n();
  const [rows, setRows] = useState<App[] | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const reload = useCallback(async () => {
    const { data: s } = await supabase.auth.getSession();
    const id = s.session?.user.id ?? null;
    setUid(id);
    if (id) {
      const { data: admin } = await supabase.rpc("has_role", { check_user_id: id, check_role: "admin" });
      setIsAdmin(admin === true);
    }
    const { data } = await supabase
      .from("partner_applications")
      .select(
        "id, user_id, full_name, email, company_name, partnership_type, description, status, created_at, verification_status, verification_note, registration_doc_path, authorization_doc_path",
      )
      .order("created_at", { ascending: false });
    setRows((data as App[]) ?? []);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (rows === null) return null;
  const queue = isAdmin ? rows.filter((r) => r.verification_status === "under_review") : [];
  const rest = isAdmin ? rows.filter((r) => r.verification_status !== "under_review") : rows;

  return (
    <>
      {isAdmin && (
        <section className="mt-10">
          <h2 className="font-display text-xl text-foreground">{t("Verification review queue")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("Company accounts with both documents uploaded. Review manually, then mark Verified or Reject with a note.")}
          </p>
          <div className="mt-4 space-y-3">
            {queue.length === 0 && <p className="text-sm text-muted-foreground">{t("Nothing is waiting for review.")}</p>}
            {queue.map((r) => (
              <AppCard key={r.id} r={r} uid={uid} isAdmin reload={reload} />
            ))}
          </div>
        </section>
      )}
      <section className="mt-10">
        <h2 className="font-display text-xl text-foreground">{t("Partner applications")}</h2>
        {rest.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {rows.length === 0 && t("No applications yet.")}{" "}
            <Link to="/become-a-partner" className="text-gold hover:underline">{t("Become a Partner")}</Link>
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {rest.map((r) => (
              <AppCard key={r.id} r={r} uid={uid} isAdmin={isAdmin} reload={reload} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
