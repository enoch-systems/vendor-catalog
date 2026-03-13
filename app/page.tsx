import HeroSection from '@/components/hero-section';
import { getAllProducts, Product } from '@/lib/products';

export default async function Home() {
  // fetch once on the server so clients render immediately
  let featured: Product[] = []
  try {
    const products = await getAllProducts()
    // Get ALL badged products (up to 4) first, then fill remaining slots with newest non-badged
    const badgedProducts = products.filter(p => p.badge).slice(0, 4)
    const remainingSlots = 8 - badgedProducts.length
    const nonBadgedProducts = products.filter(p => !p.badge).slice(-remainingSlots)
    featured = [...badgedProducts, ...nonBadgedProducts]
  } catch (err) {
    console.error('Error loading products for home page', err)
  }

  return <HeroSection initialFeatured={featured} />;
}
