import { Link } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/stores/cartStore";
import { AuthMenu } from "./AuthMenu";

const links = [
  { to: "/", label: "New In" },
  { to: "/shop", label: "Bridal" },
  { to: "/shop", label: "Lehengas" },
  { to: "/shop", label: "Sarees" },
  { to: "/shop", label: "Suits" },
  { to: "/shop", label: "Gowns" },
  { to: "/about", label: "Atelier" },
];

export function Header() {
  const { count, open } = useCart();
  const c = count();
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <div className="bg-[var(--beige-900)] text-[var(--beige-50)] text-[10px] sm:text-[11px] tracking-luxury py-2 px-3 text-center">
        Complimentary shipping worldwide on orders above ₹15,000
      </div>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-3 items-center gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button aria-label="Menu" className="lg:hidden"><Menu className="h-5 w-5" /></button>
          <button aria-label="Search" className="hidden lg:inline-flex"><Search className="h-[18px] w-[18px]" /></button>
        </div>
        <Link to="/" className="text-center font-display text-base sm:text-2xl lg:text-3xl tracking-[0.2em] sm:tracking-[0.35em] truncate">LAVEE DESIGN</Link>
        <div className="flex items-center justify-end gap-3 sm:gap-5">
          <AuthMenu />
          <Link to="/" aria-label="Wishlist"><Heart className="h-[18px] w-[18px]" /></Link>
          <button aria-label="Cart" onClick={open} className="relative">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {c > 0 && <span className="absolute -top-2 -right-2 bg-[var(--beige-900)] text-[var(--beige-50)] text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{c}</span>}
          </button>
        </div>
      </div>
      <nav className="hidden lg:flex items-center justify-center gap-10 pb-4 text-[11px] tracking-luxury text-muted-foreground">
        {links.map((l, i) => (
          <Link key={i} to={l.to} className="hover:text-foreground transition-colors">{l.label}</Link>
        ))}
      </nav>
      <nav className="lg:hidden flex items-center gap-5 overflow-x-auto px-4 pb-3 text-[10px] tracking-luxury text-muted-foreground whitespace-nowrap">
        {links.map((l, i) => (
          <Link key={i} to={l.to} className="hover:text-foreground transition-colors shrink-0">{l.label}</Link>
        ))}
      </nav>
    </header>
  );
}