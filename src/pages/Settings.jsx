import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProfileSettings from '../components/settings/ProfileSettings';
import ShopSettings from '../components/settings/ShopSettings';

const Settings = ({ onLogout, userData }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'profile', label: 'Personal Profile' },
    { id: 'shop', label: 'Shop Settings' }
  ];

  const handleUpdateSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout onLogout={onLogout} userData={userData}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account and shop preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 space-x-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'profile' && (
            <ProfileSettings 
              key={`profile-${refreshKey}`}
              userData={userData} 
              onUpdate={handleUpdateSuccess}
            />
          )}

          {activeTab === 'shop' && (
            <ShopSettings 
              key={`shop-${refreshKey}`}
              userData={userData} 
              onUpdate={handleUpdateSuccess}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;