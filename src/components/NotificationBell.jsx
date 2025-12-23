// src/components/NotificationBell.jsx - CLEAN VERSION
// import React, { useState, useEffect } from 'react';
// import { initializeAndSaveFCM, isFCMInitialized } from '../services/fcmAPI';

// const BellIcon = () => (
//   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//   </svg>
// );

// const BellAlertIcon = () => (
//   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//     <path d="M12 2c1.1 0 2 .9 2 2v.29c2.89.86 5 3.54 5 6.71v4.29l2 3v1H5v-1l2-3V11c0-3.17 2.11-5.85 5-6.71V4c0-1.1.9-2 2-2zm0 18c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3z" />
//   </svg>
// );

// const NotificationBell = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [fcmEnabled, setFcmEnabled] = useState(false);

//   useEffect(() => {
//     checkFCMStatus();
//     setupFirebaseListener();
//     loadInitialNotifications();
//   }, []);

//   const checkFCMStatus = () => {
//     const hasFCM = isFCMInitialized();
//     const permission = Notification.permission;
//     setFcmEnabled(hasFCM && permission === 'granted');
//   };

//   const setupFirebaseListener = async () => {
//     try {
//       const firebaseModule = await import('../firebase/firebase');
      
//       firebaseModule.onMessageListener((payload) => {
//         if (payload.notification) {
//           if ('Notification' in window && Notification.permission === 'granted') {
//             try {
//               const notification = new Notification(
//                 payload.notification.title || 'New Notification', 
//                 {
//                   body: payload.notification.body,
//                   icon: '/logo192.png'
//                 }
//               );
              
//               notification.onclick = () => {
//                 window.focus();
//                 if (payload.data && payload.data.orderId) {
//                   window.location.href = `/orders/${payload.data.orderId}`;
//                 } else {
//                   window.location.href = '/orders';
//                 }
//               };
//             } catch (error) {
//               // Silent fail
//             }
//           }
          
//           addNotification({
//             _id: Date.now().toString(),
//             title: payload.notification.title || 'Notification',
//             body: payload.notification.body || '',
//             read: false,
//             createdAt: new Date().toISOString(),
//             data: payload.data || {},
//             isPushNotification: true
//           });
//         }
//       });
//     } catch (error) {
//       // Silent fail
//     }
//   };

//   const loadInitialNotifications = () => {
//     setLoading(true);
//     const savedNotifications = localStorage.getItem('shopOwnerNotifications');
    
//     if (savedNotifications) {
//       try {
//         const parsed = JSON.parse(savedNotifications);
//         setNotifications(parsed);
//         const unread = parsed.filter(n => !n.read).length;
//         setUnreadCount(unread);
//       } catch (error) {
//         loadDemoNotifications();
//       }
//     } else {
//       loadDemoNotifications();
//     }
//     setLoading(false);
//   };

//   const loadDemoNotifications = () => {
//     const demoNotifications = [
//       {
//         _id: '1',
//         title: 'Welcome to ZED Marketplace!',
//         body: 'Your shop is now ready to receive orders',
//         read: false,
//         createdAt: new Date(Date.now() - 3600000).toISOString(),
//         data: { type: 'welcome' }
//       },
//       {
//         _id: '2',
//         title: 'Get Started Guide',
//         body: 'Learn how to add products and manage your store',
//         read: false,
//         createdAt: new Date(Date.now() - 86400000).toISOString(),
//         data: { type: 'guide' }
//       }
//     ];
    
//     setNotifications(demoNotifications);
//     setUnreadCount(2);
//     saveNotifications(demoNotifications);
//   };

//   const saveNotifications = (notifs) => {
//     try {
//       localStorage.setItem('shopOwnerNotifications', JSON.stringify(notifs));
//     } catch (error) {
//       // Silent fail
//     }
//   };

//   const addNotification = (notification) => {
//     setNotifications(prev => {
//       const newNotifications = [notification, ...prev.slice(0, 49)];
//       saveNotifications(newNotifications);
//       return newNotifications;
//     });
    
//     setUnreadCount(prev => prev + 1);
//   };

//   const handleEnableNotifications = async () => {
//     try {
//       const result = await initializeAndSaveFCM();
      
//       if (result.success) {
//         setFcmEnabled(true);
//         addNotification({
//           _id: Date.now().toString(),
//           title: 'Notifications Enabled',
//           body: 'You will now receive push notifications for new orders',
//           read: false,
//           createdAt: new Date().toISOString(),
//           data: { type: 'system' }
//         });
//       }
//     } catch (error) {
//       // Silent fail
//     }
//   };

