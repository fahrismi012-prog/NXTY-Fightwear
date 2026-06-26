import { createAdminClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";
import OrderListClient from "./OrderListClient";

export const dynamic = "force-dynamic";

async function loadOrders(): Promise<Order[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Order[];
}

export default async function PesananListPage() {
  const orders = await loadOrders();
  return <OrderListClient orders={orders} />;
}
