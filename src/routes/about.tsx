import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import veil from "@/assets/veil.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The Atelier — Lavee Design" },
      { name: "description", content: "Inside the Lavee Design atelier — a house devoted to ivory, cream and beige couture." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="tracking-luxury text-xs text-muted-foreground mb-4">The Atelier</p>
        <h1 className="font-display text-5xl italic">A House of Quiet Couture</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          Lavee Design began with a single intention — to celebrate the softest part of the Indian palette.
          Working only in ivory, cream and natural beige, every ensemble is conceived and hand-finished in our New Delhi atelier by master karigars whose craft has been passed down through generations.
        </p>
      </div>
      <img src={veil} alt="Lavee Design Atelier" loading="lazy" className="w-full h-[70vh] object-cover" />
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl">Made Slowly, Worn Forever</h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          We are uninterested in trend. Every piece in the collection is built to be an heirloom — restorable, rewearable, and stitched with the patience of a discipline that refuses to be hurried.
        </p>
      </div>
    </SiteLayout>
  );
}