export interface Settings {
  id: string;
  app_name?: string;
  app_description?: string;
  store_email?: string;
  store_phone?: string;
  store_address?: string;
  store_city?: string;
  store_state?: string;
  store_country?: string;
  store_zip?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  tax_rate?: number;
  shipping_cost?: number;
  currency?: string;
  business_hours?: string;
  social_links?: Record<string, string>;
  contact_methods?: Record<string, string>;
  payment_methods?: Record<string, string>;
  terms_of_service?: string;
  privacy_policy?: string;
  return_policy?: string;
  shipping_policy?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export async function getSettings(): Promise<Settings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) {
      throw new Error('Failed to fetch settings');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings if fetch fails
    return {
      id: 'app-settings',
      app_name: 'Hair Store',
      app_description: 'Premium Hair Extensions & Accessories',
      currency: '₦',
      primary_color: '#b45309',
      secondary_color: '#1a1a1a',
      accent_color: '#d97706'
    };
  }
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    
    if (!res.ok) {
      throw new Error('Failed to update settings');
    }
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}
