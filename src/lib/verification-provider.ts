/**
 * Partner (KYB) verification provider — integration point.
 *
 * Today verification is MANUAL: an admin reviews uploaded documents in the
 * partner portal. No third-party service is called and nothing here costs money.
 *
 * ─── SUMSUB INTEGRATION POINT ───────────────────────────────────────────────
 * When a Sumsub account exists, replace the body of `verifyWithSumsub` with a
 * server-side call (createServerFn) that:
 *   1. creates a Sumsub applicant for the company (levelName for KYB),
 *   2. uploads the two stored documents from the private `partner-documents` bucket,
 *   3. stores the Sumsub applicant id on the partner_applications row,
 * and add a webhook route under src/routes/api/public/ that verifies the Sumsub
 * signature and sets verification_status to 'verified' / 'rejected'.
 * Keys (SUMSUB_APP_TOKEN, SUMSUB_SECRET_KEY) must be stored as backend secrets,
 * never in browser code.
 * ────────────────────────────────────────────────────────────────────────────
 */
export type VerificationResult = { provider: "manual" | "sumsub"; queued: boolean };

export async function verifyWithSumsub(_applicationId: string): Promise<VerificationResult> {
  // Intentionally a no-op: manual admin review only. No live API usage.
  return { provider: "manual", queued: false };
}
