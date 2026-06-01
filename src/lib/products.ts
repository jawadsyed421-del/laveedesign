import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

export type Product = {
  id: string;
  handle: string;
  title: string;
  category: string;
  price: number;
  compareAt?: number;
  image: string;
  description: string;
  sizes: string[];
};

export const products: Product[] = [
  { id: "1", handle: "ivory-bridal-lehenga", title: "Ivory Bridal Lehenga", category: "Lehenga", price: 24800, compareAt: 32000, image: p1, description: "Hand-embroidered ivory lehenga with delicate zardozi work, finished with a feather-light tulle dupatta.", sizes: ["XS","S","M","L","XL"] },
  { id: "2", handle: "cream-anarkali-gown", title: "Cream Anarkali Gown", category: "Gowns", price: 18900, image: p2, description: "Floor-sweeping anarkali in soft cream silk with antique gold motifs.", sizes: ["XS","S","M","L"] },
  { id: "3", handle: "ivory-sharara-set", title: "Ivory Sharara Set", category: "Suits", price: 14500, image: p3, description: "Festive sharara set with floral threadwork and a sheer organza dupatta.", sizes: ["S","M","L","XL"] },
  { id: "4", handle: "beige-chikan-kurta", title: "Beige Chikankari Kurta", category: "Suits", price: 8900, image: p4, description: "Pure mulmul kurta with traditional Lucknowi chikankari in tonal beige.", sizes: ["XS","S","M","L","XL","XXL"] },
  { id: "5", handle: "pearl-white-saree", title: "Pearl White Saree", category: "Saree", price: 16700, compareAt: 22000, image: p5, description: "Crepe silk saree with pearl-embroidered border and matching blouse piece.", sizes: ["Free Size"] },
  { id: "6", handle: "champagne-evening-gown", title: "Champagne Evening Gown", category: "Gowns", price: 21900, image: p6, description: "Sculpted tulle gown with hand-set crystals fading into champagne.", sizes: ["XS","S","M","L"] },
];

export const getProduct = (handle: string) => products.find(p => p.handle === handle);

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");