// services/api.js - FIXED VERSION
import axios from 'axios';
import { API_BASE_URL } from '../config'; // ✅ config.js se import karein

console.log('🔧 API Base URL from config:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL, // ✅ Yahan se direct use karein
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopOwnerToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debugging ke liye
    console.log('📡 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Network Error - Check your internet connection or API URL');
      console.log('Current API URL:', API_BASE_URL);
      
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error. Please check your internet connection.'
      });
    }

    if (error.response) {
      console.error('❌ API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.response.config?.url,
        fullUrl: error.response.config?.baseURL + error.response.config?.url
      });

      // Handle 401 Unauthorized (Token expired)
      if (error.response.status === 401) {
        console.log('🛡️ Token expired, redirecting to login');
        localStorage.removeItem('shopOwnerToken');
        localStorage.removeItem('userData');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('❌ API Request Error:', error.request);
    } else {
      console.error('❌ API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;