export interface ShippingZone {
  label: string;
  provinces: string[];
  fee: number;
}

/**
 * Ongkir manual per zona: cari zona yang provinces-nya cocok dengan
 * provinsi customer (case-insensitive). Tidak ketemu / provinsi kosong
 * -> pakai defaultFee (ongkir nasional flat, setting `shipping_manual_fee`).
 */
export function resolveManualShippingFee(
  zones: ShippingZone[],
  defaultFee: number,
  province: string | undefined | null,
): number {
  const target = (province ?? "").trim().toLowerCase();
  if (target) {
    const match = zones.find((zone) =>
      zone.provinces.some((p) => p.trim().toLowerCase() === target),
    );
    if (match) return match.fee;
  }
  return defaultFee;
}
