import { Database } from './database.types';

export * from './database.types';

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type Item = Database['public']['Tables']['items']['Row'];
export type ItemInsert = Database['public']['Tables']['items']['Insert'];
export type ItemUpdate = Database['public']['Tables']['items']['Update'];

export type PublicCatalogItem = Database['public']['Views']['public_catalog_items']['Row'];

export type Combo = Database['public']['Tables']['combos']['Row'];
export type ComboInsert = Database['public']['Tables']['combos']['Insert'];
export type ComboUpdate = Database['public']['Tables']['combos']['Update'];

export type ComboItem = Database['public']['Tables']['combo_items']['Row'];
export type ComboItemInsert = Database['public']['Tables']['combo_items']['Insert'];

export interface ComboWithItems extends Combo {
  items: Array<{
    item: Item;
    quantity: number;
  }>;
}

export interface PublicComboWithItems extends Combo {
  items: Array<{
    item: PublicCatalogItem;
    quantity: number;
  }>;
}

export type BusinessHours = Database['public']['Tables']['business_hours']['Row'];
export type BlockedDate = Database['public']['Tables']['blocked_dates']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export type AppSettings = Database['public']['Tables']['app_settings']['Row'];
export type AppSettingsUpdate = Database['public']['Tables']['app_settings']['Update'];

// --- Tipos para Cálculos Financieros ---
export interface PricingMetrics {
  markup: number;
  margin: number;
  profit: number;
}

export interface ComboItemPrice {
  price: number;
  quantity: number;
}

export interface ComboTotalCalculation {
  subtotal: number;
  discountAmount: number;
  total: number;
}

// --- Tipos para Mensajería de WhatsApp ---
export interface AppointmentMessageData {
  customerName: string;
  customerPhone?: string;
  serviceOrComboName: string;
  date: string; // formato DD/MM/AAAA o YYYY-MM-DD
  time: string; // formato HH:mm
  notes?: string;
  businessName?: string;
  template?: string | null;
}

export interface ProductMessageData {
  businessName?: string;
  productName: string;
  price: number;
  currencySymbol?: string;
  template?: string | null;
}

export interface QuoteItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface QuoteMessageData {
  customerName: string;
  items: QuoteItem[];
  discountAmount?: number;
  total: number;
  notes?: string;
  currencySymbol?: string;
  businessName?: string;
  template?: string | null;
}