//   const handleMarkAsRead = (notificationId) => {
//     setNotifications(prev => {
//       const updated = prev.map(n => 
//         n._id === notificationId ? { ...n, read: true } : n
//       );
//       saveNotifications(updated);
//       return updated;
//     });
    
//     setUnreadCount(prev => Math.max(0, prev - 1));
//   };

//   const handleMarkAllAsRead = () => {
//     setNotifications(prev => {
//       const updated = prev.map(n => ({ ...n, read: true }));
//       saveNotifications(updated);
//       return updated;
//     });
    
//     setUnreadCount(0);
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     return date.toLocaleDateString();
//   };

//   const handleNotificationClick = (notification) => {
//     if (!notification.read) {
//       handleMarkAsRead(notification._id);
//     }
    
//     if (notification.data?.type === 'new_order') {
//       window.location.href = `/orders/${notification.data.orderId}`;
//     } else if (notification.data?.type === 'order_status_update') {
//       window.location.href = `/orders`;
//     }
    
//     setShowDropdown(false);
//   };

//   const handleClearAll = () => {
//     setNotifications([]);
//     setUnreadCount(0);
//     localStorage.removeItem('shopOwnerNotifications');
//   };

//   return (
//     <div className="relative">
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => setShowDropdown(!showDropdown)}
//           className="relative p-2 transition-colors rounded-lg hover:bg-gray-100"
//           aria-label="Notifications"
//         >
//           {unreadCount > 0 ? <BellAlertIcon /> : <BellIcon />}
          
//           {unreadCount > 0 && (
//             <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
//               {unreadCount > 9 ? '9+' : unreadCount}
//             </span>
//           )}
//         </button>
        
//         {!fcmEnabled && Notification.permission !== 'granted' && (
//           <button
//             onClick={handleEnableNotifications}
//             className="px-2 py-1 text-xs text-yellow-800 transition-colors bg-yellow-100 rounded hover:bg-yellow-200"
//           >
//             Enable
//           </button>
//         )}
//       </div>

//       {showDropdown && (
//         <div className="absolute right-0 z-50 mt-2 bg-white border rounded-lg shadow-lg w-80">
//           <div className="p-4 border-b">
//             <div className="flex items-center justify-between">
//               <h3 className="font-semibold text-gray-800">Notifications</h3>
//               <div className="flex gap-2">
//                 {notifications.length > 0 && unreadCount > 0 && (
//                   <button
//                     onClick={handleMarkAllAsRead}
//                     className="text-sm text-blue-600 transition-colors hover:text-blue-800"
//                   >
//                     Mark all read
//                   </button>
//                 )}
//                 {notifications.length > 0 && (
//                   <button
//                     onClick={handleClearAll}
//                     className="text-sm text-red-600 transition-colors hover:text-red-800"
//                   >
//                     Clear all
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
          
//           <div className="overflow-y-auto max-h-96">
//             {loading ? (
//               <div className="p-8 text-center">
//                 <div className="w-8 h-8 mx-auto border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
//                 <p className="mt-2 text-sm text-gray-500">Loading...</p>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="p-8 text-center">
//                 <BellIcon />
//                 <p className="mt-2 text-gray-500">No notifications yet</p>
//                 <p className="mt-1 text-sm text-gray-400">You'll see notifications here</p>
//               </div>
//             ) : (
//               notifications.map(notification => (
//                 <div
//                   key={notification._id}
//                   onClick={() => handleNotificationClick(notification)}
//                   className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
//                     !notification.read ? 'bg-blue-50 hover:bg-blue-100' : ''
//                   }`}
//                 >
//                   <div className="flex gap-3">
//                     <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
//                       !notification.read ? 'bg-blue-500' : 'bg-gray-300'
//                     }`}></div>
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-medium text-gray-900 truncate">{notification.title}</h4>
//                       <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notification.body}</p>
//                       <p className="mt-2 text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
//                     </div>
//                     {!notification.read && (
//                       <span className="flex-shrink-0 text-xs font-medium text-blue-600">New</span>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
          
//           {notifications.length > 0 && (
//             <div className="p-4 border-t">
//               <div className="text-sm text-gray-500">
//                 Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
//                 {unreadCount > 0 && ` (${unreadCount} unread)`}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationBell;

////////////////////////////////
// src/components/NotificationBell.jsx - UPDATED (NO DEMO NOTIFICATIONS)
import React, { useState, useEffect } from 'react';
import { initializeAndSaveFCM, isFCMInitialized } from '../services/fcmAPI';

