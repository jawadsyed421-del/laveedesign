import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — LAVEE DESIGN" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. Welcome back.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-6 py-24">
        <div className="text-center mb-10">
          <p className="tracking-luxury text-xs text-muted-foreground mb-2">Set New Password</p>
          <h1 className="font-display text-4xl">Reset Password</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="text-[11px] tracking-luxury">New Password</Label>
            <div className="relative mt-1">
              <Input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-none h-11 border-foreground/30 pr-10" />
              <button type="button" aria-label={show ? "Hide" : "Show"} onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-none h-12 tracking-luxury text-xs bg-[var(--beige-900)] hover:bg-[var(--beige-900)]/90 text-[var(--beige-50)]">
            {loading ? "Please wait…" : "Update Password"}
          </Button>
        </form>
      </section>
    </SiteLayout>
  );
}