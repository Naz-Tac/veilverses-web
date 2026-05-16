import { AppointmentStatus, DressCategory, ItemStatus, OrderStatus } from "@/types/domain";

export interface Database {
  public: {
    Tables: {
      dresses: {
        Row: {
          id: string;
          name: string;
          category: DressCategory;
          color: string;
          size: string;
          price: number;
          wholesale_cost: number;
          sku: string;
          supplier: string;
          status: ItemStatus;
          image_url: string | null;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: DressCategory;
          color: string;
          size: string;
          price: number;
          wholesale_cost: number;
          sku: string;
          supplier: string;
          status?: ItemStatus;
          image_url?: string | null;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: DressCategory;
          color?: string;
          size?: string;
          price?: number;
          wholesale_cost?: number;
          sku?: string;
          supplier?: string;
          status?: ItemStatus;
          image_url?: string | null;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          dress_id: string;
          quantity_on_hand: number;
          quantity_reserved: number;
          reorder_level: number;
          location: string | null;
          last_restocked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dress_id: string;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          reorder_level?: number;
          location?: string | null;
          last_restocked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          dress_id?: string;
          quantity_on_hand?: number;
          quantity_reserved?: number;
          reorder_level?: number;
          location?: string | null;
          last_restocked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          supplier: string;
          supplier_order_number: string | null;
          status: OrderStatus;
          ordered_at: string;
          expected_delivery_at: string | null;
          received_at: string | null;
          subtotal: number;
          shipping_cost: number;
          tax: number;
          total_cost: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier: string;
          supplier_order_number?: string | null;
          status?: OrderStatus;
          ordered_at?: string;
          expected_delivery_at?: string | null;
          received_at?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          tax?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier?: string;
          supplier_order_number?: string | null;
          status?: OrderStatus;
          ordered_at?: string;
          expected_delivery_at?: string | null;
          received_at?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          tax?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          dress_id: string;
          quantity: number;
          unit_cost: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          dress_id: string;
          quantity: number;
          unit_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          dress_id?: string;
          quantity?: number;
          unit_cost?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          preferred_category: DressCategory | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          preferred_category?: DressCategory | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          preferred_category?: DressCategory | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          customer_id: string;
          appointment_at: string;
          duration_minutes: number;
          status: AppointmentStatus;
          stylist_name: string | null;
          fitting_room: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          appointment_at: string;
          duration_minutes?: number;
          status?: AppointmentStatus;
          stylist_name?: string | null;
          fitting_room?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          appointment_at?: string;
          duration_minutes?: number;
          status?: AppointmentStatus;
          stylist_name?: string | null;
          fitting_room?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
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
