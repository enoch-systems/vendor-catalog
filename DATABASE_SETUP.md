# Database Setup Instructions

## Step 1: Copy the SQL Code

1. Open `SQL_SETUP_COMPLETE.sql` in your text editor
2. Select all the SQL code (Ctrl+A)
3. Copy it (Ctrl+C)

## Step 2: Run in Supabase

1. Go to your Supabase project: https://app.supabase.com
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"** button
4. Paste all the SQL code into the editor
5. Click the **"Run"** button (▶️ icon)

## Step 3: Verify Everything Works

Run these commands individually in the SQL Editor to verify:

```sql
-- Check products table exists
SELECT COUNT(*) as product_count FROM products;

-- Check settings table exists
SELECT * FROM settings WHERE id = 'app-settings';

-- Check orders table exists
SELECT COUNT(*) as order_count FROM orders;
```

## Understanding the Setup

### Products Table
- **id**: Unique product identifier
- **name**: Product name
- **price**: Current selling price
- **original_price**: Original/list price (for discounts)
- **images**: Array of image URLs - **Images are now stored here!**
- **colors**: Array of available colors
- **sizes**: Array of available lengths (8" to 30")
- **features**: Product features
- **in_stock**: Availability status
- **created_at/updated_at**: Automatic timestamps

### Settings Table
- **id**: Always "app-settings" (single record)
- **app_name**: Your store name
- **app_description**: Store description
- **store_email**: Contact email
- **store_phone**: Contact phone
- **logo_url**: Store logo (saved to database)
- **favicon_url**: Browser favicon (saved to database)
- **primary_color**: Primary brand color
- **social_links**: Social media links (JSON)
- **payment_methods**: Payment options available
- **terms_of_service, privacy_policy**: Legal documents
- **created_at/updated_at**: Automatic timestamps

### Orders Table (for future)
- Stores customer orders
- Tracks order status (pending, completed, shipped, etc.)
- Stores items ordered with quantities and prices
- Maintains shipping and billing information

## How Images Are Saved

When you upload images in the admin panel:
1. Images are sent to Cloudinary and get URLs
2. The image URLs are stored in the `images` array in the `products` table
3. When a product is updated, all images are saved to the database
4. The first image is saved in the `image` field as the thumbnail

## How Settings Are Saved

When you update settings:
1. Data is sent to `/api/settings` endpoint
2. The settings table is updated with new values
3. The `updated_at` timestamp is automatically set
4. Settings are retrieved when your app loads

## Testing the API

### Get Settings
```bash
curl https://yourapp.com/api/settings
```

### Update Settings
```bash
curl -X PUT https://yourapp.com/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "Premium Hair Store",
    "store_email": "contact@hairstore.com",
    "currency": "₦"
  }'
```

### Get Products
```bash
curl https://yourapp.com/api/products
```

### Update Product (Images Included)
```bash
curl -X PUT https://yourapp.com/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "id": "product-id",
    "name": "Hair Extension",
    "images": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ]
  }'
```

## Troubleshooting

### Images not saving
- Check that the `images` column exists in products table
- Verify images are being passed in the API request
- Check Supabase logs for any errors

### Settings not saving
- Ensure settings table exists
- Make sure you're using id='app-settings' 
- Check that JSONB fields are properly formatted

### Permission errors
- Make sure you're using the Service Role Key in your `.env.local`
- Do NOT use the anon key for admin operations

## What's Next?

1. Run the SQL setup
2. Update products with images in the admin panel
3. Images will automatically save to the database
4. Update settings and they'll be saved to the database
5. Build your settings panel UI to modify content

