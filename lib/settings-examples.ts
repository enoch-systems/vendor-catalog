// Example: How to Update Settings in Your Application

import { updateSettings } from '@/lib/settings';

// Example 1: Update basic store information
export const updateStoreInfo = async () => {
  await updateSettings({
    app_name: 'My Hair Store',
    app_description: 'Premium Quality Hair Extensions',
    store_email: 'contact@example.com',
    store_phone: '+234 (0) 123 456 7890',
    store_address: '123 Main Street',
    store_city: 'Lagos',
    store_state: 'Lagos State',
    store_country: 'Nigeria',
    store_zip: '100001',
    currency: '₦'
  });
};

// Example 2: Update branding colors
export const updateBrandColors = async () => {
  await updateSettings({
    primary_color: '#b45309',
    secondary_color: '#1a1a1a',
    accent_color: '#d97706'
  });
};

// Example 3: Update logo and favicon
export const updateLogos = async () => {
  await updateSettings({
    logo_url: 'https://cloudinary.com/your-logo.png',
    favicon_url: 'https://cloudinary.com/your-favicon.ico'
  });
};

// Example 4: Update social links
export const updateSocialLinks = async () => {
  await updateSettings({
    social_links: {
      facebook: 'https://facebook.com/yourstorepage',
      instagram: 'https://instagram.com/yourprofile',
      twitter: 'https://twitter.com/yourprofile',
      tiktok: 'https://tiktok.com/@yourprofile'
    }
  });
};

// Example 5: Update payment methods
export const updatePaymentMethods = async () => {
  await updateSettings({
    payment_methods: {
      stripe: 'enabled',
      paypal: 'enabled',
      bank_transfer: 'enabled',
      card: 'enabled',
      mobile_money: 'enabled'
    }
  });
};

// Example 6: Update policies
export const updatePolicies = async () => {
  await updateSettings({
    terms_of_service: 'Your terms of service text here...',
    privacy_policy: 'Your privacy policy text here...',
    return_policy: 'Your return policy text here...',
    shipping_policy: 'Your shipping policy text here...'
  });
};

// Example 7: Update business hours
export const updateBusinessHours = async () => {
  await updateSettings({
    business_hours: JSON.stringify({
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 3:00 PM',
      sunday: 'Closed'
    })
  });
};

// Example 8: Update SEO meta tags
export const updateSEOSettings = async () => {
  await updateSettings({
    meta_description: 'Premium hair extensions. Shop high-quality, affordable hair products online.',
    meta_keywords: 'hair extensions, wigs, quality hair'
  });
};

// Example 9: Update shipping and tax
export const updateShippingAndTax = async () => {
  await updateSettings({
    shipping_cost: 5000, // ₦5,000
    tax_rate: 0.075 // 7.5%
  });
};

// Example 10: Complete settings update
export const updateAllSettings = async () => {
  await updateSettings({
    app_name: 'My Hair Store',
    app_description: 'Premium Quality Hair Extensions',
    store_email: 'contact@example.com',
    store_phone: '+234 (0) 123 456 7890',
    store_address: '123 Main Street',
    store_city: 'Lagos',
    store_state: 'Lagos State',
    store_country: 'Nigeria',
    store_zip: '100001',
    logo_url: 'https://cloudinary.com/your-logo.png',
    favicon_url: 'https://cloudinary.com/your-favicon.ico',
    primary_color: '#b45309',
    secondary_color: '#1a1a1a',
    accent_color: '#d97706',
    tax_rate: 0.075,
    shipping_cost: 5000,
    currency: '₦',
    business_hours: JSON.stringify({
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 3:00 PM',
      sunday: 'Closed'
    }),
    social_links: {
      facebook: 'https://facebook.com/yourstorepage',
      instagram: 'https://instagram.com/yourprofile',
      twitter: 'https://twitter.com/yourprofile',
      whatsapp: '+234 (0) 123 456 7890'
    },
    payment_methods: {
      stripe: 'enabled',
      paypal: 'enabled',
      bank_transfer: 'enabled',
      card: 'enabled',
      mobile_money: 'enabled'
    },
    terms_of_service: 'Your terms of service text here...',
    privacy_policy: 'Your privacy policy text here...',
    return_policy: 'Your return policy text here...',
    shipping_policy: 'Your shipping policy text here...',
    meta_description: 'Premium hair extensions. Shop high-quality, affordable hair products online.',
    meta_keywords: 'hair extensions, wigs, quality hair'
  });
};
