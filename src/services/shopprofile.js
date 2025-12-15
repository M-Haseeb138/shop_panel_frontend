// services/shopprofile.js - UPDATED (Single API only)
import api from './api';

const shopProfileAPI = {
  // Get store profile only
  getStoreProfile: async () => {
    try {
      const response = await api.get('/shop-owner/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching store profile:', error);
      throw error;
    }
  }
};

export default shopProfileAPI;