import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { UIProvider } from "@/contexts/UIContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-canvas text-text-primary selection:bg-brand-green selection:text-white`}
      >
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <UIProvider>
                <AppShell>{children}</AppShell>
              </UIProvider>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
