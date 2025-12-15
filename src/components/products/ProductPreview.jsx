import React from 'react';

const ProductPreview = ({ product, onClose, onEdit }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Product Preview</h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Product Images */}
            <div>
              <div className="p-4 mb-4 bg-gray-100 rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-64 rounded-lg"
                />
              </div>
              
              {/* Additional Images */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="bg-gray-100 border-2 border-transparent rounded-lg cursor-pointer aspect-square hover:border-blue-500">
                    <img
                      src={product.image}
                      alt={`${product.name} ${index}`}
                      className="object-cover w-full h-full rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 mb-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">
                  Live
                </span>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="mb-4 text-2xl font-bold text-gray-900">₹{product.price}</p>
                
                {product.discountedPrice && (
                  <div className="flex items-center mb-4 space-x-2">
                    <span className="text-lg text-gray-500 line-through">₹{product.price}</span>
                    <span className="text-lg font-bold text-red-600">₹{product.discountedPrice}</span>
                    <span className="px-2 py-1 text-sm font-medium text-red-800 bg-red-100 rounded">
                      Save {Math.round((1 - product.discountedPrice / product.price) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="mb-6 space-y-4">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-600">Description</h3>
                  <p className="text-gray-700">
                    {product.description || "No description provided. This is a sample product description that highlights the key features and benefits of the product."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-600">Category</h3>
                    <p className="text-gray-900">{product.category}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-600">SKU</h3>
                    <p className="text-gray-900">{product.sku}</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-600">Stock</h3>
                    <p className="text-gray-900">{product.stock} units</p>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-medium text-gray-600">Brand</h3>
                    <p className="text-gray-900">{product.brand || "Not specified"}</p>
                  </div>
                </div>

                {/* Specifications */}
                {product.specifications && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-600">Specifications</h3>
                    <div className="space-y-2">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Info */}
                <div>
                  <h3 className="mb-2 text-sm font-medium text-gray-600">Shipping Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Free Shipping:</span>
                      <span className="text-gray-900">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Time:</span>
                      <span className="text-gray-900">2-3 business days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Preview */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Customer Reviews</h3>
                <div className="flex items-center mb-4 space-x-4">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">4.0 out of 5</span>
                  </div>
                  <span className="text-sm text-gray-500">128 reviews</span>
                </div>

                {/* Sample Review */}
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center mb-2 space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= 5 ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">Sarah M.</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    "Great product! The quality exceeded my expectations. Fast shipping and excellent customer service."
                  </p>
                  <span className="block mt-2 text-xs text-gray-500">Posted on June 15, 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end p-6 space-x-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close Preview
          </button>
          <button
            onClick={onEdit}
            className="flex items-center px-6 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;