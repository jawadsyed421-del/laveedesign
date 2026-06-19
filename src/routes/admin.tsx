import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminLogin, adminGetDashboard } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LogOut, ShoppingBag, Users, IndianRupee, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { inr } from "@/lib/products";

const STORAGE_KEY = "lavee-admin-creds";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — LAVEE DESIGN" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [creds, setCreds] = useState<{ username: string; password: string } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setCreds(JSON.parse(raw)); } catch { /* noop */ }
    }
  }, []);

  if (!creds) return <Login onSuccess={(c) => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c)); setCreds(c); }} />;
  return <Dashboard creds={creds} onLogout={() => { sessionStorage.removeItem(STORAGE_KEY); setCreds(null); }} />;
}

function Login({ onSuccess }: { onSuccess: (c: { username: string; password: string }) => void }) {
  const loginFn = useServerFn(adminLogin);
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const m = useMutation({
    mutationFn: (d: { username: string; password: string }) => loginFn({ data: d }),
    onSuccess: (_r, vars) => onSuccess(vars),
    onError: (e: any) => toast.error(e?.message || "Invalid credentials"),
  });
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--beige-50)]">
      <Card className="w-full max-w-sm p-6 sm:p-8 rounded-none">
        <h1 className="font-display text-3xl text-center mb-1">Admin</h1>
        <p className="text-xs tracking-luxury text-center text-muted-foreground mb-6">LAVEE DESIGN</p>
        <form
          onSubmit={(e) => { e.preventDefault(); m.mutate({ username, password }); }}
          className="space-y-4"
        >
          <Input placeholder="Username" value={username} onChange={(e) => setU(e.target.value)} autoComplete="username" />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
          <Button type="submit" disabled={m.isPending} className="w-full rounded-none h-11 bg-[var(--beige-900)] text-[var(--beige-50)] hover:bg-[var(--beige-900)]/90 tracking-luxury text-xs">
            {m.isPending ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Dashboard({ creds, onLogout }: { creds: { username: string; password: string }; onLogout: () => void }) {
  const dashFn = useServerFn(adminGetDashboard);
  const q = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => dashFn({ data: creds }),
    refetchInterval: 30000,
  });

  if (q.isLoading) return <div className="min-h-screen grid place-items-center text-xs tracking-luxury">Loading dashboard…</div>;
  if (q.error) return (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="text-sm text-destructive mb-4">{(q.error as Error).message}</p>
        <Button onClick={onLogout} variant="outline" className="rounded-none">Back to login</Button>
      </div>
    </div>
  );

  const d = q.data!;
  return (
    <div className="min-h-screen bg-[var(--beige-50)]">
      <header className="bg-[var(--beige-900)] text-[var(--beige-50)]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl tracking-[0.2em] truncate">LAVEE — ADMIN</h1>
            <p className="text-[10px] tracking-luxury opacity-70">Dashboard overview</p>
          </div>
          <Button onClick={onLogout} variant="ghost" size="sm" className="shrink-0 text-[var(--beige-50)] hover:bg-white/10 rounded-none">
            <LogOut className="h-4 w-4 mr-1.5" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <Stat icon={<IndianRupee className="h-4 w-4" />} label="Revenue" value={inr(d.stats.totalRevenue)} />
          <Stat icon={<ShoppingBag className="h-4 w-4" />} label="Orders" value={String(d.stats.totalOrders)} />
          <Stat icon={<Users className="h-4 w-4" />} label="Customers" value={String(d.stats.totalCustomers)} />
          <Stat icon={<TrendingUp className="h-4 w-4" />} label="Avg Order" value={inr(Math.round(d.stats.avgOrder))} />
        </section>

        <section className="grid lg:grid-cols-2 gap-5">
          <Card className="p-4 sm:p-5 rounded-none">
            <h2 className="font-display text-lg mb-3">Monthly Revenue</h2>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-4 sm:p-5 rounded-none">
            <h2 className="font-display text-lg mb-3">Orders by Month</h2>
            <div className="h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="hsl(var(--foreground))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">Recent Transactions</h2>
          <Card className="rounded-none overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] tracking-luxury">Date</TableHead>
                  <TableHead className="text-[11px] tracking-luxury">Customer</TableHead>
                  <TableHead className="text-[11px] tracking-luxury">Items</TableHead>
                  <TableHead className="text-[11px] tracking-luxury text-right">Total</TableHead>
                  <TableHead className="text-[11px] tracking-luxury">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.orders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground text-xs py-8">No transactions yet</TableCell></TableRow>
                ) : d.orders.map((o) => {
                  const its = d.items.filter((i) => i.order_id === o.id);
                  const qty = its.reduce((s, i) => s + i.quantity, 0);
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{o.email || o.shipping_name || o.user_id.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs">{qty}</TableCell>
                      <TableCell className="text-xs text-right">{inr(Number(o.total_amount))}</TableCell>
                      <TableCell className="text-xs capitalize">{o.status}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">Top Customers</h2>
          <Card className="rounded-none overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px] tracking-luxury">Customer</TableHead>
                  <TableHead className="text-[11px] tracking-luxury">Orders</TableHead>
                  <TableHead className="text-[11px] tracking-luxury text-right">Lifetime Value</TableHead>
                  <TableHead className="text-[11px] tracking-luxury">Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.users.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-8">No customers yet</TableCell></TableRow>
                ) : d.users.map((u) => (
                  <TableRow key={u.user_id}>
                    <TableCell className="text-xs">{u.email || u.user_id.slice(0, 8)}</TableCell>
                    <TableCell className="text-xs">{u.orders}</TableCell>
                    <TableCell className="text-xs text-right">{inr(u.total)}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(u.last).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-4 sm:p-5 rounded-none">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-[10px] tracking-luxury uppercase">{label}</span>
      </div>
      <p className="font-display text-xl sm:text-2xl truncate">{value}</p>
    </Card>
  );
}