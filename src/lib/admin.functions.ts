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