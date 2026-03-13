'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { Carousel } from '@/components/ui/carousel'
import { Featured } from './featured'
import { HeroHeader } from '@/components/header'
import Footer from '@/components/footer'
import { useUI } from '@/contexts/ui-context'
import { Product, getAllProducts } from '@/lib/products'

const carouselImages = [
    {
        src: '/wig2.jpeg',
        alt: 'Fashion Wigs',
        title: 'Trendy Fashion Styles',
        description: 'Stay ahead of the trends with our latest fashion-forward wig designs.'
    },
    {
        src: '/wig3.jpeg',
        alt: 'Natural Look Wigs',
        title: 'Natural Looking Wigs',
        description: 'Achieve the perfect natural look with our realistic hairline and texture options.'
    },
    {
        src: '/wig4.jpeg',
        alt: 'Colorful Wigs',
        title: 'Vibrant Color Collection',
        description: 'Express yourself with our wide range of vibrant and natural color options.'
    },
    {
        src: '/wig5.jpeg',
        alt: 'Luxury Wigs',
        title: 'Luxury Hair Solutions',
        description: 'Experience premium luxury with our handcrafted designer wig collection.'
    },
    {
        src: '/wig9.jpeg',
        alt: 'Elegant Styles',
        title: 'Elegant & Sophisticated',
        description: 'Elevate your look with our elegant and sophisticated wig styles.'
    },
    {
        src: '/wig10.jpeg',
        alt: 'Long Curly Wigs',
        title: 'Stunning Long Curls',
        description: 'Embrace volume and glamour with our beautiful long curly wig collection.'
    },
    {
        src: '/wig15.jpeg',
        alt: 'Classic Collection',
        title: 'Classic & Timeless',
        description: 'Discover timeless beauty with our classic wig designs that never go out of style.'
    }
]

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            x: 50,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            x: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 0.8,
            },
        },
    },
}

const carouselTransitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            x: 100,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            x: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 0.8,
                delay: 0.2,
            },
        },
    },
}

const featuredTransitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            x: -100,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            x: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 0.8,
                delay: 0.4,
            },
        },
    },
}

interface HeroSectionProps {
    initialFeatured?: Product[]
}

export default function HeroSection({ initialFeatured = [] }: HeroSectionProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const searchWrapperRef = useRef<HTMLDivElement>(null)
    const [resultsStyle, setResultsStyle] = useState<{top: number; left: number; width: number} | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { profileDropdownOpen, mobileMenuOpen } = useUI()

    // Load all products for search on component mount
    useEffect(() => {
        const loadAllProducts = async () => {
            try {
                const products = await getAllProducts()
                setAllProducts(products)
            } catch (err) {
                console.error('Failed to load products for search:', err)
            }
        }
        loadAllProducts()
    }, [])

    // Show loading overlay for 0.8 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 800)
        return () => clearTimeout(timer)
    }, [])

    // compute dropdown position whenever query changes
    useEffect(() => {
        if (!searchWrapperRef.current) return
        const rect = searchWrapperRef.current.getBoundingClientRect()
        setResultsStyle({
            top: rect.bottom + window.scrollY,
            left: rect.left + rect.width / 2 + window.scrollX,
            width: rect.width,
        })
    }, [searchQuery])

    // reposition on window resize
    useEffect(() => {
        const handler = () => {
            if (!searchWrapperRef.current) return
            const rect = searchWrapperRef.current.getBoundingClientRect()
            setResultsStyle({
                top: rect.bottom + window.scrollY,
                left: rect.left + rect.width / 2 + window.scrollX,
                width: rect.width,
            })
        }
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <HeroHeader />
            
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto mb-4"></div>
                        <p className="text-white">Loading...</p>
                    </div>
                </div>
            )}
            
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32">
                            <Image
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="hidden size-full"
                                width="3276"
                                height="4095"
                            />
                        </div>

                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants} className="relative z-[10000]">
                                    <div ref={searchWrapperRef} className="hover:bg-background bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-2 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300">
                                        <input
                                            type="text"
                                            placeholder="Search products...."
                                            className="text-foreground text-sm bg-transparent outline-none w-64 placeholder:text-muted-foreground"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ fontSize: '16px' }}
                                        />
                                        <span className="block h-4 w-0.5 border-l bg-white"></span>
                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500 flex items-center justify-center">
                                            <Search className="m-auto size-3" />
                                        </div>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>

                        {/* backdrop layer */}
                        {searchQuery && filteredProducts.length > 0 && (
                            <div
                                className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[9998] cursor-pointer"
                                onClick={() => setSearchQuery('')}
                            />
                        )}

                        {/* search results below search bar */}
                        {searchQuery && filteredProducts.length > 0 && resultsStyle && (
                            <div
                                className="fixed bg-white border border-gray-300 rounded-lg shadow-lg w-[500px] h-80 overflow-y-auto z-[9999]"
                                style={{
                                    top: resultsStyle.top + 8,
                                    left: resultsStyle.left,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                {filteredProducts.slice(0, 20).map(product => (
                                    <Link key={product.id} href={`/shop/${product.id}`} onClick={() => setSearchQuery('')}>
                                        <div className="flex items-center p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0">
                                            {product.image ? (
                                                <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name} 
                                                        className="w-10 h-10 object-cover rounded"
                                                        loading="lazy"
                                                        decoding="async"
                                                        sizes="40px"
                                                        style={{ 
                                                            background: 'linear-gradient(to right, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                                                            backgroundSize: '200% 100%',
                                                            animation: 'shimmer 1.5s ease-in-out infinite'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs text-gray-400">N/A</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{product.name.charAt(0).toUpperCase() + product.name.slice(1).toLowerCase()}</p>
                                                <p className="text-xs text-gray-500">{product.price}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Carousel Section */}
                        <AnimatedGroup variants={carouselTransitionVariants}>
                            <div className="relative h-[600px] w-full">
                                <Carousel images={carouselImages} className="h-full" />
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                
                {/* Featured Products Section */}
                <AnimatedGroup variants={featuredTransitionVariants}>
                    <Featured initialProducts={initialFeatured} />
                </AnimatedGroup>

                {/* Page footer */}
                <Footer />
            </main>
        </>
    )
}
