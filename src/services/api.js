// services/api.js - UPDATED
import axios from 'axios';
import { API_BASE_URL } from '../config';

console.log('🔧 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Network Error - Check your internet connection or API URL');
      console.log('Current API URL:', API_BASE_URL);
      
      // Don't redirect on network errors for protected routes
      // Just reject the promise
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error. Please check your internet connection.'
      });
    }

    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.response.config?.url
      });

      // Handle 401 Unauthorized (Token expired)
      if (error.response.status === 401) {
        console.log('🛡️ Token expired, redirecting to login');
        localStorage.removeItem('shopOwnerToken');
        localStorage.removeItem('userData');
        // Use navigate instead of window.location for React Router
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.log('🚫 Access forbidden');
      }
    } else if (error.request) {
      console.error('API Request Error:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;