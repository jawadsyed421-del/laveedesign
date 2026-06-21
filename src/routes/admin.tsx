import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminLogin,
  adminGetDashboard,
  adminCreateProduct,
  adminListProducts,
  adminDeleteProduct,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LogOut, ShoppingBag, Users, IndianRupee, TrendingUp, Upload, X, Trash2 } from "lucide-react";
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
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setCreds(JSON.parse(raw)); } catch { /* noop */ }
    }
  }, []);

  if (!creds) return <Login onSuccess={(c) => { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c)); setCreds(c); }} />;
  return <Dashboard creds={creds} onLogout={() => { sessionStorage.removeItem(STORAGE_KEY); setCreds(null); navigate({ to: "/" }); }} />;
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
            <p className="text-[10px] tracking-luxury opacity-70">Manage store</p>
          </div>
          <Button onClick={onLogout} variant="ghost" size="sm" className="shrink-0 text-[var(--beige-50)] hover:bg-white/10 rounded-none">
            <LogOut className="h-4 w-4 mr-1.5" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="rounded-none bg-[var(--beige-100)] flex flex-wrap h-auto">
            <TabsTrigger value="overview" className="rounded-none text-[11px] tracking-luxury">Overview</TabsTrigger>
            <TabsTrigger value="upload" className="rounded-none text-[11px] tracking-luxury">Upload Product</TabsTrigger>
            <TabsTrigger value="gallery" className="rounded-none text-[11px] tracking-luxury">Products Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
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
          </TabsContent>

          <TabsContent value="upload">
            <UploadProduct creds={creds} />
          </TabsContent>

          <TabsContent value="gallery">
            <ProductGallery creds={creds} />
          </TabsContent>
        </Tabs>
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

const CATEGORIES = ["Lehenga", "Gowns", "Suits", "Saree", "Corset Sarees", "Bridal", "Festive"];

function fileToBase64(file: File): Promise<{ name: string; mime: string; base64: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve({ name: file.name, mime: file.type || "image/jpeg", base64, preview: result });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UploadProduct({ creds }: { creds: { username: string; password: string } }) {
  const createFn = useServerFn(adminCreateProduct);
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [mrp, setMrp] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<{ name: string; mime: string; base64: string; preview: string }[]>([]);

  const m = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          ...creds,
          title,
          description,
          category,
          mrp: Number(mrp),
          price: Number(price),
          images: images.map(({ name, mime, base64 }) => ({ name, mime, base64 })),
        },
      }),
    onSuccess: () => {
      toast.success("Product uploaded");
      setTitle(""); setDescription(""); setMrp(""); setPrice(""); setImages([]);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: any) => toast.error(e?.message || "Upload failed"),
  });

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 8 - images.length;
    const picked = files.slice(0, remaining);
    const converted = await Promise.all(picked.map(fileToBase64));
    setImages((prev) => [...prev, ...converted]);
    e.target.value = "";
  }

  const disabled = m.isPending || !title || !price || !mrp || images.length === 0;

  return (
    <Card className="rounded-none p-5 sm:p-8">
      <h2 className="font-display text-2xl mb-1">Upload New Product</h2>
      <p className="text-xs text-muted-foreground tracking-luxury mb-6">Add up to 8 photos with MRP and selling price.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); m.mutate(); }}
        className="grid gap-5 lg:grid-cols-2"
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] tracking-luxury uppercase text-muted-foreground">Product name</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ivory Bridal Lehenga" className="rounded-none mt-1" />
          </div>
          <div>
            <label className="text-[10px] tracking-luxury uppercase text-muted-foreground">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Hand-embroidered…" className="rounded-none mt-1 min-h-[100px]" />
          </div>
          <div>
            <label className="text-[10px] tracking-luxury uppercase text-muted-foreground">Category / Section</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full h-9 border border-input bg-transparent px-3 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] tracking-luxury uppercase text-muted-foreground">MRP (₹)</label>
              <Input type="number" min="0" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="32000" className="rounded-none mt-1" />
              <p className="text-[10px] text-muted-foreground mt-1">Original price (shown struck through)</p>
            </div>
            <div>
              <label className="text-[10px] tracking-luxury uppercase text-muted-foreground">Selling Price (₹)</label>
              <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="24800" className="rounded-none mt-1" />
              <p className="text-[10px] text-muted-foreground mt-1">Discounted price (shown bold)</p>
            </div>
          </div>
          {mrp && price && Number(mrp) > Number(price) && (
            <p className="text-xs text-green-700">
              Discount: {Math.round((1 - Number(price) / Number(mrp)) * 100)}% off
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] tracking-luxury uppercase text-muted-foreground">Photos ({images.length}/8)</label>
            <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-input p-6 cursor-pointer hover:bg-[var(--beige-100)] transition-colors">
              <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
              <span className="text-xs tracking-luxury">Click to add photos</span>
              <span className="text-[10px] text-muted-foreground mt-1">Select up to 8 at once</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPick}
                disabled={images.length >= 8}
              />
            </label>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square bg-[var(--beige-100)]">
                  <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Button
            type="submit"
            disabled={disabled}
            className="w-full sm:w-auto rounded-none h-11 px-8 bg-[var(--beige-900)] text-[var(--beige-50)] hover:bg-[var(--beige-900)]/90 tracking-luxury text-xs"
          >
            {m.isPending ? "Uploading…" : "Publish Product"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ProductGallery({ creds }: { creds: { username: string; password: string } }) {
  const listFn = useServerFn(adminListProducts);
  const delFn = useServerFn(adminDeleteProduct);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listFn({ data: creds }),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { ...creds, id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-products"] }); },
    onError: (e: any) => toast.error(e?.message || "Delete failed"),
  });

  if (q.isLoading) return <p className="text-xs tracking-luxury text-center py-8">Loading products…</p>;
  if (q.error) return <p className="text-xs text-destructive text-center py-8">{(q.error as Error).message}</p>;

  const products = q.data?.products ?? [];
  if (products.length === 0) {
    return (
      <Card className="rounded-none p-10 text-center">
        <p className="text-sm text-muted-foreground">No products uploaded yet. Use the Upload tab to add your first piece.</p>
      </Card>
    );
  }

  const grouped: Record<string, typeof products> = {};
  for (const p of products) {
    (grouped[p.category] ||= []).push(p);
  }

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[10px] tracking-luxury text-muted-foreground">Section</p>
              <h2 className="font-display text-2xl">{cat}</h2>
            </div>
            <span className="text-[10px] tracking-luxury text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => (
              <Card key={p.id} className="rounded-none overflow-hidden group">
                <div className="relative aspect-[3/4] bg-[var(--beige-100)]">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">No image</div>
                  )}
                  {p.images && p.images.length > 1 && (
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5">
                      +{p.images.length - 1} more
                    </span>
                  )}
                  <button
                    onClick={() => { if (confirm(`Delete "${p.title}"?`)) del.mutate(p.id); }}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-display text-sm truncate">{p.title}</p>
                  <div className="flex items-baseline gap-2 text-xs">
                    <span className="font-medium">{inr(Number(p.price))}</span>
                    {Number(p.mrp) > Number(p.price) && (
                      <span className="line-through text-muted-foreground">{inr(Number(p.mrp))}</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}