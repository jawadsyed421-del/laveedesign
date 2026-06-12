import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
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
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          options: { emailRedirectTo: window.location.origin, data: { full_name: name, phone } },
        });
        if (error) throw error;
        toast.success("Welcome to LAVEE DESIGN");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to LAVEE DESIGN");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-6 py-24">
        <div className="text-center mb-10">
          <p className="tracking-luxury text-xs text-muted-foreground mb-2">{mode === "signin" ? "Welcome Back" : "Join the House"}</p>
          <h1 className="font-display text-4xl">{mode === "signin" ? "Sign In" : "Create Account"}</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <Label className="text-[11px] tracking-luxury">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-none h-11 border-foreground/30 mt-1" />
              </div>
              <div>
                <Label className="text-[11px] tracking-luxury">Phone Number</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required pattern="[0-9+\-\s]{7,15}" className="rounded-none h-11 border-foreground/30 mt-1" />
              </div>
            </>
          )}
          <div>
            <Label className="text-[11px] tracking-luxury">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-none h-11 border-foreground/30 mt-1" />
          </div>
          <div>
            <Label className="text-[11px] tracking-luxury">Password</Label>
            <div className="relative mt-1">
              <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-none h-11 border-foreground/30 pr-10" />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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