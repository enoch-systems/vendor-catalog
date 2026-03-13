'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, MapPin, Phone, User, Package, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfirmationProps {
    orderData: {
        firstName: string
        lastName: string
        address: string
        phone: string
        state: string
        city: string
        customCity?: string
        cartItems: Array<{
            id: string
            name: string
            price: string
            quantity: number
            image: string
        }>
        subtotal: number
        total: number
        orderNumber: string
    }
    onBackToShop: () => void
}

const Confirmation = ({ orderData, onBackToShop }: ConfirmationProps) => {
    const [showCancelModal, setShowCancelModal] = useState(false)
    const getItemTotal = (price: string, quantity: number) => {
        const numericPrice = parseInt(price.replace('₦', '').replace(',', ''))
        return `₦${(numericPrice * quantity).toLocaleString()}`
    }

    // Function to calculate numeric total for WhatsApp message (without formatting)
    const getNumericItemTotal = (price: string, quantity: number) => {
        const numericPrice = parseInt(price.replace('₦', '').replace(',', ''))
        return numericPrice * quantity
    }

    const formatOrderNumber = (orderNumber: string) => {
        // Generate 4 random numbers (0-9)
        const randomDigits = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')
        return `ORD-${orderNumber.slice(0, 3).toUpperCase()}${randomDigits}`
    }

    const handleCancelOrder = () => {
        setShowCancelModal(true)
    }

    const confirmCancelOrder = () => {
        // Scroll to top first
        window.scrollTo({ top: 0, behavior: 'smooth' })
        
        // Clear cart and reset form, then go back to checkout
        onBackToShop()
    }

    const cancelCancelOrder = () => {
        setShowCancelModal(false)
    }

    const handleConfirmOrder = () => {
        // Create well-structured WhatsApp message with all order details
        const formattedOrderNumber = formatOrderNumber(orderData.orderNumber)
        const cityDisplay = orderData.customCity || orderData.city
        
        // Build products list with accurate calculations
        const productsList = orderData.cartItems.map((item, index) => {
            const numericTotal = getNumericItemTotal(item.price, item.quantity)
            return `${index + 1}. ${item.name}\n   • Quantity: ${item.quantity}\n   • Price: ${item.price}\n   • Total: ₦${numericTotal.toLocaleString()}`
        }).join('\n\n')
        
        // Verify subtotal calculation matches individual item totals
        const calculatedSubtotal = orderData.cartItems.reduce((total, item) => {
            return total + getNumericItemTotal(item.price, item.quantity)
        }, 0)
        
        // Create comprehensive message
        const message = `🛍️ *NEW ORDER CONFIRMATION* 🛍️

📋 *Order Details:*
Order Number: ${formattedOrderNumber}
Date: ${new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

👤 *Customer Information:*
Name: ${orderData.firstName} ${orderData.lastName}
Phone: ${orderData.phone}

📍 *Delivery Address:*
${orderData.address}
${cityDisplay}, ${orderData.state}

📦 *Products Ordered:*
${productsList}

💰 *Order Summary:*
Subtotal: ₦${calculatedSubtotal.toLocaleString()}
Total: ₦${orderData.total.toLocaleString()}

---
*Order confirmed via Wigga Online Store*
*Please process this order promptly*`

        // Send to WhatsApp with correct phone number
        const phoneNumber = "2349162919586" // Convert 09162919586 to international format
        window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
        
        // Clear everything after a short delay
        setTimeout(() => {
            onBackToShop()
        }, 1000)
    }

    // Navigation protection
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Clear cart and form when user navigates away
            onBackToShop()
        }

        const handlePopState = () => {
            // Scroll to top and clear cart when user uses browser back button
            window.scrollTo({ top: 0, behavior: 'smooth' })
            onBackToShop()
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('popstate', handlePopState)
        }
    }, [onBackToShop])

    // Scroll to top when confirmation page loads
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
                    <div className="mt-2 inline-block bg-green-50 text-green-800 px-4 py-2 rounded-lg font-medium">
                        Order Number: {formatOrderNumber(orderData.orderNumber)}
                    </div>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Order Details
                    </h2>
                    
                    {/* Products */}
                    <div className="space-y-4 mb-6">
                        {orderData.cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                    <p className="text-gray-900 font-bold text-sm">{item.price}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm text-gray-500">Quantity: {item.quantity}</span>
                                        <span className="font-semibold text-amber-900">
                                            {getItemTotal(item.price, item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₦{orderData.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-lg">₦{orderData.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                {/* Customer Information Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Customer Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{orderData.firstName} {orderData.lastName}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="font-medium">{orderData.phone}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 md:col-span-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Delivery Address</p>
                                <p className="font-medium">{orderData.address}</p>
                                <p className="font-medium">
                                    {orderData.customCity || orderData.city}, {orderData.state}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Redirect */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800">
                        You will be redirected to WhatsApp after Confirm Order is clicked.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                        onClick={handleConfirmOrder}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700 py-3"
                    >
                        Confirm Order
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex-1 bg-transparent border-red-500 text-red-500 hover:bg-red-50 py-3"
                        onClick={handleCancelOrder}
                    >
                        Cancel Order
                    </Button>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Thank you for your business!</p>
                </div>

                {/* Cancel Order Modal */}
                {showCancelModal && (
                    <>
                        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
                                <p className="text-gray-600 mb-6">
                                    Your order would be canceled. This cannot be reversed. Are you sure you want to proceed?
                                </p>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={cancelCancelOrder}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        No
                                    </button>
                                    <button
                                        onClick={confirmCancelOrder}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Confirmation
