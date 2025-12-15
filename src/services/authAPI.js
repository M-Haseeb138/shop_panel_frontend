// services/authAPI.js - UPDATED REGISTER FUNCTION
import api from './api';

export const authAPI = {
  // ✅ FIXED: Register with ONLY email and password
  register: (userData) => {
    console.log('📝 Registration data:', { 
      email: userData.email, 
      password: '••••••' 
    });
    
    // ✅ SIMPLIFIED: Send ONLY email and password as backend expects
    const payload = {
      email: userData.email.trim(),
      password: userData.password
    };
    
    console.log('📤 Sending registration payload:', payload);
    return api.post('/shop-owner/register', payload);
  },

  // ✅ FIXED: Login
  login: (credentials) => {
    return api.post('/shop-owner/login', {
      email: credentials.email.trim(),
      password: credentials.password
    });
  },

  // Logout
  logout: () => api.post('/shop-owner/logout'),
  
   verifyEmailOTP: (data) => {
    console.log('📧 Verifying email OTP:', { 
      email: data.email, 
      otp: data.otp 
    });
    
    return api.post('/shop-owner/verify-otp', {
      email: data.email.trim(),
      otp: data.otp.trim()
    });
  },
  
  resendEmailOTP: (data) => {
    console.log('📧 Resending email OTP to:', data.email);
    return api.post('/shop-owner/resend-otp', {
      email: data.email.trim()
    });
  },

  
 


  // Phone verification - FIXED
  // registerPhone: (phoneData) => {
  //   console.log('📱 Registering phone:', phoneData.phone);
    
  //   const formattedData = {
  //     // phone: String(phoneData.phone).replace(/\D/g, '') // Remove non-digits
      
  //   };
    
  //   return api.post('/shop-owner/register-phone', formattedData);
  // },
  registerPhone: (phoneData) => {
  console.log('📱 Registering phone:', phoneData.phone);
  
  // Don't remove + sign, just ensure proper formatting
  let phone = phoneData.phone;
  
  // If it doesn't start with +, add it (should already have it from frontend)
  if (!phone.startsWith('+')) {
    phone = '+' + phone.replace(/\D/g, '');
  }
  
  const formattedData = {
    phone: phone // Send with + sign
  };
  
  console.log('📤 Sending phone to backend:', formattedData);
  return api.post('/shop-owner/register-phone', formattedData);
},

  //  verifyPhoneOTP: (otpData) => {
  //   console.log('📱 Verifying phone OTP:', otpData.otp);
    
  //   // Send OTP as string
  //   return api.post('/shop-owner/verify-phone-otp', {
  //     otp: String(otpData.otp).trim()
  //   });
  // },

  // Resend phone OTP
  
  verifyPhoneOTP: (otpData) => {
  console.log('📱 Verifying phone OTP:', otpData.otp);
  
  // Send OTP as string
  return api.post('/shop-owner/verify-phone-otp', {
    otp: String(otpData.otp).trim()
  });
},
  // resendPhoneOTP: () => {
  //   console.log('📱 Resending phone OTP');
  //   return api.post('/shop-owner/resend-phone-otp', {});
  // },

 // authAPI.js - FIXED updateBusinessDetails function

 resendPhoneOTP: () => {
  console.log('📱 Resending phone OTP');
  return api.post('/shop-owner/resend-phone-otp', {});
},

 updateBusinessDetails: (businessData) => {
  console.log('🏢 Business details data for backend:', businessData);
  
  const formData = new FormData();
  
  // ✅ REQUIRED FIELDS - Use exact field names from businessData
  // Check for 'name' field (store name)
  if (businessData.name) {
    formData.append('name', businessData.name.trim());
    console.log('🏪 Store name sent as "name":', businessData.name);
  } else {
    console.error('❌ Missing store name in businessData');
  }
  
    if (businessData.description) {
    formData.append('description', businessData.description.trim());
    console.log('📝 Store description sent:', businessData.description);
  }
  
  if (businessData.businessType) {
    formData.append('businessType', businessData.businessType);
  }
  
  if (businessData.contactName) {
    formData.append('contactName', businessData.contactName.trim());
  }
  
  // Business hours - REQUIRED
  formData.append('openTime', businessData.openTime || '09:00');
  formData.append('closeTime', businessData.closeTime || '18:00');
  
  // Address fields - REQUIRED
  if (businessData.streetAddress) {
    formData.append('streetAddress', businessData.streetAddress.trim());
  }
  
  if (businessData.city) {
    formData.append('city', businessData.city.trim());
  }
  
  if (businessData.state) {
    formData.append('state', businessData.state.trim());
  }
  
  if (businessData.zipCode) {
    formData.append('zipCode', businessData.zipCode.trim());
  }
  
  if (businessData.country) {
    formData.append('country', businessData.country.trim());
  }
  
  // Categories
  if (businessData.categories && Array.isArray(businessData.categories)) {
    formData.append('categories', JSON.stringify(businessData.categories));
  }
  
  // Optional fields
  if (businessData.latitude) {
    formData.append('latitude', businessData.latitude);
  }
  
  if (businessData.longitude) {
    formData.append('longitude', businessData.longitude);
  }
  
  if (businessData.altPhoneNumber) {
    formData.append('altPhoneNumber', businessData.altPhoneNumber.trim());
  }
  
  // Debug: Log all form data
  console.log('📤 FormData contents for backend:');
  let hasAllRequiredFields = true;
  const requiredFields = ['name', 'businessType', 'contactName', 'streetAddress', 'city', 'state', 'zipCode', 'country', 'openTime', 'closeTime'];
  
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value);
    if (requiredFields.includes(key) && !value) {
      console.error(`❌ Missing required field: ${key}`);
      hasAllRequiredFields = false;
    }
  }
  
  if (!hasAllRequiredFields) {
    console.error('❌ Not all required fields are present!');
  }
  
  return api.put('/shop-owner/update-business-details', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
},

  // ... rest of the functions ...
};

export default authAPI;