const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const BellAlertIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2c1.1 0 2 .9 2 2v.29c2.89.86 5 3.54 5 6.71v4.29l2 3v1H5v-1l2-3V11c0-3.17 2.11-5.85 5-6.71V4c0-1.1.9-2 2-2zm0 18c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3z" />
  </svg>
);

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fcmEnabled, setFcmEnabled] = useState(false);

  useEffect(() => {
    checkFCMStatus();
    setupFirebaseListener();
    loadInitialNotifications();
  }, []);

  const checkFCMStatus = () => {
    const hasFCM = isFCMInitialized();
    const permission = Notification.permission;
    setFcmEnabled(hasFCM && permission === 'granted');
  };

  const setupFirebaseListener = async () => {
    try {
      const firebaseModule = await import('../firebase/firebase');
      
      firebaseModule.onMessageListener((payload) => {
        if (payload.notification) {
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const notification = new Notification(
                payload.notification.title || 'New Notification', 
                {
                  body: payload.notification.body,
                  icon: '/logo192.png'
                }
              );
              
              notification.onclick = () => {
                window.focus();
                if (payload.data && payload.data.orderId) {
                  window.location.href = `/orders/${payload.data.orderId}`;
                } else {
                  window.location.href = '/orders';
                }
              };
            } catch (error) {
              // Silent fail
            }
          }
          
          addNotification({
            _id: Date.now().toString(),
            title: payload.notification.title || 'Notification',
            body: payload.notification.body || '',
            read: false,
            createdAt: new Date().toISOString(),
            data: payload.data || {},
            isPushNotification: true
          });
        }
      });
    } catch (error) {
      // Silent fail
    }
  };

  // ✅ UPDATED: Load initial notifications (NO DEMO)
  const loadInitialNotifications = () => {
    setLoading(true);
    const savedNotifications = localStorage.getItem('shopOwnerNotifications');
    
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        const unread = parsed.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        // If error loading, set empty notifications
        setNotifications([]);
        setUnreadCount(0);
        saveNotifications([]);
      }
    } else {
      // No saved notifications, set empty
      setNotifications([]);
      setUnreadCount(0);
      saveNotifications([]);
    }
    setLoading(false);
  };

  // ✅ REMOVED: loadDemoNotifications function completely
  // No demo notifications will be loaded

  const saveNotifications = (notifs) => {
    try {
      localStorage.setItem('shopOwnerNotifications', JSON.stringify(notifs));
    } catch (error) {
      // Silent fail
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev.slice(0, 49)];
      saveNotifications(newNotifications);
      return newNotifications;
    });
    
    setUnreadCount(prev => prev + 1);
  };

  const handleEnableNotifications = async () => {
    try {
      const result = await initializeAndSaveFCM();
      
      if (result.success) {
        setFcmEnabled(true);
        // ✅ OPTIONAL: Only add notification if you want
        // addNotification({
        //   _id: Date.now().toString(),
        //   title: 'Notifications Enabled',
        //   body: 'You will now receive push notifications for new orders',
        //   read: false,
        //   createdAt: new Date().toISOString(),
        //   data: { type: 'system' }
        // });
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
    
    setUnreadCount(0);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    
    if (notification.data?.type === 'new_order') {
      window.location.href = `/orders/${notification.data.orderId}`;
    } else if (notification.data?.type === 'order_status_update') {
      window.location.href = `/orders`;
    }
    
    setShowDropdown(false);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('shopOwnerNotifications');
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative p-2 transition-colors rounded-lg hover:bg-gray-100"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? <BellAlertIcon /> : <BellIcon />}
          
          {unreadCount > 0 && (
            <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        
        {!fcmEnabled && Notification.permission !== 'granted' && (
          <button
            onClick={handleEnableNotifications}
            className="px-2 py-1 text-xs text-yellow-800 transition-colors bg-yellow-100 rounded hover:bg-yellow-200"
          >
            Enable
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute right-0 z-50 mt-2 bg-white border rounded-lg shadow-lg w-80">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 transition-colors hover:text-blue-800"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-600 transition-colors hover:text-red-800"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-96">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 mx-auto border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon />
                <p className="mt-2 text-gray-500">No notifications yet</p>
                <p className="mt-1 text-sm text-gray-400">You'll see notifications here</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 hover:bg-blue-100' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                      !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{notification.title}</h4>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notification.body}</p>
                      <p className="mt-2 text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
                    </div>
                    {!notification.read && (
                      <span className="flex-shrink-0 text-xs font-medium text-blue-600">New</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                {unreadCount > 0 && ` (${unreadCount} unread)`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;