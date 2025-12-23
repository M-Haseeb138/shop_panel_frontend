// src/services/fcmAPI.js - CLEAN VERSION
import axios from 'axios';
import { API_BASE_URL } from '../config.js';

export const saveFCMTokenToBackend = async (fcmToken) => {
  try {
    const authToken = localStorage.getItem('shopOwnerToken');
    
    if (!authToken) {
      return { success: false, message: "User not authenticated" };
    }

    const response = await axios.post(
      `${API_BASE_URL}/shop-owner/save-fcm-token`,
      { fcmToken },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    try {
      const altResponse = await axios.post(
        `${API_BASE_URL}/shop/save-fcm-token`,
        { fcmToken },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return { success: true, data: altResponse.data };
    } catch (altError) {
      return { 
        success: false, 
        message: altError.response?.data?.message || "Failed to save token" 
      };
    }
  }
};

export const initializeAndSaveFCM = async () => {
  try {
    if (Notification.permission === 'denied') {
      return { 
        success: false, 
        message: "Notifications are blocked. Please enable in browser settings." 
      };
    }

    const firebaseModule = await import('../firebase/firebase.js');
    
    await firebaseModule.registerServiceWorker();
    
    const fcmToken = await firebaseModule.getFCMToken();
    
    if (!fcmToken) {
      return { 
        success: false, 
        message: "Could not get FCM token" 
      };
    }

    localStorage.setItem('fcmToken', fcmToken);
    
    const saveResult = await saveFCMTokenToBackend(fcmToken);
    
    if (saveResult.success) {
      localStorage.setItem('fcmTokenSaved', 'true');
      localStorage.setItem('fcmTokenSavedAt', new Date().toISOString());
    } else {
      localStorage.setItem('fcmToken', fcmToken);
      localStorage.setItem('fcmTokenSaved', 'false');
    }

    return { 
      success: saveResult.success, 
      token: fcmToken,
      message: saveResult.message || "FCM token saved successfully"
    };
    
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    };
  }
};

export const checkAndUpdateFCMToken = async () => {
  try {
    const oldToken = localStorage.getItem('fcmToken');
    const firebaseModule = await import('../firebase/firebase.js');
    
    const newToken = await firebaseModule.getFCMToken();
    
    if (newToken && newToken !== oldToken) {
      const result = await saveFCMTokenToBackend(newToken);
      
      if (result.success) {
        localStorage.setItem('fcmToken', newToken);
        localStorage.setItem('fcmTokenSaved', 'true');
        localStorage.setItem('fcmTokenUpdatedAt', new Date().toISOString());
      }
      
      return result;
    } else if (!newToken && Notification.permission === 'granted') {
      return await initializeAndSaveFCM();
    }
    
    return { success: true, message: "Token unchanged" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const isFCMInitialized = () => {
  const token = localStorage.getItem('fcmToken');
  const saved = localStorage.getItem('fcmTokenSaved');
  const authToken = localStorage.getItem('shopOwnerToken');
  
  return authToken && token && saved === 'true';
};

export const setupFirebaseMessageListener = async (onMessageCallback) => {
  try {
    const firebaseModule = await import('../firebase/firebase.js');
    
    const cleanup = firebaseModule.onMessageListener((payload) => {
      if (onMessageCallback) onMessageCallback(payload);
    });
    
    return cleanup;
  } catch (error) {
    return null;
  }
};