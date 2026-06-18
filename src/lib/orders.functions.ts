import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ItemInput = {
  product_id: string;
  product_title: string;
  product_image?: string | null;
  size?: string | null;
  quantity: number;
  unit_price: number;
};

type RecordInput = {
  items: ItemInput[];
  total_amount: number;
  shipping_name?: string | null;
  shipping_address?: string | null;
};

export const recordOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: RecordInput) => {
    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("No items to order");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        email: (claims as any)?.email ?? null,
        total_amount: data.total_amount,
        currency: "INR",
        status: "completed",
        shipping_name: data.shipping_name ?? null,
        shipping_address: data.shipping_address ?? null,
      })
      .select("id")
      .single();
    if (oErr || !order) throw new Error(oErr?.message || "Order failed");

    const rows = data.items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_title: i.product_title,
      product_image: i.product_image ?? null,
      size: i.size ?? null,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }));
    const { error: iErr } = await supabase.from("order_items").insert(rows);
    if (iErr) throw new Error(iErr.message);
    return { id: order.id };
  });