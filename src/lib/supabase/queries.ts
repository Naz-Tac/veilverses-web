import { MOCK_DASHBOARD_DATA, MOCK_INVENTORY, MOCK_ORDERS } from "@/data/mock-data";
import { DashboardData, InventoryItem, Order, OrderStatus, SalesTotals } from "@/types/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

function mapOrderItems(items: unknown): Order["items"] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "sku" in item &&
      "quantity" in item &&
      "unitPrice" in item
    ) {
      return [
        {
          sku: String(item.sku),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        },
      ];
    }

    return [];
  });
}

function calculateSalesTotals(orders: Order[]): SalesTotals {
  const now = new Date();
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();

  const grossRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const monthlyRevenue = orders
    .filter((order) => {
      const date = new Date(order.createdAt);
      return date.getUTCMonth() === month && date.getUTCFullYear() === year;
    })
    .reduce((sum, order) => sum + order.total, 0);

  return {
    grossRevenue,
    monthlyRevenue,
    pendingOrders: orders.filter((order) => order.status === "pending").length,
    totalOrders: orders.length,
  };
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return MOCK_INVENTORY;
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, category, sku, price, stock, status, featured")
    .order("name", { ascending: true });

  if (error || !data) {
    return MOCK_INVENTORY;
  }

  const rows = data as Database["public"]["Tables"]["inventory_items"]["Row"][];

  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    sku: item.sku,
    price: item.price,
    stock: item.stock,
    status: item.status,
    featured: item.featured,
  }));
}

export async function getFeaturedInventory(limit = 4): Promise<InventoryItem[]> {
  const inventory = await getInventoryItems();
  return inventory.filter((item) => item.featured).slice(0, limit);
}

export async function getOrders(): Promise<Order[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return MOCK_ORDERS;
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, customer_email, status, total, created_at, items")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return MOCK_ORDERS;
  }

  const rows = data as Database["public"]["Tables"]["orders"]["Row"][];

  return rows.map((order) => ({
    id: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    status: order.status,
    total: order.total,
    createdAt: order.created_at,
    items: mapOrderItems(order.items),
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return MOCK_DASHBOARD_DATA;
  }

  const [inventory, orders] = await Promise.all([getInventoryItems(), getOrders()]);

  return {
    inventory,
    orders,
    salesTotals: calculateSalesTotals(orders),
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServerClient(true);
  if (!supabase) {
    return { ok: false, error: "Supabase service role key is missing." };
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
