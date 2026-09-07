import { NextRequest, NextResponse } from "next/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Allow login page itself
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    const loginUrl = new URL("/admin/login", req.url);
    // Simpan tujuan asli (path + query) supaya setelah login kembali ke sana,
    // mis. deep-link notifikasi Telegram /admin/pesanan?order=...
    loginUrl.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
