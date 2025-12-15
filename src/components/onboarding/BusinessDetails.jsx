// components/onboarding/BusinessDetails.jsx - UPDATED WITH CONSISTENT GRAY COLORS
import React, { useState, useEffect, useRef } from 'react';
import 'typeface-metropolis';
import categoriesAPI from '../../services/categoriesAPI';

const BusinessDetails = ({ formData, updateFormData, onNext, onBack, loading }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [addressError, setAddressError] = useState('');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [apiCategories, setApiCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  // Consistent gray color variables
  const grayColors = {
    light: '#f5f5f5',      // Light gray for backgrounds
    medium: '#e2e2e2',     // Medium gray (same as Tiered Approval System)
    dark: '#bebebe',       // Dark gray (same as Tiered Approval System border)
    text: '#555555',       // Text gray
    border: '#cccccc',     // Border gray
    focus: '#999999',      // Focus ring gray
  };

  // Initialize form data properly
  const [localFormData, setLocalFormData] = useState(() => {
    const defaults = {
      storeName: '',
      businessType: '',
      contactName: '',
      email: formData?.email || '',
      phoneNumber: formData?.phoneNumber || '',
      altPhoneNumber: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      openTime: '09:00',
      closeTime: '18:00',
      latitude: '',
      longitude: '',
      categories: [],
      storeDescription: ''
    };
    
    if (formData) {
      return {
        ...defaults,
        ...formData,
        categories: formData.categories || []
      };
    }
    
    return defaults;
  });

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoriesAPI.getCategories();
        
        let categoriesArray = [];
        
        if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
          categoriesArray = response.data.categories;
        } else if (Array.isArray(response.data)) {
          categoriesArray = response.data;
        }
        
        setApiCategories(categoriesArray);
        
      } catch (error) {
        console.error('Failed to load categories from API:', error);
        const defaultCategories = [
          { category_id: 'electronics', category_name: 'Electronics' },
          { category_id: 'fashion', category_name: 'Fashion' },
          { category_id: 'grocery', category_name: 'Grocery' },
          { category_id: 'beauty', category_name: 'Beauty' },
          { category_id: 'sports', category_name: 'Sports' }
        ];
        setApiCategories(defaultCategories);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);

  useEffect(() => {
    if (formData?.categories) {
      setSelectedCategories(formData.categories);
    }
  }, [formData]);

  const updateFormDataField = (updates) => {
    setLocalFormData(prev => {
      const newData = { ...prev, ...updates };
      updateFormData(newData);
      return newData;
    });
  };

  const handleInputChange = (field, value) => {
    updateFormDataField({ [field]: value });
  };

  // Google Maps Autocomplete Initialization
  useEffect(() => {
    const initializeAutocomplete = async () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCcnrJzc_eila82oN703gCfCX60oQFzPVs&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setMapsLoaded(true);
          initializeAutocompleteInstance();
        };
        
        script.onerror = () => {
          console.error('Failed to load Google Maps API');
          setAddressError('Failed to load address suggestions. Please enter address manually.');
        };
        
        document.head.appendChild(script);
      } else {
        setMapsLoaded(true);
        initializeAutocompleteInstance();
      }
    };

    const initializeAutocompleteInstance = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('Google Maps Places API not available');
        return;
      }

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: ['us', 'ca', 'in', 'au', 'gb'] },
            fields: ['address_components', 'geometry', 'formatted_address']
          }
        );

        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setAddressError('Address suggestions temporarily unavailable. Please enter address manually.');
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    
    if (!place.geometry) {
      setAddressError('Please select a valid address from suggestions');
      return;
    }

    const addressInfo = {
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng()
    };

    place.address_components.forEach(component => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        addressInfo.streetAddress = component.long_name;
      } else if (types.includes('route')) {
        addressInfo.streetAddress = addressInfo.streetAddress 
          ? `${addressInfo.streetAddress} ${component.long_name}`
          : component.long_name;
      } else if (types.includes('sublocality_level_1') || types.includes('locality')) {
        addressInfo.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        addressInfo.state = component.long_name;
      } else if (types.includes('postal_code')) {
        addressInfo.zipCode = component.long_name;
      } else if (types.includes('postal_code_suffix')) {
        addressInfo.zipCode = addressInfo.zipCode 
          ? `${addressInfo.zipCode}-${component.long_name}`
          : component.long_name;
      } else if (types.includes('country')) {
        addressInfo.country = component.long_name;
      }
    });

    if (!addressInfo.streetAddress && place.formatted_address) {
      addressInfo.streetAddress = place.formatted_address;
    }

    updateFormDataField({
      streetAddress: addressInfo.streetAddress,
      city: addressInfo.city,
      state: addressInfo.state,
      zipCode: addressInfo.zipCode,
      country: addressInfo.country,
      latitude: addressInfo.latitude.toString(),
      longitude: addressInfo.longitude.toString()
    });

    setAddressError('');
  };

  const handleManualAddressChange = (field, value) => {
    updateFormDataField({ [field]: value });
  };

  const handleCategoryToggle = (categoryValue) => {
    const newCategories = selectedCategories.includes(categoryValue)
      ? selectedCategories.filter(c => c !== categoryValue)
      : [...selectedCategories, categoryValue];
    
    setSelectedCategories(newCategories);
    updateFormDataField({ categories: newCategories });
  };

  const formatCoordinate = (coord) => {
    if (!coord) return '';
    const num = parseFloat(coord);
    return isNaN(num) ? coord : num.toFixed(6);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!localFormData.storeName?.trim()) {
      errors.push('Store Name');
    }
    
    if (!localFormData.businessType?.trim()) {
      errors.push('Business Type');
    }
    
    if (!localFormData.contactName?.trim()) {
      errors.push('Contact Name');
    }
    
    if (!localFormData.streetAddress?.trim()) {
      errors.push('Street Address');
    }
    
    if (!localFormData.city?.trim()) {
      errors.push('City');
    }
    
    if (!localFormData.state?.trim()) {
      errors.push('State');
    }
    
    if (!localFormData.zipCode?.trim()) {
      errors.push('Zip/Postal Code');
    }
    
    if (!localFormData.country?.trim()) {
      errors.push('Country');
    }
    
    if (!localFormData.openTime?.trim()) {
      errors.push('Opening Time');
    }
    
    if (!localFormData.closeTime?.trim()) {
      errors.push('Closing Time');
    }
    
    if (localFormData.openTime && localFormData.closeTime) {
      const open = new Date(`2000-01-01T${localFormData.openTime}`);
      const close = new Date(`2000-01-01T${localFormData.closeTime}`);
      
      if (open >= close) {
        errors.push('Opening time must be before closing time');
      }
    }
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n\n• ${errors.join('\n• ')}`);
      return;
    }
    
    const businessData = {
      name: localFormData.storeName.trim(),
      description: localFormData.storeDescription?.trim() || '',
      businessType: localFormData.businessType,
      contactName: localFormData.contactName.trim(),
      openTime: localFormData.openTime || '09:00',
      closeTime: localFormData.closeTime || '18:00',
      streetAddress: localFormData.streetAddress.trim(),
      city: localFormData.city.trim(),
      state: localFormData.state.trim(),
      zipCode: localFormData.zipCode.trim(),
      country: localFormData.country.trim(),
      categories: selectedCategories,
      ...(localFormData.latitude && { latitude: localFormData.latitude }),
      ...(localFormData.longitude && { longitude: localFormData.longitude }),
      ...(localFormData.altPhoneNumber && { altPhoneNumber: localFormData.altPhoneNumber.trim() })
    };
    
    onNext(businessData);
  };

  const businessTypes = [
    "Sole Proprietorship",
    "Partnership",
    "Corporation",
    "Limited Liability Company (LLC)",
    "Co‑operative (Co‑op)",
    "Not-for-Profit / Non-Profit Corporation",
    "Franchise",
    "Other"
  ];

  return (
    <div className="space-y-8" style={{ fontFamily: 'Metropolis, sans-serif' }}>
      <div>
        <h2 
          className="mb-2 text-2xl font-bold"
          style={{ 
            color: '#000000',
            fontWeight: 700 
          }}
        >
          Business Details
        </h2>
        <p style={{ color: grayColors.text }}>
          Please provide accurate information about your business.
        </p>
      </div>

      {/* Business Information */}
      <div className="space-y-6">
        <h3 
          className="text-lg font-semibold"
          style={{ 
            color: '#000000',
            fontWeight: 600 
          }}
        >
          Business Information
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label 
                className="block mb-2 text-sm font-medium"
                style={{ 
                  color: '#000000',
                  fontWeight: 500 
                }}
              >
                Store Name *
              </label>
              <input
                type="text"
                value={localFormData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                placeholder="Enter your store name"
                required
                style={{ 
                  fontFamily: 'Metropolis, sans-serif',
                  borderColor: grayColors.border,
                  backgroundColor: grayColors.light,
                  color: '#000000'
                }}
              />
            </div>

            <div>
              <label 
                className="block mb-2 text-sm font-medium"
                style={{ 
                  color: '#000000',
                  fontWeight: 500 
                }}
              >
                Business Type *
              </label>
              <select
                value={localFormData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                required
                style={{ 
                  fontFamily: 'Metropolis, sans-serif',
                  borderColor: grayColors.border,
                  backgroundColor: grayColors.light,
                  color: '#000000'
                }}
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Store Description Field */}
          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Store Description
            </label>
            <textarea
              value={localFormData.storeDescription}
              onChange={(e) => handleInputChange('storeDescription', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              placeholder="Tell customers about your store, products, and services..."
              rows={4}
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: '#000000'
              }}
            />
            <p className="mt-1 text-xs" style={{ color: grayColors.text }}>
              Describe your store to help customers understand what you offer
            </p>
          </div>
        </div>

        {/* Business Hours Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Opening Time *
            </label>
            <input
              type="time"
              value={localFormData.openTime}
              onChange={(e) => handleInputChange('openTime', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              required
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: '#000000'
              }}
            />
            <p className="mt-1 text-xs" style={{ color: grayColors.text }}>
              When your store opens for business
            </p>
          </div>

          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Closing Time *
            </label>
            <input
              type="time"
              value={localFormData.closeTime}
              onChange={(e) => handleInputChange('closeTime', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              required
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: '#000000'
              }}
            />
            <p className="mt-1 text-xs" style={{ color: grayColors.text }}>
              When your store closes for the day
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <h3 
          className="text-lg font-semibold"
          style={{ 
            color: '#000000',
            fontWeight: 600 
          }}
        >
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Contact Name *
            </label>
            <input
              type="text"
              value={localFormData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              placeholder="Full name"
              required
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: '#000000'
              }}
            />
          </div>

          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Business Email *
            </label>
            <input
              type="email"
              value={localFormData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              placeholder="email@example.com"
              disabled
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: grayColors.text
              }}
            />
          </div>

          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Phone Number *
            </label>
            <input
              type="tel"
              value={localFormData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              placeholder="(123) 456-7890"
              disabled
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: grayColors.text
              }}
            />
          </div>

          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Alternative Phone Number
            </label>
            <input
              type="tel"
              value={localFormData.altPhoneNumber}
              onChange={(e) => handleInputChange('altPhoneNumber', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              placeholder="(123) 456-7890"
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: '#000000'
              }}
            />
          </div>
        </div>
      </div>

      {/* Business Location with Google Maps Autocomplete */}
      <div className="space-y-6">
        <h3 
          className="text-lg font-semibold"
          style={{ 
            color: '#000000',
            fontWeight: 600 
          }}
        >
          Business Location
        </h3>
        
        <div className="space-y-4">
          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Street Address *
            </label>
            <input
              ref={inputRef}
              type="text"
              value={localFormData.streetAddress}
              onChange={(e) => handleManualAddressChange('streetAddress', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              placeholder="Start typing your address..."
              required
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: '#000000'
              }}
            />
            {addressError && (
              <p className="mt-1 text-sm" style={{ color: '#e53e3e' }}>
                {addressError}
              </p>
            )}
            <p className="mt-1 text-sm" style={{ color: grayColors.text }}>
              {mapsLoaded 
                ? "Start typing and select from suggestions for auto-fill (includes coordinates)" 
                : "Loading address suggestions..."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label 
                className="block mb-2 text-sm font-medium"
                style={{ 
                  color: '#000000',
                  fontWeight: 500 
                }}
              >
                City *
              </label>
              <input
                type="text"
                value={localFormData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                placeholder="City"
                required
                style={{ 
                  fontFamily: 'Metropolis, sans-serif',
                  borderColor: grayColors.border,
                  backgroundColor: grayColors.light,
                  color: '#000000'
                }}
              />
            </div>

            <div>
              <label 
                className="block mb-2 text-sm font-medium"
                style={{ 
                  color: '#000000',
                  fontWeight: 500 
                }}
              >
                State/Province *
              </label>
              <input
                type="text"
                value={localFormData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                placeholder="State"
                required
                style={{ 
                  fontFamily: 'Metropolis, sans-serif',
                  borderColor: grayColors.border,
                  backgroundColor: grayColors.light,
                  color: '#000000'
                }}
              />
            </div>

            <div>
              <label 
                className="block mb-2 text-sm font-medium"
                style={{ 
                  color: '#000000',
                  fontWeight: 500 
                }}
              >
                Zip/Postal Code *
              </label>
              <input
                type="text"
                value={localFormData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                placeholder="Zip code"
                required
                style={{ 
                  fontFamily: 'Metropolis, sans-serif',
                  borderColor: grayColors.border,
                  backgroundColor: grayColors.light,
                  color: '#000000'
                }}
              />
            </div>
          </div>

          <div>
            <label 
              className="block mb-2 text-sm font-medium"
              style={{ 
                color: '#000000',
                fontWeight: 500 
              }}
            >
              Country *
            </label>
            <input
              type="text"
              value={localFormData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              placeholder="Country"
              required
              style={{ 
                fontFamily: 'Metropolis, sans-serif',
                borderColor: grayColors.border,
                backgroundColor: grayColors.light,
                color: '#000000'
              }}
            />
          </div>

          {/* Coordinates Display */}
          {(localFormData.latitude || localFormData.longitude) && (
            <div 
              className="p-3 border rounded-lg"
              style={{ 
                borderColor: grayColors.dark,
                backgroundColor: grayColors.medium,
                fontFamily: 'Metropolis, sans-serif'
              }}
            >
              <p className="text-sm font-medium" style={{ color: '#000000' }}>
                Location coordinates captured:
              </p>
              <p className="mt-1 font-mono text-xs" style={{ color: grayColors.text }}>
                [{formatCoordinate(localFormData.latitude)}, {formatCoordinate(localFormData.longitude)}]
              </p>
              <p className="mt-1 text-xs" style={{ color: grayColors.text }}>
                Latitude and longitude automatically captured from selected address
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Categories from API */}
      <div className="space-y-6">
        <h3 
          className="text-lg font-semibold"
          style={{ 
            color: '#000000',
            fontWeight: 600 
          }}
        >
          Product Categories
        </h3>
        
        {loadingCategories ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-4 rounded-full border-t-transparent animate-spin" 
              style={{ borderColor: grayColors.border, borderTopColor: 'transparent' }}></div>
            <span className="ml-3" style={{ color: grayColors.text }}>Loading categories...</span>
          </div>
        ) : apiCategories.length === 0 ? (
          <div 
            className="p-4 text-center border rounded-lg"
            style={{ 
              borderColor: grayColors.dark,
              backgroundColor: grayColors.medium
            }}
          >
            <p style={{ color: '#000000' }}>No categories available. Please contact admin to add categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {apiCategories.map(category => (
              <label
                key={category._id || category.category_id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCategories.includes(category.category_name)
                    ? "border-gray-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ 
                  fontFamily: 'Metropolis, sans-serif',
                  backgroundColor: selectedCategories.includes(category.category_name) ? grayColors.medium : grayColors.light,
                  borderColor: selectedCategories.includes(category.category_name) ? grayColors.dark : grayColors.border
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.category_name)}
                  onChange={() => handleCategoryToggle(category.category_name)}
                  className="hidden"
                />
                <span 
                  className="font-medium"
                  style={{ 
                    color: '#000000',
                    fontWeight: 500 
                  }}
                >
                  {category.category_name}
                </span>
              </label>
            ))}
          </div>
        )}
        
        <p className="text-sm" style={{ color: grayColors.text }}>
          Select the categories that best describe your products. You can select multiple categories.
        </p>
      </div>

      {/* Info Box */}
      <div 
        className="p-4 border rounded-lg"
        style={{ 
          borderColor: grayColors.dark,
          backgroundColor: grayColors.medium,
          fontFamily: 'Metropolis, sans-serif' 
        }}
      >
        <div className="flex items-start">
          <div>
            <strong style={{ color: '#000000', fontWeight: 600 }}>Tiered Approval System:</strong>
            <p className="mt-1 text-sm" style={{ color: grayColors.text }}>
              New stores start with basic verification. As your store establishes a positive track record, you'll gain access to additional features.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 transition-all border rounded-lg hover:opacity-90 focus:ring-2 focus:outline-none disabled:opacity-50"
          style={{ 
            color: '#000000',
            fontFamily: 'Metropolis, sans-serif',
            fontWeight: 500,
            borderColor: grayColors.dark,
            backgroundColor: grayColors.light
          }}
        >
          <span>Back</span>
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg hover:opacity-90 focus:ring-2 focus:outline-none disabled:opacity-50"
          style={{ 
            backgroundColor: '#000000',
            fontFamily: 'Metropolis, sans-serif',
            fontWeight: 500 
          }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Next</span>
            </>
          )}
        </button>
      </div>

      {/* Custom CSS for time input */}
      <style jsx global>{`
        /* Style time input picker */
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5); /* Makes the clock icon gray */
          opacity: 0.7;
          cursor: pointer;
        }
        
        input[type="time"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        
        /* Style for focused inputs */
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: ${grayColors.dark} !important;
          box-shadow: 0 0 0 2px ${grayColors.focus}20 !important;
        }
        
        /* Style for disabled inputs */
        input:disabled, select:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default BusinessDetails;

