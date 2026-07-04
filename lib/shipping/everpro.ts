/**
 * Everpro Shipping API client.
 *
 * Docs: https://developer.everpro.id/
 *
 * Endpoint yang dipakai mengikuti dokumentasi publik Everpro Shipping v1.
 * Catatan: dokumentasi Everpro dapat berubah — bila response shape berbeda,
 * sesuaikan parser di bawah atau override via wrapper function.
 *
 * Behaviour kalau EVERPRO_API_KEY kosong:
 *   - getRates() → return mock 3 rate (JNE REG, JNT EZ, SiCepat BEST)
 *   - createShipment() → throw Error dengan pesan jelas
 *   - trackShipment() → return mock timeline
 *   - console.warn sekali per proses.
 */

import { getIntegrationCredential } from "@/lib/integrations/credentials";

const DEFAULT_TIMEOUT_MS = 15_000;

let warnedMissingKey = false;
function warnMissingKey(): void {
  if (warnedMissingKey) return;
  warnedMissingKey = true;
  console.warn(
    "[everpro] EVERPRO_API_KEY kosong — menggunakan mock data untuk development. Set EVERPRO_API_KEY untuk integrasi nyata.",
  );
}

let tokenCache: { value: string; expiresAt: number; fingerprint: string } | null = null;

async function everproConfig() {
  const credential = await getIntegrationCredential("everpro");
  return {
    baseUrl: String(
      credential.publicConfig.baseUrl ||
      (credential.environment === "production"
        ? "https://client-api.everpro.id"
        : "https://client-api-sandbox.everpro.id"),
    ).replace(/\/$/, ""),
    clientKey: credential.secrets.clientKey ?? "",
    clientSecret: credential.secrets.clientSecret ?? "",
    shipperName: String(credential.publicConfig.shipperName || process.env.STORE_SHIPPER_NAME || "NXTY Fightwear"),
    shipperPhone: String(credential.publicConfig.shipperPhone || process.env.STORE_SHIPPER_PHONE || ""),
    shipperAddress: String(credential.publicConfig.shipperAddress || process.env.STORE_SHIPPER_ADDRESS || ""),
    shipperPostalCode: String(credential.publicConfig.shipperPostalCode || process.env.STORE_ORIGIN_POSTAL_CODE || ""),
  };
}

