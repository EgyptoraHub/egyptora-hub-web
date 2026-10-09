import { createFileRoute } from "@tanstack/react-router";

/**
 * Protected webhook skeleton: POST /api/public/hooks/<provider>
 *
 * Requires header `x-egyptora-signature: sha256=<hex HMAC-SHA256 of the raw body>` computed with the
 * WEBHOOK_SHARED_SECRET backend secret. Anything else gets 401. Valid calls are acknowledged but
 * NOTHING is processed yet — provider handlers (Paymob, Sumsub, n8n…) are added in later prompts.
 */
const PROVIDER = /^[a-z0-9-]{2,32}$/;

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/hooks/$provider")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const secret = process.env["WEBHOOK_SHARED_SECRET"];
        const unauthorized = () => new Response("Unauthorized", { status: 401 });
        if (!secret || !PROVIDER.test(params.provider)) return unauthorized();
        const header = request.headers.get("x-egyptora-signature") ?? "";
        const body = await request.text();
        if (body.length > 1_000_000) return unauthorized();
        const expected = `sha256=${await hmacHex(secret, body)}`;
        if (!safeEqual(header, expected)) return unauthorized();
        return Response.json({ received: true, processed: false });
      },
    },
  },
});
