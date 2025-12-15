// components/onboarding/DocumentUpload.js - FIXED VERSION
import React, { useState } from 'react';
import 'typeface-metropolis';

const DocumentUpload = ({ onUpload, onBack, loading }) => {
  const [uploadedFiles, setUploadedFiles] = useState({
    businessLicense: null,
    ownershipProof: null,
    taxFiles: [],
    shopImage: null
  });
  const [selectedTaxes, setSelectedTaxes] = useState([]);
  const [shopImagePreview, setShopImagePreview] = useState(null);
  const [previews, setPreviews] = useState({
    businessLicense: null,
    ownershipProof: null,
    taxFiles: [],
    shopImage: null
  });

  const taxOptions = ["GST", "PST", "HST", "VAT", "Sales Tax"];

  const handleFileUpload = (fileType, files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Take first file for single uploads
    
    if (file && file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    if (fileType === 'taxFiles') {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: [...prev[fileType], file]
      }));
      setPreviews(prev => ({
        ...prev,
        [fileType]: [...prev[fileType], previewUrl]
      }));
    } else {
      setUploadedFiles(prev => ({ ...prev, [fileType]: file }));
      setPreviews(prev => ({ ...prev, [fileType]: previewUrl }));
      
      // Special handling for shop image
      if (fileType === 'shopImage') {
        setShopImagePreview(previewUrl);
      }
    }
  };

  const removeFile = (fileType, index = null) => {
    if (fileType === 'taxFiles' && index !== null) {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: prev[fileType].filter((_, i) => i !== index)
      }));
      setPreviews(prev => ({
        ...prev,
        [fileType]: prev[fileType].filter((_, i) => i !== index)
      }));
    } else {
      setUploadedFiles(prev => ({ ...prev, [fileType]: null }));
      setPreviews(prev => ({ ...prev, [fileType]: null }));
      
      if (fileType === 'shopImage') {
        setShopImagePreview(null);
      }
    }
  };

  const handleTaxToggle = (tax) => {
    setSelectedTaxes(prev => 
      prev.includes(tax) 
        ? prev.filter(t => t !== tax)
        : [...prev, tax]
    );
  };

  const handleUpload = async () => {
    console.log('🔄 Starting document upload...');
    
    // Validate all required files are uploaded
    const validationErrors = [];
    
    if (!uploadedFiles.businessLicense) {
      validationErrors.push('Business License');
    }
    
    if (!uploadedFiles.ownershipProof) {
      validationErrors.push('Ownership Proof');
    }
    
    if (!uploadedFiles.taxFiles || uploadedFiles.taxFiles.length === 0) {
      validationErrors.push('at least one Tax Document');
    }
    
    if (!uploadedFiles.shopImage) {
      validationErrors.push('Shop/Storefront Image');
    }
    
    if (selectedTaxes.length === 0) {
      validationErrors.push('tax type selection');
    }

    if (validationErrors.length > 0) {
      alert(`Please provide: ${validationErrors.join(', ')}`);
      return;
    }

    console.log('✅ All documents validated');
    
    try {
      // Create FormData object
      const formData = new FormData();
      
      // Append files in the format backend expects
      formData.append('businessLicense', uploadedFiles.businessLicense);
      formData.append('ownershipProof', uploadedFiles.ownershipProof);
      formData.append('shopImage', uploadedFiles.shopImage); // Added shop image
      
      // Append tax files as array
      uploadedFiles.taxFiles.forEach((file, index) => {
        formData.append('taxFiles', file);
      });
      
      // Append taxes as comma-separated string
      formData.append('taxes', selectedTaxes.join(','));
      
      console.log('📤 Uploading documents with shop image...');
      
      // Call the upload function with FormData
      await onUpload(formData);
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Failed to upload documents. Please try again.');
    }
  };

  const FileUploadBox = ({ title, fileType, description, acceptedFormats, multiple = false }) => {
    const file = uploadedFiles[fileType];
    const preview = previews[fileType];
    const isUploaded = multiple ? (file && file.length > 0) : (file !== null);
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold" style={{ color: '#000000', fontFamily: 'Metropolis, sans-serif' }}>
          {title} {fileType === 'shopImage' ? '' : '*'}
        </h4>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isUploaded
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-500 hover:bg-gray-50'
          }`}
          onClick={() => document.getElementById(`${fileType}-upload`).click()}
        >
          <div className="mb-4">
            {isUploaded ? (
              <div className="relative w-16 h-16 mx-auto">
                {fileType === 'shopImage' ? (
                  <img 
                    src={preview} 
                    alt="Shop preview" 
                    className="object-cover w-full h-full rounded-lg"
                  />
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="absolute px-2 py-1 text-xs text-white bg-green-500 rounded-full -bottom-2 -right-2">
                      ✓
                    </span>
                  </>
                )}
              </div>
            ) : (
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          
          <h5 
            className={`text-lg font-medium mb-2 ${isUploaded ? 'text-green-700' : ''}`}
            style={{ 
              color: isUploaded ? '#27C840' : '#000000',
              fontFamily: 'Metropolis, sans-serif',
              fontWeight: isUploaded ? 600 : 500 
            }}
          >
            {isUploaded ? 
              (multiple ? `${file.length} file(s) uploaded` : file.name) 
              : `Upload ${title}`
            }
          </h5>
          
          <p 
            className="mb-2"
            style={{ 
              color: '#555555',
              fontFamily: 'Metropolis, sans-serif' 
            }}
          >
            {isUploaded ? 
              (multiple ? 
                `${file.length} file(s) ready for upload` 
                : `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
              )
              : 'Click here or drag and drop file'
            }
          </p>
          
          <p 
            className="text-sm"
            style={{ 
              color: '#555555',
              fontFamily: 'Metropolis, sans-serif' 
            }}
          >
            {description}
          </p>
          <p 
            className="mt-1 text-xs"
            style={{ 
              color: '#888888',
              fontFamily: 'Metropolis, sans-serif' 
            }}
          >
            Supported formats: {acceptedFormats}
          </p>
          
          <input
            type="file"
            id={`${fileType}-upload`}
            accept={fileType === 'shopImage' ? "image/*" : ".pdf,.jpg,.jpeg,.png,.doc,.docx"}
            className="hidden"
            onChange={(e) => handleFileUpload(fileType, e.target.files)}
            multiple={multiple}
          />
        </div>

        {/* File preview and remove button */}
        {isUploaded && (
          <div className="flex flex-wrap gap-2">
            {multiple ? (
              file.map((fileItem, index) => (
                <div key={index} className="flex items-center px-3 py-2 space-x-2 bg-white border border-gray-200 rounded-lg">
                  {previews[fileType] && previews[fileType][index] && fileItem.type.startsWith('image/') ? (
                    <img 
                      src={previews[fileType][index]} 
                      alt="Preview" 
                      className="object-cover w-8 h-8 rounded"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  )}
                  <span 
                    className="text-sm"
                    style={{ 
                      color: '#000000',
                      fontFamily: 'Metropolis, sans-serif' 
                    }}
                  >
                    {fileItem.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(fileType, index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="flex items-center px-3 py-2 space-x-2 bg-white border border-gray-200 rounded-lg">
                {preview && fileType === 'shopImage' ? (
                  <img 
                    src={preview} 
                    alt="Shop preview" 
                    className="object-cover w-8 h-8 rounded"
                  />
                ) : preview && file.type.startsWith('image/') ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="object-cover w-8 h-8 rounded"
                  />
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                )}
                <span 
                  className="text-sm"
                  style={{ 
                    color: '#000000',
                    fontFamily: 'Metropolis, sans-serif' 
                  }}
                >
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(fileType)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Metropolis, sans-serif' }}>
      <div>
        <h2 
          className="mb-2 text-2xl font-bold"
          style={{ 
            color: '#000000',
            fontFamily: 'Metropolis, sans-serif',
            fontWeight: 700 
          }}
        >
          Document Upload
        </h2>
        <p style={{ color: '#555555' }}>
          Please upload the following documents to verify your business. All fields are required.
        </p>
      </div>

      {/* Shop Image Upload */}
      <FileUploadBox
        title="Shop/Storefront Image"
        fileType="shopImage"
        description="Upload a clear image of your shop/storefront"
        acceptedFormats="JPEG, PNG, WEBP (Max. 10MB)"
      />

      {/* Business License */}
      <FileUploadBox
        title="Business License"
        fileType="businessLicense"
        description="Upload your official business license document"
        acceptedFormats="PDF, JPG, PNG, DOC, DOCX (Max. 10MB)"
      />

      {/* Ownership Proof */}
      <FileUploadBox
        title="Ownership Proof"
        fileType="ownershipProof"
        description="Upload proof of business ownership"
        acceptedFormats="PDF, JPG, PNG, DOC, DOCX (Max. 10MB)"
      />

      {/* Tax Documents - Allow multiple */}
      <FileUploadBox
        title="Tax Documents"
        fileType="taxFiles"
        description="Upload your tax identification documents"
        acceptedFormats="PDF, JPG, PNG, DOC, DOCX (Max. 10MB)"
        multiple={true}
      />

      {/* Tax Type Selection */}
      <div className="space-y-4">
        <h4 
          className="text-lg font-semibold"
          style={{ 
            color: '#000000',
            fontFamily: 'Metropolis, sans-serif',
            fontWeight: 600 
          }}
        >
          Tax Types *
        </h4>
        <p style={{ color: '#555555' }}>Select the tax types that apply to your business</p>
        
        <div className="flex flex-wrap gap-2">
          {taxOptions.map(tax => (
            <button
              key={tax}
              type="button"
              onClick={() => handleTaxToggle(tax)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                selectedTaxes.includes(tax)
                  ? 'bg-gray-600 text-white border-gray-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              style={{ fontFamily: 'Metropolis, sans-serif', fontWeight: 500 }}
            >
              {tax}
            </button>
          ))}
        </div>
        
        {selectedTaxes.length > 0 && (
          <p className="text-sm" style={{ color: '#555555' }}>
            Selected: {selectedTaxes.join(', ')}
          </p>
        )}
      </div>

      {/* Requirements Info */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h5 
              className="text-sm font-semibold"
              style={{ 
                color: '#000000',
                fontFamily: 'Metropolis, sans-serif',
                fontWeight: 600 
              }}
            >
              Required Documents
            </h5>
            <ul className="mt-1 space-y-1 text-sm list-disc list-inside" style={{ color: '#555555' }}>
              <li>Shop/Storefront Image (JPEG, PNG, WEBP - Max 10MB)</li>
              <li>Valid Business License (PDF, JPG, PNG, DOC, DOCX - Max 10MB)</li>
              <li>Proof of Business Ownership (PDF, JPG, PNG, DOC, DOCX - Max 10MB)</li>
              <li>At least one Tax Identification Document (PDF, JPG, PNG, DOC, DOCX - Max 10MB)</li>
              <li>Selection of applicable tax types</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 transition-all border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
          style={{ 
            color: '#555555',
            fontFamily: 'Metropolis, sans-serif',
            fontWeight: 500 
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
        <button
          onClick={handleUpload}
          disabled={loading}
          className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
          style={{ 
            backgroundColor: '#000000',
            fontFamily: 'Metropolis, sans-serif',
            fontWeight: 500 
          }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <span>Submit Documents</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;