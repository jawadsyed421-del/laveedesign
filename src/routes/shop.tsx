import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useState } from "react";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All — Lavee Design" },
      { name: "description", content: "Discover the complete Lavee Design collection of lehengas, sarees, suits and gowns in ivory and beige." },
    ],
  }),
  component: ShopPage,
});

const cats = ["All", "Lehenga", "Saree", "Suits", "Gowns"];

function ShopPage() {
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? products : products.filter(p => p.category === cat);
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-6 pt-10 pb-20">
        <nav className="text-[11px] tracking-luxury text-muted-foreground mb-6">
          <Link to="/">Home</Link> / Shop
        </nav>
        <h1 className="font-display text-5xl text-center">The Collection</h1>
        <div className="flex justify-center gap-8 mt-8 mb-12 text-[11px] tracking-luxury">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`pb-1 border-b ${cat === c ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </SiteLayout>
  );
}