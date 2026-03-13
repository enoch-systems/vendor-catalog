export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  images?: string[];
  description?: string;
  features?: string[];
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
  badge?: string;
  category?: string;
}

export async function getAllProducts(): Promise<Product[]> {
  const baseUrl = typeof window !== 'undefined' 
    ? '' // Client-side: use relative URL
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` // Production: use Vercel URL
      : 'http://localhost:3000'; // Development: fallback to localhost
  
  const res = await fetch(`${baseUrl}/api/products`);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

// fetch a single product by id using the same API endpoint. the backend
// supports an optional ?id= query parameter which restricts the rows.
export async function getProductById(id: string): Promise<Product | null> {
  if (!id) {
    return null;
  }
  
  const baseUrl = typeof window !== 'undefined' 
    ? '' // Client-side: use relative URL
    : process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` // Production: use Vercel URL
      : 'http://localhost:3000'; // Development: fallback to localhost
  
  const res = await fetch(`${baseUrl}/api/products?id=${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  const data: Product[] = await res.json();
  return data.length > 0 ? data[0] : null;
}
