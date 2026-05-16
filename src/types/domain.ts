export type DressCategory = "Bridal" | "Quinceanera" | "Prom & Formal" | "Evening";

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";
export type ItemStatus = "active" | "archived" | "draft";
export type OrderStatus = "draft" | "submitted" | "partially_received" | "received" | "cancelled";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface InventoryItem {
  id: string;
  name: string;
  category: DressCategory;
  sku: string;
  price: number;
  stock: number;
  status: InventoryStatus;
  location: string;
  imageUrl?: string | null;
  featured: boolean;
}

export interface OrderItem {
  dressName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  supplier: string;
  supplierOrderNumber: string | null;
  status: OrderStatus;
  total: number;
  orderedAt: string;
  expectedDeliveryAt: string | null;
  items: OrderItem[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  preferredCategory: DressCategory | null;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  appointmentAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  stylistName: string | null;
  fittingRoom: string | null;
}

export interface SalesTotals {
  grossRevenue: number;
  monthlyRevenue: number;
  pendingOrders: number;
  totalOrders: number;
}

export interface DashboardData {
  inventory: InventoryItem[];
  orders: Order[];
  customers: Customer[];
  appointments: Appointment[];
  salesTotals: SalesTotals;
}

export interface DressMatch {
  id: string;
  name: string;
  category: DressCategory;
  color: string;
  size: string;
  price: number;
  sku: string;
  imageUrl: string | null;
  score: number;
}
