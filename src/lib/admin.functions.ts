import { createServerFn } from "@tanstack/react-start";

// Hardcoded demo admin credentials — replace with real auth before production.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "lavee@admin2026";

function verify(credentials: { username: string; password: string }) {
  if (
    credentials?.username !== ADMIN_USERNAME ||
    credentials?.password !== ADMIN_PASSWORD
  ) {
    throw new Error("Invalid admin credentials");
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => {
    verify(data);
    return { ok: true };
  });

export const adminGetDashboard = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => {
    verify(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: orders, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, email, total_amount, currency, status, shipping_name, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (oErr) throw new Error(oErr.message);

    const orderIds = (orders ?? []).map((o) => o.id);
    const { data: items } = orderIds.length
      ? await supabaseAdmin
          .from("order_items")
          .select("order_id, product_title, quantity, unit_price, size")
          .in("order_id", orderIds)
      : { data: [] as any[] };

    // Aggregate per-user
    const byUser: Record<string, { user_id: string; email: string | null; orders: number; total: number; last: string }> = {};
    for (const o of orders ?? []) {
      const k = o.user_id;
      if (!byUser[k]) byUser[k] = { user_id: k, email: o.email, orders: 0, total: 0, last: o.created_at };
      byUser[k].orders += 1;
      byUser[k].total += Number(o.total_amount);
      if (o.created_at > byUser[k].last) byUser[k].last = o.created_at;
    }
    const users = Object.values(byUser).sort((a, b) => b.total - a.total);

    // Monthly bucket (last 12)
    const monthly: Record<string, { month: string; revenue: number; orders: number }> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = { month: key, revenue: 0, orders: 0 };
    }
    for (const o of orders ?? []) {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthly[key]) {
        monthly[key].revenue += Number(o.total_amount);
        monthly[key].orders += 1;
      }
    }

    const totalRevenue = (orders ?? []).reduce((s, o) => s + Number(o.total_amount), 0);
    const totalOrders = orders?.length ?? 0;
    const totalCustomers = users.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      stats: { totalRevenue, totalOrders, totalCustomers, avgOrder },
      monthly: Object.values(monthly),
      orders: orders ?? [],
      items: items ?? [],
      users,
    };
  });

type NewProductInput = {
  username: string;
  password: string;
  title: string;
  description?: string;
  category: string;
  mrp: number;
  price: number;
  images: { name: string; mime: string; base64: string }[];
};

export const adminCreateProduct = createServerFn({ method: "POST" })
  .inputValidator((d: NewProductInput) => {
    if (!d?.title?.trim()) throw new Error("Title is required");
    if (!d.category?.trim()) throw new Error("Category is required");
    if (!(d.price >= 0) || !(d.mrp >= 0)) throw new Error("Invalid prices");
    if (!Array.isArray(d.images) || d.images.length === 0)
      throw new Error("At least one image required");
    if (d.images.length > 8) throw new Error("Max 8 images per product");
    return d;
  })
  .handler(async ({ data }) => {
    verify(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const urls: string[] = [];
    for (const img of data.images) {
      const ext = (img.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${crypto.randomUUID()}.${ext}`;
      const bytes = Uint8Array.from(atob(img.base64), (c) => c.charCodeAt(0));
      const { error } = await supabaseAdmin.storage
        .from("product-images")
        .upload(path, bytes, { contentType: img.mime || "image/jpeg", upsert: false });
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const { data: pub } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
      urls.push(pub.publicUrl);
    }
    const { error: insErr } = await supabaseAdmin.from("admin_products").insert({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      category: data.category.trim(),
      mrp: data.mrp,
      price: data.price,
      images: urls,
    });
    if (insErr) throw new Error(insErr.message);
    return { ok: true };
  });

export const adminListProducts = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) => d)
  .handler(async ({ data }) => {
    verify(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("admin_products")
      .select("id, title, description, category, mrp, price, images, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { products: rows ?? [] };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string; id: string }) => d)
  .handler(async ({ data }) => {
    verify(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("admin_products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });