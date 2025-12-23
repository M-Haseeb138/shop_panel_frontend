// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCcnrJzc_eila82oN703gCfCX60oQFzPVs",
  authDomain: "zed-shop-panel.firebaseapp.com",
  projectId: "zed-shop-panel",
  storageBucket: "zed-shop-panel.appspot.com",
  messagingSenderId: "1016158374500",
  appId: "1:1016158374500:web:aee8b4f1338e65e7d0239"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'ZED Marketplace';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/logo192.png'
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});