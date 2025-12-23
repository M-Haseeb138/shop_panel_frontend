// // services/ordersAPI.js
// import api from './api';

// const ordersAPI = {
//   // Get shop owner's orders with pagination and filters
//   getShopOrders: async (params = {}) => {
//     try {
//       const response = await api.get('/shop-owner/orders', { params });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching shop orders:', error);
//       throw error;
//     }
//   },

//   // Get specific order details
//   getOrderDetails: async (orderId) => {
//     try {
//       const response = await api.get(`/shop-owner/orders/${orderId}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching order details:', error);
//       throw error;
//     }
//   },

//   // Update order status
//   updateOrderStatus: async (orderId, status) => {
//     try {
//       const response = await api.put(`/shop-owner/orders/${orderId}/status`, { status });
//       return response.data;
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       throw error;
//     }
//   },

//   // Accept order (when pending)
//   acceptOrder: async (orderId) => {
//     try {
//       const response = await api.post(`/shop-owner/orders/${orderId}/accept`);
//       return response.data;
//     } catch (error) {
//       console.error('Error accepting order:', error);
//       throw error;
//     }
//   },

//   // Mark order as ready for pickup
//   markAsReady: async (orderId) => {
//     try {
//       const response = await api.post(`/shop-owner/orders/${orderId}/ready`);
//       return response.data;
//     } catch (error) {
//       console.error('Error marking order as ready:', error);
//       throw error;
//     }
//   }
// };

// export default ordersAPI; 

// services/ordersAPI.js
import api from './api';

const ordersAPI = {
  // Get shop owner's orders with pagination and filters
  getShopOrders: async (params = {}) => {
    try {
      const response = await api.get('/shop-owner/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shop orders:', error);
      throw error;
    }
  },

  // Get specific order details
  getOrderDetails: async (orderId) => {
    try {
      const response = await api.get(`/shop-owner/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // Update order status (USE THIS ONE - it works)
 updateOrderStatus: async (orderMongoId, status) => {
    try {
      console.log('📤 Updating order status:', { orderMongoId, status });
      
      const response = await api.put(`/shop-owner/orders/${orderMongoId}/status`, { 
        status 
      });
      
      console.log('✅ Status update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  },

  
  // ========== ORDER MEDIA FUNCTIONS ==========
  
   uploadOrderMedia: async (orderId, formData) => {
    try {
      console.log('📤 Uploading order media for:', orderId);
      console.log('📤 FormData entries:');
      
      // Log form data for debugging
      for (let pair of formData.entries()) {
        console.log('📤 FormData:', pair[0], pair[1]);
      }
      
      const response = await api.post(`/shop-owner/orders/${orderId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Media upload successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error uploading order media:', error);
      throw error;
    }
  },




 // ========== SELF PICKUP OTP VERIFICATION ==========
  verifySelfPickupOtp: async (orderId, otp) => {
    try {
      console.log('🔐 Verifying OTP for order:', { orderId, otp });
      
      const response = await api.post('/shop-owner/verify-pickup', {
        orderId: orderId, // Use order.orderId from MongoDB (like "ORD-12345")
        otp: otp
      });
      
      console.log('✅ OTP verification successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      throw error;
    }
  },
  
};




export default ordersAPI;