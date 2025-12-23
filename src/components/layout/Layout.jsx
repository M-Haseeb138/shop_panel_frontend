// components/layout/Layout.jsx - UPDATED FOR SETTINGS
// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Sidebar from '../dashboard/Sidebar';
// import Navbar from '../dashboard/Navbar';

// const Layout = ({ children, onLogout, userData }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   console.log('📍 Layout - Current location:', location.pathname);

//   // Extract current page from pathname
//   const getCurrentPage = () => {
//     const path = location.pathname.split('/')[1];
//     if (!path) return 'dashboard';
    
//     // Map routes to sidebar items - UPDATED to include orders and settings
//     const routeMap = {
//       'dashboard': 'dashboard',
//       'orders': 'orders',
//       'products': 'products',
//       'add-product': 'products',
//       'update-product': 'products',
//       'preview-product': 'products',
//       'settings': 'settings', // ADD THIS LINE
//       'inventory': 'inventory',
//       'customers': 'customers',
//       'analytics': 'analytics'
//     };
    
//     return routeMap[path] || 'dashboard';
//   };

//   const currentPage = getCurrentPage();

//   const handleNavigation = (page) => {
//     console.log('📍 Layout - Sidebar clicked - navigating to:', page);
    
//     if (page.includes('/')) {
//       console.error('⚠️ Invalid navigation path:', page);
//       return;
//     }
    
//     switch (page) {
//       case 'dashboard':
//         navigate('/dashboard');
//         break;
//       case 'orders':
//         navigate('/orders');
//         break;
//       case 'products':
//         navigate('/products');
//         break;
//       case 'settings': // ADD THIS CASE
//         navigate('/settings');
//         break;
//       case 'inventory':
//         alert('Inventory page is coming soon!');
//         break;
//       case 'customers':
//         alert('Customers page is coming soon!');
//         break;
//       case 'analytics':
//         alert('Analytics page is coming soon!');
//         break;
//       default:
//         navigate('/dashboard');
//     }
//   };

//   // Log to debug
//   console.log('📍 Layout - Current page:', currentPage);
//   console.log('📍 Layout - User Data available:', !!userData);

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <Sidebar 
//         activePage={currentPage} 
//         navigateTo={handleNavigation}
//         userData={userData}
//       />
      
//       {/* Main Content */}
//       <div className="flex flex-col flex-1 overflow-hidden">
//         {/* Navbar */}
//         <Navbar onLogout={onLogout} userData={userData} />
        
//         {/* Page Content */}
//         <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto md:p-6 bg-gray-50">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

// components/layout/Layout.jsx - MINOR UPDATE
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';
import Navbar from '../dashboard/Navbar';

const Layout = ({ children, onLogout, userData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log('📍 Layout - Current location:', location.pathname);

  // Extract current page from pathname
  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'dashboard';
    
    const routeMap = {
      'dashboard': 'dashboard',
      'orders': 'orders',
      'products': 'products',
      'add-product': 'products',
      'update-product': 'products',
      'preview-product': 'products',
      'settings': 'settings',
      'inventory': 'inventory',
      'customers': 'customers',
      'analytics': 'analytics'
    };
    
    return routeMap[path] || 'dashboard';
  };

  const currentPage = getCurrentPage();

  const handleNavigation = (page) => {
    console.log('📍 Layout - Sidebar clicked - navigating to:', page);
    
    if (page.includes('/')) {
      console.error('⚠️ Invalid navigation path:', page);
      return;
    }
    
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'products':
        navigate('/products');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'inventory':
        alert('Inventory page is coming soon!');
        break;
      case 'customers':
        alert('Customers page is coming soon!');
        break;
      case 'analytics':
        alert('Analytics page is coming soon!');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        activePage={currentPage} 
        navigateTo={handleNavigation}
        userData={userData}
      />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar onLogout={onLogout} userData={userData} />
        
        {/* Page Content */}
        <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;