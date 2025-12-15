// src/services/dashboardAPI.js - FIXED VERSION
import api from './api';

export const dashboardAPI = {
  /**
   * Get dashboard summary statistics
   * @param {string} period - today, week, month, year
   * @returns {Promise} API response
   */
  getDashboardStats: (period = 'month') => {
    console.log(`📊 Fetching dashboard stats for period: ${period}`);
    return api.get(`/shop-owner/dashboard/stats?period=${period}`);
  },

  /**
   * Get order volume data for charts
   * @param {string} range - day, week, month
   * @returns {Promise} API response
   */
  getOrderVolume: (range = 'day') => {
    console.log(`📈 Fetching order volume for range: ${range}`);
    return api.get(`/shop-owner/dashboard/order-volume?range=${range}`);
  },

  /**
   * Get revenue data for charts
   * @param {string} range - day, week, month
   * @returns {Promise} API response
   */
  getRevenueData: (range = 'day') => {
    console.log(`💰 Fetching revenue data for range: ${range}`);
    return api.get(`/shop-owner/dashboard/revenue?range=${range}`);
  },

  /**
   * Get recent orders for dashboard
   * @param {number} limit - Number of orders to fetch
   * @returns {Promise} API response
   */
  getRecentOrders: (limit = 5) => {
    console.log(`📋 Fetching recent orders, limit: ${limit}`);
    return api.get(`/shop-owner/dashboard/recent-orders?limit=${limit}`);
  },

  /**
   * Get top selling products
   * @param {number} limit - Number of products to fetch
   * @param {string} period - week, month, year, all
   * @returns {Promise} API response
   */
  getTopProducts: (limit = 5, period = 'month') => {
    console.log(`🏆 Fetching top products, limit: ${limit}, period: ${period}`);
    return api.get(`/shop-owner/dashboard/top-products?limit=${limit}&period=${period}`);
  }
};