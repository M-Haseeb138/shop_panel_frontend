import React from 'react';
import 'typeface-metropolis';

const Sidebar = ({ activePage, navigateTo }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'products', label: 'Products' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleClick = (pageId) => {
    if (typeof navigateTo === 'function') {
      navigateTo(pageId);
    } else {
      console.error('navigateTo is not a function');
    }
  };

  return (
    <div className="w-64 bg-black dow-lg " style={{ fontFamily: 'Metropolis, sans-serif' }}>
      
      {/* TOP LOGO SECTION */}
      <div className="p-4 text-center text-black border-b border-gray-200">
        <img
          src="\images\zed.png"
          alt="Shop owner"
          className="mx-auto"
          style={{ maxWidth: '120px', height: 'auto' }}
        /> <h2 style={{ fontFamily: 'Metropolis, sans-serif',color:'white' }}><strong> SHOP OWNER </strong></h2>
      </div>

      {/* MENU SECTION */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'text-gray-600 border border-gray-400'
                    : 'hover:bg-gray-800'
                }`}
                style={{
                  fontFamily: 'Metropolis, sans-serif',
                  backgroundColor: activePage === item.id ? '#e2e2e2ff' : 'transparent',
                  color: activePage === item.id ? '#000' : '#FFF',
                  fontWeight: activePage === item.id ? 600 : 500,
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

Sidebar.defaultProps = {
  activePage: 'dashboard',
  navigateTo: () => console.warn('navigateTo not implemented'),
};

export default Sidebar;
