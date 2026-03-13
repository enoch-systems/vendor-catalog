'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { Truck, Shield, ArrowLeft, ArrowRight, Plus, Minus, Trash2, MapPin, Edit, ChevronDown, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeroHeader } from './header'
import Footer from '@/components/footer'
import { useCart } from './cart-context'
import Confirmation from './Confirmation'

const Checkout = () => {
    const [showClearModal, setShowClearModal] = useState(false)
    const [showEmptyCartModal, setShowEmptyCartModal] = useState(false)
    const [selectedState, setSelectedState] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        phone: ''
    })
    const [showFirstNameTick, setShowFirstNameTick] = useState(false)
    const [showLastNameTick, setShowLastNameTick] = useState(false)
    const [showAddressTick, setShowAddressTick] = useState(false)
    const [showPhoneTick, setShowPhoneTick] = useState(false)
    const [customCity, setCustomCity] = useState('')
    const [showCustomCityInput, setShowCustomCityInput] = useState(false)
    const [showCityDropdown, setShowCityDropdown] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [orderNumber, setOrderNumber] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const { cartItems, updateQuantity, removeFromCart, clearCart: clearCartFromContext, cartCount } = useCart()

    // State to cities mapping
    const stateCities: { [key: string]: string[] } = {
        'abia': ['Aba', 'Umuahia', 'Arochukwu', 'Ohafia', 'Bende', 'Isuikwuato'],
        'adamawa': ['Yola', 'Mubi', 'Numan', 'Jimeta', 'Ganye', 'Toungo'],
        'akwa-ibom': ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron', 'Ikot Abasi', 'Uruan'],
        'anambra': ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Oba', 'Ihiala'],
        'bauchi': ['Bauchi', 'Azare', 'Jamare', 'Misau', 'Ganjuwa', 'Tafawa Balewa'],
        'bayelsa': ['Yenagoa', 'Brass', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw'],
        'benue': ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Vandeikya', 'Adikpo'],
        'borno': ['Maiduguri', 'Bama', 'Gwoza', 'Dikwa', 'Biu', 'Monguno'],
        'cross-river': ['Calabar', 'Ikom', 'Ogoja', 'Obudu', 'Ugep', 'Akamkpa'],
        'delta': ['Asaba', 'Warri', 'Sapele', 'Ughelli', 'Agbor', 'Oghara'],
        'ebonyi': ['Abakaliki', 'Afikpo', 'Onueke', 'Ezzamgbo', 'Ishieke', 'Nkalagu'],
        'edo': ['Benin City', 'Auchi', 'Ekpoma', 'Uromi', 'Igueben', 'Sabongidda-Ora'],
        'ekiti': ['Ado Ekiti', 'Ikere Ekiti', 'Ijero Ekiti', 'Oye Ekiti', 'Ikole Ekiti', 'Emure Ekiti'],
        'enugu': ['Enugu', 'Nsukka', 'Oji River', 'Awgu', 'Udi', 'Ezagu'],
        'gombe': ['Gombe', 'Kaltungo', 'Kumo', 'Bajoga', 'Dukku', 'Billiri'],
        'imo': ['Owerri', 'Orlu', 'Okigwe', 'Oru East', 'Aboh Mbaise', 'Ngor Okpala'],
        'jigawa': ['Dutse', 'Hadejia', 'Kazaure', 'Ringim', 'Gumel', 'Birnin Kudu'],
        'kaduna': ['Kaduna', 'Zaria', 'Kafanchan', 'Kagoro', 'Saminaka', 'Birnin Gwari'],
        'kano': ['Kano', 'Kano Municipal', 'Dala', 'Nassarawa', 'Fagge', 'Gwale'],
        'katsina': ['Katsina', 'Daura', 'Funtua', 'Mashi', 'Malumfashi', 'Rimi'],
        'kebbi': ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru', 'Bunza', 'Gwandu'],
        'kogi': ['Lokoja', 'Okene', 'Kabba', 'Idah', 'Ogori', 'Egbe'],
        'kwara': ['Ilorin', 'Offa', 'Omu Aran', 'Jebba', 'Patigi', 'Lafiagi'],
        'lagos': ['Lagos Island', 'Ikeja', 'Victoria Island', 'Apapa', 'Badagry', 'Ikorodu', 'Surulere', 'Epe', 'Agege', 'Mushin'],
        'nasarawa': ['Keffi', 'Lafia', 'Akwanga', 'Wamba', 'Karu', 'Nasarawa'],
        'niger': ['Minna', 'Suleja', 'Bida', 'Kontagora', 'Mokwa', 'Lapai'],
        'ogun': ['Abeokuta', 'Ijebu-Ode', 'Sagamu', 'Ifo', 'Ilaro', 'Ota'],
        'ondo': ['Akure', 'Owo', 'Ondo', 'Ikare', 'Idanre', 'Okitipupa'],
        'osun': ['Osogbo', 'Ile-Ife', 'Ilesha', 'Ede', 'Iwo', 'Ikirun'],
        'oyo': ['Ibadan', 'Oyo', 'Iseyin', 'Ogbomoso', 'Shaki', 'Saki'],
        'plateau': ['Jos', 'Bokkos', 'Shendam', 'Pankshin', 'Kanam', 'Wase'],
        'rivers': ['Port Harcourt', 'Obio-Akpor', 'Bonny', 'Okrika', 'Degema', 'Ahoada'],
        'sokoto': ['Sokoto', 'Wurno', 'Gwadabawa', 'Tambuwal', 'Bodinga', 'Goronyo'],
        'taraba': ['Jalingo', 'Wukari', 'Ibi', 'Gembu', 'Bali', 'Takum'],
        'yobe': ['Damaturu', 'Potiskum', 'Gashua', 'Gaidam', 'Geidam', 'Nguru'],
        'zamfara': ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Zurmi', 'Shinkafi', 'Anka'],
        'fct': ['Abuja', 'Gwagwalada', 'Kuje', 'Bwari', 'Abaji', 'Karu']
    }

    // Reset city when state changes
    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedState(e.target.value)
        setSelectedCity('') // Reset city when state changes
        setShowCustomCityInput(false) // Hide custom city input when state changes
        setCustomCity('') // Clear custom city when state changes
    }

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        
        // Show tick animation for first name if 3+ characters
        if (name === 'firstName') {
            if (value.trim().length >= 3) {
                setShowFirstNameTick(true)
            } else {
                setShowFirstNameTick(false)
            }
        }
        
        // Show tick animation for last name if 3+ characters
        if (name === 'lastName') {
            if (value.trim().length >= 3) {
                setShowLastNameTick(true)
            } else {
                setShowLastNameTick(false)
            }
        }
        
        // Show tick animation for address if 7+ characters
        if (name === 'address') {
            if (value.trim().length >= 7) {
                setShowAddressTick(true)
            } else {
                setShowAddressTick(false)
            }
        }
        
        // Show tick animation for phone if exactly 11 digits
        if (name === 'phone') {
            if (value.trim().length === 11) {
                setShowPhoneTick(true)
            } else {
                setShowPhoneTick(false)
            }
        }
    }

    // Check if form is valid
    const isFormValid = () => {
        const cityValue = showCustomCityInput ? customCity.trim() : selectedCity
        const isValid = (
            formData.firstName.trim().length >= 3 &&
            formData.lastName.trim().length >= 3 &&
            formData.address.trim().length >= 7 &&
            formData.phone.trim().length === 11 &&
            selectedState !== '' &&
            cityValue !== '' &&
            cartItems.length > 0
        )
        
        // Debug logging (remove in production)
        console.log('Form validation:', {
            firstName: formData.firstName.trim(),
            firstNameLength: formData.firstName.trim().length,
            lastName: formData.lastName.trim(),
            lastNameLength: formData.lastName.trim().length,
            address: formData.address.trim(),
            addressLength: formData.address.trim().length,
            phone: formData.phone.trim(),
            phoneLength: formData.phone.trim().length,
            selectedState,
            selectedCity,
            customCity,
            showCustomCityInput,
            cityValue,
            cartItemsLength: cartItems.length,
            isValid
        })
        
        return isValid
    }

    const clearCart = () => {
        setShowClearModal(true)
    }

    const confirmClearCart = () => {
        clearCartFromContext()
        setShowClearModal(false)
    }

    const cancelClearCart = () => {
        setShowClearModal(false)
    }

    const handlePlaceOrder = () => {
        if (!isFormValid()) {
            return
        }
        
        // Show processing spinner
        setIsProcessing(true)
        
        // Simulate processing delay
        setTimeout(() => {
            // Generate order number
            const newOrderNumber = Date.now().toString(36) + Math.random().toString(36).substr(2)
            setOrderNumber(newOrderNumber)
            
            // Hide spinner and show confirmation
            setIsProcessing(false)
            setShowConfirmation(true)
        }, 3000) // 3 seconds delay
    }

    const handleBackToShop = () => {
        clearCartFromContext()
        setShowConfirmation(false)
        // Reset form
        setFormData({
            firstName: '',
            lastName: '',
            address: '',
            phone: ''
        })
        setSelectedState('')
        setSelectedCity('')
        setCustomCity('')
        setShowCustomCityInput(false)
        // Reset validation ticks
        setShowFirstNameTick(false)
        setShowLastNameTick(false)
        setShowAddressTick(false)
        setShowPhoneTick(false)
    }

    const getItemTotal = (price: string, quantity: number) => {
        const numericPrice = parseInt(price.replace('₦', '').replace(',', ''))
        return `₦${(numericPrice * quantity).toLocaleString()}`
    }

    // Calculate totals based on current cart items
    const subtotal = cartItems.reduce((total, item) => {
        const price = parseInt(item.price.replace('₦', '').replace(',', ''))
        return total + (price * item.quantity)
    }, 0)

    return (
        <>
            {showConfirmation ? (
                <Confirmation
                    orderData={{
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        address: formData.address,
                        phone: formData.phone,
                        state: selectedState,
                        city: selectedCity,
                        customCity: customCity,
                        cartItems: cartItems,
                        subtotal: subtotal,
                        total: subtotal,
                        orderNumber: orderNumber
                    }}
                    onBackToShop={handleBackToShop}
                />
            ) : (
                <>
                    <HeroHeader />
                    <main className="overflow-hidden">
                        <section className="py-8 mt-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                            <div className="max-w-6xl mx-auto">
                                {/* Header */}
                                <div className="mb-8">
                                    <Link href="/shop" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                                        <ArrowLeft className="w-5 h-5" />
                                        Back to Shopping
                                    </Link>
                                    <h1 className="text-2xl font-semibold text-gray-900 text-center mt-7">Checkout</h1>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Main Content */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Cart Items */}
                                        <div className="bg-white rounded-lg p-6 shadow-sm">
                                            
                                            {cartItems.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                                                    <Link href="/shop">
                                                        <Button className="bg-amber-900 text-white hover:bg-amber-800">
                                                            Continue Shopping
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {cartItems.map((item) => (
                                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 relative">
                                                        <Link href="/shop">
                                                            <div className="relative w-16 h-16 flex-shrink-0">
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                                    loading="lazy"
                                                                    decoding="async"
                                                                    sizes="64px"
                                                                    style={{
                                                                        background: 'linear-gradient(to right, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                                                                        backgroundSize: '200% 100%',
                                                                        animation: 'shimmer 1.5s ease-in-out infinite'
                                                                    }}
                                                                />
                                                            </div>
                                                        </Link>
                                                        
                                                        <div className="flex-1">
                                                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                            <p className="text-gray-900 font-bold text-sm">{item.price}</p>
                                                            
                                                            <div className="flex items-center justify-between mt-3">
                                                                <div className="flex items-center">
                                                                    <select
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent text-sm"
                                                                    >
                                                                        {Array.from({ length: 49 }, (_, i) => i + 1).map(num => (
                                                                            <option key={num} value={num}>{num}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                
                                                                <div className="text-right">
                                                                    <p className="text-sm text-gray-500">Total</p>
                                                                    <p className="font-semibold text-amber-900">
                                                                        {item.quantity}x {getItemTotal(item.price, item.quantity)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <button 
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="absolute top-0 right-0 text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            )}
                                        </div>

                                        {/* Clear Cart Button */}
                                        {cartItems.length > 0 && (
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={clearCart}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        )}

                                        {/* Delivery Address */}
                                        <div className="bg-white rounded-lg p-6 shadow-sm">
                                            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                                                            placeholder="Enter your first name"
                                                        />
                                                        {showFirstNameTick && (
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                <svg 
                                                                    className="w-5 h-5 text-green-500 animate-pulse" 
                                                                    fill="none" 
                                                                    stroke="currentColor" 
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path 
                                                                        strokeLinecap="round" 
                                                                        strokeLinejoin="round" 
                                                                        strokeWidth={2} 
                                                                        d="M5 13l4 4L19 7" 
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                                                            placeholder="Enter your last name"
                                                        />
                                                        {showLastNameTick && (
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                <svg 
                                                                    className="w-5 h-5 text-green-500 animate-pulse" 
                                                                    fill="none" 
                                                                    stroke="currentColor" 
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path 
                                                                        strokeLinecap="round" 
                                                                        strokeLinejoin="round" 
                                                                        strokeWidth={2} 
                                                                        d="M5 13l4 4L19 7" 
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            name="address"
                                                            value={formData.address}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                                                            placeholder="Enter your complete delivery address"
                                                        />
                                                        {showAddressTick && (
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                <svg 
                                                                    className="w-5 h-5 text-green-500 animate-pulse" 
                                                                    fill="none" 
                                                                    stroke="currentColor" 
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path 
                                                                        strokeLinecap="round" 
                                                                        strokeLinejoin="round" 
                                                                        strokeWidth={2} 
                                                                        d="M5 13l4 4L19 7" 
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                                    <select
                                                        value={selectedState}
                                                        onChange={handleStateChange}
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                                                    >
                                                        <option value="">Select State</option>
                                                        <option value="abia">Abia</option>
                                                        <option value="adamawa">Adamawa</option>
                                                        <option value="akwa-ibom">Akwa Ibom</option>
                                                        <option value="anambra">Anambra</option>
                                                        <option value="bauchi">Bauchi</option>
                                                        <option value="bayelsa">Bayelsa</option>
                                                        <option value="benue">Benue</option>
                                                        <option value="borno">Borno</option>
                                                        <option value="cross-river">Cross River</option>
                                                        <option value="delta">Delta</option>
                                                        <option value="ebonyi">Ebonyi</option>
                                                        <option value="edo">Edo</option>
                                                        <option value="ekiti">Ekiti</option>
                                                        <option value="enugu">Enugu</option>
                                                        <option value="gombe">Gombe</option>
                                                        <option value="imo">Imo</option>
                                                        <option value="jigawa">Jigawa</option>
                                                        <option value="kaduna">Kaduna</option>
                                                        <option value="kano">Kano</option>
                                                        <option value="katsina">Katsina</option>
                                                        <option value="kebbi">Kebbi</option>
                                                        <option value="kogi">Kogi</option>
                                                        <option value="kwara">Kwara</option>
                                                        <option value="lagos">Lagos</option>
                                                        <option value="nasarawa">Nasarawa</option>
                                                        <option value="niger">Niger</option>
                                                        <option value="ogun">Ogun</option>
                                                        <option value="ondo">Ondo</option>
                                                        <option value="osun">Osun</option>
                                                        <option value="oyo">Oyo</option>
                                                        <option value="plateau">Plateau</option>
                                                        <option value="rivers">Rivers</option>
                                                        <option value="sokoto">Sokoto</option>
                                                        <option value="taraba">Taraba</option>
                                                        <option value="yobe">Yobe</option>
                                                        <option value="zamfara">Zamfara</option>
                                                        <option value="fct">Federal Capital Territory</option>
                                                    </select>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">City / Area *</label>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCityDropdown(!showCityDropdown)}
                                                            disabled={!selectedState}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex items-center justify-between"
                                                        >
                                                            <span className="text-gray-500">
                                                                {selectedCity === 'custom' 
                                                                    ? 'Custom city input' 
                                                                    : selectedCity 
                                                                    ? selectedCity 
                                                                    : (selectedState ? 'Select City' : 'Select State First')
                                                                }
                                                            </span>
                                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                        
                                                        {showCityDropdown && selectedState && (
                                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                                {selectedState && stateCities[selectedState]?.map((city) => (
                                                                    <button
                                                                        key={city}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedCity(city)
                                                                            setShowCustomCityInput(false)
                                                                            setCustomCity('')
                                                                            setShowCityDropdown(false)
                                                                        }}
                                                                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                                    >
                                                                        {city}
                                                                    </button>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedCity('custom')
                                                                        setShowCustomCityInput(true)
                                                                        setShowCityDropdown(false)
                                                                    }}
                                                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-blue-600 font-medium flex items-center gap-2"
                                                                >
                                                                    <MapPin className="w-4 h-4" />
                                                                    Can't find city? Type manually
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {selectedCity === 'custom' && (
                                                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <label className="block text-sm font-medium text-blue-900 mb-2">
                                                                <Edit className="w-4 h-4 inline mr-2" />
                                                                Enter your city/area name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={customCity}
                                                                onChange={(e) => setCustomCity(e.target.value)}
                                                                placeholder="e.g., Lekki Phase 1, Victoria Island, etc."
                                                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                                            />
                                                            <p className="text-xs text-blue-700 mt-1">
                                                                Type the exact name of your city or area for delivery
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            maxLength={11}
                                                            required
                                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900 focus:border-transparent"
                                                            placeholder="Enter your phone number (e.g., 0800 000 0000)"
                                                            onKeyPress={(e) => {
                                                                if (!/[0-9]/.test(e.key)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        />
                                                        {showPhoneTick && (
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                <svg 
                                                                    className="w-5 h-5 text-green-500 animate-pulse" 
                                                                    fill="none" 
                                                                    stroke="currentColor" 
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path 
                                                                        strokeLinecap="round" 
                                                                        strokeLinejoin="round" 
                                                                        strokeWidth={2} 
                                                                        d="M5 13l4 4L19 7" 
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        </div>

                                    {/* Order Summary */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-white rounded-lg p-6 shadow-sm sticky top-6">
                                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                                            
                     {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-lg">₦{subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                                            
                                            <div className="space-y-3">
                                                <Button 
                                                    onClick={handlePlaceOrder}
                                                    disabled={!isFormValid()}
                                                    className="w-full bg-blue-500 text-white hover:bg-blue-600 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed mb-5"
                                                >
                                                    Place Order
                                                </Button>
                                                
                                                <Button variant="outline" className="w-full bg-transparent border-gray-400 text-gray-600 hover:bg-gray-100 py-3" asChild>
                                                    <Link href="/shop">
                                                        Continue Shopping
                                                    </Link>
                                                </Button>
                                            </div>
                                            
                                            <div className="mt-4 text-center text-xs text-gray-500">
                                                <p>By placing your order, you agree to our</p>
                                                <p>Terms & Conditions and Privacy Policy</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Page footer */}
                        <Footer />
                    </main>

                    {/* Clear Cart Confirmation Modal */}
                    {showClearModal && (
                        <>
                            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear Cart</h3>
                                    <p className="text-gray-600 mb-6">Do you want to clear all items from your cart?</p>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={cancelClearCart}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            No
                                        </button>
                                        <button
                                            onClick={confirmClearCart}
                                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Yes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Empty Cart Warning Message */}
                    {showEmptyCartModal && (
                        <>
                            <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-40"></div>
                            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                                <div className="text-amber-800 text-2xl font-semibold animate-pulse">
                                    Cart is empty!
                                </div>
                            </div>
                        </>
                    )}

                    {/* Processing Spinner */}
                    {isProcessing && (
                        <>
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto mb-4"></div>
                                    <p className="text-white">Processing your order...</p>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </>
    )
}

export default Checkout
