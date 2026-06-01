import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { getProduct, products, inr } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/stores/cartStore";
import { Heart, Truck, RotateCw, Shield } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => {
    const p = getProduct(params.handle);
    return {
      meta: [
        { title: p ? `${p.title} — Monik` : "Product — Monik" },
        { name: "description", content: p?.description ?? "Monik couture" },
        { property: "og:title", content: p?.title ?? "Monik" },
        { property: "og:description", content: p?.description ?? "" },
        ...(p ? [{ property: "og:image", content: p.image }] : []),
      ],
    };
  },
  loader: ({ params }) => {
    const product = getProduct(params.handle);
    if (!product) throw notFound();
    return { product };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="py-32 text-center">
        <h1 className="font-display text-4xl">Piece not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-xs tracking-luxury border-b border-foreground">Back to Shop</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout><div className="py-32 text-center font-display text-2xl">Something went wrong.</div></SiteLayout>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [size, setSize] = useState(product.sizes[0]);
  const add = useCart((s) => s.add);
  const related = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1400px] px-6 pt-8 pb-20">
        <nav className="text-[11px] tracking-luxury text-muted-foreground mb-8">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.title}
        </nav>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-[var(--beige-100)]">
            <img src={product.image} alt={product.title} className="w-full aspect-[3/4] object-cover" />
          </div>
          <div className="md:pt-8">
            <p className="tracking-luxury text-[10px] text-muted-foreground mb-2">{product.category}</p>
            <h1 className="font-display text-4xl">{product.title}</h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xl">{inr(product.price)}</span>
              {product.compareAt && <span className="text-muted-foreground line-through text-sm">{inr(product.compareAt)}</span>}
            </div>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="mt-8">
              <p className="text-[11px] tracking-luxury mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button key={s} onClick={() => setSize(s)} className={`px-4 h-10 border text-xs ${size === s ? "border-foreground bg-foreground text-background" : "border-border"}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button onClick={() => add(product, size)} className="flex-1 rounded-none h-12 tracking-luxury text-xs bg-[var(--beige-900)] hover:bg-[var(--beige-900)]/90 text-[var(--beige-50)]">Add to Bag</Button>
              <Button variant="outline" className="rounded-none h-12 w-12 p-0 border-foreground"><Heart className="h-4 w-4" /></Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 text-center text-[10px] tracking-luxury text-muted-foreground border-t border-border pt-6">
              <div><Truck className="h-4 w-4 mx-auto mb-2" />Free Shipping</div>
              <div><RotateCw className="h-4 w-4 mx-auto mb-2" />Easy Returns</div>
              <div><Shield className="h-4 w-4 mx-auto mb-2" />Authenticity</div>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <h2 className="font-display text-3xl text-center mb-10">You May Also Love</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}