'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Mail, Phone, MessageCircle, HelpCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'
import Footer from '@/components/footer'
import { useUI } from '@/contexts/ui-context'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
                delay: 0.6,
            },
        },
    },
}

const helpCategories = [
    {
        title: 'Order & Shipping',
        icon: '📦',
        questions: [
            {
                q: 'How long does shipping take?',
                a: 'Standard shipping takes 3-5 business days within Nigeria. Express shipping takes 1-2 business days.'
            },
            {
                q: 'Do you ship internationally?',
                a: 'Currently, we only ship within Nigeria. We are working on expanding to international shipping soon.'
            },
            {
                q: 'How can I track my order?',
                a: 'Once your order ships, you will receive a tracking number via email that you can use to track your package.'
            }
        ]
    },
    {
        title: 'Returns & Refunds',
        icon: '🔄',
        questions: [
            {
                q: 'What is your return policy?',
                a: 'We accept returns within 7 days of delivery if the product is unused and in original packaging.'
            },
            {
                q: 'How do I initiate a return?',
                a: 'Contact our customer service team via email or phone, and they will guide you through the return process.'
            },
            {
                q: 'When will I receive my refund?',
                a: 'Refunds are processed within 3-5 business days after we receive and inspect the returned item.'
            }
        ]
    },
    {
        title: 'Product Care',
        icon: '💇',
        questions: [
            {
                q: 'How do I wash my wig?',
                a: 'Use cold water and wig-specific shampoo. Gently comb through with a wide-tooth comb and air dry.'
            },
            {
                q: 'Can I use heat styling tools?',
                a: 'Only use heat tools on heat-resistant wigs. Always use a heat protectant spray and keep temperature below 350°F.'
            },
            {
                q: 'How often should I wash my wig?',
                a: 'Wash your wig every 6-8 wears or when it becomes dirty. Over-washing can damage the fibers.'
            }
        ]
    }
]

const Help = () => {
    const { profileDropdownOpen } = useUI()
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const searchWrapperRef = useRef<HTMLDivElement>(null)
    const [resultsStyle, setResultsStyle] = useState<{top: number; left: number; width: number} | null>(null)

    // compute dropdown position whenever query changes or resize occurs
    useEffect(() => {
        if (!searchWrapperRef.current) return
        const rect = searchWrapperRef.current.getBoundingClientRect()
        setResultsStyle({
            top: rect.bottom + window.scrollY,
            left: rect.left + rect.width / 2 + window.scrollX,
            width: rect.width,
        })
    }, [searchQuery])

    // reposition on window resize as well
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

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission here
        console.log('Contact form submitted:', contactForm)
        // Reset form
        setContactForm({
            name: '',
            email: '',
            subject: '',
            message: ''
        })
        alert('Thank you for your message. We will get back to you soon!')
    }

    const filteredHelp = helpCategories.flatMap(category =>
        category.questions.filter(q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(q => ({ ...q, category: category.title }))
    )

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section className="py-8 mt-16 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <AnimatedGroup variants={transitionVariants}>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
                                <p className="text-lg text-gray-600">Find answers to common questions or get in touch with our support team</p>
                            </div>
                        </AnimatedGroup>

                        {/* Search Bar */}
                        <AnimatedGroup variants={transitionVariants} className="relative z-[10000]">
                            <div ref={searchWrapperRef} className="relative text-center mb-8">
                                {!profileDropdownOpen && (
                                    <div className="hover:bg-background bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-2 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300">
                                        <input
                                            type="text"
                                            placeholder="Search for help...."
                                            className="text-foreground text-sm bg-transparent outline-none w-64 placeholder:text-muted-foreground"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <span className="block h-4 w-0.5 border-l bg-white"></span>
                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500 flex items-center justify-center">
                                            <Search className="m-auto size-3" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AnimatedGroup>

                        {/* Search Results */}
                        {searchQuery && filteredHelp.length > 0 && (
                            <AnimatedGroup variants={transitionVariants}>
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
                                    <div className="space-y-4">
                                        {filteredHelp.map((help, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <HelpCircle className="w-5 h-5 text-amber-900 mt-1 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 mb-2">{help.q}</h4>
                                                        <p className="text-gray-600 text-sm">{help.a}</p>
                                                        <p className="text-xs text-gray-500 mt-2">Category: {help.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </AnimatedGroup>
                        )}

                        {!searchQuery && (
                            <>
                                {/* Help Categories */}
                                <AnimatedGroup variants={transitionVariants}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Center</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {helpCategories.map((category, categoryIndex) => (
                                                <div key={categoryIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => setExpandedCategory(expandedCategory === category.title ? null : category.title)}
                                                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{category.icon}</span>
                                                            <h3 className="font-semibold text-gray-900">{category.title}</h3>
                                                        </div>
                                                        <span className="text-gray-500">
                                                            {expandedCategory === category.title ? '−' : '+'}
                                                        </span>
                                                    </button>
                                                    
                                                    {expandedCategory === category.title && (
                                                        <div className="px-6 py-4 space-y-3">
                                                            {category.questions.map((question, questionIndex) => (
                                                                <div key={questionIndex} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                                                    <button
                                                                        onClick={() => setExpandedQuestion(expandedQuestion === `${categoryIndex}-${questionIndex}` ? null : `${categoryIndex}-${questionIndex}`)}
                                                                        className="w-full text-left flex items-center justify-between py-2"
                                                                    >
                                                                        <span className="font-medium text-gray-900 text-sm">{question.q}</span>
                                                                        <span className="text-gray-500 text-sm">
                                                                            {expandedQuestion === `${categoryIndex}-${questionIndex}` ? '−' : '+'}
                                                                        </span>
                                                                    </button>
                                                                    
                                                                    {expandedQuestion === `${categoryIndex}-${questionIndex}` && (
                                                                        <p className="text-gray-600 text-sm mt-2 pl-2">{question.a}</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </AnimatedGroup>

                                {/* Contact Form */}
                                <AnimatedGroup variants={transitionVariants}>
                                    <div className="bg-gray-50 rounded-lg p-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <Mail className="w-5 h-5 text-amber-900" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">Email</p>
                                                            <p className="text-gray-600">support@wigga.com</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Phone className="w-5 h-5 text-amber-900" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">Phone</p>
                                                            <p className="text-gray-600">+234 800 000 0000</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <MessageCircle className="w-5 h-5 text-amber-900" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">Live Chat</p>
                                                            <p className="text-gray-600">Available 9 AM - 6 PM (Mon-Fri)</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a Message</h3>
                                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="Your Name"
                                                            value={contactForm.name}
                                                            onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="email"
                                                            placeholder="Your Email"
                                                            value={contactForm.email}
                                                            onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="Subject"
                                                            value={contactForm.subject}
                                                            onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <textarea
                                                            placeholder="Your Message"
                                                            value={contactForm.message}
                                                            onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                                                            rows={4}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent resize-none"
                                                            required
                                                        />
                                                    </div>
                                                    <Button
                                                        type="submit"
                                                        className="w-full bg-amber-900 text-white hover:bg-amber-800 py-3 flex items-center justify-center gap-2"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        Send Message
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedGroup>
                            </>
                        )}
                    </div>
                </section>

                {/* Page footer */}
                <Footer />
            </main>
        </>
    )
}

export default Help
