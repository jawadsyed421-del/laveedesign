import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/products";

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
  add: (product: Product, size: string, qty?: number) => void;
  remove: (id: string, size: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (v) => set({ isOpen: v }),
      add: (product, size, qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex(i => i.product.id === product.id && i.size === size);
        if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
        else items.push({ product, size, quantity: qty });
        set({ items, isOpen: true });
      },
      remove: (id, size) => set({ items: get().items.filter(i => !(i.product.id === id && i.size === size)) }),
      updateQty: (id, size, qty) => {
        if (qty <= 0) return get().remove(id, size);
        set({ items: get().items.map(i => i.product.id === id && i.size === size ? { ...i, quantity: qty } : i) });
      },
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "lavee-cart", partialize: (s) => ({ items: s.items }) }
  )
);