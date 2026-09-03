// Type definitions untuk tabel Supabase.
// Schema lengkap ada di `supabase/schema.sql`.

export type PromotionType =
  | "banner"
  | "flash_sale"
  | "voucher"
  | "bundle"
  | "add_on";

export type DiscountType = "percentage" | "fixed";

export type OrderStatus =
  | "awaiting_shipping_cost"
  | "awaiting_payment"
  | "awaiting_confirmation"
  | "pending"
  | "paid"
  | "processed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  sizes: string[];
  colors: string[];
  rating: number;
  reviews_count: number;
  featured: boolean;
  in_stock: boolean;
  weight_grams: number;
  // Harga per kombinasi size/color, key "size|color". Lihat lib/pricing.ts.
  variant_prices: Record<string, number>;
  // Harga khusus pelanggan tier "legacy". Null = pakai harga normal.
  legacy_price: number | null;
  is_preorder: boolean;
  preorder_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Promotion {
  id: string;
  type: PromotionType;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  badge: string | null;
  discount_type: DiscountType | null;
  discount_value: number | null;
  min_purchase: number | null;
  flash_price: number | null;
  flash_stock: number | null;
  product_ids: string[];
  end_time: string | null;
  cta_label: string | null;
  cta_href: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  slug?: string;
}

export interface OrderShipping {
  courier?: string;
  service?: string;
  waybill?: string;
  etd?: string;
  weight?: number;
  cost?: number;
  rateCode?: string;
  trackingCode?: string;
}

export interface Order {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  notes: string | null;
  subtotal: number | null;
  shipping_cost: number | null;
  total: number | null;
  status: OrderStatus;
  items: OrderItem[];
  shipping: OrderShipping | null;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  // Payment mode manual (dari migration 2026-07-03)
  payment_method: "gateway" | "manual" | null;
  payment_proof_url: string | null;
  payment_expires_at: string | null;
  payment_confirmed_at: string | null;
  payment_confirmed_by: string | null;
  payment_rejection_reason: string | null;
  bank_account_id: string | null;
  // Shipping mode (snapshot saat order dibuat)
  shipping_method_used: "auto" | "manual" | null;
  shipping_manual_carrier: string | null;
  shipping_manual_cost: number | null;
  shipping_manual_receipt: string | null;
  shipping_manual_receipt_url: string | null;
}

export type PriceTier = "standard" | "legacy";

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  default_address_id: string | null;
  price_tier: PriceTier;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}

// Joined view untuk storefront (product + category + images)
export interface ProductWithRelations extends Product {
  category: Category | null;
  images: ProductImage[];
}

// Legacy Product (dari data/products.json) — dipakai saat fallback
// sebelum Supabase di-setup atau saat dev tanpa env.
export interface LegacyProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  sizes: string[];
  colors: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  inStock: boolean;
}
