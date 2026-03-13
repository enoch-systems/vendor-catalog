'use client';
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronDown, X, Upload, Bot, Plus, Edit, ArrowLeft } from 'lucide-react';
import { Product } from '@/lib/products';
import { descriptionTemplates } from './descriptionTemplates';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Custom loader styles
const loaderStyles = `
  .loader {
    width: 70px;
    aspect-ratio: 1;
    background:
      radial-gradient(farthest-side,#ffa516 90%,#0000) center/16px 16px,
      radial-gradient(farthest-side,green   90%,#0000) bottom/12px 12px;
    background-repeat: no-repeat;
    animation: l17 1s infinite linear;
    position: relative;
  }
  .loader::before {    
    content:"";
    position: absolute;
    width: 8px;
    aspect-ratio: 1;
    inset: auto 0 16px;
    margin: auto;
    background: #ccc;
    border-radius: 50%;
    transform-origin: 50% calc(100% + 10px);
    animation: inherit;
    animation-duration: 0.5s;
  }
  @keyframes l17 { 
    100%{transform: rotate(1turn)}
  }
`;

interface AddProductModalProps {
  onClose: () => void;
}

const defaultProduct: Partial<Product> = {
  id: '',
  name: '',
  price: '₦0',
  originalPrice: '',
  rating: 4.2,
  reviews: 0,
  image: '',
  images: ['', '', '', ''],
  description: '',
  features: [],
  colors: ['Black'],
  sizes: ['8"', '10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'],
  inStock: true,
  badge: '',
  category: ''
};

const sizes = [
  '8"', '10"', '12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"'
];

const badgeOptions = ['None', 'New Arrival', 'Hot Deals', 'Popular', 'Top Selling'];

