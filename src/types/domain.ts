export type DressCategory = "Bridal" | "Quinceanera" | "Prom & Formal" | "Evening";

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";
export type OrderStatus = "pending" | "processing" | "ready" | "completed" | "cancelled";

export interface InventoryItem {
  id: string;
  name: string;
  category: DressCategory;
  sku: string;
  price: number;
  stock: number;
  status: InventoryStatus;
  featured: boolean;
}

export interface OrderItem {
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
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
  salesTotals: SalesTotals;
}
