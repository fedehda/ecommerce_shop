-- ==============================================================================
-- SCHEMA: Plataforma Web de Catálogo, Turnos y Gestión Admin
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT 'tag',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. ITEMS (Productos y Servicios)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('product', 'service')),
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pricing_mode TEXT NOT NULL DEFAULT 'markup' CHECK (pricing_mode IN ('markup', 'margin')),
    markup_percentage NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    margin_percentage NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT DEFAULT '',
    duration_minutes INT DEFAULT NULL, -- Relevante para servicios
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_is_active ON items(is_active);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);

-- ------------------------------------------------------------------------------
-- 3. COMBOS (Paquetes con Descuento)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS combos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    final_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS combo_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(combo_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_combo_items_combo_id ON combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_item_id ON combo_items(item_id);

-- ------------------------------------------------------------------------------
-- 4. BUSINESS HOURS & BLOCKED DATES (Agenda)
-- ------------------------------------------------------------------------------
-- day_of_week: 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6) UNIQUE,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    open_time TIME NOT NULL DEFAULT '09:00',
    close_time TIME NOT NULL DEFAULT '18:00',
    slot_duration_minutes INT NOT NULL DEFAULT 30 CHECK (slot_duration_minutes > 0)
);

CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    reason TEXT DEFAULT 'Cerrado / Feriado',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date);

-- ------------------------------------------------------------------------------
-- 5. APPOINTMENTS (Turnos Reservados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_id UUID REFERENCES items(id) ON DELETE SET NULL,
    combo_id UUID REFERENCES combos(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ------------------------------------------------------------------------------
-- 6. APP SETTINGS (Configuración General del Negocio)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL DEFAULT 'Mi Negocio',
    whatsapp_phone TEXT NOT NULL DEFAULT '5491100000000',
    currency_symbol TEXT NOT NULL DEFAULT '$',
    address TEXT DEFAULT '',
    instagram_url TEXT DEFAULT '',
    business_description TEXT DEFAULT 'Venta de productos, servicios y reservas en línea',
    theme_palette TEXT DEFAULT 'emerald',
    theme_mode TEXT DEFAULT 'light',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: Lectura pública; Escritura autenticada (Admin)
CREATE POLICY "Public read categories" ON categories
    FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Admin write categories" ON categories
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ITEMS: Lectura anónima solo ítems activos; Administradores acceso total
CREATE POLICY "Public read active items" ON items
    FOR SELECT TO anon USING (is_active = TRUE);

CREATE POLICY "Admin full access items" ON items
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- COMBOS & COMBO_ITEMS:
CREATE POLICY "Public read active combos" ON combos
    FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY "Admin full access combos" ON combos
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Public read combo_items
CREATE POLICY "Public read combo_items" ON combo_items
    FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Admin full access combo_items" ON combo_items
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- BUSINESS_HOURS & BLOCKED_DATES: Lectura pública para disponibilidad
CREATE POLICY "Public read business_hours" ON business_hours
    FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Admin write business_hours" ON business_hours
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Public read blocked_dates" ON blocked_dates
    FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Admin write blocked_dates" ON blocked_dates
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- APPOINTMENTS:
-- Clientes anónimos pueden solicitar un turno
CREATE POLICY "Public create appointment" ON appointments
    FOR INSERT TO anon WITH CHECK (TRUE);

-- Admin puede ver, actualizar y gestionar todos los turnos
CREATE POLICY "Admin full access appointments" ON appointments
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- APP SETTINGS:
CREATE POLICY "Public read app_settings" ON app_settings
    FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Admin write app_settings" ON app_settings
    FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ------------------------------------------------------------------------------
-- 8. VISTAS SEGURAS (Protección de Costo y Márgenes)
-- ------------------------------------------------------------------------------
-- Vista pública de catálogo que descarta intencionalmente columnas de rentabilidad
CREATE OR REPLACE VIEW public_catalog_items AS
SELECT 
    id,
    category_id,
    name,
    description,
    type,
    price,
    image_url,
    duration_minutes,
    is_active,
    sort_order
FROM items
WHERE is_active = TRUE;

-- Revocación de permisos de columnas sensibles sobre la tabla items para anon
REVOKE SELECT (cost, markup_percentage, margin_percentage) ON items FROM anon;

-- Otorgar permisos de lectura en la vista pública
GRANT SELECT ON public_catalog_items TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 9. SEED DATA INICIAL
-- ------------------------------------------------------------------------------
-- App Settings
INSERT INTO app_settings (id, business_name, whatsapp_phone, currency_symbol, address, business_description)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Studio & Barbería Style',
    '5491123456789',
    '$',
    'Av. Corrientes 1234, CABA',
    'Especialistas en barbería clásica, corte y cuidado capilar.'
) ON CONFLICT (id) DO NOTHING;

-- Business Hours (Lunes a Sábado abiertos, Domingo cerrado)
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time, slot_duration_minutes)
VALUES
    (0, FALSE, '10:00', '18:00', 30), -- Domingo cerrado
    (1, TRUE,  '09:00', '19:00', 30), -- Lunes
    (2, TRUE,  '09:00', '19:00', 30), -- Martes
    (3, TRUE,  '09:00', '19:00', 30), -- Miércoles
    (4, TRUE,  '09:00', '19:00', 30), -- Jueves
    (5, TRUE,  '09:00', '20:00', 30), -- Viernes
    (6, TRUE,  '09:00', '20:00', 30)  -- Sábado
