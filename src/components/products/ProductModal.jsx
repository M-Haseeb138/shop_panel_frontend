// components/products/ProductModal.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react'; // ✅ useEffect add karein
import productsAPI from '../../services/productsAPI';

const ProductModal = ({ product, onClose, onEdit, onDelete, onPublish, onMoveToDraft, loading, onStockUpdate }) => {
  if (!product) return null;

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAmount, setStockAmount] = useState('');
  const [stockAction, setStockAction] = useState('set');
  const [stockLoading, setStockLoading] = useState(false);
  
  // ✅ Local state for product to handle updates
  const [currentProduct, setCurrentProduct] = useState(product);

  // ✅ When prop changes, update local state
  useEffect(() => {
    console.log('🔄 ProductModal: Product prop updated', {
      id: product._id,
      oldStock: currentProduct?.stockQuantity,
      newStock: product.stockQuantity
    });
    setCurrentProduct(product);
  }, [product]);

  const formatPrice = (price) => {
    return typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`;
  };

  const getStatusBadge = (status, stockQuantity) => {
    // Low stock badge
    if (stockQuantity <= 10) {
      return (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: '#e2e2e2ff',
            color: '#555555',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 500,
          }}
        >
          Low Stock
        </span>
      );
    }

    // All statuses
    const statusConfig = {
      published: {
        bgColor: '#e2e2e2ff',
        textColor: '#000000',
        text: 'Published',
      },
      draft: {
        bgColor: '#e2e2e2ff',
        textColor: '#555555',
        text: 'Draft',
      },
      archived: {
        bgColor: '#bebebeff',
        textColor: '#000000',
        text: 'Archived',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 500,
        }}
      >
        {config.text}
      </span>
    );
  };

  const displayCategory = (category) => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'object' && category.category_name) return category.category_name;
    if (typeof category === 'object' && category.name) return category.name;
    if (typeof category === 'string') return category;
    return 'Uncategorized';
  };

  // ✅ Optimized handleUpdateStock function
  const handleUpdateStock = async () => {
    if (!stockAmount || isNaN(stockAmount) || parseInt(stockAmount) < 0) {
      alert('Please enter a valid stock amount');
      return;
    }

    console.log('🔄 Stock update started...', {
      productId: currentProduct._id,
      currentStock: currentProduct.stockQuantity,
      newAmount: stockAmount,
      action: stockAction
    });
    
    setStockLoading(true);
    
    try {
      const response = await productsAPI.updateProductStock(currentProduct._id, {
        stockQuantity: parseInt(stockAmount),
        action: stockAction
      });

      console.log('✅ API Response:', response.data);

      if (response.data.success) {
        // ✅ IMMEDIATELY update local state
        const newStock = calculateNewStock(stockAction, currentProduct.stockQuantity, parseInt(stockAmount));
        
        // Update local state immediately
        setCurrentProduct(prev => ({
          ...prev,
          stockQuantity: newStock
        }));
        
        console.log('📈 Local state updated to:', newStock);
        
        // ✅ Alert user
        alert(`✅ Stock updated successfully for "${currentProduct.title}"`);
        
        // ✅ Send update to parent (Products page)
        if (onStockUpdate) {
          const updatedProduct = {
            ...currentProduct,
            stockQuantity: response.data.product?.stockQuantity || newStock
          };
          
          console.log('📤 Sending to parent component:', updatedProduct);
          onStockUpdate(updatedProduct);
        }
        
        // Close modal
        setShowStockModal(false);
        setStockAmount('');
        setStockAction('set');
      } else {
        alert(response.data.message || 'Failed to update stock');
      }
    } catch (error) {
      console.error('❌ Stock update error:', error);
      alert(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setStockLoading(false);
    }
  };

  // Helper function to calculate new stock
  const calculateNewStock = (action, currentStock, amount) => {
    switch(action) {
      case 'set':
        return amount;
      case 'increase':
        return currentStock + amount;
      case 'decrease':
        return Math.max(0, currentStock - amount);
      default:
        return currentStock;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
          style={{ fontFamily: "'Metropolis', sans-serif" }}
        >
          {/* Modal Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white border-b"
            style={{ borderColor: '#555555' }}
          >
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}
              >
                {currentProduct.title}
              </h2>
              <div className="flex items-center mt-2 space-x-3">
                {getStatusBadge(currentProduct.status, currentProduct.stockQuantity)}
                <span className="text-sm" style={{ color: '#555555' }}>
                  {currentProduct.sku}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
              style={{ color: '#000000' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Column - Image */}
              <div>
                <div className="flex items-center justify-center p-4 border rounded-lg" style={{ 
                  borderColor: '#555555',
                  backgroundColor: '#f9f9f9',
                  minHeight: '350px'
                }}>
                  <div className="relative w-full max-w-sm mx-auto">
                    <img
                      src={
                        currentProduct.imagePath ||
                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                      }
                      alt={currentProduct.title}
                      className="object-contain mx-auto"
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '300px',
                        width: 'auto',
                        height: 'auto'
                      }}
                    />
                    
                    {/* Frame Size Indicator */}
                    <div className="absolute transform -translate-x-1/2 -bottom-3 left-1/2">
                      <div className="px-3 py-1 text-xs font-medium rounded-full" style={{ 
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500
                      }}>
                        164×104 px
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Images if available */}
                {currentProduct.additionalImages && currentProduct.additionalImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-8">
                    {currentProduct.additionalImages.slice(0, 4).map((img, index) => (
                      <div
                        key={index}
                        className="overflow-hidden border rounded"
                        style={{ 
                          borderColor: '#e2e2e2',
                          backgroundColor: '#f9f9f9'
                        }}
                      >
                        <img
                          src={img}
                          alt={`${currentProduct.title} ${index + 1}`}
                          className="object-contain w-full h-16 mx-auto"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Price and Stock */}
                <div className="p-4 border rounded-lg" style={{ borderColor: '#555555' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold" style={{ color: '#000000' }}>
                      {formatPrice(currentProduct.price)}
                    </span>
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full"
                      style={{
                        backgroundColor:
                          currentProduct.stockQuantity > 10 ? '#e2e2e2ff' : '#bebebeff',
                        color: '#000000',
                      }}
                    >
                      {/* ✅ Yahan currentProduct use karein, jo update ho raha hai */}
                      Stock: {currentProduct.stockQuantity}
                    </span>
                  </div>

                  {/* Discount and Tax */}
                  {(currentProduct.discount > 0 || currentProduct.tax > 0) && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {currentProduct.discount > 0 && (
                        <div
                          className="p-2 text-center rounded"
                          style={{ backgroundColor: '#e2e2e2ff' }}
                        >
                          <span
                            className="text-sm font-medium"
                            style={{ color: '#555555' }}
                          >
                            Discount: {currentProduct.discount}%
                          </span>
                        </div>
                      )}
                      {currentProduct.tax > 0 && (
                        <div
                          className="p-2 text-center rounded"
                          style={{ backgroundColor: '#e2e2e2ff' }}
                        >
                          <span
                            className="text-sm font-medium"
                            style={{ color: '#555555' }}
                          >
                            Tax: {currentProduct.tax}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* UPDATE STOCK BUTTON */}
                  <button
                    onClick={() => setShowStockModal(true)}
                    className="w-full px-4 py-2 mt-4 text-sm font-medium text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none"
                    style={{
                      backgroundColor: '#000000',
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Update Stock
                  </button>
                </div>

                {/* Product Information */}
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                      Description
                    </h4>
                    <p className="text-sm" style={{ color: '#555555' }}>
                      {currentProduct.description || 'No description available'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                        Category
                      </h4>
                      <span
                        className="px-3 py-1 text-sm rounded-full"
                        style={{
                          backgroundColor: '#e2e2e2ff',
                          color: '#555555',
                        }}
                      >
                        {displayCategory(currentProduct.category)}
                      </span>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                        Product Type
                      </h4>
                      <span
                        className="px-3 py-1 text-sm rounded-full"
                        style={{
                          backgroundColor: '#e2e2e2ff',
                          color: '#555555',
                        }}
                      >
                        {currentProduct.productType || 'Other'}
                      </span>
                    </div>
                  </div>

                  {/* Sizes and Colors */}
                  {(currentProduct.sizes?.length > 0 || currentProduct.colors?.length > 0) && (
                    <div className="grid grid-cols-2 gap-4">
                      {currentProduct.sizes?.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                            Available Sizes
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {currentProduct.sizes.map((size, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs rounded"
                                style={{
                                  backgroundColor: '#e2e2e2ff',
                                  color: '#000000',
                                }}
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentProduct.colors?.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                            Available Colors
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {currentProduct.colors.map((color, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs rounded"
                                style={{
                                  backgroundColor: '#e2e2e2ff',
                                  color: '#555555',
                                }}
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="p-3 border rounded-lg" style={{ borderColor: '#555555' }}>
                    <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span style={{ color: '#555555' }}>Age Group:</span>
                        <span className="ml-2 font-medium" style={{ color: '#000000' }}>
                          {currentProduct.targetAgeGroup || 'All'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#555555' }}>Gender:</span>
                        <span className="ml-2 font-medium" style={{ color: '#000000' }}>
                          {currentProduct.gender || 'Unisex'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#555555' }}>Created:</span>
                        <span className="ml-2 font-medium" style={{ color: '#000000' }}>
                          {new Date(currentProduct.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#555555' }}>Updated:</span>
                        <span className="ml-2 font-medium" style={{ color: '#000000' }}>
                          {currentProduct.updatedAt
                            ? new Date(currentProduct.updatedAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            className="sticky bottom-0 p-6 bg-white border-t"
            style={{ borderColor: '#555555' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {currentProduct.status === 'published' && (
                  <button
                    onClick={() => onMoveToDraft && onMoveToDraft(currentProduct._id, currentProduct.title)}
                    disabled={loading}
                    className="px-4 py-2 text-sm transition-colors border rounded-lg hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                    style={{
                      color: '#000000',
                      borderColor: '#555555',
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Move to Draft
                  </button>
                )}

                {currentProduct.status === 'draft' && (
                  <button
                    onClick={() => onPublish && onPublish(currentProduct._id, currentProduct.title)}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none disabled:opacity-50"
                    style={{
                      backgroundColor: '#555555',
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Publish
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => onEdit && onEdit(currentProduct._id)}
                  className="px-6 py-2 text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none"
                  style={{
                    backgroundColor: '#000000',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Edit Product
                </button>

                <button
                  onClick={() => onDelete && onDelete(currentProduct._id, currentProduct.title)}
                  disabled={loading}
                  className="px-6 py-2 transition-colors rounded-lg hover:opacity-90 focus:outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: '#bebebeff',
                    color: '#000000',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl" style={{ fontFamily: "'Metropolis', sans-serif" }}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: '#000000' }}>
                  Update Stock - {currentProduct.title}
                </h3>
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setStockAmount('');
                    setStockAction('set');
                  }}
                  className="p-1 transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
                  style={{ color: '#000000' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="mb-2 text-sm" style={{ color: '#555555' }}>
                  <span className="font-medium" style={{ color: '#000000' }}>Current Stock:</span> {currentProduct.stockQuantity}
                </p>
                
                <div className="mb-3">
                  <label className="block mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                    Action
                  </label>
                  <select
                    value={stockAction}
                    onChange={(e) => setStockAction(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: '#d1d5db', color: '#000000', fontFamily: "'Metropolis', sans-serif" }}
                  >
                    <option value="set">Set to specific amount</option>
                    <option value="increase">Increase stock</option>
                    <option value="decrease">Decrease stock</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                    {stockAction === 'set' ? 'New Stock Quantity' : 
                     stockAction === 'increase' ? 'Amount to Add' : 'Amount to Subtract'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockAmount}
                    onChange={(e) => setStockAmount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: '#d1d5db', color: '#000000', fontFamily: "'Metropolis', sans-serif" }}
                    placeholder="Enter amount"
                  />
                </div>
                
                {stockAmount && (
                  <div className="p-3 mb-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                    <p className="text-sm" style={{ color: '#000000' }}>
                      {stockAction === 'set' && `Stock will be set to: ${stockAmount}`}
                      {stockAction === 'increase' && `New stock will be: ${currentProduct.stockQuantity + parseInt(stockAmount)}`}
                      {stockAction === 'decrease' && (
                        <>
                          New stock will be: {Math.max(0, currentProduct.stockQuantity - parseInt(stockAmount))}
                          {currentProduct.stockQuantity - parseInt(stockAmount) < 0 && (
                            <span className="block mt-1 text-sm" style={{ color: '#dc2626' }}>⚠️ Stock cannot go below 0</span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setStockAmount('');
                    setStockAction('set');
                  }}
                  className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50"
                  style={{ borderColor: '#d1d5db', color: '#000000', fontFamily: "'Metropolis', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStock}
                  disabled={stockLoading || !stockAmount || 
                           (stockAction === 'decrease' && currentProduct.stockQuantity - parseInt(stockAmount) < 0)}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#000000', fontFamily: "'Metropolis', sans-serif" }}
                >
                  {stockLoading ? 'Updating...' : 'Update Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductModal;