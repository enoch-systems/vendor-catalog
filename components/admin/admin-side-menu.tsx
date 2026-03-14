'use client'

import React from 'react'
import { ArrowLeft, ShoppingCart, Settings, X } from 'lucide-react'
import Link from 'next/link'
import { OptimizedImage } from '../ui/optimized-image'

interface AdminSideMenuProps {
  currentPath?: string
  menuOpen?: boolean
  setMenuOpen?: (open: boolean) => void
}

export const AdminSideMenu = ({ 
  currentPath = '', 
  menuOpen: externalMenuOpen,
  setMenuOpen: externalSetMenuOpen 
}: AdminSideMenuProps) => {
  const [internalMenuOpen, setInternalMenuOpen] = React.useState(false)
  
  // Use external state if provided, otherwise use internal state
  const menuOpen = externalMenuOpen !== undefined ? externalMenuOpen : internalMenuOpen
  const setMenuOpen = externalSetMenuOpen || setInternalMenuOpen

  const menuItems = [
    { icon: ShoppingCart, label: 'Products', href: '/admin/products' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 delay-300 ${
      menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/10 bg-opacity-50 backdrop-blur-lg"
        onClick={() => setMenuOpen(false)}
      />
      
      {/* Menu Panel */}
      <div className={`absolute top-0 left-0 h-full w-64 bg-gray-800 shadow-xl transform transition-transform duration-700 ease-in-out ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <Link href="/admin/products" className="flex items-center space-x-2">
              <OptimizedImage
                src="/wig.png"
                alt="Logo"
                width={24}
                height={24}
                className="h-6 w-auto object-contain"
              />
              <span className="text-white font-semibold">Wigga</span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-300" />
            </button>
          </div>
        </div>
        
        <nav className="p-4">
          {/* Back to Store Button */}
          <a
            href="/"
            className="flex items-center p-3 mb-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors group"
            onClick={() => setMenuOpen(false)}
          >
            <ArrowLeft size={20} className="min-w-[20px]" />
            <span className="ml-3 font-medium">Back to Store</span>
          </a>
          
          {menuItems.map((item, index) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center p-3 mb-2 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-slate-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <item.icon size={20} className={`min-w-[20px] ${isActive ? 'text-white' : ''}`} />
                <span className="ml-3 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  )
}
