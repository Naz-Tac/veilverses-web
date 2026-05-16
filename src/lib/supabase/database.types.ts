import { DressCategory, InventoryStatus, OrderStatus } from "@/types/domain";

export interface Database {
  public: {
    Tables: {
      inventory_items: {
        Row: {
          id: string;
          name: string;
          category: DressCategory;
          sku: string;
          price: number;
          stock: number;
          status: InventoryStatus;
          featured: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          category: DressCategory;
          sku: string;
          price: number;
          stock: number;
          status: InventoryStatus;
          featured?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          category?: DressCategory;
          sku?: string;
          price?: number;
          stock?: number;
          status?: InventoryStatus;
          featured?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          status: OrderStatus;
          total: number;
          created_at: string;
          items: { sku: string; quantity: number; unitPrice: number }[];
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          status?: OrderStatus;
          total: number;
          created_at?: string;
          items?: { sku: string; quantity: number; unitPrice: number }[];
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          status?: OrderStatus;
          total?: number;
          created_at?: string;
          items?: { sku: string; quantity: number; unitPrice: number }[];
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
