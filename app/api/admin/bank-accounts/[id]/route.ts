import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * PUT /api/admin/bank-accounts/[id]
 * Update bank account. Admin only.
 * Body: { bank_name?, account_number?, account_holder?, instructions?, is_active? }
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const { id } = await context.params;

  let body: {
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    instructions?: string | null;
    is_active?: boolean;
  } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.bank_name === "string") {
    const v = body.bank_name.trim();
    if (!v) return NextResponse.json({ error: "bank_name kosong" }, { status: 400 });
    update.bank_name = v;
  }
  if (typeof body.account_number === "string") {
    const v = body.account_number.trim();
    if (!v) return NextResponse.json({ error: "account_number kosong" }, { status: 400 });
    update.account_number = v;
  }
  if (typeof body.account_holder === "string") {
    const v = body.account_holder.trim();
    if (!v) return NextResponse.json({ error: "account_holder kosong" }, { status: 400 });
    update.account_holder = v;
  }
  if (body.instructions !== undefined) {
    update.instructions = body.instructions ?? null;
  }
  if (typeof body.is_active === "boolean") {
    update.is_active = body.is_active;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Body kosong" }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("bank_accounts")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Rekening tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ account: data });
}

/**
 * DELETE /api/admin/bank-accounts/[id]
 * Hapus bank account. Admin only.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin();
  if (auth) return auth;

  const { id } = await context.params;

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const { error } = await supabase
    .from("bank_accounts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
