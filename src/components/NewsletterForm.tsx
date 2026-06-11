import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("subscribers").insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.success("You're already on the list.");
      else toast.error("Could not subscribe. Please try again.");
      return;
    }
    toast.success("Welcome to the House. We'll be in touch.");
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="mt-6 flex gap-0">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="rounded-none h-12 border-foreground/30 bg-background"
      />
      <Button disabled={loading} className="rounded-none h-12 px-8 tracking-luxury text-xs bg-[var(--beige-900)] hover:bg-[var(--beige-900)]/90 text-[var(--beige-50)]">
        {loading ? "…" : "Subscribe"}
      </Button>
    </form>
  );
}