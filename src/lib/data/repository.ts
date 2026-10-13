import {
  Category,
  CategoryInsert,
  CategoryUpdate,
  Item,
  PublicCatalogItem,
  Combo,
  ComboWithItems,
  BusinessHours,
  BlockedDate,
  Appointment,
  AppointmentStatus,
  AppSettings,
  ItemInsert,
  ItemUpdate,
  AppointmentInsert,
  Database,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_ITEMS,
  INITIAL_COMBOS,
  INITIAL_BUSINESS_HOURS,
  INITIAL_BLOCKED_DATES,
  INITIAL_APPOINTMENTS,
  INITIAL_SETTINGS,
} from './initial-data';
import { isSupabaseConfigured, createClient } from '@/lib/supabase/client';
import { calculatePriceFromMarkup, calculatePriceFromMargin, getMetrics } from '@/lib/calculations/pricing';

const STORAGE_KEYS = {
  CATEGORIES: 'cta_categories',
  ITEMS: 'cta_items',
  COMBOS: 'cta_combos',
  BUSINESS_HOURS: 'cta_business_hours',
  BLOCKED_DATES: 'cta_blocked_dates',
  APPOINTMENTS: 'cta_appointments',
  SETTINGS: 'cta_settings',
};

// Helper para leer/escribir de localStorage en el navegador
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export interface RubroPreset {
  key: string;
  name: string;
  description: string;
  icon: string;
  categories: Array<{ name: string; slug: string; icon: string; sort_order: number }>;
}

export const RUBRO_PRESETS: RubroPreset[] = [
  {
    key: 'barberia',
    name: 'Barbería & Peluquería',
    description: 'Cortes, afeitado tradicional, colorimetría y cuidado capilar.',
    icon: 'scissors',
    categories: [
      { name: 'Cortes y Peinados', slug: 'cortes', icon: 'scissors', sort_order: 1 },
      { name: 'Barba y Afeitado', slug: 'barba', icon: 'scissors', sort_order: 2 },
      { name: 'Tratamientos Capilares', slug: 'tratamientos', icon: 'sparkles', sort_order: 3 },
      { name: 'Productos y Ceras', slug: 'productos', icon: 'shopping-bag', sort_order: 4 },
    ],
  },
  {
    key: 'estetica_spa',
    name: 'Estética, Belleza & Spa',
    description: 'Masajes, cosmetología, manicuría, pestañas y skincare.',
    icon: 'sparkles',
    categories: [
      { name: 'Tratamientos Faciales', slug: 'faciales', icon: 'sparkles', sort_order: 1 },
      { name: 'Masajes & Relajación', slug: 'masajes', icon: 'heart', sort_order: 2 },
      { name: 'Manicuría & Pedicuría', slug: 'manicuria', icon: 'palette', sort_order: 3 },
      { name: 'Pestañas & Cejas', slug: 'pestanas-cejas', icon: 'star', sort_order: 4 },
      { name: 'Productos Skincare', slug: 'skincare', icon: 'shopping-bag', sort_order: 5 },
    ],
  },
  {
    key: 'taller_automotor',
    name: 'Taller Mecánico & Lavadero',
    description: 'Service, mecánica ligera, frenos, gomería y detailing.',
    icon: 'car',
    categories: [
      { name: 'Mantenimiento & Service', slug: 'service', icon: 'wrench', sort_order: 1 },
      { name: 'Mecánica Ligera', slug: 'mecanica-ligera', icon: 'car', sort_order: 2 },
      { name: 'Lavado & Detailing', slug: 'detailing', icon: 'sparkles', sort_order: 3 },
      { name: 'Repuestos & Accesorios', slug: 'repuestos', icon: 'shopping-bag', sort_order: 4 },
    ],
  },
  {
    key: 'veterinaria',
    name: 'Veterinaria & Pet Shop',
    description: 'Consultas médicas, vacunación, peluquería canina y accesorios.',
    icon: 'heart',
    categories: [
      { name: 'Consultas & Vacunación', slug: 'consultas-vacunas', icon: 'heart', sort_order: 1 },
      { name: 'Baño & Peluquería Canina', slug: 'bano-peluqueria', icon: 'scissors', sort_order: 2 },
      { name: 'Alimentos Balanceados', slug: 'alimentos', icon: 'shopping-bag', sort_order: 3 },
      { name: 'Juguetes & Accesorios', slug: 'accesorios', icon: 'gift', sort_order: 4 },
    ],
  },
  {
    key: 'gastronomia',
    name: 'Cafetería, Bar & Gastronomía',
    description: 'Café de especialidad, pastelería, bebidas y platos de autor.',
    icon: 'coffee',
    categories: [
      { name: 'Cafetería de Especialidad', slug: 'cafeteria', icon: 'coffee', sort_order: 1 },
      { name: 'Pastelería & Dulces', slug: 'pasteleria', icon: 'gift', sort_order: 2 },
      { name: 'Platos & Salados', slug: 'salados', icon: 'utensils', sort_order: 3 },
      { name: 'Bebidas & Tragos', slug: 'bebidas', icon: 'flame', sort_order: 4 },
    ],
  },
  {
    key: 'profesional',
    name: 'Servicios Profesionales & Salud',
    description: 'Consultoría, sesiones individuales, turnos médicos o legales.',
    icon: 'briefcase',
    categories: [
      { name: 'Sesiones Individuales', slug: 'sesiones-individuales', icon: 'briefcase', sort_order: 1 },
      { name: 'Consultoría Especializada', slug: 'consultoria', icon: 'book-open', sort_order: 2 },
      { name: 'Paquetes de Seguimiento', slug: 'paquetes-seguimiento', icon: 'star', sort_order: 3 },
    ],
  },
];

