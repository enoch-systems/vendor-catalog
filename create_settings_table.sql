-- Create Settings Table for storing application configuration
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'app-settings',
  app_name TEXT,
  app_description TEXT,
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

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at 
BEFORE UPDATE ON settings 
FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings
INSERT INTO settings (id, app_name, app_description, currency)
VALUES ('app-settings', 'Hair Store', 'Premium Hair Extensions & Accessories', '₦')
ON CONFLICT (id) DO NOTHING;
