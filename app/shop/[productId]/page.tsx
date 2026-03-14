'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Minus, Plus, Loader2, Circle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroHeader } from '@/components/header'
import Footer from '@/components/footer'
import { useCart } from '@/components/cart-context'
import { getProductById, Product, getAllProducts } from '@/lib/products'

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`size-3 ${
                        star <= Math.floor(rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                    }`}
                />
            ))}
            <span className="text-xs text-gray-600 ml-1">({rating})</span>
        </div>
    )
}

const getColorHex = (colorName: string): string => {
    const colorMap: { [key: string]: string } = {
        'Black': '#1a1a1a',
        'Brown': '#6d4c41',
        'Dark Red': '#8B0000',
        'Blonde': '#F4D03F',
        'Natural Black': '#1a1a1a',
        'Dark Brown': '#3e2723',
        'Chestnut Brown': '#6d4c41',
        'Jet Black': '#000000',
        'Off Black': '#2d2d2d',
        'Charcoal': '#36454f',
        'Platinum Blonde': '#f8f8ff',
        'Icy Blonde': '#e6f3ff',
        'Diamond Blonde': '#fafafa',
        'Honey Blonde': '#e6b800',
        'Auburn Red': '#a52a2a',
        'Burgundy Red': '#800020',
        'Copper Red': '#b87333',
        'Strawberry Red': '#ff6347',
        'Honey Brown': '#8b4513',
        'Caramel Brown': '#cd853f',
        'Chocolate Brown': '#3b2f2f',
        'Medium Brown': '#5c4033',
        'Light Brown': '#bc9a6a',
        'Rich Brown': '#654321',
        'Espresso Brown': '#2f1b14',
        'Ash Blonde': '#e0e0e0',
        'Strawberry Blonde': '#ffc0cb',
        'Pearl Blonde': '#f8f6f0',
        'Classic Auburn': '#8b4513',
        'Copper Auburn': '#b87333',
        'Burgundy Auburn': '#800020',
        'Strawberry Auburn': '#ff6347',
        'Velvet Red': '#8b0000',
        'Wine Red': '#722f37',
        'Cherry Red': '#de3163'
    }
    return colorMap[colorName] || '#cccccc'
}

