// services/productsAPI.js - UPDATED
import api from './api';

export const productsAPI = {
  // Get all products with filters
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] && params[key] !== 'all') {
        queryParams.append(key, params[key]);
      }
    });
    
    return api.get(`/products?${queryParams}`);
  },

  // Create new product
  createProduct: (productData) => {
    return api.post('/products', productData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Update product status
  updateProductStatus: (productId, status) => {
    return api.patch(`/products/${productId}/status`, { status });
  },

  // Update product
  updateProduct: (productId, productData) => {
    return api.put(`/products/${productId}`, productData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Delete product
  deleteProduct: (productId) => {
    return api.delete(`/products/${productId}`);
  }
};

export default productsAPI;