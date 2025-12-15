// components/dashboard/Navbar.jsx - UPDATED (Owner Name Removed)
import React, { useState, useEffect, useRef } from 'react';
import { FaStore, FaBell, FaSignOutAlt } from 'react-icons/fa';
import shopProfileAPI from '../../services/shopprofile';
import StoreProfileModal from '../profile/StoreProfileModal';
import authAPI from '../../services/authAPI';

const Navbar = ({ onLogout, userData }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [storeProfile, setStoreProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Safely get user data
  const getSafeUserData = () => {
    if (!userData) {
      return {
        shop: {
          name: 'My Store',
          image: null
        },
        email: 'No email'
      };
    }
    
    // Handle different response structures
    if (userData.success && userData.data) {
      return {
        shop: {
          name: userData.data.shop?.name || 'My Store',
          image: userData.data.shop?.image || null
        },
        email: userData.data.email || 'No email'
      };
    }
    
    // If userData is directly the object
    return {
      shop: {
        name: userData.shop?.name || 'My Store',
        image: userData.shop?.image || null
      },
      email: userData.email || 'No email'
    };
  };

  const safeUserData = getSafeUserData();

  // Get display name (Store Name only)
  const getDisplayName = () => {
    return safeUserData.shop.name || 'My Store';
  };

  // Get display image
  const getDisplayImage = () => {
    return safeUserData.shop?.image || null;
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      onLogout();
      setLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const handleStoreProfileClick = async () => {
    try {
      setLoadingProfile(true);
      const response = await shopProfileAPI.getStoreProfile();
      
      if (response && response.success) {
        setStoreProfile(response);
      } else {
        // Fallback data
        setStoreProfile({
          success: true,
          data: {
            id: 'N/A',
            email: safeUserData.email,
            phone: 'N/A',
            profileImage: null,
            accountStatus: 'Active',
            shop: {
              name: getDisplayName(),
              image: getDisplayImage()
            },
            contactName: 'Store Contact'
          }
        });
      }
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching store profile:', error);
      // Fallback to basic data if API fails
      setStoreProfile({
        success: false,
        data: {
          id: 'N/A',
          email: safeUserData.email,
          phone: 'N/A',
          profileImage: null,
          accountStatus: 'Active',
          shop: {
            name: getDisplayName(),
            image: getDisplayImage()
          },
          contactName: 'Store Contact'
        }
      });
      setShowProfileModal(true);
    } finally {
      setLoadingProfile(false);
      setIsDropdownOpen(false);
    }
  };

  const handleProfileModalClose = () => {
    setShowProfileModal(false);
    setStoreProfile(null);
  };

  return (
    <>
      {/* Store Profile Modal */}
      {showProfileModal && (
        <StoreProfileModal
          profile={storeProfile}
          onClose={handleProfileModalClose}
        />
      )}

      <nav className="bg-white border-b border-gray-200 shadow-sm" style={{ fontFamily: 'Metropolis, sans-serif' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#555555' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden md:block">
                <h2 
                  className="text-lg font-semibold"
                  style={{ 
                    color: '#000000',
                    fontFamily: 'Metropolis, sans-serif',
                    fontWeight: 600 
                  }}
                >
                  Welcome to {getDisplayName()} Dashboard
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              {/* <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <FaBell className="w-5 h-5" style={{ color: '#555555' }} />
                
              </button> */}

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center p-2 space-x-3 rounded-lg hover:bg-gray-100"
                  style={{ fontFamily: 'Metropolis, sans-serif' }}
                >
                  {getDisplayImage() ? (
                    <div className="w-8 h-8 overflow-hidden rounded-full">
                      <img 
                        src={getDisplayImage()} 
                        alt="Store" 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="flex items-center justify-center w-full h-full bg-gradient-to-r from-green-500 to-emerald-600">
                              <span class="font-medium text-white" style="font-family: 'Metropolis', sans-serif">
                                ${getInitials()}
                              </span>
                            </div>
                          `;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
                      <span 
                        className="font-medium text-white"
                        style={{ 
                          fontFamily: 'Metropolis, sans-serif',
                          fontWeight: 500 
                        }}
                      >
                        {getInitials()}
                      </span>
                    </div>
                  )}
                  <div className="hidden text-left md:block">
                    <p 
                      className="text-sm font-medium"
                      style={{ 
                        color: '#000000',
                        fontFamily: 'Metropolis, sans-serif',
                        fontWeight: 500 
                      }}
                    >
                      {getDisplayName()}
                    </p>
                    <p 
                      className="text-xs text-gray-500 truncate max-w-[120px]"
                      style={{ fontFamily: 'Metropolis, sans-serif' }}
                    >
                      {safeUserData.email}
                    </p>
                  </div>
                  <svg className="w-4 h-4 transition-transform duration-200" style={{ 
                    color: '#555555',
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    onMouseLeave={handleMouseLeave}
                    className="absolute right-0 z-50 w-56 py-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl"
                    style={{ fontFamily: 'Metropolis, sans-serif' }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate" title={getDisplayName()}>
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate" title={safeUserData.email}>
                        {safeUserData.email}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleStoreProfileClick}
                      disabled={loadingProfile}
                      className="flex items-center w-full px-4 py-3 space-x-3 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                      style={{ color: '#000000' }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                        <FaStore className="w-4 h-4" style={{ color: '#555555' }} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Store Profile</p>
                        <p className="text-xs text-gray-500">View store details</p>
                      </div>
                      {loadingProfile && (
                        <div className="w-4 h-4 ml-auto border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
                      )}
                    </button>

                    <div className="my-1 border-t border-gray-200"></div>
                    
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center w-full px-4 py-3 space-x-3 text-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
                      style={{ color: '#000000' }}
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                        <FaSignOutAlt className="w-4 h-4 text-black-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">
                          {loggingOut ? 'Logging out...' : 'Logout'}
                        </p>
                        <p className="text-xs text-gray-500">Sign out from account</p>
                      </div>
                      {loggingOut && (
                        <div className="w-4 h-4 ml-auto border-2 border-red-500 rounded-full border-t-transparent animate-spin"></div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;