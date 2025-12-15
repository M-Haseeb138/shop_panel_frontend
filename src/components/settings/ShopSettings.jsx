import React, { useState, useEffect } from 'react';
import settingsAPI from '../../services/settingsAPI';

const ShopSettings = ({ userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    openTime: '09:00',
    closeTime: '18:00',
    preparationTime: '',
    shopImage: null,
    imagePreview: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchShopDetails();
  }, []);

  const fetchShopDetails = async () => {
    try {
      const response = await settingsAPI.getShopOwnerProfile();
      if (response.success) {
        const data = response.data || response;
        
        // Extract shop data from response
        const shopData = data.shop || data.businessDetails || {};
        
        setFormData(prev => ({
          ...prev,
          shopName: shopData.name || '',
          description: shopData.description || '',
          openTime: shopData.openTime || '09:00',
          closeTime: shopData.closeTime || '18:00',
          preparationTime: shopData.preparationTime || '',
          imagePreview: shopData.image || null
        }));
        
        console.log('✅ Shop data loaded:', shopData);
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For preparation time, only allow numbers
    if (name === 'preparationTime') {
      // Remove non-numeric characters
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        shopImage: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.shopName.trim()) {
      setMessage({ type: 'error', text: 'Shop name is required' });
      return;
    }
    
    // Validate preparation time is a number and positive
    const prepTime = parseInt(formData.preparationTime);
    if (isNaN(prepTime) || prepTime <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid preparation time (positive number)' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const response = await settingsAPI.updateShopDetails({
        ...formData,
        preparationTime: prepTime
      });
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Shop details updated successfully' });
        if (onUpdate) onUpdate(response.data);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update shop details' });
      }
    } catch (error) {
      console.error('Error updating shop details:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update shop details. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      shopImage: null,
      imagePreview: null
    }));
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">Shop Details</h2>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Image Upload */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Shop Image
          </label>
          <div className="flex items-center space-x-6">
            <div className="relative w-32 h-32 overflow-hidden border border-gray-300 rounded-lg">
              {formData.imagePreview ? (
                <img
                  src={formData.imagePreview}
                  alt="Shop preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-100">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <input
                  type="file"
                  id="shopImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="shopImage"
                  className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {formData.imagePreview ? 'Change Image' : 'Upload Image'}
                </label>
              </div>
              {formData.imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 transition-colors border border-red-200 rounded-lg bg-red-50 hover:bg-red-100"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Shop Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Shop Name *
          </label>
          <input
            type="text"
            name="shopName"
            value={formData.shopName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter your shop name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Shop Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Describe your shop..."
          />
        </div>

        {/* Business Hours */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Opening Time
            </label>
            <input
              type="time"
              name="openTime"
              value={formData.openTime}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Closing Time
            </label>
            <input
              type="time"
              name="closeTime"
              value={formData.closeTime}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Preparation Time */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Preparation Time (minutes) *
          </label>
          <input
            type="text"
            name="preparationTime"
            value={formData.preparationTime}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Enter preparation time in minutes"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <p className="mt-2 text-sm text-gray-500">
            Time needed to prepare orders (in minutes)
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-white transition-colors bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Shop Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShopSettings;