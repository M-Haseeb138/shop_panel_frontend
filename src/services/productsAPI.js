// services/productsAPI.js - UPDATED
import api from './api';

const productsAPI = {
  // Create product - FIXED
  createProduct: async (formData) => {
    console.log('📦 Creating product...');
    
    const token = localStorage.getItem('shopOwnerToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('🔐 Using token:', token.substring(0, 20) + '...');
    
    // Log form data for debugging
    console.log('📝 FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File - ${value.name}`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }
    
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 45000,
    });
  },

  // Get all products
  getProducts: (params = {}) => api.get('/products', { params }),

  // Get shop owner's products
  getShopProducts: () => api.get('/products/shop/my-products'),

  // Get product by ID
  getProductById: (productId) => api.get(`/products/${productId}`),

  // Update product status
  updateProductStatus: (productId, statusData) => 
    api.patch(`/products/${productId}/status`, statusData),

  // Update product details
  updateProduct: (productId, productData) => 
    api.put(`/products/${productId}`, productData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Delete product
  deleteProduct: (productId) => api.delete(`/products/${productId}`),
};

export default productsAPI;