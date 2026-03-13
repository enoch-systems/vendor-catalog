'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

interface FooterLink {
  group: string
  items: { href: string; title: string }[]
}

const links: FooterLink[] = []

export default function Footer() {
    const [showComingSoon, setShowComingSoon] = React.useState('')
    const [comingSoonPosition, setComingSoonPosition] = React.useState({ x: 0, y: 0 })

    const handleSocialClick = (e: React.MouseEvent, platform: string) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        setComingSoonPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom + 5
        })
        setShowComingSoon(platform)
        setTimeout(() => setShowComingSoon(''), 2000)
    }
    return (
        <>
            <footer className="border-b bg-white pt-20">
                <div className="mb-8 border-b md:mb-12">
                    <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-6 px-6 pb-6">
                        <Link
                            href="/"
                            onClick={(e) => {
                                e.preventDefault()
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            aria-label="go home">
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <Image src="/wig.png" alt="Logo" width={32} height={32} className="h-8 w-auto object-contain" />
                                <span className="text-sm font-semibold">Wigga</span>
                            </div>
                        </Link>
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <button
                                onClick={(e) => handleSocialClick(e, 'X')}
                                className="text-muted-foreground hover:text-primary block"
                                aria-label="X/Twitter">
                                <svg
                                    className="size-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"></path>
                                </svg>
                            </button>
                            
                            <button
                                onClick={(e) => handleSocialClick(e, 'Facebook')}
                                className="text-muted-foreground hover:text-primary block"
                                aria-label="Facebook">
                                <svg
                                    className="size-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"></path>
                                </svg>
                            </button>
                           
                            <button
                                onClick={(e) => handleSocialClick(e, 'Instagram')}
                                className="text-muted-foreground hover:text-primary block"
                                aria-label="Instagram">
                                <svg
                                    className="size-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path>
                                </svg>
                            </button>
                            <button
                                onClick={(e) => handleSocialClick(e, 'TikTok')}
                                className="text-muted-foreground hover:text-primary block"
                                aria-label="TikTok">
                                <svg
                                    className="size-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid gap-12 md:grid-cols-5 md:gap-0 lg:grid-cols-4">
                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-5 md:row-start-1 lg:col-span-3">
                            {links.map((link, index) => (
                                <div
                                    key={index}
                                    className="space-y-4 text-sm">
                                    <span className="block font-medium">{link.group}</span>
                                    {link.items.map((item, index) => (
                                        <Link
                                            key={index}
                                            href={item.href}
                                            className="text-muted-foreground hover:text-primary block duration-150">
                                            <span>{item.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-muted-foreground hover:text-primary text-sm bg-none border-none cursor-pointer p-0">
                            Back to top 
                        </button>
                        <small className="text-muted-foreground order-last block text-center text-sm md:order-first">© {new Date().getFullYear()} Wigga. All rights reserved</small>
                        <div className="relative">
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none" />
                            <select
                                className={cn(
                                    'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground shadow-xs flex h-9 w-full min-w-32 appearance-none rounded-md border bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
                                )}
                                name="language">
                                <option value="1">English</option>
                            </select>
                        </div>
                    </div>
                </div>
            </footer>
            
            {/* Coming Soon Tooltip */}
            {showComingSoon && (
                <div
                    className="fixed bg-gray-500 text-white px-3 py-1 rounded-md text-sm z-50 pointer-events-none"
                    style={{
                        left: `${comingSoonPosition.x}px`,
                        top: `${comingSoonPosition.y}px`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    Coming Soon
                </div>
            )}
        </>
    )
}
