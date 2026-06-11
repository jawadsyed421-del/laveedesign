import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — LAVEE DESIGN" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Welcome to LAVEE DESIGN");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error(res.error.message ?? "Google sign-in failed");
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-6 py-24">
        <div className="text-center mb-10">
          <p className="tracking-luxury text-xs text-muted-foreground mb-2">{mode === "signin" ? "Welcome Back" : "Join the House"}</p>
          <h1 className="font-display text-4xl">{mode === "signin" ? "Sign In" : "Create Account"}</h1>
        </div>
        <Button type="button" variant="outline" onClick={google} className="w-full rounded-none h-12 tracking-luxury text-xs border-foreground/30">
          Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-[10px] tracking-luxury text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label className="text-[11px] tracking-luxury">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-none h-11 border-foreground/30 mt-1" />
            </div>
          )}
          <div>
            <Label className="text-[11px] tracking-luxury">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-none h-11 border-foreground/30 mt-1" />
          </div>
          <div>
            <Label className="text-[11px] tracking-luxury">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-none h-11 border-foreground/30 mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-none h-12 tracking-luxury text-xs bg-[var(--beige-900)] hover:bg-[var(--beige-900)]/90 text-[var(--beige-50)]">
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-6">
          {mode === "signin" ? "New to LAVEE DESIGN?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="underline">
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </p>
      </section>
    </SiteLayout>
  );
}