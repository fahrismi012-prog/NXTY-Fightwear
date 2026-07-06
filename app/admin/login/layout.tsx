import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Anxiety Fightwear Admin",
  description: "Panel administrasi Anxiety Fightwear",
  manifest: "/admin-manifest.webmanifest",
  icons: {
    icon: [
      { url: "/admin-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/admin-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/admin-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "Anxiety Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
