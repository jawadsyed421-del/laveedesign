import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";

const cols = [
  { title: "Shop", links: ["New Arrivals", "Bridal", "Lehengas", "Sarees", "Suits", "Gowns"] },
  { title: "Atelier", links: ["Our Story", "Craftsmanship", "Press", "Stores", "Careers"] },
  { title: "Assistance", links: ["Contact Us", "Shipping", "Returns", "Size Guide", "FAQ"] },
];

export function Footer() {
  return (
    <footer className="bg-[var(--beige-100)] border-t border-border mt-24">
      <div className="mx-auto max-w-[1400px] px-6 py-16 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="font-display text-2xl tracking-[0.3em]">LAVEE DESIGN</div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
            A house of contemporary Indian couture, devoted to the quiet luxury of ivory, cream and natural beige.
          </p>
          <div className="flex gap-4 mt-6 text-muted-foreground">
            <a href="#" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Youtube"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-[11px] tracking-luxury text-foreground mb-4">{c.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => <li key={l}><Link to="/" className="hover:text-foreground">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LAVEE DESIGN. All rights reserved.
      </div>
    </footer>
  );
}