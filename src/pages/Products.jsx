// pages/Products.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import productsAPI from '../services/productsAPI';
import categoriesAPI from '../services/categoriesAPI';
import ProductModal from '../components/products/ProductModal';

const Products = ({ onLogout, userData }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedShop, setSelectedShop] = useState('all');
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadShops();
  }, [activeTab, searchTerm, selectedCategory, sortBy, selectedShop]);

    // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };
  
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        status: activeTab !== 'all' ? activeTab : undefined,
        q: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy,
        shop: selectedShop !== 'all' ? selectedShop : undefined
      };

      // Clean up undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await productsAPI.getShopProducts(params);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      // FIX: Ensure categories is always an array
      const categoriesData = response.data || response || [];
      console.log('Categories response:', response);
      console.log('Categories data:', categoriesData);
      console.log('Is array?', Array.isArray(categoriesData));
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else if (categoriesData && Array.isArray(categoriesData.categories)) {
        // If response has nested categories array
        setCategories(categoriesData.categories);
      } else if (categoriesData && categoriesData.success && Array.isArray(categoriesData.data)) {
        // If response has success field with data array
        setCategories(categoriesData.data);
      } else {
        // If response is object, convert values to array
        const categoriesArray = Object.values(categoriesData);
        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]); // Set empty array on error
    }
  };
  
  
