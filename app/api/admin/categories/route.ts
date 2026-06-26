import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifikasi session admin dari cookie.
 * Mengembalikan null kalau valid, atau NextResponse 401 kalau tidak.
 */
async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * GET /api/admin/categories
 * List semua kategori, diurutkan berdasarkan nama ASC.
 */
export async function GET() {
  const auth = await requireAuth();
  if (auth) return auth;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

/**
 * POST /api/admin/categories
 * Buat kategori baru. Body: { name, slug, description? }
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth) return auth;

  let body: { name?: string; slug?: string; description?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON valid" },
      { status: 400 },
    );
  }

  const name = (body.name ?? "").trim();
  const slug = (body.slug ?? "").trim();

  if (!name) {
    return NextResponse.json(
      { error: "Nama kategori wajib diisi" },
      { status: 400 },
    );
  }
  if (!slug) {
    return NextResponse.json(
      { error: "Slug kategori wajib diisi" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      description: body.description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}
