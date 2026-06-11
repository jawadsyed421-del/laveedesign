import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { products, inr } from "@/lib/products";

type Msg = { role: "user" | "assistant"; content: string };

function catalog() {
  return products.map((p) =>
    `- ${p.title} (${p.category}) — ${inr(p.price)}${p.compareAt ? ` (was ${inr(p.compareAt)})` : ""}. ${p.description} Sizes: ${p.sizes.join(", ")}. Link: /product/${p.handle}`,
  ).join("\n");
}

const SYSTEM = `You are the LAVEE DESIGN concierge — a warm, refined assistant for a luxury contemporary Indian couture house specializing in ivory, cream and natural beige bridal, festive and pret wear.

Greet users warmly. If a user introduces themselves (e.g. "Hi, I'm Jawad"), greet them by name with an appropriate time-of-day welcome. Keep replies concise, elegant, and helpful.

You can answer questions about our products, fabrics, sizing, styling, bridal consultations and the atelier. When recommending a product, mention its name and price and reference its category. Politely decline topics unrelated to the brand.

CURRENT CATALOG:
${catalog()}

Other useful info:
- Complimentary worldwide shipping on orders above ₹15,000
- Checkout is a demo; payments are not yet enabled
- Bridal consultations can be booked from the home page
- Atelier story at /about, full shop at /shop`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages } = (await request.json()) as { messages: Msg[] };
          if (!Array.isArray(messages)) return new Response("Bad request", { status: 400 });
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
          const gateway = createLovableAiGatewayProvider(key);
          const { text } = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            system: SYSTEM,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          });
          return Response.json({ text });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Chat error";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});