import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { UIProvider } from "@/contexts/UIContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { BrandProvider } from "@/contexts/BrandContext";
import AppShell from "@/components/AppShell";
import { getTheme } from "@/lib/storefront/settings";
import { themeToCssVars } from "@/lib/theme";
import "./globals.css";

// Semua font pilihan theme di-load di sini (next/font wajib deklarasi statis).
// Yang aktif dipilih runtime lewat CSS var --theme-font (lihat themeToCssVars).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getTheme();
  const name = theme.brandName;
  const title = `${name} — Peralatan Olahraga & Fightwear`;
  return {
    ...metadata,
    title,
    appleWebApp: { capable: true, statusBarStyle: "black", title: name },
    openGraph: {
      title,
      description:
        "Temukan perlengkapan latihan terbaik. Boxing gloves, rashguard, fight shorts, dan banyak lagi.",
      type: "website",
      locale: "id_ID",
      siteName: name,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: "Peralatan Olahraga & Fightwear Berkualitas",
    },
    authors: [{ name }],
  };
}

const metadata: Metadata = {
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Theme white-label dari settings DB — di-inject sebagai CSS vars di <html>
  // sehingga semua token warna/font (globals.css) mengikuti tanpa rebuild.
  const theme = await getTheme();
  const themeVars = themeToCssVars(theme) as React.CSSProperties;

  return (
    <html lang="id" style={themeVars}>
      <body
        className={`${inter.variable} ${poppins.variable} ${manrope.variable} ${jakarta.variable} antialiased min-h-screen bg-canvas text-text-primary selection:bg-brand-black selection:text-white`}
      >
        <BrandProvider
          value={{ brandName: theme.brandName, logoUrl: theme.logoUrl }}
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
        </BrandProvider>
      </body>
    </html>
  );
}
