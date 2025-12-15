// components/profile/profilemodel.jsx - OWNER NAME REMOVED
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaStore, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaClock,
  FaStar,
  FaShieldAlt,
  FaCalendarAlt,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaUserCheck,
  FaUserClock,
  FaBuilding,
  FaIdCard,
  FaGlobe
} from 'react-icons/fa';

const StoreProfileModal = ({ profile, onClose }) => {
  const [loading, setLoading] = useState(false);

  // Safely get profile data with defaults
  const getProfileData = () => {
    if (!profile) {
      return {
        success: false,
        data: {
          id: '',
          email: 'No email provided',
          phone: 'No phone provided',
          profileImage: null,
          accountStatus: 'Pending',
          shop: {
            name: 'My Store',
            image: null
          },
          contactName: 'Store Contact'
        }
      };
    }

    // API response structure check
    if (profile.success && profile.data) {
      const data = profile.data;
      return {
        success: true,
        data: {
          id: data.id || data._id || '',
          email: data.email || 'No email provided',
          phone: data.phone || 'No phone provided',
          profileImage: data.profileImage || null,
          accountStatus: data.accountStatus || 'Pending',
          shop: {
            name: data.shop?.name || 'My Store',
            image: data.shop?.image || null
          },
          contactName: data.contactName || data.businessDetails?.contactName || 'Store Contact'
        }
      };
    }

    // If API structure is different
    return {
      success: false,
      data: {
        id: profile.id || profile._id || '',
        email: profile.email || 'No email provided',
        phone: profile.phone || 'No phone provided',
        profileImage: profile.profileImage || null,
        accountStatus: profile.accountStatus || 'Pending',
        shop: {
          name: profile.shop?.name || 'My Store',
          image: profile.shop?.image || null
        },
        contactName: profile.contactName || profile.businessDetails?.contactName || 'Store Contact'
      }
    };
  };

  const profileData = getProfileData();

  // Format account status with gray/black theme
  const formatStatus = (status) => {
    const statusConfig = {
      'Active': { 
        color: '#000000', 
        bg: '#e2e2e2', 
        icon: <FaCheckCircle className="mr-1" />,
        label: 'Active'
      },
      'Verified': { 
        color: '#000000', 
        bg: '#d6d6d6', 
        icon: <FaUserCheck className="mr-1" />,
        label: 'Verified'
      },
      'Pending': { 
        color: '#000000', 
        bg: '#bebebe', 
        icon: <FaUserClock className="mr-1" />,
        label: 'Pending Approval'
      },
      'Suspended': { 
        color: '#000000', 
        bg: '#a6a6a6', 
        icon: <FaTimesCircle className="mr-1" />,
        label: 'Suspended'
      }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    
    return (
      <span 
        className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
        style={{ 
          backgroundColor: config.bg, 
          color: config.color,
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 500
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profileData.data.shop?.image ? (
                <div className="w-16 h-16 overflow-hidden border-2 border-gray-300 rounded-full">
                  <img 
                    src={profileData.data.shop.image} 
                    alt={profileData.data.shop.name} 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="flex items-center justify-center w-full h-full bg-gradient-to-r from-gray-900 to-black">
                          <FaStore class="text-xl text-white" />
                        </div>
                      `;
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-gray-900 to-black">
                  <FaStore className="text-2xl text-white" />
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {profileData.data.shop.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  {formatStatus(profileData.data.accountStatus)}
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <FaCalendarAlt />
                    Store Profile
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Store Information Section */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
              <h4 className="flex items-center gap-2 mb-4 font-bold text-gray-900" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                <FaBuilding className="text-gray-700" />
                Store Information
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="p-3 border border-gray-200 rounded-lg bg-white/50">
                    <p className="text-sm text-gray-600">Store Name</p>
                    <p className="font-medium text-gray-900 truncate">{profileData.data.shop.name}</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg bg-white/50">
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-medium text-gray-900 truncate">{profileData.data.contactName}</p>
                  </div>
                </div>
                
                <div className="p-3 border border-gray-200 rounded-lg bg-white/50">
                  <p className="text-sm text-gray-600">Store ID</p>
                  <p className="text-xs font-medium text-gray-900 truncate">{profileData.data.id}</p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
              <h4 className="flex items-center gap-2 mb-4 font-bold text-gray-900" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                <FaGlobe className="text-gray-700" />
                Contact Information
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white/50">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-full">
                    <FaEnvelope className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-900 truncate">{profileData.data.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white/50">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 rounded-full">
                    <FaPhone className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-900 truncate">{profileData.data.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Status Section */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
              <h4 className="flex items-center gap-2 mb-4 font-bold text-gray-900" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                <FaShieldAlt className="text-gray-700" />
                Account Status
              </h4>
              
              <div className="space-y-4">
                <div className="p-3 border border-gray-200 rounded-lg bg-white/50">
                  <p className="text-sm text-gray-600">Current Status</p>
                  <div className="mt-2">
                    {formatStatus(profileData.data.accountStatus)}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {profileData.data.accountStatus === 'Active' 
                      ? 'Your store is active and ready to accept orders.' 
                      : profileData.data.accountStatus === 'Pending'
                      ? 'Your store is pending approval. You will be notified once approved.'
                      : profileData.data.accountStatus === 'Verified'
                      ? 'Your store is verified and fully operational.'
                      : 'Your store has been suspended. Please contact support.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Store Details Section */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
              <h4 className="flex items-center gap-2 mb-4 font-bold text-gray-900" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                <FaStar className="text-gray-700" />
                Store Details
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 text-center border border-gray-200 rounded-lg bg-white/50">
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="font-medium text-gray-900">Business</p>
                </div>
                
                <div className="p-3 text-center border border-gray-200 rounded-lg bg-white/50">
                  <p className="text-sm text-gray-600">Store Type</p>
                  <p className="font-medium text-gray-900">E-commerce</p>
                </div>
                
                <div className="p-3 text-center border border-gray-200 rounded-lg bg-white/50">
                  <p className="text-sm text-gray-600">Platform</p>
                  <p className="font-medium text-gray-900">Marketplace</p>
                </div>
                
                <div className="p-3 text-center border border-gray-200 rounded-lg bg-white/50">
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      profileData.data.accountStatus === 'Active' 
                        ? 'text-black bg-gray-200' 
                        : 'text-black bg-gray-300'
                    }`}>
                      {profileData.data.accountStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span>Showing store profile information</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 font-medium text-white transition-all duration-300 transform rounded-lg hover:scale-[1.02] hover:shadow-lg focus:outline-none"
                style={{ 
                  background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/metropolis');
        
        img {
          max-width: 100%;
          height: auto;
          object-fit: cover;
          object-position: center;
        }
        
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default StoreProfileModal;