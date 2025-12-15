// services/onboardingAPI.js - FIXED
import api from './api';

const onboardingAPI = {
  // ✅ FIXED: uploadDocuments
  uploadDocuments: (formData) => {
    console.log('📋 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key} =`, value instanceof File ? `${value.name} (File)` : value);
    }
    
    return api.post('/shop-owner/upload-all', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  getApplicationStatus: () => {
    return api.get('/shop-owner/application-status');
  },

  completeOnboarding: () => {
    return api.post('/shop-owner/complete-onboarding');
  }
};

export default onboardingAPI;