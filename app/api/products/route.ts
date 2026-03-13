import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Product } from '@/lib/products';

// don't create client at module load; build once per request so we can
// inspect the environment and avoid startup errors

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('building supabase client with url', url);
  if (!url || !key) {
    throw new Error('Supabase environment not configured');
  }
  return createClient(url, key);
}

// existing POST handler unchanged above
export async function POST(request: NextRequest) {
  const attemptedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  try {
    console.log('--- /api/products POST called ---');
    console.log('Supabase URL env:', process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL);
    console.log('Supabase service key present?', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    const body = await request.json();
    console.log('JSON body received', body);

    const {
      name,
      price,
      originalPrice = '',
      rating = 4.5,
      reviews = 0,
      description = '',
      features = [],
      colors = [],
      sizes = [],
      inStock = true,
      badge = '',
      category = '',
      image = '',
      images = [],
    } = body as Partial<Product> & { name?: string; price?: string };

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    if (!image || image.trim() === '') {
      return NextResponse.json({ error: 'Main product image is required' }, { status: 400 });
    }

    if (!description || description.trim() === '') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    // build product object for logging/response
    const product: Product = {
      id: Date.now().toString(),
      name,
      price,
      originalPrice,
      rating,
      reviews,
      image,
      images,
      description,
      features,
      colors,
      sizes,
      inStock,
      badge,
      category,
    };

    // convert to snake_case for the database
    const dbRow = {
      id: product.id,
      name: product.name,
      price: product.price,
      original_price: product.originalPrice,
      rating: product.rating,
      reviews: product.reviews,
      image: product.image,
      images: product.images,
      description: product.description,
      features: product.features,
      colors: product.colors,
      sizes: product.sizes,
      in_stock: product.inStock,
      badge: product.badge,
      category: product.category,
    };

    console.log('Inserting product into Supabase...');
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('products').insert([dbRow]);
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Product created successfully');
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Product creation error:', error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (error && typeof (error as any).message === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error('Error message:', (error as any).message);
    }
    return NextResponse.json({ 
      error: 'Failed to add product',
      details: error instanceof Error ? `${error.message} (url=${attemptedUrl})` : JSON.stringify(error)
    }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// Add GET handler for fetching all products (and maybe others in future)
// -----------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    console.log('--- /api/products GET called ---');
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    const supabase = getSupabaseClient();
    let query = supabase.from('products').select('*');

    if (id) {
      query = query.eq('id', id);
    } else {
      // Sort by ID descending to show newly added products first
      query = query.order('id', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase select error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // map the snake_case column names coming from Postgres into our
    // camelCase Product type so clients don't need to know about the
    // database naming convention.
    const rows: any[] = data || [];
    const camel = rows.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      originalPrice: r.original_price,
      rating: r.rating,
      reviews: r.reviews,
      image: r.image,
      images: r.images,
      description: r.description,
      features: r.features,
      colors: r.colors,
      sizes: r.sizes,
      inStock: r.in_stock,
      badge: r.badge,
      category: r.category,
    }));
    return NextResponse.json(camel);
  } catch (err) {
    console.error('Fetching products failed:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// PUT handler for updating an existing product
// -----------------------------------------------------------------------------
export async function PUT(request: NextRequest) {
  try {
    console.log('--- /api/products PUT called ---');
    const body = await request.json();
    console.log('Update request body:', body);
    
    const { id, ...updateData } = body as Partial<Product> & { id?: string };

    if (!id) {
      return NextResponse.json({ error: 'Product id required' }, { status: 400 });
    }

    // Build the database row with snake_case column names
    // Only include fields that are present in the request
    const dbRow: Record<string, any> = {};
    
    if (updateData.name !== undefined) dbRow.name = updateData.name;
    if (updateData.price !== undefined) dbRow.price = updateData.price;
    if (updateData.originalPrice !== undefined) dbRow.original_price = updateData.originalPrice;
    if (updateData.rating !== undefined) dbRow.rating = updateData.rating;
    if (updateData.reviews !== undefined) dbRow.reviews = updateData.reviews;
    if (updateData.image !== undefined) {
      if (updateData.image.trim() === '') {
        return NextResponse.json({ error: 'Main product image cannot be empty' }, { status: 400 });
      }
      dbRow.image = updateData.image;
    }
    if (updateData.images !== undefined) dbRow.images = updateData.images;
    if (updateData.description !== undefined) {
      if (updateData.description.trim() === '') {
        return NextResponse.json({ error: 'Description cannot be empty' }, { status: 400 });
      }
      dbRow.description = updateData.description;
    }
    if (updateData.features !== undefined) dbRow.features = updateData.features;
    if (updateData.colors !== undefined) dbRow.colors = updateData.colors;
    if (updateData.sizes !== undefined) dbRow.sizes = updateData.sizes;
    if (updateData.inStock !== undefined) dbRow.in_stock = updateData.inStock;
    if (updateData.badge !== undefined) dbRow.badge = updateData.badge;
    if (updateData.category !== undefined) dbRow.category = updateData.category;

    console.log('Database row to update:', dbRow);

    const supabase = getSupabaseClient();
    const { error, data } = await supabase.from('products').update(dbRow).eq('id', id).select();
    
    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: `Update failed: ${error.message}` }, { status: 500 });
    }

    console.log('Product updated successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Product update error:', err);
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: err instanceof Error ? err.message : JSON.stringify(err)
    }, { status: 500 });
  }
}

// -----------------------------------------------------------------------------
// DELETE handler for removing a product
// -----------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body as { id?: string };

    if (!id) {
      return NextResponse.json({ error: 'Product id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Product delete error:', err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
