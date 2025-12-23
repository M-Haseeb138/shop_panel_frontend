// // src/firebase/firebase.js
// import { initializeApp } from 'firebase/app';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// // ✅ MUST BE EXACT - Check Firebase Console
// const firebaseConfig = {
//   apiKey: "AIzaSyBGYzbaa2cWCgdK-LxD56jLJBlCE8l4R0M",
//   authDomain: "zed-shop-panel.firebaseapp.com",
//   projectId: "zed-shop-panel",
//   storageBucket: "zed-shop-panel.firebasestorage.app",
//   messagingSenderId: "525608555134",
//   appId: "1:525608555134:web:82c40301855612b1af7e2f",
//   measurementId: "G-7TRN7260EL"
// };

// // ✅ MUST BE EXACT - From your .env
// const VAPID_KEY = "BFIl0iFEhCVPc_eoJIhP6rgyN6lfvuGsaI2UdZSrl3K61G5jkgYGrox-UkhDJWTVel_ZaqD1wnN5sHEwQ0MU5rA";


// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// // ✅ CORRECT EXPORT: getFCMToken
// export const getFCMToken = async () => {
//   try {
//     const permission = await Notification.requestPermission();
    
//     if (permission !== 'granted') {
//       console.log('Notifications not allowed');
//       return null;
//     }
    
//     const token = await getToken(messaging, { 
//       vapidKey: VAPID_KEY 
//     });
    
//     if (token) {
//       console.log('FCM Token:', token);
//       localStorage.setItem('fcmToken', token);
//       return token;
//     }
    
//     return null;
//   } catch (error) {
//     console.error('FCM Token Error:', error);
//     return null;
//   }
// };

// // ✅ CORRECT EXPORT: onMessageListener (NOT setupMessageListener)
// export const onMessageListener = (callback) => {
//   return onMessage(messaging, (payload) => {
//     console.log('Message received:', payload);
    
//     if (callback) callback(payload);
//   });
// };

// // ✅ CORRECT EXPORT: registerServiceWorker
// export const registerServiceWorker = async () => {
//   if ('serviceWorker' in navigator) {
//     try {
//       const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
//       console.log('Service Worker registered');
//       return registration;
//     } catch (error) {
//       console.log('Service Worker registration failed:', error);
//       return null;
//     }
//   }
//   return null;
// };

// export { messaging };

/////////////////////////////////////
// src/firebase/firebase.js - UPDATED TO USE ENV VARIABLES
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ✅ Use environment variables from .env.local
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ✅ Get VAPID key from environment variables
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

console.log('🔧 Firebase Config Loaded:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasVapidKey: !!VAPID_KEY,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ✅ Get FCM Token
export const getFCMToken = async () => {
  try {
    console.log("🔑 Requesting FCM token...");
    
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('❌ Notification permission denied:', permission);
      return null;
    }
    
    console.log('✅ Notification permission granted');
    
    const token = await getToken(messaging, { 
      vapidKey: VAPID_KEY 
    });
    
    if (token) {
      console.log('✅ FCM Token received (first 20 chars):', token.substring(0, 20) + '...');
      return token;
    }
    
    console.log('❌ No FCM token received');
    return null;
  } catch (error) {
    console.error('❌ FCM Token Error:', error);
    return null;
  }
};

// ✅ Message listener
export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('📬 FCM Message received:', payload);
    if (callback) callback(payload);
  });
};

// ✅ Register service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered');
      return registration;
    } catch (error) {
      console.log('❌ Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export { messaging };