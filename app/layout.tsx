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
  title: "Anxiety Fightwear — Peralatan Olahraga & Fightwear",
  description:
    "Toko online Anxiety Fightwear. Jual boxing gloves, hand wrap, rashguard, fight shorts, shin guard, dan apparel olahraga berkualitas dengan harga terjangkau.",
  manifest: "/storefront-manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/storefront-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/storefront-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/storefront-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "Anxiety Fightwear",
  },
  keywords: [
    "Anxiety Fightwear",
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
  authors: [{ name: "Anxiety Fightwear" }],
  openGraph: {
    title: "Anxiety Fightwear — Peralatan Olahraga & Fightwear",
    description:
      "Temukan perlengkapan latihan terbaik. Boxing gloves, rashguard, fight shorts, dan banyak lagi.",
    type: "website",
    locale: "id_ID",
    siteName: "Anxiety Fightwear",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anxiety Fightwear",
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
        className={`${inter.variable} antialiased min-h-screen bg-canvas text-text-primary selection:bg-brand-black selection:text-white`}
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
