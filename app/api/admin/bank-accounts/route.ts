import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/bank-accounts
 * Public read — return semua bank accounts yang aktif (untuk checkout).
 * Admin tidak perlu auth untuk ini (RLS sudah handle public read).
 */
export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ accounts: [] });
  }
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(
      "id, bank_name, account_number, account_holder, instructions, is_active, display_order",
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ accounts: data ?? [] });
}

/**
 * POST /api/admin/bank-accounts
 * Buat bank account baru. Admin only.
 * Body: { bank_name, account_number, account_holder, instructions?, is_active? }
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const bank_name = String(body.bank_name ?? "").trim();
  const account_number = String(body.account_number ?? "").trim();
  const account_holder = String(body.account_holder ?? "").trim();

  if (!bank_name || !account_number || !account_holder) {
    return NextResponse.json(
      { error: "Nama bank, nomor rekening, dan atas nama wajib diisi" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // Auto-assign display_order = max + 1
  const { data: maxRow } = await supabase
    .from("bank_accounts")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const display_order =
    typeof maxRow?.display_order === "number" ? maxRow.display_order + 1 : 0;

  const { data, error } = await supabase
    .from("bank_accounts")
    .insert({
      bank_name,
      account_number,
      account_holder,
      instructions: body.instructions ?? null,
      is_active: body.is_active ?? true,
      display_order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ account: data }, { status: 201 });
}
