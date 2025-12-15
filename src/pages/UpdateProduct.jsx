// pages/UpdateProduct.jsx - FIXED VERSION
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
    status: 'published'
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

  const loadProduct = async () => {
    try {
      setLoading(true);
      // Get product details
      const response = await productsAPI.getProductById(id);
      const productData = response.data;
      
      setProduct(productData);
      setCurrentImage(productData.imagePath);
      
      // Set form data
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
        sizes: productData.sizes || [],
        colors: productData.colors || [],
        tax: productData.tax || '0',
        status: productData.status || 'published'
      });

      // Set sizes and colors
      setSelectedSizes(productData.sizes || []);
      setSelectedColors(productData.colors || []);

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
      
      // FIX: Handle different API response structures
      if (response && response.data) {
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
        // Check if response.data has a categories property
        else if (response.data.categories && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        }
        // Check if response.data has a data property
        else if (response.data.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
        // If response.data is an object with success property
        else if (response.data.success && Array.isArray(response.data.categories)) {
          setCategories(response.data.categories);
        }
        else {
          console.warn('⚠️ Unexpected categories API response format:', response.data);
          setCategories([]); // Set empty array to prevent map error
        }
      } else {
        console.warn('⚠️ No data in categories API response');
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size and type
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

  const handleAddColor = () => {
    if (colorInput.trim() && !selectedColors.includes(colorInput.trim())) {
      const newColors = [...selectedColors, colorInput.trim()];
      setSelectedColors(newColors);
      setFormData(prev => ({ ...prev, colors: newColors }));
      setColorInput('');
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    const newColors = selectedColors.filter(color => color !== colorToRemove);
    setSelectedColors(newColors);
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  // Get available sizes for current product type
  const getAvailableSizes = () => {
    return sizeTemplates[formData.productType] || sizeTemplates.Other;
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
      productData.append('sizes', JSON.stringify(selectedSizes));
      productData.append('colors', JSON.stringify(selectedColors));

      // Append new image if uploaded
      if (images[0]) {
        productData.append('image', images[0]);
      }

      console.log('📦 Updating product with ID:', id);

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
      
      // Append all form data
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
      productData.append('sizes', JSON.stringify(selectedSizes));
      productData.append('colors', JSON.stringify(selectedColors));
      productData.append('status', 'draft');

      // Append new image if available
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
                      {/* FIXED: Safely map over categories array */}
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

                  {/* Selected Sizes */}
                  <div className="flex flex-wrap gap-2">
                    {selectedSizes.map((size, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 text-sm text-gray-800 bg-gray-100 rounded-full">
                        {size}
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(size)}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colors */}
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
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map((color, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 text-sm text-purple-800 bg-purple-100 rounded-full">
                        {color}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(color)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
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