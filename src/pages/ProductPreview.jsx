// pages/ProductPreview.jsx - CLEANED UP VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productsAPI from '../services/productsAPI';

const ProductPreview = ({ onBack }) => {
  const [productData, setProductData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        setLoading(true);
        
        const savedData = localStorage.getItem('productPreviewData');
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          if (parsedData.productData) {
            setProductData(parsedData.productData);
          }
          
          // Process images - recreate File objects from base64
          if (parsedData.images && Array.isArray(parsedData.images)) {
            const urls = [];
            const files = [];
            
            for (let i = 0; i < parsedData.images.length; i++) {
              const imgData = parsedData.images[i];
              
              if (imgData.dataUrl) {
                try {
                  const file = await base64ToFile(
                    imgData.dataUrl,
                    imgData.name || `product-image-${i + 1}.jpg`,
                    imgData.type || 'image/jpeg'
                  );
                  files.push(file);
                  urls.push(imgData.dataUrl);
                } catch (error) {
                  console.error('Error converting image:', error);
                }
              }
            }
            
            setImageFiles(files);
            setImageUrls(urls);
          }
        } else {
          alert('No product data found. Please go back and create a product.');
        }
      } catch (error) {
        console.error('Error loading preview:', error);
        alert('Failed to load preview data. Please try creating the product again.');
      } finally {
        setLoading(false);
      }
    };

    loadPreviewData();
  }, []);

  // Helper function to convert base64 to File
  const base64ToFile = (base64String, fileName, mimeType) => {
    return new Promise((resolve, reject) => {
      try {
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const file = new File([blob], fileName, { type: mimeType });
        resolve(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  // API call to publish product
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      
      if (!productData) {
        throw new Error('No product data found');
      }

      const formData = new FormData();
      
      // Add all product data fields
      Object.keys(productData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (key !== '_id' && key !== '__v' && key !== 'shopName' && key !== 'createdAt') {
          formData.append(key, productData[key]);
        }
      });
      
      formData.append('status', 'published');
      
      // Add image if available
      if (imageFiles.length > 0 && imageFiles[0]) {
        formData.append('image', imageFiles[0]);
      } else {
        alert('Error: No product image found. Please add an image.');
        setIsPublishing(false);
        return;
      }

      const response = await productsAPI.createProduct(formData);
      
      if (response.data.success) {
        alert('✅ Product published successfully!');
        localStorage.removeItem('productPreviewData');
        navigate('/products');
      } else {
        throw new Error(response.data.message || 'Failed to publish product');
      }
    } catch (error) {
      console.error('Error publishing product:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to publish product. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // API call to save as draft
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      
      if (!productData) {
        throw new Error('No product data found');
      }

      const formData = new FormData();
      
      Object.keys(productData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (key !== '_id' && key !== '__v' && key !== 'shopName' && key !== 'createdAt') {
          formData.append(key, productData[key]);
        }
      });
      
      formData.append('status', 'draft');
      
      if (imageFiles.length > 0 && imageFiles[0]) {
        formData.append('image', imageFiles[0]);
      } else {
        alert('Error: No product image found for draft.');
        setIsSaving(false);
        return;
      }

      const response = await productsAPI.createProduct(formData);
      
      if (response.data.success) {
        alert('✅ Product saved as draft successfully!');
        localStorage.removeItem('productPreviewData');
        navigate('/products');
      } else {
        throw new Error(response.data.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to save draft. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleBack = () => {
    localStorage.removeItem('productPreviewData');
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Format currency for Canada (CAD)
  const formatPrice = (price) => {
    const numPrice = parseFloat(price) || 0;
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    const price = parseFloat(productData?.price) || 0;
    const discount = parseFloat(productData?.discount) || 0;
    if (discount > 0) {
      return price - (price * discount / 100);
    }
    return price;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50" style={{ fontFamily: "'Metropolis', sans-serif" }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-t-transparent animate-spin" style={{ borderColor: '#000000' }}></div>
          <h2 className="mb-2 text-2xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>Loading Preview...</h2>
          <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>Preparing your product preview</p>
        </div>
      </div>
    );
  }

  // If no product data
  if (!productData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50" style={{ fontFamily: "'Metropolis', sans-serif" }}>
        <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl" style={{ border: '1px solid #555555' }}>
          <div className="flex justify-center mb-6">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#FFFAEB' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-center" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>Preview Not Available</h2>
          <p className="mb-6 text-center text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
            No product data found for preview. Please go back and create a product first.
          </p>
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none"
            style={{ 
              backgroundColor: '#000000',
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Product Form
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice();
  const hasDiscount = productData.discount > 0;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Metropolis', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b shadow-sm" style={{ borderBottomColor: '#555555' }}>
        <div className="px-4 py-3 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                style={{ color: '#000000' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div className="flex items-center">
                  <img 
                    src="/images/zed-logo.png"
                    alt="ZED Logo"
                    className="w-6 h-6 mr-2"
                    style={{ objectFit: 'contain' }}
                  />
                  <span className="text-xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}></span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1.5 text-xs font-semibold text-white rounded-full" style={{ backgroundColor: '#555555' }}>
                PREVIEW MODE
              </span>
              
              <div className="relative group">
                <button className="flex items-center p-2 space-x-2 transition-colors rounded-lg hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#000000' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>{productData.shopName || 'Fashion House'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 mx-auto max-w-7xl">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>Product Preview</h1>
              <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>This is how your product will appear to customers</p>
            </div>
            <div className="flex items-center mt-4 md:mt-0">
              <span className="flex items-center px-4 py-2 font-medium rounded-lg" style={{ 
                color: '#000', 
                backgroundColor: '#e2e2e2ff',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Live Preview
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Product Images */}
          <div>
            <div className="overflow-hidden bg-white shadow-lg rounded-2xl" style={{ border: '1px solid #555555' }}>
              <div className="p-6">
                {imageUrls.length > 0 ? (
                  <>
                    {/* Main Image */}
                    <div className="relative mb-6 overflow-hidden rounded-xl h-96" style={{ backgroundColor: '#fff' }}>
                      <img
                        src={imageUrls[selectedImageIndex]}
                        alt={productData.title}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                      <div className="absolute px-3 py-1 text-sm font-medium text-black rounded-full top-4 right-4" style={{ backgroundColor: '#e2e2e2ff' }}>
                        {imageUrls.length} {imageUrls.length === 1 ? 'Image' : 'Images'}
                      </div>
                    </div>

                    {/* Image Navigation Dots */}
                    <div className="flex justify-center mb-8 space-x-2">
                      {imageUrls.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-3 h-3 rounded-full transition-all focus:outline-none ${
                            selectedImageIndex === idx 
                              ? 'scale-125' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          style={{ 
                            backgroundColor: selectedImageIndex === idx ? '#000000' : '',
                            fontFamily: "'Metropolis', sans-serif"
                          }}
                        />
                      ))}
                    </div>

                    {/* Thumbnails */}
                    {imageUrls.length > 1 && (
                      <div>
                        <h3 className="mb-4 text-lg font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>Product Images</h3>
                        <div className="flex pb-4 space-x-3 overflow-x-auto">
                          {imageUrls.map((url, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                                selectedImageIndex === idx 
                                  ? 'ring-2' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ 
                                borderColor: selectedImageIndex === idx ? '#000000' : '#555555',
                                ringColor: selectedImageIndex === idx ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                                fontFamily: "'Metropolis', sans-serif"
                              }}
                            >
                              <img
                                src={url}
                                alt={`Product view ${idx + 1}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mb-6">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#555555' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>No Images Available</h3>
                    <p className="max-w-md mx-auto mb-6 text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                      Could not load product images. Please go back and re-add images.
                    </p>
                    <button
                      onClick={handleBack}
                      className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none"
                      style={{ 
                        backgroundColor: '#000000',
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Go Back & Add Images
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Product Info Card */}
            <div className="p-6 bg-white shadow-lg rounded-2xl" style={{ border: '1px solid #555555' }}>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1.5 font-medium rounded-lg" style={{ 
                  backgroundColor: '#e2e2e2ff', 
                  color: '#555555',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500
                }}>
                  {productData.category || 'Uncategorized'}
                </span>
                {productData.status === 'draft' && (
                  <span className="px-3 py-1.5 font-medium rounded-lg flex items-center" style={{ 
                    backgroundColor: '#e2e2e2ff', 
                    color: '#bebebeff',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500
                  }}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Draft
                  </span>
                )}
                {productData.productType && (
                  <span className="px-3 py-1.5 font-medium rounded-lg" style={{ 
                    backgroundColor: '#e2e2e2ff', 
                    color: '#555555',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500
                  }}>
                    {productData.productType}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h2 className="mb-4 text-3xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                {productData.title || 'Untitled Product'}
              </h2>

              {/* Price Section */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  {hasDiscount ? (
                    <>
                      <span className="text-4xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                        {formatPrice(discountedPrice)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl line-through" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                          {formatPrice(productData.price)}
                        </span>
                        <span className="px-3 py-1.5 font-bold text-white rounded-lg" style={{ 
                          backgroundColor: '#555555',
                          fontFamily: "'Metropolis', sans-serif"
                        }}>
                          {productData.discount}% OFF
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-4xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                      {formatPrice(productData.price)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                  Inclusive of all taxes • Free shipping over $99
                </p>
              </div>

              {/* Stock & SKU */}
              <div className="p-4 mb-6 rounded-xl" style={{ backgroundColor: '#e2e2e2ff' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-sm" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>Available Stock</p>
                    <p className={`text-2xl font-bold ${
                      productData.stockQuantity <= 10 ? 'text-red-600' : 'text-black'
                    }`} style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                      {productData.stockQuantity || 0} units
                    </p>
                  </div>
                  {productData.sku && (
                    <div>
                      <p className="mb-1 text-sm" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>SKU</p>
                      <p className="font-mono text-xl font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                        {productData.sku}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {productData.description && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>Description</h3>
                  <div className="leading-relaxed whitespace-pre-line" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                    {productData.description}
                  </div>
                </div>
              )}

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {productData.targetAgeGroup && productData.targetAgeGroup !== 'All' && (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: '#e2e2e2ff' }}>
                    <p className="mb-1 text-sm" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>Age Group</p>
                    <p className="font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>{productData.targetAgeGroup}</p>
                  </div>
                )}
                {productData.gender && productData.gender !== 'Unisex' && (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: '#e2e2e2ff' }}>
                    <p className="mb-1 text-sm" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>Gender</p>
                    <p className="font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>{productData.gender}</p>
                  </div>
                )}
                {productData.tax > 0 && (
                  <div className="p-4 rounded-xl" style={{ backgroundColor: '#e2e2e2ff' }}>
                    <p className="mb-1 text-sm" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>Tax</p>
                    <p className="font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>{productData.tax}%</p>
                  </div>
                )}
              </div>

              {/* Sizes */}
              {productData.sizes && productData.sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>Available Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {productData.sizes.map((size, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 font-medium transition-colors border rounded-lg hover:opacity-80"
                        style={{ 
                          color: '#000000',
                          backgroundColor: '#FFFFFF',
                          borderColor: '#555555',
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 500
                        }}
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {productData.colors && productData.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-lg font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>Available Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {productData.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 font-medium transition-colors border rounded-lg hover:opacity-80"
                        style={{ 
                          color: '#000000',
                          backgroundColor: '#FFFFFF',
                          borderColor: '#555555',
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 500
                        }}
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Policy Information */}
              <div className="p-5 border rounded-xl" style={{ 
                borderColor: '#bebebeff',
                backgroundColor: '#e2e2e2ff'
              }}>
                <h3 className="flex items-center mb-4 text-lg font-semibold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#555555' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Product Information
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#555555' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>Authentic product with quality guarantee</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#555555' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>Secure packaging for safe delivery</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="flex-shrink-0 w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#555555' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>Customer support available for inquiries</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-white shadow-lg rounded-2xl" style={{ border: '1px solid #555555' }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isPublishing || isSaving}
                    className="flex items-center justify-center w-full px-6 py-3 font-semibold transition-all duration-200 border-2 rounded-xl hover:bg-gray-50 hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      color: '#000000',
                      borderColor: '#555555',
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Product
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing || isSaving || imageFiles.length === 0}
                    className="flex items-center justify-center w-full px-6 py-3 font-semibold text-white transition-all duration-200 rounded-xl hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#000000',
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Publish Product
                      </>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={handleSaveDraft}
                  disabled={isPublishing || isSaving || imageFiles.length === 0}
                  className="flex items-center justify-center w-full px-6 py-3 font-semibold text-white transition-all duration-200 rounded-xl hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#555555',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Save as Draft
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 text-sm text-center text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                This is a preview. Your product will look exactly like this to customers.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Metropolis font styles */}
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/metropolis');
        
        body {
          font-family: 'Metropolis', sans-serif;
        }
        
        button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ProductPreview;