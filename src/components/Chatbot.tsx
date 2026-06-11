import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content: "Welcome to LAVEE DESIGN. I'm your atelier concierge — ask me about our pieces, sizing, bridal couture or styling. How may I help?",
};

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat failed");
      setMessages((m) => [...m, { role: "assistant", content: data.text }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "I'm having trouble responding right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[var(--beige-900)] text-[var(--beige-50)] shadow-lg flex items-center justify-center hover:opacity-90 transition"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-background border border-border shadow-2xl flex flex-col">
          <div className="px-5 py-4 border-b border-border bg-[var(--beige-100)]">
            <p className="text-[10px] tracking-luxury text-muted-foreground">Atelier Concierge</p>
            <p className="font-display text-lg tracking-[0.2em]">LAVEE DESIGN</p>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "bg-[var(--beige-900)] text-[var(--beige-50)] px-3.5 py-2 max-w-[80%] leading-relaxed"
                      : "text-foreground max-w-[90%] leading-relaxed whitespace-pre-wrap"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-muted-foreground italic">Thinking…</p>}
          </div>
          <form onSubmit={send} className="border-t border-border p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a piece, size, fabric…"
              className="flex-1 px-3 h-10 text-sm bg-background border border-border outline-none focus:border-foreground/50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 w-10 flex items-center justify-center bg-[var(--beige-900)] text-[var(--beige-50)] disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}