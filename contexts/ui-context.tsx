'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface UIContextType {
  isMenuOpen: boolean
  toggleMenu: () => void
  closeMenu: () => void
  openMenu: () => void
  profileDropdownOpen: boolean
  setProfileDropdownOpen: (open: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export const useUI = () => {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}

interface UIProviderProps {
  children: ReactNode
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const openMenu = () => {
    setIsMenuOpen(true)
  }

  const value: UIContextType = {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    openMenu,
    profileDropdownOpen,
    setProfileDropdownOpen,
    mobileMenuOpen,
    setMobileMenuOpen
  }

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  )
}
