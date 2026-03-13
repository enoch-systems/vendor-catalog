'use client';
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ShoppingBag, ShoppingCart, HelpCircle, User, Settings, LogOut, ChevronDown, CreditCard, HousePlus, ScissorsLineDashed } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import { useCart } from './cart-context'
import { useUI } from '@/contexts/ui-context'
import { useAuth } from '@/contexts/auth-context'
import { Logo, LogoIcon } from '@/components/logo'

type ProfileDropdownItem = {
    name?: string;
    email?: string;
    href?: string;
    icon?: React.ElementType;
    isHeader?: boolean;
    isSignOut?: boolean;
}

export const HeroHeader = () => {
    const { profileDropdownOpen, setProfileDropdownOpen, mobileMenuOpen, setMobileMenuOpen } = useUI()
    const { user } = useAuth()
    const [isScrolled, setIsScrolled] = React.useState(false)
    const { cartCount } = useCart()
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const mobileMenuRef = React.useRef<HTMLDivElement>(null)
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    // Create menu items dynamically based on auth state
    type MenuItem = {
        name: string
        href: string
        icon: React.ElementType
        customIcon?: string
    }

    const mobileMenuItems: MenuItem[] = [
        { name: 'Home', href: '/', icon: HousePlus },
        { name: 'Shop Wigs', href: '/shop', icon: ShoppingBag },
        { name: 'Check out', href: '/checkout', icon: CreditCard },
        ...(user ? [{ name: 'My Account', href: '/admin/products', icon: User, customIcon: '/avatar.jpeg' }] : [])
    ]

    const desktopMenuItems: MenuItem[] = [
        { name: 'Home', href: '/', icon: HousePlus },
        { name: 'Shop Wigs', href: '/shop', icon: ShoppingBag },
        { name: 'Check out', href: '/checkout', icon: CreditCard },
    ]

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileDropdownOpen(false)
            }
        }

        if (profileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [profileDropdownOpen, setProfileDropdownOpen])

    // Close mobile menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) {
                setMobileMenuOpen(false)
            }
        }

        if (mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [mobileMenuOpen, setMobileMenuOpen])

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            {/* Backdrop overlay */}
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-white/5 backdrop-blur-lg z-10 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />                                                                                  
            )}
            <nav
                data-state={mobileMenuOpen ? 'active' : ''}
                className="fixed z-20 w-full px-2">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                onClick={(e) => {
                                    e.preventDefault()
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                    window.location.href = '/'
                                }}
                                aria-label="home"
                                className={cn("flex items-center space-x-2", mobileMenuOpen && "hidden")}>
                                <LogoIcon className="h-8 w-auto" priority={true} />
                                <span className="text-lg font-semibold">Wigga</span>
                            </Link>

                            <Link
                                href="/checkout"
                                aria-label="Shopping Cart"
                                className={cn("relative z-20 -m-2.5 -mr-20 block cursor-pointer p-2.5 lg:hidden", mobileMenuOpen && "hidden")}>
                                <Image src="/shopping-bag.png" alt="Shopping Cart" width={24} height={24} className="size-6 object-contain" />
                                <span className="absolute top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                    {cartCount}
                                </span>
                            </Link>

                            <button
                                ref={buttonRef}
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label={mobileMenuOpen === true ? 'Close Menu' : 'Open Menu'}
                                className={cn("relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden", mobileMenuOpen && "hidden")}>
                                <Menu className="data-[state=active]:rotate-180 data-[state=active]:scale-0 data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="data-[state=active]:rotate-0 data-[state=active]:scale-100 data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {desktopMenuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className={`text-black hover:text-black flex items-center gap-2 duration-150`}>
                                            {(['Home', 'Shop Wigs'].includes(item.name)) ? null : (
                                                item.customIcon ? (
                                                    <div className="relative">
                                                        <Image src={item.customIcon} alt={item.name} width={16} height={16} className="size-4 object-contain" />
                                                        {item.name === 'Shopping Bag' && (
                                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                                                                {cartCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <item.icon className="size-5" />
                                                )
                                            )}
                                            {item.name !== 'Shopping Bag' && <span>{item.name}</span>}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Shopping Cart Icon for Desktop */}
                        <Link
                            href="/checkout"
                            className="relative hidden lg:flex items-center p-2 rounded hover:bg-gray-100"
                        >
                            <Image src="/shopping-bag.png" alt="Shopping Cart" width={20} height={20} className="size-5 object-contain" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                                {cartCount}
                            </span>
                        </Link>

                        {/* No auth profile dropdown when Supabase auth is removed */}

                        <div ref={mobileMenuRef} data-state={mobileMenuOpen ? 'active' : ''} className="fixed z-50 right-0 top-0 h-screen w-64 bg-slate-800 transform translate-x-full transition-transform duration-1000 data-[state=active]:translate-x-0 lg:hidden">
                            <div className="p-6">
                                <div className="flex items-center space-x-2 mb-4 pb-6">
                                    <LogoIcon className="h-8 w-auto" />
                                    <span className="text-lg font-semibold text-white">Wigga</span>
                                </div>
                                <ul className="space-y-4 text-base">
                                    {mobileMenuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                onClick={() => { setMobileMenuOpen(false); if (item.name === 'Home') window.scrollTo(0, 0); }}
                                                className={`text-white hover:text-amber-400 flex items-center gap-3 duration-150 pb-4 border-b-2 border-amber-900 last:border-0 ${item.name === 'My Account' ? 'mt-6' : ''}`}>
                                                {item.customIcon ? (
                                                    <Image src={item.customIcon} alt={item.name} className="size-6 object-contain rounded-full" width={24} height={24} />
                                                ) : (
                                                    <item.icon className="size-5 text-amber-100" />
                                                )}
                                                <span className={`font-normal ${item.name === 'My Account' ? 'text-left' : ''}`}>{item.name}</span>
                                                {item.name === 'My Account' && <ChevronDown className="size-4 ml-2" />}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