ON CONFLICT (day_of_week) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, slug, icon, sort_order)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Cortes y Peinados', 'cortes', 'scissors', 1),
    ('c0000000-0000-0000-0000-000000000002', 'Tratamientos y Barba', 'barba-tratamientos', 'sparkles', 2),
    ('c0000000-0000-0000-0000-000000000003', 'Productos de Cuidado', 'productos', 'shopping-bag', 3)
ON CONFLICT (slug) DO NOTHING;

-- Items (Servicios y Productos)
INSERT INTO items (id, category_id, name, description, type, cost, pricing_mode, markup_percentage, margin_percentage, price, duration_minutes, is_active, sort_order)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Corte de Cabello Clásico', 'Corte personalizado con tijera y navaja, lavado y perfilado.', 'service', 3000.00, 'markup', 150.00, 60.00, 7500.00, 45, TRUE, 1),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Arreglo y Perfilado de Barba', 'Toalla caliente, aceites esenciales, afeitado a navaja y bálsamo.', 'service', 2000.00, 'margin', 150.00, 60.00, 5000.00, 30, TRUE, 2),
    ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Tratamiento Capilar Fortalecedor', 'Exfoliación de cuero cabelludo, ampolla nutritiva y masaje.', 'service', 4000.00, 'markup', 125.00, 55.56, 9000.00, 45, TRUE, 3),
    ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Pomada Modeladora Mate 100g', 'Fijación fuerte y acabado mate al agua de fácil remoción.', 'product', 4500.00, 'margin', 100.00, 50.00, 9000.00, NULL, TRUE, 4),
    ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Aceite Hidratante para Barba 30ml', 'Mezcla de argán, jojoba y cedro para máxima suavidad.', 'product', 3200.00, 'markup', 100.00, 50.00, 6400.00, NULL, TRUE, 5)
ON CONFLICT (id) DO NOTHING;

-- Combos
INSERT INTO combos (id, name, description, discount_type, discount_value, final_price, is_active, sort_order)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'Combo Total: Corte + Barba', 'Corte completo clásico más diseño y perfilado de barba con toalla caliente.', 'percentage', 15.00, 10625.00, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO combo_items (combo_id, item_id, quantity)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1),
    ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 1)
ON CONFLICT DO NOTHING;
