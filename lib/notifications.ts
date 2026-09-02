import { createAdminClient } from "@/lib/supabase/server";

/**
 * Notifikasi internal aplikasi. Disimpan di tabel `notifications` supaya
 * bisa dilihat kembali (bukan toast sementara).
 *
 * Best-effort: kegagalan insert notifikasi TIDAK boleh menggagalkan alur
 * order/pembayaran — cukup di-log.
 */

export type NotificationType =
  | "order_created" // -> admin: ada pesanan baru
  | "shipping_cost_set" // -> customer: ongkir sudah tersedia
  | "payment_submitted" // -> admin: customer upload bukti bayar
  | "payment_verified" // -> customer: pembayaran dikonfirmasi
  | "payment_rejected" // -> customer: pembayaran ditolak
  | "order_processing" // -> customer: pesanan diproses
  | "order_shipped" // -> customer: pesanan dikirim
  | "order_completed" // -> customer: pesanan selesai
  | "order_cancelled"; // -> customer: pesanan dibatalkan

interface NotifyInput {
  audience: "admin" | "customer";
  type: NotificationType;
  title: string;
  body?: string | null;
  orderId?: string | null;
  /** auth.users.id customer. Null untuk admin & guest checkout. */
  recipientId?: string | null;
}

export function formatRupiah(value: number | null | undefined): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export async function notify(input: NotifyInput): Promise<void> {
  try {
    const supabase = createAdminClient();
    if (!supabase) return;
    const { error } = await supabase.from("notifications").insert({
      audience: input.audience,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      order_id: input.orderId ?? null,
      recipient_id: input.recipientId ?? null,
    });
    if (error) console.error("[notify] insert gagal:", error.message);
  } catch (err) {
    console.error("[notify] error:", err);
  }
}

/** Label + pesan default per transisi status order (dipakai admin PUT). */
export function statusNotification(
  status: string,
  orderId: string,
): { type: NotificationType; title: string; body: string } | null {
  const short = orderId.slice(-8);
  switch (status) {
    case "processed":
      return {
        type: "order_processing",
        title: "Pesanan sedang diproses",
        body: `Pesanan …${short} sedang kami siapkan.`,
      };
    case "shipped":
      return {
        type: "order_shipped",
        title: "Pesanan dikirim",
        body: `Pesanan …${short} sudah dikirim.`,
      };
    case "delivered":
      return {
        type: "order_completed",
        title: "Pesanan selesai",
        body: `Pesanan …${short} telah sampai. Terima kasih!`,
      };
    case "cancelled":
      return {
        type: "order_cancelled",
        title: "Pesanan dibatalkan",
        body: `Pesanan …${short} dibatalkan.`,
      };
    default:
      return null;
  }
}
