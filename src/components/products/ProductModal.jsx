// components/products/ProductModal.jsx
import React from 'react';

const ProductModal = ({ product, onClose, onEdit, onDelete, onPublish, onMoveToDraft, loading }) => {
  if (!product) return null;

  const formatPrice = (price) => {
    return typeof price === 'number' ? `$${price.toFixed(2)}` : `$${price}`;
  };

  const getStatusBadge = (status, stockQuantity) => {
    // Low stock badge (now gray)
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

    // All statuses now gray theme
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

  return (
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
              {product.title}
            </h2>
            <div className="flex items-center mt-2 space-x-3">
              {getStatusBadge(product.status, product.stockQuantity)}
              <span className="text-sm" style={{ color: '#555555' }}>
                {product.sku}
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
                      product.imagePath ||
                      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
                    }
                    alt={product.title}
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
              {product.additionalImages && product.additionalImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-8">
                  {product.additionalImages.slice(0, 4).map((img, index) => (
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
                        alt={`${product.title} ${index + 1}`}
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
                    {formatPrice(product.price)}
                  </span>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor:
                        product.stockQuantity > 10 ? '#e2e2e2ff' : '#bebebeff',
                      color: '#000000',
                    }}
                  >
                    Stock: {product.stockQuantity}
                  </span>
                </div>

                {/* Discount and Tax */}
                {(product.discount > 0 || product.tax > 0) && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {product.discount > 0 && (
                      <div
                        className="p-2 text-center rounded"
                        style={{ backgroundColor: '#e2e2e2ff' }}
                      >
                        <span
                          className="text-sm font-medium"
                          style={{ color: '#555555' }}
                        >
                          Discount: {product.discount}%
                        </span>
                      </div>
                    )}
                    {product.tax > 0 && (
                      <div
                        className="p-2 text-center rounded"
                        style={{ backgroundColor: '#e2e2e2ff' }}
                      >
                        <span
                          className="text-sm font-medium"
                          style={{ color: '#555555' }}
                        >
                          Tax: {product.tax}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                    Description
                  </h4>
                  <p className="text-sm" style={{ color: '#555555' }}>
                    {product.description || 'No description available'}
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
                      {displayCategory(product.category)}
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
                      {product.productType || 'Other'}
                    </span>
                  </div>
                </div>

                {/* Sizes and Colors */}
                {(product.sizes?.length > 0 || product.colors?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {product.sizes?.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                          Available Sizes
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map((size, index) => (
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

                    {product.colors?.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-medium" style={{ color: '#000000' }}>
                          Available Colors
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {product.colors.map((color, index) => (
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
                        {product.targetAgeGroup || 'All'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#555555' }}>Gender:</span>
                      <span className="ml-2 font-medium" style={{ color: '#000000' }}>
                        {product.gender || 'Unisex'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#555555' }}>Created:</span>
                      <span className="ml-2 font-medium" style={{ color: '#000000' }}>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#555555' }}>Updated:</span>
                      <span className="ml-2 font-medium" style={{ color: '#000000' }}>
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleDateString()
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
              {product.status === 'published' && (
                <button
                  onClick={() => onMoveToDraft && onMoveToDraft(product._id, product.title)}
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

              {product.status === 'draft' && (
                <button
                  onClick={() => onPublish && onPublish(product._id, product.title)}
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
                onClick={() => onEdit && onEdit(product._id)}
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
                onClick={() => onDelete && onDelete(product._id, product.title)}
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
  );
};

export default ProductModal;