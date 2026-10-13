export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ItemType = 'product' | 'service';
export type PricingMode = 'markup' | 'margin';
export type DiscountType = 'percentage' | 'fixed';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string;
          type: ItemType;
          cost: number;
          pricing_mode: PricingMode;
          markup_percentage: number;
          margin_percentage: number;
          price: number;
          image_url: string;
          duration_minutes: number | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string;
          type: ItemType;
          cost?: number;
          pricing_mode?: PricingMode;
          markup_percentage?: number;
          margin_percentage?: number;
          price: number;
          image_url?: string;
          duration_minutes?: number | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string;
          type?: ItemType;
          cost?: number;
          pricing_mode?: PricingMode;
          markup_percentage?: number;
          margin_percentage?: number;
          price?: number;
          image_url?: string;
          duration_minutes?: number | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      combos: {
        Row: {
          id: string;
          name: string;
          description: string;
          discount_type: DiscountType;
          discount_value: number;
          final_price: number;
          image_url: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          discount_type?: DiscountType;
          discount_value?: number;
          final_price: number;
          image_url?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          discount_type?: DiscountType;
          discount_value?: number;
          final_price?: number;
          image_url?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      combo_items: {
        Row: {
          id: string;
          combo_id: string;
          item_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          combo_id: string;
          item_id: string;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          combo_id?: string;
          item_id?: string;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      business_hours: {
        Row: {
          id: string;
          day_of_week: number;
          is_open: boolean;
          open_time: string;
          close_time: string;
          slot_duration_minutes: number;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          is_open?: boolean;
          open_time?: string;
          close_time?: string;
          slot_duration_minutes?: number;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          is_open?: boolean;
          open_time?: string;
          close_time?: string;
          slot_duration_minutes?: number;
        };
        Relationships: [];
      };
      blocked_dates: {
        Row: {
          id: string;
          date: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          reason?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          reason?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          service_id: string | null;
          combo_id: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status: AppointmentStatus;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          service_id?: string | null;
          combo_id?: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          status?: AppointmentStatus;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          service_id?: string | null;
          combo_id?: string | null;
          appointment_date?: string;
          start_time?: string;
          end_time?: string;
          status?: AppointmentStatus;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: string;
          business_name: string;
          whatsapp_phone: string;
          currency_symbol: string;
          address: string;
          instagram_url: string;
          business_description: string;
          theme_palette: string;
          theme_mode: ThemeMode;
          logo_icon?: string | null;
          logo_url?: string | null;
          whatsapp_appointment_template?: string | null;
          whatsapp_product_template?: string | null;
          whatsapp_quote_template?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name?: string;
          whatsapp_phone?: string;
          currency_symbol?: string;
          address?: string;
          instagram_url?: string;
          business_description?: string;
          theme_palette?: string;
          theme_mode?: ThemeMode;
          logo_icon?: string | null;
          logo_url?: string | null;
          whatsapp_appointment_template?: string | null;
          whatsapp_product_template?: string | null;
          whatsapp_quote_template?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          whatsapp_phone?: string;
          currency_symbol?: string;
          address?: string;
          instagram_url?: string;
          business_description?: string;
          theme_palette?: string;
          theme_mode?: ThemeMode;
          logo_icon?: string | null;
          logo_url?: string | null;
          whatsapp_appointment_template?: string | null;
          whatsapp_product_template?: string | null;
          whatsapp_quote_template?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_catalog_items: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string;
          type: ItemType;
          price: number;
          image_url: string;
          duration_minutes: number | null;
          is_active: boolean;
          sort_order: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
