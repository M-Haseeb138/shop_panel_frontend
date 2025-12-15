// services/shopAPI.js
import api from './api';

export const shopAPI = {
  // Get shops owned by the authenticated user
  getMyShops: () => {
    return api.get('/shops/owner/my-shops');
  },

  // Create new shop
  createShop: (shopData) => {
    return api.post('/shops', shopData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Update shop
  updateShop: (shopId, shopData) => {
    return api.put(`/shops/${shopId}`, shopData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Delete shop
  deleteShop: (shopId) => {
    return api.delete(`/shops/${shopId}`);
  }
};

export default shopAPI;