export default function DynamicProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const { addToCart } = useCart()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedColor, setSelectedColor] = useState('Black')
    const [selectedSize, setSelectedSize] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [customColor, setCustomColor] = useState('')
    const [isCustomColorDropdownOpen, setIsCustomColorDropdownOpen] = useState(false)
    const [mainDisplayImage, setMainDisplayImage] = useState(product?.image || product?.images?.[0] || '')

    const resolvedParams = React.use(params)

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true)
                setError(null)
                const productId = resolvedParams.productId
                const productData = await getProductById(productId)
                if (!productData) {
                    throw new Error('Product not found')
                }
                setProduct(productData)
                setSelectedImage(0) // Reset to first image when product loads
                setMainDisplayImage(productData.image || productData.images?.[0] || '')
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load product')
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [resolvedParams.productId])

    useEffect(() => {
        const loadRelatedProducts = async () => {
            try {
                const allProducts = await getAllProducts()
                const filtered = allProducts.filter(p => p.id !== product?.id)
                const shuffled = [...filtered].sort(() => 0.5 - Math.random())
                const random = shuffled.slice(0, 4)
                setRelatedProducts(random)
            } catch (err) {
                console.error('Failed to load related products:', err)
            }
        }

        if (product) {
            if (product.sizes && product.sizes.length > 0) {
                setSelectedSize(product.sizes[0])
            }
            loadRelatedProducts()
        }
    }, [product])

    useEffect(() => {
        const handleStorageChange = async () => {
            try {
                const productId = resolvedParams.productId
                const productData = await getProductById(productId)
                if (productData) {
                    setProduct(productData)
                    setMainDisplayImage(productData.image || productData.images?.[0] || '')
                }
            } catch (err) {
                console.error('Failed to reload product:', err)
            }
        }

        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === 'productsUpdated') {
                handleStorageChange()
            }
        }

        const handleProductsChanged = () => {
            handleStorageChange()
        }

        window.addEventListener('storage', handleStorageEvent)
        window.addEventListener('productsChanged', handleProductsChanged)
        return () => {
            window.removeEventListener('storage', handleStorageEvent)
            window.removeEventListener('productsChanged', handleProductsChanged)
        }
    }, [resolvedParams.productId])

    const handleAddToCart = () => {
        if (!product) return
        if (!selectedSize) {
            alert('Please select size')
            return
        }

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || '',
            image: product.images?.[0] || '',
            badge: product.badge
        })
        
        setAddedToCart(prev => new Set([...prev, product.id]))
        
        setTimeout(() => {
            setAddedToCart(prev => {
                const newSet = new Set(prev)
                newSet.delete(product.id)
                return newSet
            })
        }, 1000)
    }

    if (loading) {
        return (
            <>
                <HeroHeader />
                <main className="overflow-hidden">
                    <section className="py-8 mt-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                        <div className="max-w-7xl mx-auto">
                            <Link href="/shop" className="mb-6 inline-block">
                                <Button className="flex items-center gap-2 bg-transparent border border-gray-400 text-gray-700 hover:bg-gray-50 mb-7">
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Shopping
                                </Button>
                            </Link>
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-900" />
                                    <p className="text-gray-600">Loading product...</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </>
        )
    }

    if (error || !product) {
        return (
            <>
                <HeroHeader />
                <main className="overflow-hidden">
                    <section className="py-8 mt-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                        <div className="max-w-7xl mx-auto">
                            <Link href="/shop" className="mb-6 inline-block">
                                <Button className="flex items-center gap-2 bg-transparent border border-gray-400 text-gray-700 hover:bg-gray-50 mb-7">
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Shopping
                                </Button>
                            </Link>
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <div className="text-red-500 mb-4">Error loading product</div>
                                    <p className="text-gray-600 mb-4">{error}</p>
                                    <Link href="/shop">
                                        <Button className="bg-amber-900 text-white hover:bg-amber-800">
                                            Back to Shop
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </>
        )
    }

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="py-6 sm:py-8 lg:py-12 mt-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6 sm:mb-8">
                            <Link href="/shop">
                                <Button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-all duration-200">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Back to Shopping</span>
                                    <span className="sm:hidden">Back</span>
                                </Button>
                            </Link>
                        </div>
                        <div className="bg-gray-100 rounded-2xl shadow-xl border border-gray-100 p-0">
                                {/* Image Gallery */}
                                <div className="mb-8">
                                    <div className="space-y-4">
                                        {/* Main Image */}
                                        <div className="w-full h-[32rem] bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                            {mainDisplayImage ? (
                                                <img
                                                    src={mainDisplayImage}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={() => setMainDisplayImage('')}
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="mx-auto text-gray-400" size={48} />
                                                    <p className="text-gray-500 mt-2">No image available</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Thumbnails Below Main Image */}
                                        <div className="flex gap-2 justify-center">
                                            {/* Only show main image thumbnail if it exists */}
                                            {product.image || product.images?.[0] ? (
                                                <div className="relative flex-shrink-0">
                                                    <div 
                                                        className={`w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                                                            mainDisplayImage === (product.image || product.images?.[0] || '')
                                                                ? 'border-2 border-amber-600 border-solid' 
                                                                : 'border-2 border-dashed border-gray-300 hover:border-gray-400'
                                                        }`}
                                                        onClick={() => setMainDisplayImage(product.image || product.images?.[0] || '')}
                                                    >
                                                        <img
                                                            src={product.image || product.images?.[0]}
                                                            alt="Main thumbnail"
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Only show additional thumbnails if they exist and have images */}
                                            {(product.images || []).slice(1, 4).filter(image => image).map((image, index) => (
                                                <div key={index} className="relative flex-shrink-0">
                                                    <div 
                                                        className={`w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                                                            mainDisplayImage === image
                                                                ? 'border-2 border-amber-600 border-solid' 
                                                                : 'border-2 border-dashed border-gray-300 hover:border-gray-400'
                                                        }`}
                                                        onClick={() => setMainDisplayImage(image)}
                                                    >
                                                        <img
                                                            src={image}
                                                            alt={`Product thumbnail ${index + 2}`}
                                                            className="w-full h-full object-cover rounded-lg"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        {product.inStock ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-sm"></div>
                                                <span className="text-sm sm:text-base text-green-600 font-semibold">In Stock</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-sm"></div>
                                                <span className="text-sm sm:text-base text-red-600 font-semibold">Out of Stock</span>
                                            </div>
                                        )}
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700">{product.price}</span>
                                            {product.originalPrice && (
                                                <span className="text-sm sm:text-base lg:text-lg text-gray-400 line-through">{product.originalPrice}</span>
                                            )}
                                        </div>
                                        <div className="py-2">
                                            <StarRating rating={product.rating || 0} />
                                        </div>
                                    </div>

                                    {/* Enhanced Product Details Section */}
                                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                                        {/* Product Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4 border-b border-gray-100">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Product Details</h3>
                                                {product.category && (
                                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200 self-start">
                                                        {product.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Product Description */}
                                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                            <div className="prose prose-gray max-w-none">
                                                <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
                                                    {product.description}
                                                </p>
                                            </div>
                                            
                                            {/* Product Features */}
                                            {product.features && product.features.length > 0 && (
                                                <div className="border-t border-gray-100 pt-4">
                                                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                                                        Key Features
                                                    </h4>
                                                    <ul className="grid grid-cols-1 gap-2">
                                                        {product.features.map((feature, index) => (
                                                            <li key={index} className="flex items-start">
                                                                <span className="text-amber-600 mr-2 mt-0.5 flex-shrink-0">
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                    </svg>
                                                                </span>
                                                                <span className="text-gray-600 text-sm leading-relaxed">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {/* Product Specifications */}
                                            <div className="border-t border-gray-100 pt-4">
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                                    <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
                                                    Specifications
                                                </h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                        <span className="text-xs sm:text-sm font-medium text-gray-500">Product ID</span>
                                                        <span className="text-xs sm:text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">{product.id}</span>
                                                    </div>
                                                    {product.colors && product.colors.length > 0 && (
                                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                            <span className="text-xs sm:text-sm font-medium text-gray-500">Available Colors</span>
                                                            <span className="text-xs sm:text-sm text-gray-900">{product.colors.length} options</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Color</h3>
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-3">
                                                {(product.colors || []).map((color: string) => (
                                                    <button
                                                        key={color}
                                                        onClick={() => {
                                                            setSelectedColor(color)
                                                            setCustomColor('')
                                                            setIsCustomColorDropdownOpen(false)
                                                        }}
                                                        className={`w-12 h-12 rounded-full border-2 transition-all duration-200 shadow-sm ${
                                                            selectedColor === color && customColor === ''
                                                                ? 'border-amber-600 ring-2 ring-amber-600 ring-offset-2 shadow-md'
                                                                : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                                                        }`}
                                                        title={color}
                                                        style={{
                                                            backgroundColor: getColorHex(color)
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCustomColorDropdownOpen(!isCustomColorDropdownOpen)}
                                                    className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                                                >
                                                    Color not listed? Request custom color
                                                </button>
                                                {isCustomColorDropdownOpen && (
                                                    <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                                                        <div className="flex gap-3">
                                                            <input
                                                                type="text"
                                                                value={customColor}
                                                                onChange={(e) => {
                                                                    setCustomColor(e.target.value)
                                                                    if (e.target.value) {
                                                                        setSelectedColor(e.target.value)
                                                                    }
                                                                }}
                                                                placeholder="Type your color..."
                                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent text-sm"
                                                                autoFocus
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCustomColor('')
                                                                    setSelectedColor('Black')
                                                                    setIsCustomColorDropdownOpen(false)
                                                                }}
                                                                className="px-4 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                Reset
                                                            </button>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-500">
                                                            {customColor && `Selected: ${customColor}`}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <label className="text-lg font-bold text-gray-900 block mb-4">Select Length</label>
                                        <div className="flex flex-wrap gap-3">
                                            {product.sizes && product.sizes.length > 0 ? (
                                                product.sizes.map((length: string) => (
                                                    <button
                                                        key={length}
                                                        onClick={() => setSelectedSize(length)}
                                                        className={`px-5 py-3 rounded-xl border-2 transition-all font-semibold text-sm sm:text-base ${
                                                            selectedSize === length
                                                                ? 'text-amber-700 border-amber-600 bg-amber-50 shadow-md'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:border-amber-600 hover:bg-amber-50'
                                                        }`}
                                                    >
                                                        {length}
                                                    </button>
                                                ))
                                            ) : (
                                                <span className="text-gray-500 italic">No lengths available</span>
                                            )}
                                        </div>
                                        {selectedSize && (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                                <p className="text-sm text-amber-800 font-medium">✓ Selected Length: <strong>{selectedSize}</strong></p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!product.inStock}
                                        className={`w-full py-4 px-8 rounded-xl font-bold text-white transition-all duration-200 text-lg shadow-lg hover:shadow-xl ${
                                            addedToCart.has(product.id)
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : product.inStock
                                                ? 'bg-amber-900 hover:bg-amber-800 hover:scale-[1.02]'
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {addedToCart.has(product.id) ? '✓ Added to Cart' : product.inStock ? 'Add to Cart' : 'SOLD OUT'}
                                    </button>

                                    {relatedProducts.length > 0 && (
                                        <div className="mt-16 border-t border-gray-200 pt-12">
                                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">You May Also Like</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                                {relatedProducts.map(rel => (
                                                    <Link key={rel.id} href={`/shop/${rel.id}`} className="block">
                                                        <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                                <div>
                                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
                                                                        {rel.name.charAt(0).toUpperCase() + rel.name.slice(1).toLowerCase()}
                                                                    </p>
                                                                    {rel.rating && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                                                            <span className="text-xs text-gray-600">({rel.rating})</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="mt-3 space-y-1">
                                                                    <p className="text-base font-bold text-gray-900">{rel.price}</p>
                                                                    {rel.originalPrice && (
                                                                        <p className="text-sm text-gray-400 line-through">{rel.originalPrice}</p>
                                                                    )}
                                                                    {rel.inStock ? (
                                                                        <p className="text-xs text-green-600 font-semibold">In Stock</p>
                                                                    ) : (
                                                                        <p className="text-xs text-red-600 font-semibold">Out of Stock</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
