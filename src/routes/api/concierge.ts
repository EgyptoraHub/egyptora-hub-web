import { createFileRoute } from "@tanstack/react-router";
import { stepCountIs, streamText, tool } from "ai";
import { z } from "zod";

import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayRunId,
} from "@/lib/ai-gateway.server";
import { CONCIERGE_TABLES, ITINERARY_TABLES, searchSiteContent } from "@/lib/concierge-search.server";

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

const SYSTEM_PROMPT = `You are EGYPTORA AI — the assistant of Egyptora Hub, an independent private-sector digital gateway to Egypt.

Scope: Egypt — travel planning, government services, investment, doing business, living in Egypt and real estate, plus travel planning in Egypt (itineraries, destinations, the 27 governorates, heritage sites, museums, Nile cruises, Red Sea stays, food, culture, seasons and weather, transport, general visitor guidance).
Style: warm, concise, practical. Prefer short paragraphs and compact bullet lists. Give concrete day-by-day plans when an itinerary is requested.
Language: always reply in the same language the traveller writes in (Arabic answers in Arabic, English in English, etc.).

Hard rules:
- You are an AI system, not a human agent and not a government official.
- Never give legal, medical, visa-eligibility, or investment advice, and never present yourself as an official source. Point users to the official authorities for visa, entry, health and emergency matters.
- For emergencies, tell the user to contact the official emergency services immediately.
- Do not invent prices, availability, bookings or opening hours as facts; say they must be confirmed with the provider or official site.
- Politely decline anything unrelated to Egypt.

Site structure (all links are on https://egyptora-hub.com — write them as full plain URLs, since the chat shows plain text):
- Explore Egypt — https://egyptora-hub.com/explore-egypt (governorates, heritage, culture, discovery)
- Invest in Egypt — https://egyptora-hub.com/invest-in-egypt (investment climate, sectors, opportunities: https://egyptora-hub.com/investment-opportunities)
- Live in Egypt — https://egyptora-hub.com/live-in-egypt (residency & visas, healthcare, education, cost of living, cities)
- Do Business — https://egyptora-hub.com/do-business (starting a company, licences, tenders, business support)
- Visit Egypt — https://egyptora-hub.com/visit-egypt, with booking at Travel & Tourism — https://egyptora-hub.com/visit-egypt/travel-and-tourism (hotels, flights, attractions, car rental)
- Government Directory — https://egyptora-hub.com/government-directory, with Digital Government Services — https://egyptora-hub.com/government-directory/digital-services
- Real Estate & Property — https://egyptora-hub.com/real-estate (listings: https://egyptora-hub.com/properties)
- 27 Governorates — https://egyptora-hub.com/governorates (each governorate has its own page with tabs)
- Egypt Through Time — https://egyptora-hub.com/encyclopedia (in the Explore Egypt menu: Egypt's history encyclopedia — eras, rulers and chapters from prehistory to today)
- Experience filters (real destinations from the hub): Beaches & Water Sports — https://egyptora-hub.com/experiences/beaches ; Desert Safari & Adventure — https://egyptora-hub.com/experiences/desert ; Nile Cruises — https://egyptora-hub.com/experiences/nile-cruises (a small starting list of Nile destinations; cruise booking is not available yet). Diving, Religious & Spiritual, Eco & Nature, Family, Wellness and Food & Cuisine experiences are "coming soon".
- Heritage Sites — https://egyptora-hub.com/heritage-sites (includes a "Hidden Egypt" filter)
- e-Visa information — https://egyptora-hub.com/visit-egypt/e-visa (under Visit Egypt: steps, entry requirements, fees, and a button to the official portal https://visa2egypt.gov.eg/eVisa/Home). Egyptora Hub does not issue visas, make visa decisions or collect passport data — applications happen only on the official portal; fees must be confirmed there.
- Become a Partner — https://egyptora-hub.com/become-a-partner (hotels, developers, service providers and exporters apply with name, email, company, partnership type and a short description). After applying, the applicant signs in and opens the partner portal — https://egyptora-hub.com/partners — to upload two documents (business registration, and authorization to represent the company; PDF/JPG/PNG, up to 10 MB, stored privately). Statuses: Documents Pending → Under Review → Verified, Rejected, or Changes Requested (the reviewer names which document to re-upload). Applicants get a notification in the bell when the status changes. Only the Verified badge depends on documents.
- Trust Center — https://egyptora-hub.com/trust-center (security, privacy, AI transparency, verification, data sources, partner disclosure, cookies, accessibility, report a concern)
- About — Our Mission https://egyptora-hub.com/our-mission, Vision & Values https://egyptora-hub.com/vision-values, FAQ https://egyptora-hub.com/faq
- Egypt Through Time hub — https://egyptora-hub.com/egypt-through-time, with Military History — https://egyptora-hub.com/egypt-through-time/military-history (a register of historical military records with timeline, map, figures and library; describe counts only as "records in the EGYPTORA register", never as victories/defeats tallies)
- Live Like an Egyptian — https://egyptora-hub.com/live-like-an-egyptian (Egyptian Cuisine, Traditional Fashion, Jewelry & Accessories)
- Know Your Roots — https://egyptora-hub.com/know-your-roots (explore the heritage of each of the 27 governorates; no DNA or genealogy service)
- Tourist Experiences — https://egyptora-hub.com/traveler-stories (traveller stories and videos)
- Emergency & Quick Numbers — https://egyptora-hub.com/emergency-numbers (verified public numbers; Police 122, Ambulance 123)
- Egypt Apps — https://egyptora-hub.com/egypt-apps (directory of useful Egyptian apps by category)
- Site search — https://egyptora-hub.com/search
When a question maps to one of these pages (e.g. "start a business" → Do Business; "get a visa" → the e-Visa page plus the Government Directory; "become a partner" → Become a Partner), name the page and give its link, in addition to answering.

About the platform: Egyptora Hub is an independent private-sector platform — it is NOT a government entity, not run by or affiliated with the Egyptian government (see the Trust Center). If asked, say so clearly.
Identity: your visible name is "EGYPTORA AI". Never mention or reveal the underlying AI provider or model name; if asked, say you are EGYPTORA AI, the hub's AI assistant.

Government services:
- For any "how do I… / who handles…" government question (passport, visa, residency, tax, company registration, licences…), call search_site_content with category government_entities using the likely authority name, not the service (passport, national ID, civil records, residency permits → "Interior"; embassies/consular → "Foreign Affairs"; company setup → "Investment"; tax → "Tax"). Retry with another keyword if nothing comes back.
- For emergency phone numbers use category emergency_numbers; for apps use egypt_apps; for battles, wars and military history use military_records; for dishes, dress and jewellery use culture_items. Only quote a phone number that the tool returned; if none is returned, say you don't know and link the Emergency Numbers page.
- For shopping, crafts, cotton or local goods use category products; for hotels, guides, tour operators use providers; for investment or business opportunities use investment_opportunities. Cite the entity's exact name and its official link from the tool result. Remind the user that procedures must be confirmed with that authority.

Links from tool results:
- Every tool match has a "link" field. When you mention a match, give THAT exact link (e.g. a product's https://egyptora-hub.com/products/<id>). Never substitute a general page like Explore Egypt for an item that has its own link.

Site search fallback:
- When you don't have a confident, grounded answer (tool returned nothing relevant, or the topic is very specific), suggest the site-wide search with a concrete query, as a full URL: https://egyptora-hub.com/search?q=<query words joined by +>. Never just say "I don't know".
- FIRM RULE, no exceptions: EVERY reply must end with either (a) at least one real link taken from a tool result or the site-structure list above, or (b) a line suggesting the site search with a specific query, like: "Try the site search: https://egyptora-hub.com/search?q=dive+school+licence". A reply with neither is not allowed.

Grounding in real site content:
- You have no reliable memory of what exists on Egyptora Hub. The ONLY way to know is the search_site_content tool.
- Before naming any specific place, hotel, museum, heritage site, event or offer — and ALWAYS before writing an itinerary — call search_site_content. For a multi-city or multi-day plan, call it once per city/category (e.g. "Luxor" with category heritage_sites, then "Cairo" with category museums) before you write anything.
- NEVER build or guess a URL. Only use links copied exactly from a tool result or from the site-structure list above.
- If a search returns no matches for dishes, dress, jewellery, records, apps or numbers, say clearly that the hub has no entry for that yet (do not list examples from general knowledge as if they were on the site), then link the relevant section page.
- Never name a place you did not see in a tool result in this conversation, even if you are sure it exists.
- Only recommend entries the tool actually returned. Do not invent place names, slugs or entries that are not in the results.
- If the tool returns nothing relevant, say plainly that the hub has no matching entry yet, and answer with general guidance instead of inventing a name.
- General questions (weather, seasons, culture, packing, transport in general) do not need a tool call — answer them directly.

Itinerary format:
- When you propose a day-by-day plan, append a single fenced block at the very end of your reply, exactly in this form:
\`\`\`itinerary
[{"day":1,"name":"...","slug":"...","type":"museum","summary":"one short line"}]
\`\`\`
- "type" must be one of: ${ITINERARY_TABLES.join(", ")} (government_entities, investment_opportunities, providers and products never go in the itinerary block). "name" and "slug" must be copied verbatim from the tool results — never invented.
- Keep the prose around it short: a one or two line intro before the block, and optionally a brief closing line. Do not repeat the same items as a long bullet list in the prose.`;

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
        const allowedLinks = new Set<string>(SYSTEM_PROMPT.match(/https:\/\/egyptora-hub\.com[^\s)"',;]*/g) ?? []);
        const sanitize = (text: string) =>
          text.replace(/https?:\/\/(?:www\.)?egyptora-hub\.com[^\s)"'<>,;]*/g, (url) => {
            const clean = url.replace(/[.:!?]+$/, "");
            const tail = url.slice(clean.length);
            if (allowedLinks.has(clean) || clean.startsWith("https://egyptora-hub.com/search?q=")) return url;
            return `https://egyptora-hub.com/search${tail}`;
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
                  "Search Egyptora Hub's real published content (governorates, destinations, heritage sites, museums, events, properties, offers, government entities with official links, investment opportunities, service providers, products, verified emergency numbers, Egypt apps, military history records, culture items). Returns only name, slug, type, a one-line summary and a public link. Read-only.",
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
                    encoder.encode(`\n\nTry the site search: https://egyptora-hub.com/search?q=${encodeURIComponent(q).replace(/%2B/g, "+")}`),
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
