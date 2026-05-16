import { MOCK_APPOINTMENTS, MOCK_CUSTOMERS, MOCK_DASHBOARD_DATA, MOCK_INVENTORY, MOCK_ORDERS } from "@/data/mock-data";
import { Appointment, Customer, DashboardData, DressMatch, InventoryItem, Order, OrderStatus, SalesTotals } from "@/types/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

function calculateSalesTotals(orders: Order[]): SalesTotals {
  const now = new Date();
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();

  const grossRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const monthlyRevenue = orders
    .filter((order) => {
      const date = new Date(order.orderedAt);
      return date.getUTCMonth() === month && date.getUTCFullYear() === year;
    })
    .reduce((sum, order) => sum + order.total, 0);

  return {
    grossRevenue,
    monthlyRevenue,
    pendingOrders: orders.filter((order) => order.status === "draft" || order.status === "submitted").length,
    totalOrders: orders.length,
  };
}

function toInventoryStatus(quantityOnHand: number, reorderLevel: number): InventoryItem["status"] {
  if (quantityOnHand <= 0) {
    return "out_of_stock";
  }

  if (quantityOnHand <= reorderLevel) {
    return "low_stock";
  }

  return "in_stock";
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return MOCK_INVENTORY;
  }

  const { data, error } = await supabase
    .from("inventory")
    .select("id, quantity_on_hand, reorder_level, location, dresses!inner(id, name, category, sku, price, image_url, status)")
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return MOCK_INVENTORY;
  }

  type InventoryJoin = Database["public"]["Tables"]["inventory"]["Row"] & {
    dresses: Database["public"]["Tables"]["dresses"]["Row"];
  };

  const rows = data as InventoryJoin[];

  return rows.map((item, index) => ({
    id: item.dresses.id,
    name: item.dresses.name,
    category: item.dresses.category,
    sku: item.dresses.sku,
    price: item.dresses.price,
    stock: item.quantity_on_hand,
    status: toInventoryStatus(item.quantity_on_hand, item.reorder_level),
    location: item.location ?? "Main Showroom",
    imageUrl: item.dresses.image_url,
    featured: index < 4,
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
    .select("id, supplier, supplier_order_number, status, ordered_at, expected_delivery_at, total_cost")
    .order("ordered_at", { ascending: false });

  if (error || !data) {
    return MOCK_ORDERS;
  }

  const rows = data as Array<Pick<Database["public"]["Tables"]["orders"]["Row"], "id" | "supplier" | "supplier_order_number" | "status" | "ordered_at" | "expected_delivery_at" | "total_cost">>;

  const orderIds = rows.map((row) => row.id);
  const { data: orderItemsData } = await supabase
    .from("order_items")
    .select("order_id, quantity, unit_cost, dresses!inner(name, sku)")
    .in("order_id", orderIds);

  type OrderItemJoin = {
    order_id: string;
    quantity: number;
    unit_cost: number;
    dresses: { name: string; sku: string };
  };

  const itemsByOrder = new Map<string, Order["items"]>();
  (orderItemsData as OrderItemJoin[] | null)?.forEach((item) => {
    const existing = itemsByOrder.get(item.order_id) ?? [];
    existing.push({
      dressName: item.dresses.name,
      sku: item.dresses.sku,
      quantity: item.quantity,
      unitPrice: item.unit_cost,
    });
    itemsByOrder.set(item.order_id, existing);
  });

  return rows.map((order) => ({
    id: order.id,
    supplier: order.supplier,
    supplierOrderNumber: order.supplier_order_number,
    status: order.status,
    total: order.total_cost,
    orderedAt: order.ordered_at,
    expectedDeliveryAt: order.expected_delivery_at,
    items: itemsByOrder.get(order.id) ?? [],
  }));
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return MOCK_CUSTOMERS;
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone, preferred_category")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) {
    return MOCK_CUSTOMERS;
  }

  const rows = data as Array<Pick<Database["public"]["Tables"]["customers"]["Row"], "id" | "first_name" | "last_name" | "email" | "phone" | "preferred_category">>;
  return rows.map((customer) => ({
    id: customer.id,
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email,
    phone: customer.phone,
    preferredCategory: customer.preferred_category,
  }));
}

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return MOCK_APPOINTMENTS;
  }

  const { data, error } = await supabase
    .from("appointments")
    .select("id, customer_id, appointment_at, duration_minutes, status, stylist_name, fitting_room, customers!inner(first_name, last_name)")
    .order("appointment_at", { ascending: true })
    .limit(10);

  if (error || !data) {
    return MOCK_APPOINTMENTS;
  }

  type AppointmentJoin = Pick<Database["public"]["Tables"]["appointments"]["Row"], "id" | "customer_id" | "appointment_at" | "duration_minutes" | "status" | "stylist_name" | "fitting_room"> & {
    customers: { first_name: string; last_name: string };
  };

  const rows = data as AppointmentJoin[];
  return rows.map((appointment) => ({
    id: appointment.id,
    customerId: appointment.customer_id,
    customerName: `${appointment.customers.first_name} ${appointment.customers.last_name}`,
    appointmentAt: appointment.appointment_at,
    durationMinutes: appointment.duration_minutes,
    status: appointment.status,
    stylistName: appointment.stylist_name,
    fittingRoom: appointment.fitting_room,
  }));
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return MOCK_DASHBOARD_DATA;
  }

  const [inventory, orders, customers, appointments] = await Promise.all([
    getInventoryItems(),
    getOrders(),
    getCustomers(),
    getAppointments(),
  ]);

  return {
    inventory,
    orders,
    customers,
    appointments,
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

export async function getDressesForMatching(): Promise<DressMatch[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return MOCK_INVENTORY.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: "Unknown",
      size: "Varies",
      price: item.price,
      sku: item.sku,
      imageUrl: item.imageUrl ?? null,
      score: 0,
    }));
  }

  const { data, error } = await supabase
    .from("dresses")
    .select("id, name, category, color, size, price, sku, image_url, status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  const rows = data as Array<Pick<Database["public"]["Tables"]["dresses"]["Row"], "id" | "name" | "category" | "color" | "size" | "price" | "sku" | "image_url">>;

  return rows.map((dress) => ({
    id: dress.id,
    name: dress.name,
    category: dress.category,
    color: dress.color,
    size: dress.size,
    price: dress.price,
    sku: dress.sku,
    imageUrl: dress.image_url,
    score: 0,
  }));
}
