// src/services/dashboardAPI.js - FIXED WITH NAMED EXPORTS
import api from './api';

// Cache object for quick data
const cache = {};

// ✅ NAMED EXPORTS add karein
export const getDashboardStats = (period = 'month') => {
  const cacheKey = `stats-${period}`;
  if (cache[cacheKey]) {
    console.log(`📊 Using cached stats for: ${period}`);
    return Promise.resolve(cache[cacheKey]);
  }
  
  return api.get(`/shop-owner/dashboard/stats?period=${period}`)
    .then(res => {
      cache[cacheKey] = res;
      setTimeout(() => delete cache[cacheKey], 10000);
      return res;
    });
};

export const getOrderVolume = (range = 'day') => {
  const cacheKey = `orderVolume-${range}`;
  if (cache[cacheKey]) {
    console.log(`📈 Using cached order volume for: ${range}`);
    return Promise.resolve(cache[cacheKey]);
  }
  
  return api.get(`/shop-owner/dashboard/order-volume?range=${range}`)
    .then(res => {
      cache[cacheKey] = res;
      setTimeout(() => delete cache[cacheKey], 10000);
      return res;
    });
};

export const getRevenueData = (range = 'day') => {
  const cacheKey = `revenue-${range}`;
  if (cache[cacheKey]) {
    console.log(`💰 Using cached revenue for: ${range}`);
    return Promise.resolve(cache[cacheKey]);
  }
  
  return api.get(`/shop-owner/dashboard/revenue?range=${range}`)
    .then(res => {
      cache[cacheKey] = res;
      setTimeout(() => delete cache[cacheKey], 10000);
      return res;
    });
};

export const getRecentOrders = (limit = 5) => {
  return api.get(`/shop-owner/dashboard/recent-orders?limit=${limit}`);
};

export const getTopProducts = (limit = 5, period = 'month') => {
  return api.get(`/shop-owner/dashboard/top-products?limit=${limit}&period=${period}`);
};

// ✅ Ya phir object export bhi rakhein agar kahi aur use ho raha ho
export const dashboardAPI = {
  getDashboardStats,
  getOrderVolume,
  getRevenueData,
  getRecentOrders,
  getTopProducts,
  clearCache: () => {
    Object.keys(cache).forEach(key => delete cache[key]);
  }
};