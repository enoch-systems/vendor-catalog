"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Upload,
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
  Settings as SettingsIcon,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Product, getAllProducts } from '@/lib/products';
import { useAuth } from '@/contexts/auth-context';

import EditProductModal from './EditProductModal';
import AddProductModal from './AddProductModal';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const itemsPerPage = 10;

  const { user, signOut, loading: authLoading } = useAuth();
  const currentPath = '/admin/products';
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/admin/login';
    }
  }, [user, authLoading]);

  const menuItems = [
    { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  ];
  
  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await getAllProducts();
        setProducts(Array.isArray(allProducts) ? allProducts : []);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);
  // Refresh products from database
  const refreshProducts = async () => {
    try {
      const allProducts = await getAllProducts();
      setProducts(Array.isArray(allProducts) ? allProducts : []);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  };

  // Clear product cache from localStorage to force refresh on other pages
  const clearProductCache = () => {
    localStorage.removeItem('featuredProducts');
    localStorage.removeItem('shopProducts');
    // Broadcast to other tabs/windows that products have been updated
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('productsUpdated', Date.now().toString());
      // Also dispatch a custom event for same-window listeners
      window.dispatchEvent(new CustomEvent('productsChanged', { detail: { timestamp: Date.now() } }));
    }
  };

  // Scroll to top smoothly on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // lock scroll when confirmation modal open
  useEffect(() => {
    if (productToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [productToDelete]);

  // Listen for product updates (for immediate refresh when product is edited/added/deleted)
  useEffect(() => {
    const handleProductsChanged = async () => {
      await refreshProducts();
    };

    window.addEventListener('productsChanged', handleProductsChanged);
    return () => window.removeEventListener('productsChanged', handleProductsChanged);
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle product editing
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  // Handle product saving
  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        await refreshProducts();
        clearProductCache();
        setEditingProduct(null);
        alert('Product updated successfully!');
      } else {
        const errorMsg = data.error || data.details || 'Unknown error occurred';
        console.error('Update failed:', errorMsg);
        alert(`Failed to update product: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle product deletion request (opens confirmation modal)
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsDeletingProduct(true);
      try {
        const response = await fetch('/api/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: productToDelete.id }),
        });
        const data = await response.json();

        if (response.ok && !data.error) {
          await refreshProducts();
          clearProductCache();
          alert('Product deleted successfully!');
        } else {
          console.error('Delete failed', data);
          alert('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      } finally {
        setIsDeletingProduct(false);
        setProductToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setProductToDelete(null);
  };

  // Handle adding new product
  const handleAddProduct = async (newProduct: Product) => {
    try {
      // const result = await createProduct({
      //   name: newProduct.name,
      //   price: parseFloat(newProduct.price.replace(/[^\d.]/g, '')),
      //   original_price: parseFloat(newProduct.originalPrice.replace(/[^\d.]/g, '')),
      //   rating: newProduct.rating,
      //   reviews: newProduct.reviews,
      //   thumbnail: newProduct.image,
      //   images: newProduct.images,
      //   description: newProduct.description,
      //   features: newProduct.features,
      //   colors: newProduct.colors,
      //   sizes: newProduct.sizes,
      //   available: newProduct.inStock,
      //   badge: newProduct.badge,
      //   category: newProduct.category
      // });
      
      // if (result) {
      //   await refreshProducts();
      //   setShowAddModal(false);
      //   alert('Product added successfully!');
      // } else {
      //   alert('Failed to add product');
      // }
      alert('Product creation functionality not available');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Deleting Overlay */}
      {isDeletingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-white">Deleting product...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Menu size={20} className="text-gray-300" />
          </button>

          {/* Logo */}
          <button onClick={() => window.location.reload()} className="flex items-center space-x-2">
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image 
                src="/wig.png" 
                alt="Logo" 
                width={32} 
                height={32} 
                className="h-8 w-auto object-contain"
                loading="lazy"
                decoding="async"
                sizes="32px"
                style={{
                  background: 'linear-gradient(to right, #374151 0%, #4b5563 50%, #374151 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite'
                }}
              />
            </div>
            <span className="text-white font-semibold text-lg">Wigga</span>
          </button>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">

            {/* Profile Dropdown */}
            <div className="relative profile-dropdown" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="relative w-8 h-8 flex-shrink-0">
                <Image 
                  src="/avatar.jpeg" 
                  alt="Profile" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                  sizes="32px"
                  style={{
                    background: 'linear-gradient(to right, #374151 0%, #4b5563 50%, #374151 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }}
                />
              </div>
                <ChevronDown size={16} className="text-gray-300" />
              </button>

              {/* Backdrop when dropdown is open */}
              {profileDropdownOpen && (
                <div
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  onClick={() => setProfileDropdownOpen(false)}
                />
              )}

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <Link
                    href="#"
                    className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      signOut();
                      setProfileDropdownOpen(false);
                    }}
                  >
                    <LogOut size={16} className="mr-3" />
                    <span>Log out</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Side Menu */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${
        menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        ></div>
        <div className="absolute left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link href="/admin/products" className="flex items-center space-x-2">
              <div className="relative h-8 w-8 flex-shrink-0">
                <Image 
                  src="/wig.png" 
                  alt="Logo" 
                  width={32} 
                  height={32} 
                  className="h-8 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                  sizes="32px"
                  style={{
                    background: 'linear-gradient(to right, #374151 0%, #4b5563 50%, #374151 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s ease-in-out infinite'
                  }}
                />
              </div>
              <span className="text-white font-semibold text-lg">Wigga</span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-300" />
            </button>
          </div>

          <nav className="p-4">
            {/* Back to Store Button */}
            <Link
              href="/"
              className="flex items-center p-3 mb-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors group"
              onClick={() => setMenuOpen(false)}
            >
              <ArrowLeft size={20} className="min-w-[20px]" />
              <span className="ml-3 font-medium">Back to Store</span>
            </Link>
            
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

      {/* Main Content */}
      <main className="pt-16 px-2 sm:px-4 lg:px-6 pb-20">
        {/* Page Header */}
        <div className="mb-6 pt-4 px-2 sm:px-0 text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 pt-6 sm:pt-8">Products Management</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your product catalog - add, edit, and remove products</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
            <div className="relative w-full sm:flex-1 sm:max-w-md lg:mb-10">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                style={{ fontSize: '16px' }}
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full sm:w-auto lg:mb-10 cursor-pointer"
            >
              <Plus size={16} className="mr-2" />
              Add Product
            </button>
          </div>

          {/* Top Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Prev
              </button>

              {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={`top-${pageNumber}`}
                    onClick={() => {
                      setCurrentPage(pageNumber)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading products please wait</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {/* 2 columns on mobile, 4 on tablet, 6 on desktop */}
        {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 max-w-8xl mx-auto lg:pr-20 lg:pl-20">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer" onClick={() => handleEditProduct(product)}>
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-gray-700">
                {product.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                        !product.inStock ? 'brightness-50' : ''
                      }`}
                      loading="lazy"
                      decoding="async"
                      quality={75}
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 17vw, 15vw"
                      style={{
                        background: 'linear-gradient(to right, #374151 0%, #4b5563 50%, #374151 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s ease-in-out infinite'
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  </div>
                )}
                
                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg z-10">
                    {product.badge}
                  </span>
                )}
                
                {/* Sold Out Badge */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-white px-3 py-1 rounded-full">
                      <span className="text-red-500 font-semibold text-sm">SOLD OUT</span>
                    </div>
                  </div>
                )}
                
                {/* Delete Button */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(product);
                    }}
                    className="p-2 bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <h3 className="text-white font-semibold text-xs sm:text-sm leading-tight line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors duration-200">
                  {product.name.charAt(0).toUpperCase() + product.name.slice(1).toLowerCase()}
                </h3>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-bold text-blue-400">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs sm:text-sm text-gray-400 line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                    {product.inStock !== undefined && (
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                        <span className={`text-xs ${product.inStock ? 'text-green-400' : 'text-red-400'} font-medium`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProduct(product);
                    }}
                    className="px-3 py-2 bg-transparent border border-amber-800 hover:bg-amber-800 text-amber-800 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 w-full cursor-pointer"
                  >
                    <Edit size={14} />
                    <span className="text-xs font-medium">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products found matching your search.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 mb-10">
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Prev
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => {
                      setCurrentPage(pageNumber)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!productToDelete}
        title="Delete Product"
        message={
          <>
            <p>Are you sure you want to delete this product?</p>
            <p className="mt-2 text-red-400">
              This product will be lost forever, you know? Yes or no, you understand?
            </p>
          </>
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        disabled={isDeletingProduct}
      />
    </div>
  );
};



export default AdminProducts;