// pages/Products.jsx - handleStockUpdate function
const handleStockUpdate = (updatedProduct) => {
  console.log('🔄 handleStockUpdate called with:', updatedProduct);
  
  // 1. Update products array mein stock
  setProducts(prevProducts => 
    prevProducts.map(p => 
      p._id === updatedProduct._id 
        ? { ...p, stockQuantity: updatedProduct.stockQuantity }
        : p
    )
  );
  
  // 2. Update selectedProduct agar modal open hai
  if (selectedProduct?._id === updatedProduct._id) {
    console.log('✅ Updating selected product in modal');
    setSelectedProduct(prev => ({
      ...prev,
      stockQuantity: updatedProduct.stockQuantity
    }));
  }
  
  // 3. Low stock status update karein
  const updatedProductObj = products.find(p => p._id === updatedProduct._id);
  if (updatedProductObj) {
    // Agar stock 10 se kam hai to low stock tab update ho
    if (updatedProduct.stockQuantity <= 10 && updatedProductObj.stockQuantity > 10) {
      console.log('📉 Product now low in stock');
    } else if (updatedProduct.stockQuantity > 10 && updatedProductObj.stockQuantity <= 10) {
      console.log('📈 Product no longer low in stock');
    }
  }
};


  const loadShops = async () => {
    try {
      // For now, if you have shops API, use it. Otherwise, set empty
      setShops([]);
    } catch (error) {
      console.error('Error loading shops:', error);
      setShops([]);
    }
  };

  const handleAddProduct = () => {
    const token = localStorage.getItem('shopOwnerToken');
    if (!token) {
      alert('Please login to add products');
      navigate('/login');
      return;
    }
    
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const accountStatus = userData.accountStatus || 'Pending';
    const isAccountApproved = accountStatus === 'Active' || accountStatus === 'Verified' || accountStatus === 'active' || accountStatus === 'verified';
    
    console.log('📊 Add product check:', {
      accountStatus,
      isAccountApproved
    });
    
    if (!isAccountApproved) {
      alert('Please wait for admin approval before adding products.');
      navigate('/pending-approval');
      return;
    }
    
    console.log('✅ Account approved - navigating to add product');
    navigate('/add-product');
  };

  // Open modal with product details
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };



  // Publish Draft Product
  const handlePublishProduct = async (productId, productTitle) => {
    if (!window.confirm(`Publish "${productTitle}"?`)) return;
    
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await productsAPI.updateProductStatus(productId, { status: 'published' });
      
      if (response.data.success) {
        alert('✅ Product published successfully!');
        loadProducts();
        if (selectedProduct?._id === productId) {
          setSelectedProduct(prev => ({ ...prev, status: 'published' }));
        }
      } else {
        alert(response.data.message || 'Failed to publish product');
      }
    } catch (error) {
      console.error('❌ Error publishing product:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('shopOwnerToken');
        localStorage.removeItem('userData');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to update this product.');
      } else if (error.response?.status === 404) {
        alert('Product not found. It may have been deleted.');
        loadProducts();
      } else {
        alert(error.response?.data?.message || 'Failed to publish product');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Move to Draft
  const handleMoveToDraft = async (productId, productTitle) => {
    if (!window.confirm(`Move "${productTitle}" to draft?`)) return;
    
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await productsAPI.updateProductStatus(productId, { status: 'draft' });
      
      if (response.data.success) {
        alert(' Product moved to draft!');
        loadProducts();
        if (selectedProduct?._id === productId) {
          setSelectedProduct(prev => ({ ...prev, status: 'draft' }));
        }
      } else {
        alert(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('❌ Error moving to draft:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('shopOwnerToken');
        localStorage.removeItem('userData');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to update this product.');
      } else if (error.response?.status === 404) {
        alert('Product not found. It may have been deleted.');
        loadProducts();
      } else {
        alert(error.response?.data?.message || 'Failed to update product');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, productTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${productTitle}"?\nThis action cannot be undone.`)) return;
    
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await productsAPI.deleteProduct(productId);
      
      if (response.data.success) {
        alert(' Product deleted successfully!');
        loadProducts();
        if (selectedProduct?._id === productId) {
          handleCloseModal();
        }
      } else {
        alert(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('shopOwnerToken');
        localStorage.removeItem('userData');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to delete this product.');
      } else if (error.response?.status === 404) {
        alert('Product not found. It may have been deleted.');
        loadProducts();
      } else {
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getStatusBadge = (status, stockQuantity) => {
    if (stockQuantity <= 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ 
          backgroundColor: '#FFFAEB', 
          color: '#856404',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 500
        }}>
          Low Stock
        </span>
      );
    }

    const statusConfig = {
      published: { 
        bgColor: 'rgba(39, 200, 64, 0.1)', 
        textColor: '#27C840', 
        text: 'Published' 
      },
      draft: { 
        bgColor: 'rgba(85, 85, 85, 0.1)', 
        textColor: '#555555', 
        text: 'Draft' 
      },
      archived: { 
        bgColor: '#FFFAEB', 
        textColor: '#856404', 
        text: 'Archived' 
      }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ 
        backgroundColor: config.bgColor, 
        color: config.textColor,
        fontFamily: "'Metropolis', sans-serif",
        fontWeight: 500
      }}>
        {config.text}
      </span>
    );
  };

  const displayCategory = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'object' && category.category_name) return category.category_name;
    if (typeof category === 'object' && category.name) return category.name;
    if (typeof category === 'string') return category;
    return 'Uncategorized';
  };

  // Filter products based on active tab
  const filteredProducts = products.filter(product => {
    if (activeTab === 'all') return product.status !== 'draft';
    if (activeTab === 'published') return product.status === 'published';
    if (activeTab === 'draft') return product.status === 'draft';
    if (activeTab === 'low-stock') return product.stockQuantity <= 10;
    return true;
  });

  // Updated stats calculation
  const publishedProducts = products.filter(p => p.status === 'published');
  const draftProducts = products.filter(p => p.status === 'draft');
  const lowStockProducts = products.filter(p => p.stockQuantity <= 10);
  const allPublishedProducts = products.filter(p => p.status !== 'draft');

  const stats = [
    { 
      label: "Published Products", 
      value: publishedProducts.length,
      change: "+5", 
      changeType: 'positive',
      color: 'bg-gradient-to-r from-gray to-black-800'
    },
    { 
      label: "Low Stock Items", 
      value: lowStockProducts.length, 
      change: "+2", 
      changeType: 'negative',
      color: 'bg-gradient-to-r from-gray to-black-800'
    },
    { 
      label: "Draft Products", 
      value: draftProducts.length, 
      change: "-3", 
      changeType: 'positive',
     color: 'bg-gradient-to-r from-gray to-black-800'
    },
    { 
      label: "Total Products", 
      value: allPublishedProducts.length,
      change: "+12%", 
      changeType: 'positive',
      color: 'bg-gradient-to-r from-gray to-black-800'
    }
  ];

  return (
    <Layout onLogout={onLogout} userData={userData}>
      {/* Header */}
      <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>Product Listings</h1>
          <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>Manage and track all your products</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="flex items-center px-4 py-2 mt-4 space-x-2 text-white transition-all duration-300 transform rounded-lg md:mt-0 hover:scale-[1.02] hover:shadow-lg focus:outline-none"
          style={{ 
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 500
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Product</span>
        </button>
      </div>

     {/* Stats Cards - UPDATED WITHOUT CHANGE TEXT */}
<div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat, index) => (
    <div 
      key={index} 
      className={`p-6 border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] ${stat.color}`}
      style={{ borderColor: '#e5e7eb' }}
    >
      <p className="mb-2 text-sm font-medium" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>{stat.label}</p>
      <p className="mb-2 text-2xl font-bold" style={{ 
        color: stat.label === 'Total Products' ? '#555555' : '#000000', 
        fontFamily: "'Metropolis', sans-serif", 
        fontWeight: 700 
      }}>
        {stat.value}
      </p>
    </div>
  ))}
</div>

      {/* Tabs - Enhanced with smooth animation */}
      <div className="mb-6">
        <div className="border-b" style={{ borderColor: '#bebebeff' }}>
          <nav className="flex -mb-px space-x-8">
            {[
              { id: 'all', name: 'All Products', count: allPublishedProducts.length },
              { id: 'published', name: 'Published', count: publishedProducts.length },
              { id: 'draft', name: 'Drafts', count: draftProducts.length },
              { id: 'low-stock', name: 'Low Stock', count: lowStockProducts.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 focus:outline-none ${
                  activeTab === tab.id
                    ? 'text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ 
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  borderBottomColor: activeTab === tab.id ? '#bebebeff' : 'transparent'
                }}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 py-0.5 px-2 text-xs rounded-full transition-all duration-300" style={{ 
                    backgroundColor: activeTab === tab.id ? '#bebebeff' : '#555555',
                    color: activeTab === tab.id ? '#fff' : '#fff',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500
                  }}>
                    {tab.count}
                  </span>
                )}
                {/* Animated underline */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-400 to-gray-500 animate-pulse"></span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Filters - Enhanced */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 transition-all duration-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent hover:border-gray-400"
              style={{ 
                borderColor: '#d1d5db',
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400
              }}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#555555' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 transition-all duration-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent hover:border-gray-400"
          style={{ 
            borderColor: '#d1d5db',
            color: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 400
          }}
        >
          <option value="all">All Categories</option>
          {/* FIXED: Safely map over categories array */}
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map(category => (
              <option key={category._id || category.category_id} value={category.category_name || category.name}>
                {category.category_name || category.name}
              </option>
            ))
          ) : (
            <option value="" disabled>No categories available</option>
          )}
        </select>
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 transition-all duration-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent hover:border-gray-400"
          style={{ 
            borderColor: '#d1d5db',
            color: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 400
          }}
        >
          <option value="newest">Sort by: Newest</option>
          <option value="priceAsc">Sort by: Price (Low to High)</option>
          <option value="priceDesc">Sort by: Price (High to Low)</option>
          <option value="nameAsc">Sort by: Name (A-Z)</option>
          <option value="nameDesc">Sort by: Name (Z-A)</option>
        </select>
      </div>

      {/* Shop Filter */}
      {shops.length > 0 && (
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
            Filter by Shop
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedShop('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none ${
                selectedShop === 'all'
                  ? 'text-white'
                  : 'text-gray-700 hover:opacity-90'
              }`}
              style={{ 
                backgroundColor: selectedShop === 'all' ? '#27C840' : 'rgba(85, 85, 85, 0.1)',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
              All Shops
            </button>
            {shops.map(shop => (
              <button
                key={shop._id}
                onClick={() => setSelectedShop(shop._id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none ${
                  selectedShop === shop._id
                    ? 'text-white'
                    : 'text-gray-700 hover:opacity-90 hover:bg-gray-100'
                }`}
                style={{ 
                  backgroundColor: selectedShop === shop._id ? '#27C840' : 'rgba(85, 85, 85, 0.1)',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500
                }}
              >
                {shop.shopName}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-gray-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>Loading products...</p>
        </div>
      ) : (
        <>
          {/* Products Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
              Showing {filteredProducts.length} {activeTab === 'all' ? 'published' : activeTab} products
            </p>
          </div>

          {/* UPDATED: Product Grid with View Product Button */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                className="relative flex flex-col overflow-hidden transition-all duration-300 transform bg-white border rounded-lg cursor-pointer group hover:shadow-xl hover:-translate-y-1"
                style={{ 
                  borderColor: '#e5e7eb',
                  minHeight: '320px'
                }}
              >
                {/* Product Image Container - Fixed Size */}
                <div className="relative pt-[100%] bg-gradient-to-b from-gray-50 to-white">
                  <img
                    src={product.imagePath || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'}
                    alt={product.title}
                    className="absolute inset-0 object-contain w-full h-full p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Status Badge - Top Right with animation */}
                  <div className="absolute top-2 right-2">
                    {product.stockQuantity <= 10 && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white rounded-full animate-pulse" style={{ 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                      }}>
                        Low Stock
                      </span>
                    )}
                  </div>
                  
                  {/* Draft Badge - Top Left */}
                  {product.status === 'draft' && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white rounded-full" style={{ 
                        background: 'linear-gradient(135deg, #555555 0%, #333333 100%)',
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500
                      }}>
                        Draft
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details - Fixed Height */}
                <div className="flex flex-col flex-1 p-3">
                  {/* Product Title - 2 lines max */}
                  <h3 
                    className="mb-1 text-sm font-medium transition-colors duration-300 line-clamp-2 group-hover:text-gray-600"
                    style={{ 
                      color: '#1f2937',
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                      minHeight: '2.5rem'
                    }}
                    title={product.title}
                  >
                    {product.title}
                  </h3>

                  {/* Category - Single line */}
                  <div className="mb-1">
                    <span className="text-xs transition-colors duration-300 group-hover:text-gray-700" style={{ color: '#6b7280', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                      {displayCategory(product.category)}
                    </span>
                  </div>

                  {/* Price with glow effect */}
                  <div className="mt-auto">
                    <div className="flex items-center">
                      <span 
                        className="text-base font-bold transition-all duration-300 group-hover:text-gray-600 group-hover:scale-105"
                        style={{ 
                          color: '#000000',
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 700
                        }}
                      >
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </span>
                      {product.stockQuantity <= 10 && (
                        <span className="ml-2 text-xs font-medium text-red-600 animate-pulse">
                           Low
                        </span>
                      )}
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span style={{ color: '#6b7280' }}>
                        {product.sku ? `SKU: ${product.sku}` : ''}
                      </span>
                      <span className={`font-medium transition-colors duration-300 ${product.stockQuantity <= 10 ? 'text-red-600' : 'text-black'}`}>
                        {product.stockQuantity} left
                      </span>
                    </div>

                    {/* View Product Button - Always visible with gray animation */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="w-full px-3 py-2 mt-2 text-xs font-medium text-white transition-all duration-300 transform rounded-lg hover:scale-[1.02] hover:shadow-lg focus:outline-none active:scale-95"
                      style={{ 
                        background: 'black',
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500
              
                      }}
                    >
                      View Product
                    </button>
                  </div>
                </div>

                {/* gray glow effect on hover */}
                <div className="absolute inset-0 transition-opacity duration-300 rounded-lg opacity-0 pointer-events-none bg-gradient-to-r from-gray-500/5 to-emerald-500/5 group-hover:opacity-100"></div>
              </div>
            ))}
          </div>

          {/* Empty State - Enhanced */}
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center transition-all duration-300 animate-fade-in">
              <div className="relative inline-block mb-4">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-50 to-gray-100">
                  <svg className="w-10 h-10" fill="none" stroke="#555555" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-gray-200 rounded-full animate-ping opacity-20"></div>
              </div>
              <h3 className="mb-2 text-lg font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                {activeTab === 'draft' ? 'No draft products' : 
                 activeTab === 'low-stock' ? 'No low stock products' : 
                 activeTab === 'published' ? 'No published products' :
                 'No published products found'}
              </h3>
              <p className="max-w-md mx-auto mb-6 text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                {activeTab === 'draft' ? 'Get started by saving a product as draft.' : 
                 activeTab === 'low-stock' ? 'All products have sufficient stock.' : 
                 activeTab === 'published' ? 'No published products available.' :
                 'Get started by adding your first product.'}
              </p>
              <button 
                onClick={handleAddProduct}
                className="px-6 py-3 text-white transition-all duration-300 transform rounded-lg hover:scale-[1.02] hover:shadow-xl focus:outline-none"
                style={{ 
                  background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                Add New Product
              </button>
            </div>
          )}
        </>
      )}

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onEdit={() => navigate(`/update-product/${selectedProduct._id}`)}
          onDelete={() => handleDeleteProduct(selectedProduct._id, selectedProduct.title)}
          onPublish={() => handlePublishProduct(selectedProduct._id, selectedProduct.title)}
          onMoveToDraft={() => handleMoveToDraft(selectedProduct._id, selectedProduct.title)}
           onStockUpdate={handleStockUpdate}
          loading={actionLoading[selectedProduct._id]}
        />
      )}

      {/* Add Metropolis font styles and custom animations */}
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/metropolis');
        
        body {
          font-family: 'Metropolis', sans-serif;
        }
        
        /* Custom animations */
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(39, 200, 64, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(39, 200, 64, 0.4);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        /* Smooth transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        /* Line clamp utilities */
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        
        /* Custom focus styles */
        input:focus, select:focus, button:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </Layout>
  );
};

export default Products;