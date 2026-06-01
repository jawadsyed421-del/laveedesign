import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { type Product, inr } from "@/lib/products";
import { useCart } from "@/stores/cartStore";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  return (
    <div className="group">
      <Link to="/product/$handle" params={{ handle: product.handle }} className="block relative overflow-hidden bg-[var(--beige-100)]">
        <img src={product.image} alt={product.title} loading="lazy" className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105" />
        <button
          onClick={(e) => { e.preventDefault(); add(product, product.sizes[0]); }}
          className="absolute bottom-0 left-0 right-0 bg-background/95 text-foreground py-3 text-[11px] tracking-luxury opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Add to Bag
        </button>
        <button aria-label="Wishlist" className="absolute top-3 right-3 bg-background/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="h-3.5 w-3.5" />
        </button>
      </Link>
      <div className="mt-4 text-center space-y-1">
        <div className="text-[10px] tracking-luxury text-muted-foreground">{product.category}</div>
        <Link to="/product/$handle" params={{ handle: product.handle }} className="font-display text-base">{product.title}</Link>
        <div className="text-sm flex items-center justify-center gap-2">
          <span>{inr(product.price)}</span>
          {product.compareAt && <span className="text-muted-foreground line-through text-xs">{inr(product.compareAt)}</span>}
        </div>
      </div>
    </div>
  );
}