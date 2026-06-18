import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/stores/cartStore";
import { inr } from "@/lib/products";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { recordOrder } from "@/lib/orders.functions";
import { useState } from "react";

export function CartDrawer() {
  const { items, isOpen, setOpen, updateQty, remove, total, clear } = useCart();
  const recordOrderFn = useServerFn(recordOrder);
  const [submitting, setSubmitting] = useState(false);

  async function handleCheckout() {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      await recordOrderFn({
        data: {
          total_amount: total(),
          items: items.map((i) => ({
            product_id: i.product.id,
            product_title: i.product.title,
            product_image: i.product.image,
            size: i.size,
            quantity: i.quantity,
            unit_price: i.product.price,
          })),
        },
      });
      toast.success("Order placed — thank you!");
      clear();
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle className="tracking-luxury text-xs">Shopping Bag ({items.length})</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.map((i) => (
                <div key={i.product.id + i.size} className="flex gap-4">
                  <img src={i.product.image} alt={i.product.title} className="w-20 h-28 object-cover bg-[var(--beige-100)]" />
                  <div className="flex-1 text-sm">
                    <div className="flex justify-between gap-2">
                      <p className="font-display text-base leading-tight">{i.product.title}</p>
                      <button onClick={() => remove(i.product.id, i.size)}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Size: {i.size}</p>
                    <p className="mt-2">{inr(i.product.price)}</p>
                    <div className="inline-flex items-center border border-border mt-3">
                      <button className="p-1.5" onClick={() => updateQty(i.product.id, i.size, i.quantity - 1)}><Minus className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-xs">{i.quantity}</span>
                      <button className="p-1.5" onClick={() => updateQty(i.product.id, i.size, i.quantity + 1)}><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t px-6 py-5 space-y-4 bg-[var(--beige-50)]">
              <div className="flex justify-between text-sm">
                <span className="tracking-luxury text-xs">Subtotal</span>
                <span className="font-display text-lg">{inr(total())}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Shipping & taxes calculated at checkout.</p>
              <Button disabled={submitting} className="w-full rounded-none h-12 tracking-luxury text-xs bg-[var(--beige-900)] hover:bg-[var(--beige-900)]/90 text-[var(--beige-50)]" onClick={handleCheckout}>
                {submitting ? "Placing order…" : "Checkout"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}