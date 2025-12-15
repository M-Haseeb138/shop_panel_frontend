// services/categoriesAPI.js
import api from './api';

export const categoriesAPI = {
  // Get all categories
  getCategories: () => {
    return api.get('/categories');
  },

  // Create new category (if needed)
  createCategory: (categoryData) => {
    return api.post('/categories', categoryData);
  }
};

export default categoriesAPI;