import { createFileRoute } from "@tanstack/react-router";
import { stepCountIs, streamText, tool } from "ai";
import { z } from "zod";

import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayRunId,
} from "@/lib/ai-gateway.server";
import { CONCIERGE_TABLES, ITINERARY_TABLES, searchSiteContent } from "@/lib/concierge-search.server";
import { SYSTEM_PROMPT, extractPromptLinks } from "@/lib/concierge-prompt";

const MODEL = "google/gemini-2.5-flash";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(24),
  locale: z.string().max(12).optional(),
  scope: z.object({ slug: z.string().regex(/^[a-z-]{2,40}$/), name: z.string().max(60) }).optional(),
});

export const Route = createFileRoute("/api/concierge")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "The AI Concierge is not configured yet." },
            { status: 500 },
          );
        }

        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }

        const gateway = createLovableAiGatewayProvider(
          apiKey,
          getLovableAiGatewayRunId(request),
        );

        // Everything the read-only search actually returned this request, so the
        // itinerary block can be filtered down to genuinely existing entries.
        const grounded = new Map<
          string,
          { id: string; name: string; slug: string; type: string }
        >();
        // Links the model may show: site-structure links from the prompt + links the search returned.
        const allowedLinks = extractPromptLinks();
        const sanitize = (text: string) =>
          text.replace(/https?:\/\/(?:www\.)?egyptora-hub\.com[^\s)"'<>,;]*/g, (url) => {
            const clean = url.replace(/[.:!?]+$/, "");
            const tail = url.slice(clean.length);
            if (allowedLinks.has(clean) || clean.startsWith("https://www.egyptora-hub.com/search?q=")) return url;
            return `https://www.egyptora-hub.com/search${tail}`;
          });

        try {
          const result = streamText({
            model: gateway(MODEL),
            system: parsed.scope
              ? `${SYSTEM_PROMPT}\n\nGovernorate focus: the traveller is on the ${parsed.scope.name} governorate page (slug "${parsed.scope.slug}"). Keep answers centred on ${parsed.scope.name} — its places, heritage, food, events, investment, real estate and services — and prefer site results from this governorate. Only widen to the rest of Egypt if asked.`
              : SYSTEM_PROMPT,
            messages: parsed.messages,
            stopWhen: stepCountIs(6),
            tools: {
              search_site_content: tool({
                description:
                  "Search Egyptora Hub's real published content (governorates, destinations, heritage sites, museums, events, properties, offers, government entities with official links, investment opportunities, service providers, products, verified emergency numbers, Egypt apps, military history records, culture items, industrial and free zones). Returns only name, slug, type, a one-line summary and a public link. Read-only.",
                inputSchema: z.object({
                  query: z.string().min(2).max(120).describe("Free-text search, e.g. 'Luxor temple'"),
                  category: z
                    .enum(CONCIERGE_TABLES)
                    .optional()
                    .describe("Optional catalogue to restrict the search to"),
                }),
                execute: async ({ query, category }) => {
                  const matches = await searchSiteContent(query, category);
                  for (const m of matches) {
                    if (m.link) allowedLinks.add(m.link);
                    grounded.set(`${m.type}:${m.slug}`, {
                      id: m.id,
                      name: m.name,
                      slug: m.slug,
                      type: m.type,
                    });
                  }
                  // Keep the model payload free of internal ids.
                  return {
                    matches: matches.map(({ id: _id, ...rest }) => rest),
                  };
                },
              }),
            },
            onError: ({ error }) => console.error("[concierge] stream error", error),
          });
          const encoder = new TextEncoder();
          const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
              let buffer = "";
              let inBlock = false;
              let emitted = "";
              try {
                for await (const chunk of result.textStream) {
                  buffer += chunk;
                  if (inBlock) continue;
                  const idx = buffer.indexOf("```itinerary");
                  if (idx !== -1) {
                    const prose = sanitize(buffer.slice(0, idx));
                    if (prose) controller.enqueue(encoder.encode(prose));
                    emitted += prose;
                    buffer = buffer.slice(idx);
                    inBlock = true;
                    continue;
                  }
                  // Emit complete lines only, so every link can be checked before it is shown.
                  const nl = buffer.lastIndexOf("\n");
                  if (nl === -1) continue;
                  const emit = sanitize(buffer.slice(0, nl + 1));
                  buffer = buffer.slice(nl + 1);
                  if (emit) controller.enqueue(encoder.encode(emit));
                  emitted += emit;
                }

                if (!inBlock) {
                  buffer = sanitize(buffer);
                  if (buffer) controller.enqueue(encoder.encode(buffer));
                  emitted += buffer;
                } else {
                  const match = /```itinerary\s*([\s\S]*?)```/.exec(buffer);
                  let raw: unknown[] = [];
                  try {
                    const parsedBlock: unknown = JSON.parse((match?.[1] ?? "").trim());
                    if (Array.isArray(parsedBlock)) raw = parsedBlock;
                  } catch {
                    raw = [];
                  }
                  // Only keep items the read-only search actually returned.
                  const items = raw
                    .map((entry) => {
                      const row = entry as {
                        day?: unknown;
                        slug?: unknown;
                        type?: unknown;
                        summary?: unknown;
                      };
                      const slug = typeof row.slug === "string" ? row.slug : "";
                      const hit =
                        grounded.get(`${String(row.type)}:${slug}`) ??
                        [...grounded.values()].find((g) => g.slug === slug);
                      if (!hit || !(ITINERARY_TABLES as readonly string[]).includes(hit.type)) return null;
                      return {
                        ...(typeof row.day === "number" ? { day: row.day } : {}),
                        id: hit.id,
                        name: hit.name,
                        slug: hit.slug,
                        type: hit.type,
                        summary: typeof row.summary === "string" ? row.summary : "",
                      };
                    })
                    .filter((item): item is NonNullable<typeof item> => item !== null);

                  if (items.length > 0) {
                    controller.enqueue(
                      encoder.encode(`\n\`\`\`itinerary\n${JSON.stringify(items)}\n\`\`\``),
                    );
                  }
                }
                // Guarantee: every reply ends with a link or a site-search suggestion.
                if (emitted.trim() && !/https?:\/\//.test(emitted)) {
                  const lastUser = [...parsed.messages].reverse().find((m) => m.role === "user");
                  const q = (lastUser?.content ?? "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).slice(0, 6).join("+");
                  controller.enqueue(
                    encoder.encode(`\n\nTry the site search: https://www.egyptora-hub.com/search?q=${encodeURIComponent(q).replace(/%2B/g, "+")}`),
                  );
                }
                try {
                  const usage = await result.totalUsage;
                  const { logAiUsage } = await import("@/lib/audit.server");
                  await logAiUsage({ feature: "concierge", model: MODEL, tokensIn: usage.inputTokens ?? null, tokensOut: usage.outputTokens ?? null });
                } catch {
                  /* usage unavailable — skip */
                }
              } catch (streamError) {
                console.error("[concierge] stream failed", streamError);
              } finally {
                controller.close();
              }
            },
          });

          return new Response(stream, {
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "no-store",
            },
          });
        } catch (error) {
          const status =
            typeof error === "object" && error !== null && "statusCode" in error
              ? Number((error as { statusCode: unknown }).statusCode)
              : 500;
          const message =
            status === 429
              ? "The concierge is busy right now — please try again in a moment."
              : status === 402
                ? "The AI Concierge is temporarily unavailable (usage limit reached)."
                : "The concierge could not answer right now. Please try again.";
          console.error("[concierge] request failed", error);
          return Response.json({ error: message }, { status: status || 500 });
        }
      },
    },
  },
});
