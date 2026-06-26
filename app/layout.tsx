import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { UIProvider } from "@/contexts/UIContext";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NXTY Fightwear — Peralatan Olahraga & Fightwear",
  description:
    "Toko online NXTY Fightwear. Jual boxing gloves, hand wrap, rashguard, fight shorts, shin guard, dan apparel olahraga berkualitas dengan harga terjangkau.",
  keywords: [
    "NXTY Fightwear",
    "boxing gloves",
    "hand wrap",
    "rashguard",
    "fight shorts",
    "shin guard",
    "mouth guard",
    "gym bag",
    "apparel olahraga",
    "aksesoris latihan",
    "toko online",
    "UMKM",
  ],
  authors: [{ name: "NXTY Fightwear" }],
  openGraph: {
    title: "NXTY Fightwear — Peralatan Olahraga & Fightwear",
    description:
      "Temukan perlengkapan latihan terbaik. Boxing gloves, rashguard, fight shorts, dan banyak lagi.",
    type: "website",
    locale: "id_ID",
    siteName: "NXTY Fightwear",
  },
  twitter: {
    card: "summary_large_image",
    title: "NXTY Fightwear",
    description: "Peralatan Olahraga & Fightwear Berkualitas",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} antialiased min-h-screen bg-[#0a0a0a] text-white selection:bg-[#dc2626] selection:text-white`}
      >
        <CartProvider>
          <ToastProvider>
            <UIProvider>
              <AppShell>{children}</AppShell>
            </UIProvider>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
