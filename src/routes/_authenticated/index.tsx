import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import hero from "@/assets/hero.jpg";
import veil from "@/assets/veil.jpg";
import catLehenga from "@/assets/cat-lehenga.jpg";
import catCorset from "@/assets/cat-corset.jpg";
import catSaree from "@/assets/cat-saree.jpg";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/NewsletterForm";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "LAVEE DESIGN — Contemporary Indian Couture" },
      { name: "description", content: "Bridal, festive and pret couture in ivory, cream and natural beige. Hand-crafted in our atelier." },
      { property: "og:title", content: "LAVEE DESIGN — Contemporary Indian Couture" },
      { property: "og:description", content: "Bridal, festive and pret couture in ivory, cream and natural beige." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = products.slice(0, 4);
  const collections = [
    { name: "Lehengas", img: catLehenga },
    { name: "Corset Sarees", img: catCorset },
    { name: "Sarees", img: catSaree },
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative">
        <img src={hero} alt="Summer Bloom Collection" width={1920} height={1080} className="w-full h-[78vh] object-cover" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-[1400px] w-full px-10">
            <div className="max-w-md text-foreground">
              <p className="tracking-luxury text-xs mb-3">The Summer Edit</p>
              <h1 className="font-display text-6xl md:text-7xl leading-[0.95] italic">Summer<br />Bloom</h1>
              <p className="mt-4 font-display text-2xl">Up to <span className="italic">50% Off</span></p>
              <Button asChild className="mt-6 rounded-none h-12 px-8 tracking-luxury text-xs bg-[var(--beige-900)] hover:bg-[var(--beige-900)]/90 text-[var(--beige-50)]">
                <Link to="/shop">Discover</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-[1400px] px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="tracking-luxury text-xs text-muted-foreground mb-2">Just Arrived</p>
            <h2 className="font-display text-4xl">Featured Pieces</h2>
          </div>
          <Link to="/shop" className="text-xs tracking-luxury border-b border-foreground pb-1">View All</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Collections grid */}
      <section className="mx-auto max-w-[1400px] px-6 py-10">
        <h2 className="font-display text-4xl text-center mb-10">Shop by Silhouette</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {collections.map((c) => (
            <Link to="/shop" key={c.name} className="group block relative bg-[var(--beige-100)] overflow-hidden">
              <img src={c.img} alt={c.name} loading="lazy" className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-end p-8 bg-gradient-to-t from-[var(--beige-900)]/40 to-transparent">
                <div>
                  <p className="text-[10px] tracking-luxury text-[var(--beige-50)]/80">Explore</p>
                  <h3 className="font-display text-3xl text-[var(--beige-50)]">{c.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial */}
      <section className="relative my-24">
        <img src={veil} alt="Bridal Couture" loading="lazy" className="w-full h-[80vh] object-cover" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="bg-background/85 px-12 py-10 max-w-xl">
            <p className="tracking-luxury text-xs text-muted-foreground mb-3">Bridal Couture</p>
            <h2 className="font-display text-5xl italic">An Heirloom in the Making</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Conceived in our atelier, each ensemble is hand-worked over hundreds of hours — a quiet, considered luxury.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-none h-11 px-8 tracking-luxury text-xs border-foreground">
              <Link to="/shop">Book a Consultation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* All products */}
      <section className="mx-auto max-w-[1400px] px-6 pb-20">
        <div className="text-center mb-10">
          <p className="tracking-luxury text-xs text-muted-foreground mb-2">The Edit</p>
          <h2 className="font-display text-4xl">Most Loved</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
          {products.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[var(--beige-100)] py-20">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="font-display text-4xl">Join the House</h2>
          <p className="mt-3 text-sm text-muted-foreground">First access to new collections, private previews and atelier stories.</p>
          <NewsletterForm />
        </div>
      </section>
    </SiteLayout>
  );
}
