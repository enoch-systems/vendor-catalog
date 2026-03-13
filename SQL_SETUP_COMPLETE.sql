-- ==============================================================================
-- COMPREHENSIVE SQL SETUP FOR HAIR STORE DATABASE
-- ==============================================================================
-- Run all these commands in your Supabase SQL Editor
-- https://app.supabase.com/project/YOUR-PROJECT-ID/sql/new
-- ==============================================================================

-- ==============================================================================
-- 1. CREATE PRODUCTS TABLE (if not already created)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  original_price TEXT,
  rating NUMERIC,
  reviews INTEGER,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  badge TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. CREATE TRIGGER FOR PRODUCTS TABLE (auto-update updated_at)
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW EXECUTE FUNCTION update_products_updated_at();

-- ==============================================================================
-- 3. CREATE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'app-settings',
  app_name TEXT DEFAULT 'Hair Store',
  app_description TEXT DEFAULT 'Premium Hair Extensions & Accessories',
  store_email TEXT,
  store_phone TEXT,
  store_address TEXT,
  store_city TEXT,
  store_state TEXT,
  store_country TEXT,
  store_zip TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#b45309',
  secondary_color TEXT DEFAULT '#1a1a1a',
  accent_color TEXT DEFAULT '#d97706',
  tax_rate NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  currency TEXT DEFAULT '₦',
  business_hours TEXT,
  social_links JSONB DEFAULT '{}',
  contact_methods JSONB DEFAULT '{}',
  payment_methods JSONB DEFAULT '{}',
  terms_of_service TEXT,
  privacy_policy TEXT,
  return_policy TEXT,
  shipping_policy TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CREATE TRIGGER FOR SETTINGS TABLE (auto-update updated_at)
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
BEFORE UPDATE ON settings 
FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

-- ==============================================================================
-- 5. INSERT DEFAULT SETTINGS
-- ==============================================================================
INSERT INTO settings (id, app_name, app_description, currency, primary_color, secondary_color, accent_color)
VALUES ('app-settings', 'Hair Store', 'Premium Hair Extensions & Accessories', '₦', '#b45309', '#1a1a1a', '#d97706')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. CREATE ORDERS TABLE (for future order management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_country TEXT,
  shipping_zip TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total_price NUMERIC NOT NULL,
  tax NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. CREATE TRIGGER FOR ORDERS TABLE (auto-update updated_at)
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders 
FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();

-- ==============================================================================
-- 8. VERIFY DATA (Run these to check your tables)
-- ==============================================================================
-- Check products table
-- SELECT COUNT(*) as product_count FROM products;

-- Check settings table
-- SELECT * FROM settings WHERE id = 'app-settings';

-- ==============================================================================
-- NOTES FOR USER:
-- ==============================================================================
-- 1. Copy all the SQL code above
-- 2. Go to: https://app.supabase.com/project/YOUR-PROJECT-ID/sql/new
-- 3. Paste the entire code into the SQL editor
-- 4. Click "Run" button
-- 5. All tables will be created and configured automatically
-- 
-- IMPORTANT FEATURES:
-- - Images field supports multiple URLs (stored as array)
-- - Settings are stored with auto-update timestamp
-- - Orders table for future e-commerce functionality
-- - All tables have automatic timestamp management
-- ==============================================================================