interface ComboQueryResult extends Combo {
  combo_items: Array<{
    quantity: number;
    item: Item;
  }>;
}

export const DataRepository = {
  // ---------------------------------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------------------------------
  async getSettings(): Promise<AppSettings> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('app_settings').select('*').limit(1).single();
      if (data) return data as AppSettings;
    }
    return getLocal<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const current = await this.getSettings();
      const updatePayload: Database['public']['Tables']['app_settings']['Update'] = {
        ...settings,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('app_settings')
        .update(updatePayload)
        .eq('id', current.id)
        .select()
        .single();
      if (!error && data) return data as AppSettings;
    }
    const current = getLocal<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    setLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // ---------------------------------------------------------------------------
  // CATEGORIES (CRUD Completo & Presets por Rubro)
  // ---------------------------------------------------------------------------
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (data) return data as Category[];
    }
    const categories = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return categories.sort((a, b) => a.sort_order - b.sort_order);
  },

  async saveCategory(categoryInput: CategoryInsert | CategoryUpdate): Promise<Category> {
    const name = categoryInput.name?.trim() || 'Nueva Categoría';
    const slug = categoryInput.slug?.trim() || slugify(name);
    const icon = categoryInput.icon?.trim() || 'tag';
    const sortOrder = categoryInput.sort_order ?? 0;

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if ('id' in categoryInput && categoryInput.id) {
        const { data, error } = await supabase
          .from('categories')
          .update({
            name,
            slug,
            icon,
            sort_order: sortOrder,
          })
          .eq('id', categoryInput.id)
          .select()
          .single();
        if (!error && data) return data as Category;
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            name,
            slug,
            icon,
            sort_order: sortOrder,
          })
          .select()
          .single();
        if (!error && data) return data as Category;
      }
    }

    const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    let result: Category;

    if ('id' in categoryInput && categoryInput.id) {
      const index = current.findIndex((c) => c.id === categoryInput.id);
      if (index >= 0) {
        result = {
          ...current[index],
          name,
          slug,
          icon,
          sort_order: sortOrder,
        };
        current[index] = result;
      } else {
        result = {
          id: categoryInput.id,
          name,
          slug,
          icon,
          sort_order: sortOrder,
          created_at: new Date().toISOString(),
        };
        current.push(result);
      }
    } else {
      result = {
        id: 'cat-' + Date.now(),
        name,
        slug,
        icon,
        sort_order: sortOrder || current.length + 1,
        created_at: new Date().toISOString(),
      };
      current.push(result);
    }

    current.sort((a, b) => a.sort_order - b.sort_order);
    setLocal(STORAGE_KEYS.CATEGORIES, current);
    return result;
  },

  async deleteCategory(id: string): Promise<{ success: boolean; unlinkedItems: number }> {
    let unlinkedCount = 0;

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: affected } = await supabase
        .from('items')
        .update({ category_id: null })
        .eq('category_id', id)
        .select();
      unlinkedCount = affected?.length || 0;

      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) return { success: true, unlinkedItems: unlinkedCount };
    }

    // LocalStorage Fallback: Desvincular items asociados
    const items = getLocal<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    let localUnlinked = 0;
    const updatedItems = items.map((i) => {
      if (i.category_id === id) {
        localUnlinked++;
        return { ...i, category_id: null };
      }
      return i;
    });
    if (localUnlinked > 0) {
      setLocal(STORAGE_KEYS.ITEMS, updatedItems);
    }

    const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const filtered = current.filter((c) => c.id !== id);
    setLocal(STORAGE_KEYS.CATEGORIES, filtered);

    return { success: true, unlinkedItems: unlinkedCount || localUnlinked };
  },

  async reorderCategories(orderedIds: string[]): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from('categories').update({ sort_order: i + 1 }).eq('id', orderedIds[i]);
      }
    }
    const current = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const updated = current.map((c) => {
      const newOrder = orderedIds.indexOf(c.id);
      return newOrder >= 0 ? { ...c, sort_order: newOrder + 1 } : c;
    });
    updated.sort((a, b) => a.sort_order - b.sort_order);
    setLocal(STORAGE_KEYS.CATEGORIES, updated);
  },

  async applyCategoryPreset(presetKey: string): Promise<Category[]> {
    const preset = RUBRO_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return this.getCategories();

    const newCategories: Category[] = preset.categories.map((c, idx) => ({
      id: `c-preset-${presetKey}-${idx + 1}`,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      sort_order: c.sort_order,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      for (const cat of newCategories) {
        await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
      }
    }

    setLocal(STORAGE_KEYS.CATEGORIES, newCategories);
    return newCategories;
  },

  // ---------------------------------------------------------------------------
  // ITEMS - VISTA PÚBLICA (Sin columnas sensibles de costo ni margen)
  // ---------------------------------------------------------------------------
  async getPublicCatalogItems(): Promise<PublicCatalogItem[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('public_catalog_items').select('*').order('sort_order', { ascending: true });
      if (data) return data as PublicCatalogItem[];
    }
    const allItems = await this.getAdminItems();
    return allItems
      .filter((item) => item.is_active)
      .map(({ id, category_id, name, description, type, price, image_url, duration_minutes, is_active, sort_order }) => ({
        id,
        category_id,
        name,
        description,
        type,
        price,
        image_url,
        duration_minutes,
        is_active,
        sort_order,
      }));
  },

  // ---------------------------------------------------------------------------
  // ITEMS - ADMIN (Acceso total con Costo, Markup y Margen)
  // ---------------------------------------------------------------------------
  async getAdminItems(): Promise<Item[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('items').select('*').order('sort_order', { ascending: true });
      if (data) return data as Item[];
    }
    return getLocal<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
  },

  async saveItem(itemInput: ItemInsert | ItemUpdate): Promise<Item> {
    const cost = itemInput.cost ?? 0;
    const mode = itemInput.pricing_mode ?? 'markup';
    let markup = itemInput.markup_percentage ?? 0;
    let margin = itemInput.margin_percentage ?? 0;
    let price = itemInput.price ?? 0;

    if (mode === 'markup') {
      price = calculatePriceFromMarkup(cost, markup);
      const metrics = getMetrics(cost, price);
      margin = metrics.margin;
    } else {
      price = calculatePriceFromMargin(cost, margin);
      const metrics = getMetrics(cost, price);
      markup = metrics.markup;
    }

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if ('id' in itemInput && itemInput.id) {
        const updatePayload: Database['public']['Tables']['items']['Update'] = {
          ...itemInput,
          price,
          markup_percentage: markup,
          margin_percentage: margin,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('items')
          .update(updatePayload)
          .eq('id', itemInput.id)
          .select()
          .single();
        if (!error && data) return data as Item;
      } else {
        const insertPayload: Database['public']['Tables']['items']['Insert'] = {
          ...itemInput,
          name: itemInput.name || 'Nuevo Ítem',
          type: itemInput.type || 'product',
          price,
          markup_percentage: markup,
          margin_percentage: margin,
        };
        const { data, error } = await supabase
          .from('items')
          .insert(insertPayload)
          .select()
          .single();
        if (!error && data) return data as Item;
      }
    }

    // LocalStorage fallback
    const items = getLocal<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    if ('id' in itemInput && itemInput.id) {
      const updatedList = items.map((it) =>
        it.id === itemInput.id
          ? {
              ...it,
              ...itemInput,
              price,
              markup_percentage: markup,
              margin_percentage: margin,
              updated_at: new Date().toISOString(),
            }
          : it
      );
      setLocal(STORAGE_KEYS.ITEMS, updatedList);
      return updatedList.find((it) => it.id === itemInput.id)!;
    } else {
      const newItem: Item = {
        id: `item-${Date.now()}`,
        category_id: itemInput.category_id || null,
        name: itemInput.name || 'Nuevo Ítem',
        description: itemInput.description || '',
        type: itemInput.type || 'product',
        cost,
        pricing_mode: mode,
        markup_percentage: markup,
        margin_percentage: margin,
        price,
        image_url: itemInput.image_url || '',
        duration_minutes: itemInput.duration_minutes || null,
        is_active: itemInput.is_active ?? true,
        sort_order: itemInput.sort_order ?? items.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocal(STORAGE_KEYS.ITEMS, [...items, newItem]);
      return newItem;
    }
  },

  async deleteItem(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from('items').delete().eq('id', id);
    }
    const items = getLocal<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    setLocal(
      STORAGE_KEYS.ITEMS,
      items.filter((it) => it.id !== id)
    );
  },

  // ---------------------------------------------------------------------------
  // COMBOS
  // ---------------------------------------------------------------------------
  async getCombos(): Promise<ComboWithItems[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('combos').select(`
        *,
        combo_items (
          quantity,
          item:items (*)
        )
      `);
      if (data) {
        const queryResults = data as unknown as ComboQueryResult[];
        return queryResults.map((c) => ({
          ...c,
          items: c.combo_items.map((ci) => ({
            item: ci.item,
            quantity: ci.quantity,
          })),
        }));
      }
    }
    return getLocal<ComboWithItems[]>(STORAGE_KEYS.COMBOS, INITIAL_COMBOS);
  },

  async saveCombo(combo: ComboWithItems): Promise<ComboWithItems> {
    const combos = getLocal<ComboWithItems[]>(STORAGE_KEYS.COMBOS, INITIAL_COMBOS);
    const existingIndex = combos.findIndex((c) => c.id === combo.id);
    let updatedCombos: ComboWithItems[];
    if (existingIndex >= 0) {
      updatedCombos = combos.map((c) => (c.id === combo.id ? combo : c));
    } else {
      updatedCombos = [...combos, { ...combo, id: combo.id || `combo-${Date.now()}` }];
    }
    setLocal(STORAGE_KEYS.COMBOS, updatedCombos);
    return combo;
  },

  async deleteCombo(id: string): Promise<void> {
    const combos = getLocal<ComboWithItems[]>(STORAGE_KEYS.COMBOS, INITIAL_COMBOS);
    setLocal(
      STORAGE_KEYS.COMBOS,
      combos.filter((c) => c.id !== id)
    );
  },

  // ---------------------------------------------------------------------------
  // AGENDA & HORARIOS
  // ---------------------------------------------------------------------------
  async getBusinessHours(): Promise<BusinessHours[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('business_hours').select('*').order('day_of_week', { ascending: true });
      if (data) return data as BusinessHours[];
    }
    return getLocal<BusinessHours[]>(STORAGE_KEYS.BUSINESS_HOURS, INITIAL_BUSINESS_HOURS);
  },

  async updateBusinessHours(hours: BusinessHours[]): Promise<void> {
    setLocal(STORAGE_KEYS.BUSINESS_HOURS, hours);
  },

  async getBlockedDates(): Promise<BlockedDate[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('blocked_dates').select('*').order('date', { ascending: true });
      if (data) return data as BlockedDate[];
    }
    return getLocal<BlockedDate[]>(STORAGE_KEYS.BLOCKED_DATES, INITIAL_BLOCKED_DATES);
  },

  async addBlockedDate(date: string, reason: string): Promise<BlockedDate> {
    const newBlocked: BlockedDate = {
      id: `bd-${Date.now()}`,
      date,
      reason,
      created_at: new Date().toISOString(),
    };
    const current = getLocal<BlockedDate[]>(STORAGE_KEYS.BLOCKED_DATES, INITIAL_BLOCKED_DATES);
    const updated = [...current.filter((d) => d.date !== date), newBlocked];
    setLocal(STORAGE_KEYS.BLOCKED_DATES, updated);
    return newBlocked;
  },

  async removeBlockedDate(id: string): Promise<void> {
    const current = getLocal<BlockedDate[]>(STORAGE_KEYS.BLOCKED_DATES, INITIAL_BLOCKED_DATES);
    setLocal(
      STORAGE_KEYS.BLOCKED_DATES,
      current.filter((d) => d.id !== id)
    );
  },

  // ---------------------------------------------------------------------------
  // APPOINTMENTS
  // ---------------------------------------------------------------------------
  async getAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true });
      if (data) return data as Appointment[];
    }
    return getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  },

  async createAppointment(appointment: AppointmentInsert): Promise<Appointment> {
    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      customer_name: appointment.customer_name,
      customer_phone: appointment.customer_phone,
      service_id: appointment.service_id ?? null,
      combo_id: appointment.combo_id ?? null,
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      status: appointment.status ?? 'pending',
      notes: appointment.notes ?? '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const insertPayload: Database['public']['Tables']['appointments']['Insert'] = {
        ...newAppointment,
      };
      const { data } = await supabase.from('appointments').insert(insertPayload).select().single();
      if (data) return data as Appointment;
    }

    const current = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    setLocal(STORAGE_KEYS.APPOINTMENTS, [...current, newAppointment]);
    return newAppointment;
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const updatePayload: Database['public']['Tables']['appointments']['Update'] = {
        status,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('appointments').update(updatePayload).eq('id', id);
    }
    const current = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    const updated = current.map((a) => (a.id === id ? { ...a, status, updated_at: new Date().toISOString() } : a));
    setLocal(STORAGE_KEYS.APPOINTMENTS, updated);
  },
};