const colors = ['Black', 'Brown', 'Dark Red', 'Blonde'];

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose }) => {
  const [newProduct, setNewProduct] = useState<Partial<Product>>(defaultProduct);

  const [mainImage, setMainImage] = useState<string>('');
  const [displayImage, setDisplayImage] = useState<string>('');
  const [thumbnailImages, setThumbnailImages] = useState<string[]>(['', '', '', '']);


  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isAvailableDropdownOpen, setIsAvailableDropdownOpen] = useState(false);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isBadgeDropdownOpen, setIsBadgeDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [sizeButtonText, setSizeButtonText] = useState("Select All");
  const [colorButtonText, setColorButtonText] = useState("Save Changes");
  const [hasChanges, setHasChanges] = useState(false);
  const [hasGeneratedDescription, setHasGeneratedDescription] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fix for boolean state
  const [inStock, setInStock] = useState<boolean>(true);

  const sizeRef = useRef<HTMLDivElement>(null);
  const availableRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper function to capitalize each word (title case)
  const capitalizeWords = (str: string): string => {
    return str
      .split(' ')
      .map(word => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : ''))
      .join(' ');
  };

  // make sure first thumbnail mirrors main image on mount and when main image changes
  useEffect(() => {
    if (mainImage) {
      const newThumbs = [...thumbnailImages];
      newThumbs[0] = mainImage;
      setThumbnailImages(newThumbs);
      setDisplayImage(mainImage); // Also update display image
      setNewProduct(prev => ({
        ...prev,
        images: [mainImage, ...(prev.images || []).slice(1)]
      }));
    }
  }, [mainImage]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isColorDropdownOpen &&
        colorRef.current &&
        !colorRef.current.contains(event.target as Node)
      ) {
        setIsColorDropdownOpen(false);
      }
      if (
        isSizeDropdownOpen &&
        sizeRef.current &&
        !sizeRef.current.contains(event.target as Node)
      ) {
        setIsSizeDropdownOpen(false);
      }
      if (
        isAvailableDropdownOpen &&
        availableRef.current &&
        !availableRef.current.contains(event.target as Node)
      ) {
        setIsAvailableDropdownOpen(false);
      }
      if (
        isRatingDropdownOpen &&
        ratingRef.current &&
        !ratingRef.current.contains(event.target as Node)
      ) {
        setIsRatingDropdownOpen(false);
      }
      if (
        isBadgeDropdownOpen &&
        badgeRef.current &&
        !badgeRef.current.contains(event.target as Node)
      ) {
        setIsBadgeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorDropdownOpen, isSizeDropdownOpen, isAvailableDropdownOpen, isRatingDropdownOpen, isBadgeDropdownOpen]);

  useEffect(() => {
    if (newProduct.sizes?.length === 0) {
      setSizeButtonText("Select All");
    } else {
      setSizeButtonText("Save Changes");
    }
  }, [newProduct.sizes]);

  useEffect(() => {
    if (newProduct.colors?.length === 0) {
      setColorButtonText("Select All");
    } else {
      setColorButtonText("Save Changes");
    }
  }, [newProduct.colors]);

  useEffect(() => {
    const hasName = newProduct.name !== '';
    const hasPrice = newProduct.price !== '₦0';
    const hasDescription = newProduct.description !== '';
    const hasRating = newProduct.rating !== undefined;
    const hasStockChanged = inStock !== true;
    const hasBadge = newProduct.badge !== '';
    const hasSizes = newProduct.sizes && newProduct.sizes.length > 0;
    const hasColors = newProduct.colors && newProduct.colors.length > 0;
    const hasImage = newProduct.image !== '';
    const hasImages = newProduct.images && newProduct.images.some(img => img !== '');
    
    const isChanged = hasName || hasPrice || hasDescription || hasRating || hasStockChanged || hasBadge || hasSizes || hasColors || hasImage || hasImages;
    
    setHasChanges(isChanged as boolean);
  }, [newProduct, inStock]);

  // Update inStock when newProduct changes
  useEffect(() => {
    if (newProduct.inStock !== undefined) {
      setInStock(newProduct.inStock);
    }
  }, [newProduct.inStock]);

  // image handlers now upload straight to Cloudinary using an unsigned preset
  const handleThumbnailUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview immediately using blob URL
    const blobUrl = URL.createObjectURL(file);
    const newThumbnails = [...thumbnailImages];
    newThumbnails[index] = blobUrl;
    setThumbnailImages(newThumbnails);

    try {
      const { url } = await uploadToCloudinary(file);
      const finalThumbnails = [...thumbnailImages];

      const newImages = [...(newProduct.images || [])];
      newImages[index] = url;
      setNewProduct(prev => ({
        ...prev,
        images: newImages
      }));
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
    }
  };

  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { url } = await uploadToCloudinary(file);
      setNewProduct(prev => ({
        ...prev,
        image: url
      }));
      setMainImage(url);
    } catch (error) {
      console.error('Error uploading main image:', error);
    }
  };

  const handleSave = async () => {
    if (!newProduct.name || !newProduct.price || newProduct.price === '₦0') {
      alert('Please fill in at least the product name and price.');
      return;
    }

    // main image must be provided before saving
    if (!mainImage || mainImage.trim() === '') {
      alert('Main product image is required. Please upload an image before adding the product.');
      return;
    }

    // description must be provided before saving
    if (!newProduct.description || newProduct.description.trim() === '') {
      alert('Product description is required. Either type one or generate using the bot.');
      return;
    }

    const payload = {
      ...newProduct,
      inStock,
    };
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        // Broadcast to all pages (including admin) that products have been updated
        window.dispatchEvent(new CustomEvent('productsChanged', { detail: { timestamp: Date.now() } }));
        
        // Close the modal after a brief moment to show success
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        // try to extract useful information
        let errorData: any = null;
        let rawText: string | null = null;
        try {
          rawText = await response.text();
          errorData = rawText ? JSON.parse(rawText) : null;
        } catch (parseErr) {
          console.error('Could not parse response body as JSON', parseErr, 'raw:', rawText);
        }
        console.error('API Error status', response.status, 'body', errorData || rawText);
        // some backend errors include a JSON string inside `details` field
        let userMsg = errorData?.error || rawText || 'Unknown error';
        if (errorData?.details) {
          // try to parse details if it looks like JSON
          try {
            const parsed = JSON.parse(errorData.details);
            userMsg = parsed?.message || errorData.details;
          } catch {
            userMsg = errorData.details;
          }
        }
        alert(`Failed to add product (status ${response.status}): ${userMsg}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Error adding product: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-gray-900 ${
      isSizeDropdownOpen || isAvailableDropdownOpen || isColorDropdownOpen ? 'z-[60]' : 'z-50'
    } overflow-y-auto`} onClick={isSaving ? undefined : onClose}>
      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto mb-4"></div>
            <p className="text-white">Adding product...</p>
          </div>
        </div>
      )}

      <div
        className="bg-gray-800 min-h-screen w-full"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="px-4 py-4 pt-10 border-b border-gray-700 flex items-center sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>
            <h2 className="text-xl font-semibold text-white">Add New Product</h2>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
          {/* Image Upload Section */}
          <div className={isSizeDropdownOpen || isRatingDropdownOpen || isAvailableDropdownOpen ? 'filter blur-sm pointer-events-none' : ''}>
            <label className="block text-gray-300 text-sm font-medium mb-4">
              Product Images <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-400 text-xs mb-2">Main Image <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="w-full h-64 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Main product"
                        className="w-full h-full object-cover rounded-lg"
                        onError={() => setDisplayImage('')}
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto text-gray-400" size={24} />
                      </div>
                    )}
                  </div>
                  {displayImage && (
                    <button
                      onClick={() => (document.querySelector('input[type="file"]') as HTMLElement)?.click()}
                      className="absolute top-2 right-2 p-2 bg-gray-800 bg-opacity-80 rounded-lg hover:bg-opacity-100 transition-colors"
                      title="Edit main image"
                    >
                      <Edit className="text-white" size={16} />
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setThumbnailImages(['', '', '', '']);
                      setNewProduct(prev => ({
                        ...prev,
                        images: ['', '', '', '']
                      }));
                      // thumbnails cleared already since we reset urls
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors w-full"
                  >
                    Reset Thumbnails
                  </button>
                </div>
              </div>

              <div className="w-20 flex flex-col gap-2">
                <label className="block text-gray-400 text-xs mb-2">
                  Thumbnails (4)
                </label>
                <div className="flex-1 space-y-2">
                  {thumbnailImages.map((thumbnail, index) => {
                    return (
                    <div key={index} className="relative flex-1">
                      <div 
                        className={`w-full h-16 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                          selectedThumbnailIndex === index 
                            ? 'border-4 border-amber-600 border-solid' 
                            : 'border-2 border-dashed border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => {
                          if (index === 0) {
                            // Thumbnail 1 - show main image in display position
                            setDisplayImage(mainImage);
                            setSelectedThumbnailIndex(0);
                          } else if (thumbnail && thumbnail.trim() !== '' && (thumbnail.startsWith('http') || thumbnail.startsWith('blob:'))) {
                            // Thumbnails 2, 3, 4 - only update display image, don't replace thumbnail 1
                            setDisplayImage(thumbnail);
                            setNewProduct({ ...newProduct, image: thumbnail });
                            // Don't update mainImage - keep thumbnail 1 as is
                            setSelectedThumbnailIndex(index);
                          } else {
                            // Empty thumbnails - just set selected index
                            setSelectedThumbnailIndex(index);
                          }
                        }}
                      >
                        {index === 0 ? (
                          // Thumbnail 1 - always show main image (they are always the same)
                          mainImage && mainImage.trim() !== '' && (mainImage.startsWith('http') || mainImage.startsWith('blob:')) ? (
                            <div className="relative">
                              <img
                                src={mainImage}
                                alt="Main thumbnail"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          ) : (
                            <div className="text-center">
                              <Plus className="mx-auto text-gray-400" size={20} />
                            </div>
                          )
                        ) : (
                          // Thumbnails 2, 3, 4 - show image if exists and is valid, otherwise Upload icon
                          thumbnail && thumbnail.trim() !== '' && (thumbnail.startsWith('http') || thumbnail.startsWith('blob:')) ? (
                            <div className="relative">
                              <img
                                src={thumbnail}
                                alt="Additional thumbnail"
                                className="w-full h-full object-cover rounded-lg cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Only update display image, don't replace thumbnail 1
                                  setDisplayImage(thumbnail);
                                  setNewProduct({ ...newProduct, image: thumbnail });
                                  setSelectedThumbnailIndex(index);
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const newThumbs = [...thumbnailImages];
                                  newThumbs[index] = '';
                                  setThumbnailImages(newThumbs);
                                  // Reset selected thumbnail when image is deleted
                                  setSelectedThumbnailIndex(null);
                                }}
                              />
                            </div>
                          ) : (
                            <div className="text-center">
                              <Upload className="mx-auto text-gray-400" size={20} />
                            </div>
                          )
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleThumbnailUpload(index, event)}
                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${index === 0 || (index > 0 && thumbnail && thumbnail.trim() !== '' && (thumbnail.startsWith('http') || thumbnail.startsWith('blob:'))) ? 'pointer-events-none' : ''}`}
                      />
                    </div>
                    );
                  })}
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Upload up to 4 additional images
                </p>
              </div>
            </div>
          </div>

          {/* Product fields (name, price, etc.) */}
          <div className={isSizeDropdownOpen ? 'hidden' : isRatingDropdownOpen || isAvailableDropdownOpen ? 'filter blur-sm pointer-events-none' : ''}>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: capitalizeWords(e.target.value) })
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter product name"
            />
          </div>

          <div className={isSizeDropdownOpen || isRatingDropdownOpen || isAvailableDropdownOpen ? "filter blur-sm pointer-events-none" : ""}>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Price (₦) *
            </label>
            <input
              type="text"
              value={newProduct.price || '₦0'}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^\d]/g, '');
                setNewProduct({
                  ...newProduct,
                  price: numericValue ? `₦${parseInt(numericValue).toLocaleString()}` : '₦0'
                });
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter price"
            />
          </div>

          <div className={isSizeDropdownOpen || isAvailableDropdownOpen ? "filter blur-sm pointer-events-none" : ""}>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Rating
            </label>
            <div className={`relative ${isRatingDropdownOpen ? 'mb-20' : ''}`} ref={ratingRef}>
              <button
                type="button"
                onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 flex items-center justify-between"
              >
                <span className={newProduct.rating ? "text-white" : "text-gray-400"}>{newProduct.rating || 'Select Rating'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isRatingDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isRatingDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg p-2 z-50">
                  <div className="space-y-1">
                    {[4.2, 4.5, 4.7, 4.9].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        className="w-full px-3 py-2 rounded-lg text-sm transition-colors text-left bg-gray-600 hover:bg-gray-500 text-white"
                        onClick={() => {
                          setNewProduct({ ...newProduct, rating });
                          setIsRatingDropdownOpen(false);
                        }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={isSizeDropdownOpen || isRatingDropdownOpen ? "filter blur-sm pointer-events-none" : ""}>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Available
            </label>
            <div className={`relative ${isAvailableDropdownOpen ? 'mb-20' : ''}`} ref={availableRef}>
              <button
                type="button"
                onClick={() => setIsAvailableDropdownOpen(!isAvailableDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 flex items-center justify-between"
              >
                <span className={inStock ? 'text-green-400' : 'text-red-400'}>
                  {inStock ? 'Yes' : 'No'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isAvailableDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isAvailableDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg p-2 z-50">
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="w-full px-3 py-2 rounded-lg text-sm transition-colors text-left bg-gray-600 hover:bg-gray-500 text-white"
                      onClick={() => {
                        setInStock(true);
                        setNewProduct({ ...newProduct, inStock: true });
                        setIsAvailableDropdownOpen(false);
                      }}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className="w-full px-3 py-2 rounded-lg text-sm transition-colors text-left bg-gray-600 hover:bg-gray-500 text-white"
                      onClick={() => {
                        setInStock(false);
                        setNewProduct({ ...newProduct, inStock: false });
                        setIsAvailableDropdownOpen(false);
                      }}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={isSizeDropdownOpen ? 'hidden' : isRatingDropdownOpen || isAvailableDropdownOpen ? 'filter blur-sm pointer-events-none' : ''}>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              rows={4}
              className={`w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none ${
                newProduct.description && newProduct.description.trim() !== ''
                  ? 'border border-gray-600 focus:border-blue-500'
                  : 'border-2 border-red-600 focus:border-red-500'
              }`}
              placeholder="Enter product description"
            />
            <p className="text-red-500 text-xs mt-1">Required</p>
            <button
              type="button"
              className="mt-2 px-4 py-2 bg-transparent border border-blue-500 text-blue-500 rounded-lg transition-colors text-sm flex items-center gap-2"
              onClick={() => {
                // Check if product name exists first
                if (!newProduct.name || newProduct.name.trim() === '') {
                  alert('Please enter a product name first before generating a description.');
                  return;
                }
                
                setIsGeneratingDescription(true);
                setTimeout(() => {
                  const randomTemplate = descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)];
                  const description = randomTemplate.replace('{productName}', newProduct.name || 'product');
                  setNewProduct({ ...newProduct, description });
                  setHasGeneratedDescription(true);
                  setIsGeneratingDescription(false);
                }, 4000);
              }}
            >
              {isGeneratingDescription ? (
                <>
                  <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Generating please wait
                </>
              ) : (
                <>
                  <Bot size={16} />
                  {hasGeneratedDescription ? 'Generate again' : 'Use auto description'}
                </>
              )}
            </button>
          </div>

          <div ref={colorRef} className={isSizeDropdownOpen ? 'filter blur-sm pointer-events-none' : isColorDropdownOpen ? 'mb-20' : isRatingDropdownOpen || isAvailableDropdownOpen ? 'filter blur-sm pointer-events-none' : ''}>
            <label className="block text-gray-300 text-sm font-medium mb-2">Color</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 flex items-center justify-between"
              >
                <span className={newProduct.colors && newProduct.colors.length > 0 ? 'text-white' : 'text-gray-400'}>
                  {newProduct.colors && newProduct.colors.length > 0 ? newProduct.colors.filter(c => colors.includes(c)).join(', ') : 'Select colors'}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition-transform ${isColorDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isColorDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg p-2 z-50">
                  <div className="grid grid-cols-2 gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        disabled={color === 'Black' && newProduct.colors?.includes(color)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          newProduct.colors && newProduct.colors.includes(color)
                            ? color === 'Black'
                              ? 'border-2 border-amber-600 text-white bg-transparent cursor-not-allowed opacity-75'
                              : 'border-2 border-amber-600 text-white bg-transparent'
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                        onClick={() => {
                          if (color === 'Black') return; // Prevent Black from being deselected
                          const currentColors = newProduct.colors || [];
                          let newColors;
                          if (currentColors.includes(color)) {
                            newColors = currentColors.filter(c => c !== color);
                          } else {
                            newColors = [...currentColors, color];
                          }
                          setNewProduct({ ...newProduct, colors: newColors });
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-transparent border border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white rounded-lg transition-colors"
                      onClick={() => setNewProduct({ ...newProduct, colors: ['Black'] })}
                    >
                      Deselect All
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 ${colorButtonText === "Save Changes" ? "bg-green-700 hover:bg-green-800" : "bg-amber-600 hover:bg-amber-700"} text-white rounded-lg transition-colors`}
                      onClick={() => {
                        if (colorButtonText === "Select All") {
                          setNewProduct({ ...newProduct, colors });
                          modalRef.current?.scrollTo({ top: modalRef.current.scrollHeight, behavior: 'auto' });
                        } else {
                          setIsColorDropdownOpen(false);
                        }
                      }}
                    >
                      {colorButtonText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div ref={sizeRef} className={isSizeDropdownOpen ? 'mb-20' : isRatingDropdownOpen || isAvailableDropdownOpen ? 'filter blur-sm pointer-events-none' : ''}>
            <label className="block text-gray-300 text-sm font-medium mb-2">Lengths</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 flex items-center justify-between"
              >
                {(newProduct.sizes && newProduct.sizes.length > 0) ? (
                  <span>{newProduct.sizes.join(', ')}</span>
                ) : (
                  <span className="text-gray-400">Select Length</span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isSizeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSizeDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg p-2 z-50">
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          (newProduct.sizes || []).includes(size)
                            ? 'border-2 border-amber-600 text-white bg-transparent'
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                        onClick={() => {
                          const currentSizes = newProduct.sizes || [];
                          let newSizes;
                          if (currentSizes.includes(size)) {
                            newSizes = currentSizes.filter(s => s !== size);
                          } else {
                            newSizes = [...currentSizes, size];
                          }
                          setNewProduct({ ...newProduct, sizes: newSizes });
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      className="px-4 py-2 bg-transparent border border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white rounded-lg transition-colors"
                      onClick={() => setNewProduct({ ...newProduct, sizes: [] })}
                    >
                      Deselect All
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 ${sizeButtonText === "Save Changes" ? "bg-green-700 hover:bg-green-800" : "bg-amber-600 hover:bg-amber-700"} text-white rounded-lg transition-colors`}
                      onClick={() => {
                        if (sizeButtonText === "Select All") {
                          setNewProduct({ ...newProduct, sizes });
                          modalRef.current?.scrollTo({ top: modalRef.current.scrollHeight, behavior: 'auto' });
                        } else {
                          setIsSizeDropdownOpen(false);
                        }
                      }}
                    >
                      {sizeButtonText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`${isSizeDropdownOpen || isRatingDropdownOpen || isAvailableDropdownOpen ? "filter blur-sm pointer-events-none" : ""} ${isSizeDropdownOpen ? "mb-20" : ""}`}>
            <label className="block text-gray-300 text-sm font-medium mb-2">Badge</label>
            <div className={`relative ${isBadgeDropdownOpen ? 'mb-20' : ''}`} ref={badgeRef}>
              <button
                type="button"
                onClick={() => setIsBadgeDropdownOpen(!isBadgeDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 flex items-center justify-between"
              >
                <span className={newProduct.badge && newProduct.badge !== 'None' ? 'text-white' : 'text-gray-400'}>
                  {newProduct.badge && newProduct.badge !== 'None' ? newProduct.badge : 'None'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isBadgeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isBadgeDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg p-2 z-50">
                  <div className="space-y-1">
                    {badgeOptions.map(badge => (
                      <button
                        key={badge}
                        type="button"
                        className="w-full px-3 py-2 rounded-lg text-sm transition-colors text-left bg-gray-600 hover:bg-gray-500 text-white"
                        onClick={() => {
                          setNewProduct({ ...newProduct, badge: badge === 'None' ? '' : badge });
                          setIsBadgeDropdownOpen(false);
                        }}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isSizeDropdownOpen && !isBadgeDropdownOpen && !isRatingDropdownOpen && !isAvailableDropdownOpen && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !mainImage || !newProduct.description || newProduct.description.trim() === ''}
                className={`px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed ${hasChanges ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-800' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800'} text-white rounded-lg transition-colors`}
              >
                {isSaving ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
