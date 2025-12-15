// services/settingsAPI.js - UPDATED
import api from './api';

const settingsAPI = {
  // Get shop owner profile - this returns both profile and shop details
  getShopOwnerProfile: async () => {
    try {
      const response = await api.get('/shop-owner/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update shop owner profile (personal details)
  updateShopOwnerProfile: async (profileData) => {
    try {
      const response = await api.put('/shop-owner/profile/update', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Update shop details
  updateShopDetails: async (shopData) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      if (shopData.shopName) formData.append('shopName', shopData.shopName.trim());
      if (shopData.description !== undefined) formData.append('description', shopData.description.trim());
      if (shopData.openTime) formData.append('openTime', shopData.openTime);
      if (shopData.closeTime) formData.append('closeTime', shopData.closeTime);
      if (shopData.preparationTime) formData.append('preparationTime', shopData.preparationTime);
      
      // Add image file if exists
      if (shopData.shopImage && shopData.shopImage instanceof File) {
        formData.append('shopImage', shopData.shopImage);
      }
      
      console.log('📤 Sending shop update data:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
      
      const response = await api.put('/shop-owner/shop/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating shop details:', error);
      throw error;
    }
  }
};

export default settingsAPI;