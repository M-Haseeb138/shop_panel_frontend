import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productsAPI from '../services/productsAPI';
import categoriesAPI from '../services/categoriesAPI';
import Layout from '../components/layout/Layout';

const UpdateProduct = ({ onBack, onLogout, userData }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    sku: '',
    stockQuantity: '',
    discount: '0',
    category: '',
    productType: 'Other',
    targetAgeGroup: 'All',
    gender: 'Unisex',
    sizes: [],
    colors: [],
    tax: '0',
    status: 'published',
    // ✅ NEW: Return/Replace fields
    returnAllowed: false,
    returnDuration: '',
    returnConditions: ''
  });

  const [images, setImages] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [currentImage, setCurrentImage] = useState(null);

  // Product type options
  const productTypeOptions = [
    "Top", "Bottom", "Footwear", "Accessory", "Outerwear", "Other", "Not Applicable"
  ];

  // Age range options
  const ageRangeOptions = [
    "0-2", "3-5", "6-8", "9-12", "13-17", "18-24", 
    "25-34", "35-44", "45-54", "55-64", "65+", "All"
  ];

  // Size templates
  const sizeTemplates = {
    Footwear: ['6', '7', '8', '9', '10', '11', '12', '13'],
    Top: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    Bottom: ['28', '30', '32', '34', '36', '38', '40', '42'],
    Outerwear: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    Accessory: ['One Size', 'Small', 'Medium', 'Large'],
    Other: ['One Size', 'Small', 'Medium', 'Large', 'XS', 'S', 'M', 'L', 'XL'],
    "Not Applicable": ['One Size']
  };

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [id]);

  // ✅ FIXED: Helper function to parse colors from backend
  const parseColorsFromBackend = (colorsData) => {
    if (!colorsData) return [];
    
    // If it's already a simple array of strings, return as is
    if (Array.isArray(colorsData) && colorsData.length > 0 && typeof colorsData[0] === 'string') {
      return colorsData;
    }
    
    // If it's a JSON string, parse it
    if (typeof colorsData === 'string') {
      try {
        const parsed = JSON.parse(colorsData);
        // If parsed is an array, return it
        if (Array.isArray(parsed)) {
          // Flatten any nested arrays
          return parsed.flat().map(item => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object') return JSON.stringify(item);
            return String(item);
          });
        }
      } catch (error) {
        console.error('Error parsing colors:', error);
        return [];
      }
    }
    
    return [];
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProductById(id);
      const productData = response.data;
      
      setProduct(productData);
      setCurrentImage(productData.imagePath);
      
      // Parse colors from backend
      const parsedColors = parseColorsFromBackend(productData.colors);
      const parsedSizes = Array.isArray(productData.sizes) ? productData.sizes : [];
      
      // Set form data with new fields
      setFormData({
        title: productData.title || '',
        description: productData.description || '',
        price: productData.price || '',
        sku: productData.sku || '',
        stockQuantity: productData.stockQuantity || '',
        discount: productData.discount || '0',
        category: productData.category?._id || productData.category || '',
        productType: productData.productType || 'Other',
        targetAgeGroup: productData.targetAgeGroup || 'All',
        gender: productData.gender || 'Unisex',
        sizes: parsedSizes,
        colors: parsedColors,
        tax: productData.tax || '0',
        status: productData.status || 'published',
        // ✅ NEW: Return/Replace fields
        returnAllowed: productData.returnAllowed || false,
        returnDuration: productData.returnDuration || '',
        returnConditions: productData.returnConditions || ''
      });

      // Set sizes and colors
      setSelectedSizes(parsedSizes);
      setSelectedColors(parsedColors);

      console.log('📦 Loaded product data:', {
        originalColors: productData.colors,
        parsedColors: parsedColors,
        sizes: parsedSizes
      });

    } catch (error) {
      console.error('❌ Error loading product:', error);
      alert('Failed to load product. Please try again.');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
        else if (response.data.categories && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        }
        else if (response.data.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
        else if (response.data.success && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        }
        else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      const numericFields = ["price", "tax", "discount", "stockQuantity", "returnDuration", "replaceDuration"];

      if (numericFields.includes(name)) {
        if (value === "" || /^\d*\.?\d*$/.test(value)) {
          setFormData(prev => ({
            ...prev,
            [name]: value
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        return false;
      }
      
      return true;
    });
    
    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    if (!selectedSizes.includes(size)) {
      const newSizes = [...selectedSizes, size];
      setSelectedSizes(newSizes);
      setFormData(prev => ({ ...prev, sizes: newSizes }));
    }
  };

  const handleAddCustomSize = () => {
    if (sizeInput.trim() && !selectedSizes.includes(sizeInput.trim())) {
      const newSizes = [...selectedSizes, sizeInput.trim()];
      setSelectedSizes(newSizes);
      setFormData(prev => ({ ...prev, sizes: newSizes }));
      setSizeInput('');
    }
  };

  const handleRemoveSize = (sizeToRemove) => {
    const newSizes = selectedSizes.filter(size => size !== sizeToRemove);
    setSelectedSizes(newSizes);
    setFormData(prev => ({ ...prev, sizes: newSizes }));
  };

  // ✅ FIXED: Handle color addition
  const handleAddColor = () => {
    if (colorInput.trim()) {
      const color = colorInput.trim();
      if (!selectedColors.includes(color)) {
        const newColors = [...selectedColors, color];
        setSelectedColors(newColors);
        setFormData(prev => ({ ...prev, colors: newColors }));
        setColorInput('');
      } else {
        alert("This color is already added!");
      }
    }
  };

  // ✅ FIXED: Handle color removal
  const handleRemoveColor = (colorToRemove) => {
    const newColors = selectedColors.filter(color => color !== colorToRemove);
    setSelectedColors(newColors);
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  // Get available sizes for current product type
  const getAvailableSizes = () => {
    return sizeTemplates[formData.productType] || sizeTemplates.Other;
  };

  // ✅ FIXED: Helper function to format colors array for FormData
  const formatColorsForFormData = (colorsArray) => {
    if (Array.isArray(colorsArray) && colorsArray.length > 0) {
      return colorsArray;
    }
    return [];
  };

  // Update product (publish)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    // Validation
    const requiredFields = ['title', 'price', 'category', 'productType', 'targetAgeGroup', 'sku', 'stockQuantity', 'tax'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Please fill all required fields: ${missingFields.join(', ')}`);
      setUpdating(false);
      return;
    }

    try {
      const productData = new FormData();
      
      // Append all form fields
      productData.append('title', formData.title);
      productData.append('description', formData.description || '');
      productData.append('price', formData.price);
      productData.append('category', formData.category);
      productData.append('productType', formData.productType);
      productData.append('targetAgeGroup', formData.targetAgeGroup);
      productData.append('sku', formData.sku);
      productData.append('stockQuantity', formData.stockQuantity);
      productData.append('tax', formData.tax);
      productData.append('status', formData.status);
      productData.append('discount', formData.discount || '0');
      productData.append('gender', formData.gender);

      // ✅ NEW: Append Return/Replace fields
      productData.append('returnAllowed', formData.returnAllowed);
      productData.append('returnDuration', formData.returnDuration || 0);
      productData.append('returnConditions', formData.returnConditions || '');

      // ✅ FIXED: Append sizes as simple array (not JSON stringified)
      if (selectedSizes.length > 0) {
        selectedSizes.forEach((size, index) => {
          productData.append(`sizes[${index}]`, size);
        });
      }

      // ✅ FIXED: Append colors as simple array (not JSON stringified)
      if (selectedColors.length > 0) {
        const formattedColors = formatColorsForFormData(selectedColors);
        formattedColors.forEach((color, index) => {
          productData.append(`colors[${index}]`, color);
        });
      }

      // Append new image if uploaded
      if (images[0]) {
        productData.append('image', images[0]);
      }

      console.log('📦 Updating product with colors:', selectedColors);

      const response = await productsAPI.updateProduct(id, productData);
      
      if (response.data.success) {
        alert('✅ Product updated successfully!');
        onBack();
      } else {
        alert(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Failed to update product. Please try again.';
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setSavingDraft(true);

    try {
      const productData = new FormData();
      
      productData.append('title', formData.title);
      productData.append('description', formData.description || '');
      productData.append('price', formData.price || '0');
      productData.append('category', formData.category);
      productData.append('productType', formData.productType);
      productData.append('targetAgeGroup', formData.targetAgeGroup);
      productData.append('sku', formData.sku || '');
      productData.append('stockQuantity', formData.stockQuantity || '0');
      productData.append('tax', formData.tax || '0');
      productData.append('discount', formData.discount || '0');
      productData.append('gender', formData.gender);
      productData.append('status', 'draft');

      // ✅ NEW: Append Return/Replace fields
      productData.append('returnAllowed', formData.returnAllowed);
      productData.append('returnDuration', formData.returnDuration || 0);
      productData.append('replaceAllowed', formData.replaceAllowed);
      productData.append('replaceDuration', formData.replaceDuration || 0);
      productData.append('returnConditions', formData.returnConditions || '');

      // ✅ FIXED: Append sizes as simple array
      if (selectedSizes.length > 0) {
        selectedSizes.forEach((size, index) => {
          productData.append(`sizes[${index}]`, size);
        });
      }

      // ✅ FIXED: Append colors as simple array
      if (selectedColors.length > 0) {
        const formattedColors = formatColorsForFormData(selectedColors);
        formattedColors.forEach((color, index) => {
          productData.append(`colors[${index}]`, color);
        });
      }

      if (images[0]) {
        productData.append('image', images[0]);
      }

      const response = await productsAPI.updateProduct(id, productData);
      
      if (response.data.success) {
        alert('✅ Product saved as draft successfully!');
        onBack();
      } else {
        alert(response.data.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Failed to save draft. Please try again.';
      alert(errorMessage);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard changes? All unsaved changes will be lost.')) {
      onBack();
    }
  };

  if (loading) {
    return (
      <Layout onLogout={onLogout} userData={userData}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout} userData={userData}>
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="flex items-center mb-4 space-x-2 text-black"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Products</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="mt-2 text-gray-600">Update your product details below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Essential Information Card */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Essential Information</h2>
              
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Enter product title"
                    required
                  />
                </div>

                {/* Product Description */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Product Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Enter detailed description"
                  />
                </div>

                {/* Price and Tax */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Price ($) *
                    </label>
                    <div className="relative">
                      <span className="absolute text-gray-500 left-3 top-2">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full py-2 pl-8 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Tax (%) *
                    </label>
                    <div className="relative">
                      <span className="absolute text-gray-500 left-3 top-2">%</span>
                      <input
                        type="number"
                        name="tax"
                        value={formData.tax}
                        onChange={handleInputChange}
                        className="w-full py-2 pl-8 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder="0"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Discount (%)
                  </label>
                  <div className="relative">
                    <span className="absolute text-gray-500 left-3 top-2">%</span>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className="w-full py-2 pl-8 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="0"
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    SKU (Stock Keeping Unit) *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="e.g. PROD-001"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Product Image
                  </label>
                  
                  {/* Current Image */}
                  {currentImage && !images.length && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm text-gray-600">Current Image:</p>
                      <img
                        src={currentImage}
                        alt="Current product"
                        className="object-cover w-48 h-48 rounded-lg"
                      />
                    </div>
                  )}

                  <div 
                    className="p-8 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-500"
                    onClick={() => document.getElementById('imageUpload').click()}
                  >
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <h5 className="mb-2 text-lg font-medium text-gray-700">Upload new image (optional)</h5>
                    <p className="mb-3 text-gray-500">or click to browse files</p>
                    <p className="text-sm text-gray-400">Supported formats: JPG, PNG, WEBP. Max file size: 5MB</p>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>

                  {/* New Image Preview */}
                  {images.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-3 text-sm font-medium text-gray-700">New Image Preview</h4>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="object-cover w-full h-24 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute flex items-center justify-center w-6 h-6 text-white transition-opacity bg-red-500 rounded-full opacity-0 -top-2 -right-2 group-hover:opacity-100"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ NEW: Return & Replace Policy Card */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Return Policy</h2>
              
              <div className="space-y-6">
                {/* Return Policy */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start mb-4">
                    <input
                      type="checkbox"
                      name="returnAllowed"
                      checked={formData.returnAllowed}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-1 mr-3"
                      style={{ accentColor: "#000000" }}
                      id="returnAllowed"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="returnAllowed"
                        className="text-lg font-medium text-gray-900"
                      >
                        Allow Returns
                      </label>
                      <p className="mt-1 text-sm text-gray-600">
                        Customers can return this product if they are not satisfied
                      </p>
                    </div>
                  </div>
                  
                  {formData.returnAllowed && (
                    <div className="ml-8">
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Return Duration (Days) *
                        </label>
                        <input
                          type="number"
                          name="returnDuration"
                          value={formData.returnDuration}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                          placeholder="Enter number of days for return"
                          min="0"
                          required={formData.returnAllowed}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Customer can return the product within these many days
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Return Conditions */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Return Conditions 
                  </label>
                  <textarea
                    name="returnConditions"
                    value={formData.returnConditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Enter conditions for return (e.g., product must be unused, original packaging, etc.)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    These conditions will be shown to customers
                  </p>
                </div>
              </div>
            </div>

            {/* Product Details Card */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Product Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      required
                    >
                      <option value="">Select category</option>
                      {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.category_name || category.name || category.title || 'Unnamed Category'}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No categories available</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Product Type *
                    </label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      required
                    >
                      {productTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Target Age Group *
                    </label>
                    <select
                      name="targetAgeGroup"
                      value={formData.targetAgeGroup}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      required
                    >
                      {ageRangeOptions.map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Sizes Section */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Sizes for {formData.productType}
                  </label>
                  
                  {/* Quick Size Selection */}
                  <div className="mb-3">
                    <p className="mb-2 text-sm text-gray-600">Quick select sizes:</p>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableSizes().map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeSelect(size)}
                          disabled={selectedSizes.includes(size)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            selectedSizes.includes(size)
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Size Input */}
                  <div className="flex mb-2 space-x-2">
                    <input
                      type="text"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="Add custom size"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSize())}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                    >
                      Add Custom
                    </button>
                  </div>

                  {/* ✅ Selected Sizes Display */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-sm font-medium text-gray-700">
                      Selected Sizes:
                    </span>
                    {selectedSizes.length > 0 ? (
                      selectedSizes.map((size, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full">
                          {size}
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(size)}
                            className="ml-2 text-gray-500 hover:text-gray-800"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        No sizes selected
                      </span>
                    )}
                  </div>
                </div>

                {/* ✅ FIXED: Colors Section (Now exactly like sizes) */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Colors
                  </label>
                  <div className="flex mb-2 space-x-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="Add color (e.g., Red, Blue, Green)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* ✅ FIXED: Selected Colors Display (EXACTLY like sizes) */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-sm font-medium text-gray-700">
                      Selected Colors:
                    </span>
                    {selectedColors.length > 0 ? (
                      selectedColors.map((color, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                          {color}
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(color)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        No colors selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Selection */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Product Status</h2>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <span className="ml-2 text-gray-700">Published</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <span className="ml-2 text-gray-700">Draft</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex items-center px-6 py-2 space-x-2 text-red-600 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Discard</span>
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="flex items-center px-6 py-2 space-x-2 text-gray-600 transition-colors border border-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingDraft ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-600 rounded-full border-t-transparent animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Save Draft</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center px-6 py-2 space-x-2 text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Update Product</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateProduct;