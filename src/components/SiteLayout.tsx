import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { Toaster } from "@/components/ui/sonner";
import { Chatbot } from "./Chatbot";
import { AuthProvider } from "@/hooks/useAuth";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <Chatbot />
      <Toaster position="top-center" />
    </div>
    </AuthProvider>
  );
}