import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface Settings {
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

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment not configured');
  }
  return createClient(url, key);
}

// GET settings
export async function GET() {
  try {
    console.log('--- /api/settings GET called ---');
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'app-settings')
      .single();

    if (error) {
      console.error('Supabase select error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Fetching settings failed:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    console.log('--- /api/settings PUT called ---');
    const body = await request.json() as Partial<Settings>;

    const supabase = getSupabaseClient();
    
    const updateData = {
      app_name: body.app_name,
      app_description: body.app_description,
      store_email: body.store_email,
      store_phone: body.store_phone,
      store_address: body.store_address,
      store_city: body.store_city,
      store_state: body.store_state,
      store_country: body.store_country,
      store_zip: body.store_zip,
      logo_url: body.logo_url,
      favicon_url: body.favicon_url,
      primary_color: body.primary_color,
      secondary_color: body.secondary_color,
      accent_color: body.accent_color,
      tax_rate: body.tax_rate,
      shipping_cost: body.shipping_cost,
      currency: body.currency,
      business_hours: body.business_hours,
      social_links: body.social_links,
      contact_methods: body.contact_methods,
      payment_methods: body.payment_methods,
      terms_of_service: body.terms_of_service,
      privacy_policy: body.privacy_policy,
      return_policy: body.return_policy,
      shipping_policy: body.shipping_policy,
      meta_description: body.meta_description,
      meta_keywords: body.meta_keywords,
    };

    const { error, data } = await supabase
      .from('settings')
      .update(updateData)
      .eq('id', 'app-settings')
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Settings updated successfully');
    return NextResponse.json({ success: true, data: data?.[0] });
  } catch (err) {
    console.error('Settings update error:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