async function accessToken() {
  const config = await everproConfig();
  if (!config.clientKey || !config.clientSecret) return { config, token: "" };
  const fingerprint = `${config.baseUrl}:${config.clientKey}`;
  if (tokenCache && tokenCache.fingerprint === fingerprint && tokenCache.expiresAt > Date.now() + 60_000) {
    return { config, token: tokenCache.value };
  }
  const response = await fetch(`${config.baseUrl}/auth/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_key: config.clientKey, client_secret: config.clientSecret }),
  });
  if (!response.ok) throw new EverproError(`Everpro auth ${response.status}`, response.status);
  const json = await response.json() as { data?: { token?: string; expires?: number } };
  if (!json.data?.token) throw new EverproError("Everpro auth tidak mengembalikan token", 502);
  tokenCache = {
    value: json.data.token,
    expiresAt: Date.now() + Math.max(300, json.data.expires ?? 3600) * 1000,
    fingerprint,
  };
  return { config, token: tokenCache.value };
}

async function shouldUseMock() {
  const config = await everproConfig();
  const missing = !config.clientKey || !config.clientSecret;
  if (missing && process.env.NODE_ENV === "production") {
    throw new EverproError("Credential Everpro belum lengkap", 503);
  }
  if (missing) warnMissingKey();
  return missing;
}

export interface RateRequest {
  /** Origin city ID atau postal code */
  origin: string;
  /** Destination city ID atau postal code */
  destination: string;
  /** Berat dalam gram */
  weight: number;
  /** Filter courier: "jne", "jnt", "sicepat", dst */
  courier?: string;
}

export interface Rate {
  courier: string;
  service: string;
  cost: number;
  /** Estimasi durasi, mis. "2-3" hari */
  etd: string;
  rateCode?: string;
}

export interface ShipmentRequest {
  order_id: string;
  origin: string;
  destination: string;
  weight: number;
  courier: string;
  service: string;
  shipment_price?: number;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_postal_code: string;
  item_name: string;
  item_value: number;
  item_weight: number;
  item_qty: number;
}

export interface ShipmentResult {
  waybill: string;
  courier: string;
  service: string;
  etd: string;
}

export interface TrackingEvent {
  /** ISO date string */
  date: string;
  description: string;
  location?: string;
}

export interface TrackingResult {
  status: string;
  courier: string;
  waybill: string;
  events: TrackingEvent[];
}

export class EverproError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "EverproError";
    this.status = status;
  }
}

async function everproFetch<T>(
  path: string,
  init: RequestInit & { method?: string },
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    const { config, token } = await accessToken();
    if (!token) throw new EverproError("Credential Everpro belum lengkap", 503);
    res = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new EverproError("Everpro API timeout", 504);
    }
    throw new EverproError(
      `Everpro API network error: ${err instanceof Error ? err.message : "unknown"}`,
      502,
    );
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new EverproError(
      `Everpro API ${res.status}: ${detail || res.statusText}`,
      res.status,
    );
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new EverproError("Everpro API returned invalid JSON", 502);
  }
}

/**
 * Cek ongkir dari Everpro.
 *
 * Endpoint: POST /shipment/v1/rates
 * Body: { origin, destination, weight, courier? }
 */
export async function getRates(req: RateRequest): Promise<Rate[]> {
  if (await shouldUseMock()) {
    return mockRates(req);
  }

  const config = await everproConfig();
  const originPostalCode = req.origin || config.shipperPostalCode;
  if (!originPostalCode) throw new EverproError("Kode pos gudang belum dikonfigurasi", 503);
  type RawRate = {
    logistic_code?: string;
    logistic_name?: string;
    rate_code?: string;
    rate_name?: string;
    shipment_price?: number;
    end_customer_shipment_price?: number;
    min_duration?: number;
    max_duration?: number;
  };
  type RateResponse = {
    data?: {
      rates?: Record<string, RawRate[]>;
    } | RawRate[];
  } | RawRate[];
  const res = await everproFetch<RateResponse>("/shipment/v1/rates", {
    method: "POST",
    body: JSON.stringify({
      origin_postal_code: originPostalCode,
      destination_postal_code: req.destination,
      weight: req.weight,
      length: 10,
      width: 10,
      height: 5,
      item_price: 1,
      package_type_id: 1,
      shipment_type: "DROP",
      is_cod: false,
      is_use_insurance: false,
      logistic_codes: req.courier ? [req.courier.toUpperCase()] : undefined,
    }),
  });

  const rawRates: RawRate[] = Array.isArray(res)
    ? res
    : Array.isArray(res.data)
      ? res.data
      : Object.values(res.data?.rates ?? {}).flat();
  return rawRates.map((rate) => ({
    courier: rate.logistic_code ?? rate.logistic_name ?? "",
    service: rate.rate_name ?? rate.rate_code ?? "",
    rateCode: rate.rate_code,
    cost: rate.end_customer_shipment_price ?? rate.shipment_price ?? 0,
    etd: rate.min_duration === undefined
      ? ""
      : rate.min_duration === rate.max_duration
        ? String(rate.min_duration)
        : `${rate.min_duration}-${rate.max_duration ?? rate.min_duration}`,
  })).filter((rate) => rate.courier && rate.service && rate.cost >= 0);
}

/**
 * Buat shipment + generate AWB (resi) di Everpro.
 *
 * Endpoint: POST /shipment/v1/orders
 * Response Everpro biasanya berisi { data: { airway_bill_no, courier, service, etd } }
 * atau { airway_bill_no, ... }. Parser mengikuti kedua kemungkinan.
 */
export async function createShipment(req: ShipmentRequest): Promise<ShipmentResult> {
  if (await shouldUseMock()) {
    // Untuk dev tanpa API key, generate waybill dummy deterministik
    // supaya test flow admin tidak stuck.
    const stamp = Date.now().toString().slice(-8);
    return {
      waybill: `MOCK${stamp}`,
      courier: req.courier,
      service: req.service,
      etd: "2-3",
    };
  }

  // Response Everpro bisa berupa object langsung ATAU wrapper { data: {...} }.
  // Pakai union + narrowing eksplisit agar TypeScript happy.
  type ShipmentInner = Partial<ShipmentResult> & { airway_bill_no?: string };
  type ShipmentResponse = { data?: ShipmentInner } | ShipmentInner;

  const config = await everproConfig();
  const shipperName = config.shipperName;
  const shipperPhone = config.shipperPhone;
  const shipperAddress = config.shipperAddress;
  const shipperPostalCode = config.shipperPostalCode;
  if (!shipperPhone || !shipperAddress || !shipperPostalCode) {
    throw new EverproError("Data alamat pengirim belum lengkap di environment", 503);
  }
  const res = await everproFetch<ShipmentResponse>("/shipment/v1/orders", {
    method: "POST",
    body: JSON.stringify({
      client_order_no: req.order_id,
      order_reference_id: req.order_id,
      is_cod: false,
      is_use_insurance: false,
      insurance_price: 0,
      package_type_id: 1,
      package_count: Math.max(1, req.item_qty),
      package_desc: req.item_name.slice(0, 150),
      package_price: req.item_value,
      rate_code: req.service,
      shipment_price: req.shipment_price ?? 0,
      shipment_type: "DROP",
      receiver_name: req.recipient_name,
      receiver_phone: req.recipient_phone,
      receiver_address: req.recipient_address,
      receiver_postal_code: req.recipient_postal_code,
      shipper_name: shipperName,
      shipper_phone: shipperPhone,
      shipper_address: shipperAddress,
      shipper_postal_code: shipperPostalCode,
      weight: Math.max(0.001, req.weight / 1000),
      length: 10,
      width: 10,
      height: 5,
    }),
  });

  // Normalisasi ke inner shape. Type assertion di sini aman karena:
  //   - Kalau `res` adalah wrapper, `res.data` adalah ShipmentInner
  //   - Kalau `res` adalah langsung, `res` adalah ShipmentInner
  const inner = ("data" in res && res.data ? res.data : res) as ShipmentInner;
  const waybill = inner.waybill ?? inner.airway_bill_no;
  return {
    waybill: waybill ?? "",
    courier: inner.courier ?? req.courier,
    service: inner.service ?? req.service,
    etd: inner.etd ?? "",
  };
}

/**
 * Lacak paket berdasarkan nomor resi + courier.
 *
 * Endpoint: GET /shipment/v1/track?awb=XXX&courier=YYY
 * (Everpro juga support POST dengan body JSON — kita coba GET dulu,
 *  parser response robust terhadap kedua bentuk.)
 */
export async function trackShipment(
  waybill: string,
  courier: string,
): Promise<TrackingResult> {
  if (await shouldUseMock()) {
    return mockTracking(waybill, courier);
  }

  // Sama seperti createShipment: response bisa langsung atau dibungkus {data}.
  type TrackingInner = {
    status?: string;
    courier?: string;
    waybill?: string;
    events?: TrackingEvent[];
    manifest?: TrackingEvent[];
    history?: TrackingEvent[];
    tracking_history?: TrackingEvent[];
  };
  type TrackingResponse = { data?: TrackingInner } | TrackingInner;

  const res = await everproFetch<TrackingResponse>(
    `/shipment/v1/orders/${encodeURIComponent(waybill)}/track?courier=${encodeURIComponent(courier)}`,
    {
      method: "GET",
    },
  );

  const inner = ("data" in res && res.data ? res.data : res) as TrackingInner;
  const events: TrackingEvent[] =
    inner.events ?? inner.manifest ?? inner.history ?? inner.tracking_history ?? [];

  return {
    status: inner.status ?? "unknown",
    courier,
    waybill,
    events,
  };
}

/* ------------------------------------------------------------------ */
/* Mock data (untuk development tanpa EVERPRO_API_KEY)                */
/* ------------------------------------------------------------------ */

function mockRates(req: RateRequest): Rate[] {
  const base = Math.max(9000, Math.round(req.weight * 80));
  return [
    { courier: "jne", service: "REG", cost: base, etd: "2-3" },
    { courier: "jnt", service: "EZ", cost: Math.round(base * 0.85), etd: "2-4" },
    { courier: "sicepat", service: "BEST", cost: Math.round(base * 0.9), etd: "1-2" },
  ];
}

function mockTracking(waybill: string, courier: string): TrackingResult {
  const now = new Date();
  const minus = (h: number) =>
    new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
  return {
    status: "in_transit",
    courier,
    waybill,
    events: [
      {
        date: minus(2),
        description: "Paket diterima di hub asal",
        location: "Bandung",
      },
      {
        date: minus(18),
        description: "Paket telah diserahterimakan ke kurir",
        location: "Bandung",
      },
      {
        date: minus(26),
        description: "Paket sedang diproses di gudang",
        location: "Bandung",
      },
    ],
  };
}
