// // components/products/ImageEditorModal.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import ReactCrop from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';
// import Modal from 'react-modal';

// Modal.setAppElement('#root');

// const ImageEditorModal = ({ 
//   isOpen, 
//   onClose, 
//   image,
//   originalFile,
//   onSave,
//   defaultWidth = 800,
//   defaultHeight = 800 
// }) => {
//   const [crop, setCrop] = useState({
//     unit: '%',
//     width: 100,
//     height: 100,
//     x: 0,
//     y: 0,
//     aspect: undefined
//   });
  
//   const [rotation, setRotation] = useState(0);
//   const [scale, setScale] = useState(1);
//   const [customWidth, setCustomWidth] = useState(defaultWidth);
//   const [customHeight, setCustomHeight] = useState(defaultHeight);
//   const [loading, setLoading] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState('');
//   const [imgLoaded, setImgLoaded] = useState(false);
//   const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
//   const [useOriginal, setUseOriginal] = useState(false);
//   const [imageQuality, setImageQuality] = useState(0.95); // 0.95 = 95% quality
  
//   const imageRef = useRef(null);
//   const canvasRef = useRef(document.createElement('canvas'));

//   // Initialize with default dimensions
//   useEffect(() => {
//     if (defaultWidth && defaultHeight) {
//       setCustomWidth(defaultWidth);
//       setCustomHeight(defaultHeight);
//     }
//   }, [defaultWidth, defaultHeight]);

//   // Handle image load
//   const handleImageLoad = () => {
//     if (imageRef.current) {
//       const img = imageRef.current;
//       setOriginalDimensions({
//         width: img.naturalWidth,
//         height: img.naturalHeight
//       });
//       setImgLoaded(true);
      
//       // Set default crop to full image
//       setCrop({
//         unit: '%',
//         width: 100,
//         height: 100,
//         x: 0,
//         y: 0,
//         aspect: undefined
//       });
      
//       // Generate initial preview
//       setTimeout(() => updatePreview(), 100);
//     }
//   };

//   // Update preview when edits change
//   useEffect(() => {
//     if (imgLoaded && !useOriginal) {
//       const debouncedUpdate = setTimeout(() => {
//         updatePreview();
//       }, 100);
//       return () => clearTimeout(debouncedUpdate);
//     }
//   }, [crop, rotation, scale, customWidth, customHeight, imgLoaded, useOriginal]);

//   // Calculate actual pixel values from percentage crop
//   const getPixelCrop = () => {
//     if (!imageRef.current) return null;
    
//     const { naturalWidth: width, naturalHeight: height } = imageRef.current;
    
//     if (crop.unit === 'px') {
//       return {
//         x: crop.x,
//         y: crop.y,
//         width: crop.width,
//         height: crop.height
//       };
//     }
    
//     // Convert percentage to pixels
//     return {
//       x: (crop.x * width) / 100,
//       y: (crop.y * height) / 100,
//       width: (crop.width * width) / 100,
//       height: (crop.height * height) / 100
//     };
//   };

//   // HIGH-QUALITY Image processing
//   const getCroppedImage = async () => {
//     if (!imageRef.current || !imgLoaded) return null;

//     if (useOriginal) {
//       // Return original file without modifications
//       return originalFile;
//     }

//     const pixelCrop = getPixelCrop();
//     if (!pixelCrop) return null;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const img = imageRef.current;

//     // Set canvas to HIGH RESOLUTION - maintain original quality
//     // Use the larger dimension between crop size and output size
//     const scaleFactor = Math.max(1, Math.min(2, customWidth / pixelCrop.width));
//     const canvasWidth = customWidth * scaleFactor;
//     const canvasHeight = customHeight * scaleFactor;
    
//     canvas.width = canvasWidth;
//     canvas.height = canvasHeight;

//     // Set canvas to high quality
//     ctx.imageSmoothingEnabled = true;
//     ctx.imageSmoothingQuality = 'high';
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     // Save context
//     ctx.save();
    
//     // Move to center
//     ctx.translate(canvas.width / 2, canvas.height / 2);
    
//     // Apply rotation
//     if (rotation !== 0) {
//       ctx.rotate((rotation * Math.PI) / 180);
//     }
    
//     // Apply scale
//     if (scale !== 1) {
//       ctx.scale(scale * scaleFactor, scale * scaleFactor);
//     } else {
//       ctx.scale(scaleFactor, scaleFactor);
//     }
    
//     // Draw with proper scaling for high quality
//     const destWidth = customWidth;
//     const destHeight = customHeight;
    
//     // Draw the cropped portion at high resolution
//     ctx.drawImage(
//       img,
//       pixelCrop.x,
//       pixelCrop.y,
//       pixelCrop.width,
//       pixelCrop.height,
//       -destWidth / 2,
//       -destHeight / 2,
//       destWidth,
//       destHeight
//     );
    
//     ctx.restore();

//     // Convert to blob with high quality
//     return new Promise((resolve) => {
//       canvas.toBlob((blob) => {
//         if (blob) {
//           const file = new File([blob], `product-${Date.now()}.jpg`, {
//             type: 'image/jpeg',
//             lastModified: Date.now()
//           });
//           resolve(file);
//         } else {
//           resolve(null);
//         }
//       }, 'image/jpeg', imageQuality);
//     });
//   };

//   // Update preview image
//   const updatePreview = async () => {
//     if (useOriginal) {
//       setPreviewUrl(image);
//       return;
//     }

//     const file = await getCroppedImage();
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//     }
//   };

//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       if (useOriginal && originalFile) {
//         // Use original file directly
//         onSave(originalFile);
//       } else {
//         // Use edited image
//         const editedFile = await getCroppedImage();
//         if (editedFile) {
//           onSave(editedFile);
//         } else {
//           throw new Error('Failed to generate image');
//         }
//       }
//       onClose();
//     } catch (error) {
//       console.error('Error saving image:', error);
//       alert('Failed to save image. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setCrop({
//       unit: '%',
//       width: 100,
//       height: 100,
//       x: 0,
//       y: 0,
//       aspect: undefined
//     });
//     setRotation(0);
//     setScale(1);
//     setCustomWidth(defaultWidth);
//     setCustomHeight(defaultHeight);
//     setUseOriginal(false);
//   };

//   const handleAspectRatioChange = (value) => {
//     if (value === undefined) {
//       setCrop(prev => ({ ...prev, aspect: undefined }));
//     } else {
//       setCrop(prev => ({ ...prev, aspect: value }));
//       // Adjust height based on current width and new aspect ratio
//       if (crop.width) {
//         const newHeight = Math.round(crop.width / value);
//         setCrop(prev => ({ ...prev, height: newHeight }));
//       }
//     }
//   };

//   const aspectRatioPresets = [
//     { label: '1:1 Square', value: 1 },
//     { label: '16:9 Wide', value: 16/9 },
//     { label: '4:3 Standard', value: 4/3 },
//     { label: '2:3 Portrait', value: 2/3 },
//     { label: 'Free', value: undefined }
//   ];

//   const getCurrentAspectRatio = () => {
//     if (!crop.width || !crop.height) return 'Free';
//     const ratio = crop.width / crop.height;
    
//     if (Math.abs(ratio - 1) < 0.01) return '1:1 Square';
//     if (Math.abs(ratio - (16/9)) < 0.01) return '16:9 Wide';
//     if (Math.abs(ratio - (4/3)) < 0.01) return '4:3 Standard';
//     if (Math.abs(ratio - (2/3)) < 0.01) return '2:3 Portrait';
    
//     return 'Custom';
//   };

//   // Update AddProduct.jsx to pass originalFile
//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onClose}
//       className="modal-content"
//       overlayClassName="modal-overlay"
//       style={{
//         content: {
//           overflow: 'hidden'
//         }
//       }}
//     >
//       <div className="flex flex-col h-full bg-white">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#555555' }}>
//           <h2 className="text-2xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
//             Edit Product Image
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 transition-colors rounded-lg hover:bg-gray-100"
//             style={{ color: '#555555' }}
//             disabled={loading}
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {/* Content */}
//         <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
//           <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
//             {/* Left: Image Editor */}
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
//                   Crop & Adjust
//                 </h3>
//                 <div className="text-sm" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                   Drag to crop • Rotate • Zoom
//                 </div>
//               </div>
              
//               {/* Quick Action Bar */}
//               <div className="flex items-center gap-3 p-3 mb-4 border rounded-lg" style={{ borderColor: '#555555', backgroundColor: '#f9f9f9' }}>
//                 <button
//                   type="button"
//                   onClick={() => setUseOriginal(!useOriginal)}
//                   className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
//                     useOriginal ? 'text-white' : 'text-gray-700'
//                   }`}
//                   style={{ 
//                     borderColor: '#555555',
//                     backgroundColor: useOriginal ? '#000000' : 'transparent',
//                     fontFamily: "'Metropolis', sans-serif",
//                     fontWeight: 500
//                   }}
//                 >
//                   {useOriginal ? (
//                     <>
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>
//                       Using Original
//                     </>
//                   ) : (
//                     <>
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                       </svg>
//                       Use Original
//                     </>
//                   )}
//                 </button>
                
//                 {originalDimensions.width > 0 && (
//                   <div className="ml-auto text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                     Original: {originalDimensions.width}×{originalDimensions.height}px
//                   </div>
//                 )}
//               </div>
              
//               <div className="p-4 mb-6 border rounded-lg" style={{ borderColor: '#555555', backgroundColor: '#f9f9f9' }}>
//                 <div className="flex items-center justify-center min-h-[300px]">
//                   {!useOriginal ? (
//                     <ReactCrop
//                       crop={crop}
//                       onChange={setCrop}
//                       ruleOfThirds
//                       circularCrop={false}
//                       keepSelection={true}
//                       minWidth={10}
//                       minHeight={10}
//                       style={{ maxWidth: '100%', maxHeight: '400px' }}
//                       disabled={useOriginal}
//                     >
//                       <img
//                         ref={imageRef}
//                         src={image}
//                         alt="Edit"
//                         style={{ 
//                           maxHeight: '400px', 
//                           maxWidth: '100%',
//                           transform: `scale(${scale}) rotate(${rotation}deg)`,
//                           display: 'block',
//                           margin: '0 auto',
//                           transition: 'transform 0.2s ease',
//                           opacity: useOriginal ? 0.5 : 1
//                         }}
//                         onLoad={handleImageLoad}
//                       />
//                     </ReactCrop>
//                   ) : (
//                     <div className="p-8 text-center">
//                       <div className="mx-auto mb-4 text-4xl" style={{ color: '#555555' }}>✓</div>
//                       <h4 className="mb-2 text-lg font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
//                         Using Original Image
//                       </h4>
//                       <p className="text-sm" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                         The original image will be uploaded without any edits.
//                         <br />
//                         Maximum quality preserved.
//                       </p>
//                       <button
//                         type="button"
//                         onClick={() => setUseOriginal(false)}
//                         className="px-4 py-2 mt-4 text-sm font-medium transition-colors border rounded-lg hover:bg-gray-50"
//                         style={{ 
//                           color: '#000000',
//                           borderColor: '#555555',
//                           fontFamily: "'Metropolis', sans-serif",
//                           fontWeight: 500
//                         }}
//                       >
//                         Edit Image Instead
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Controls - Disabled when using original */}
//               {!useOriginal && (
//                 <div className="space-y-6">
//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <label className="text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                         Zoom: {scale.toFixed(2)}x
//                       </label>
//                       <span className="text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                         {scale < 1 ? 'Zoom Out' : scale > 1 ? 'Zoom In' : 'Normal'}
//                       </span>
//                     </div>
//                     <input
//                       type="range"
//                       min="0.1"
//                       max="3"
//                       step="0.1"
//                       value={scale}
//                       onChange={(e) => setScale(parseFloat(e.target.value))}
//                       className="w-full h-2 rounded-lg appearance-none cursor-pointer"
//                       style={{ backgroundColor: '#e2e2e2' }}
//                       disabled={useOriginal}
//                     />
//                     <div className="flex justify-between mt-1 text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                       <span>0.1x</span>
//                       <span>1x</span>
//                       <span>3x</span>
//                     </div>
//                   </div>

//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <label className="text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                         Rotation: {rotation}°
//                       </label>
//                       <span className="text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                         {rotation === 0 ? 'Original' : `${rotation}° rotated`}
//                       </span>
//                     </div>
//                     <input
//                       type="range"
//                       min="0"
//                       max="360"
//                       step="1"
//                       value={rotation}
//                       onChange={(e) => setRotation(parseInt(e.target.value))}
//                       className="w-full h-2 rounded-lg appearance-none cursor-pointer"
//                       style={{ backgroundColor: '#e2e2e2' }}
//                       disabled={useOriginal}
//                     />
//                     <div className="flex justify-between mt-1 text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                       <span>0°</span>
//                       <span>90°</span>
//                       <span>180°</span>
//                       <span>270°</span>
//                       <span>360°</span>
//                     </div>
//                   </div>
                  
//                   {/* Image Quality Control */}
//                   <div>
//                     <div className="flex items-center justify-between mb-2">
//                       <label className="text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                         Image Quality: {Math.round(imageQuality * 100)}%
//                       </label>
//                       <span className="text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                         {imageQuality >= 0.9 ? 'High' : imageQuality >= 0.7 ? 'Medium' : 'Low'}
//                       </span>
//                     </div>
//                     <input
//                       type="range"
//                       min="0.5"
//                       max="1"
//                       step="0.05"
//                       value={imageQuality}
//                       onChange={(e) => setImageQuality(parseFloat(e.target.value))}
//                       className="w-full h-2 rounded-lg appearance-none cursor-pointer"
//                       style={{ backgroundColor: '#e2e2e2' }}
//                       disabled={useOriginal}
//                     />
//                     <div className="flex justify-between mt-1 text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                       <span>50%</span>
//                       <span>75%</span>
//                       <span>100%</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Right: Preview & Settings */}
//             <div>
//               <h3 className="mb-4 font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
//                 Preview & Settings
//               </h3>
              
//               {/* Dimensions Controls */}
//               <div className="p-4 mb-6 border rounded-lg" style={{ borderColor: '#555555', backgroundColor: '#f9f9f9' }}>
//                 <div className="flex items-center justify-between mb-4">
//                   <h4 className="text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                     Output Dimensions
//                   </h4>
//                   <span className={`text-xs px-2 py-1 rounded-full ${useOriginal ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
//                     {useOriginal ? 'Original' : 'Custom'}
//                   </span>
//                 </div>
                
//                 {!useOriginal && (
//                   <>
//                     <div className="grid grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <label className="block mb-2 text-xs font-medium" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                           Width (px)
//                         </label>
//                         <div className="relative">
//                           <input
//                             type="number"
//                             value={customWidth}
//                             onChange={(e) => {
//                               const newWidth = Math.max(50, Math.min(5000, parseInt(e.target.value) || 100));
//                               setCustomWidth(newWidth);
//                               if (crop.aspect !== undefined) {
//                                 const newHeight = Math.round(newWidth / crop.aspect);
//                                 setCustomHeight(Math.max(50, newHeight));
//                               }
//                             }}
//                             min="50"
//                             max="5000"
//                             className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
//                             style={{ 
//                               borderColor: '#555555',
//                               color: '#000000',
//                               fontFamily: "'Metropolis', sans-serif",
//                               fontWeight: 400
//                             }}
//                             disabled={useOriginal}
//                           />
//                           <span className="absolute text-xs left-2 top-2" style={{ color: '#555555' }}>W:</span>
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block mb-2 text-xs font-medium" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                           Height (px)
//                         </label>
//                         <div className="relative">
//                           <input
//                             type="number"
//                             value={customHeight}
//                             onChange={(e) => {
//                               const newHeight = Math.max(50, Math.min(5000, parseInt(e.target.value) || 100));
//                               setCustomHeight(newHeight);
//                               if (crop.aspect !== undefined) {
//                                 const newWidth = Math.round(newHeight * crop.aspect);
//                                 setCustomWidth(Math.max(50, newWidth));
//                               }
//                             }}
//                             min="50"
//                             max="5000"
//                             className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
//                             style={{ 
//                               borderColor: '#555555',
//                               color: '#000000',
//                               fontFamily: "'Metropolis', sans-serif",
//                               fontWeight: 400
//                             }}
//                             disabled={useOriginal}
//                           />
//                           <span className="absolute text-xs left-2 top-2" style={{ color: '#555555' }}>H:</span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Current Crop Info */}
//                     <div className="p-3 mb-4 border rounded-lg" style={{ borderColor: '#e2e2e2', backgroundColor: '#ffffff' }}>
//                       <div className="flex justify-between">
//                         <div>
//                           <p className="text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                             Crop Area
//                           </p>
//                           <p className="text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                             {Math.round(crop.width)}% × {Math.round(crop.height)}%
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                             Aspect Ratio
//                           </p>
//                           <p className="text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                             {getCurrentAspectRatio()}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Aspect Ratio Presets */}
//                     <div className="mb-4">
//                       <label className="block mb-2 text-xs font-medium" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                         Aspect Ratio Presets
//                       </label>
//                       <div className="flex flex-wrap gap-2">
//                         {aspectRatioPresets.map(({ label, value }) => (
//                           <button
//                             key={label}
//                             type="button"
//                             onClick={() => handleAspectRatioChange(value)}
//                             className={`px-3 py-2 text-xs border rounded-lg transition-colors hover:bg-gray-100 ${
//                               (value === undefined && crop.aspect === undefined) || crop.aspect === value 
//                                 ? 'text-white' 
//                                 : 'text-gray-700'
//                             }`}
//                             style={{ 
//                               borderColor: '#555555',
//                               backgroundColor: ((value === undefined && crop.aspect === undefined) || crop.aspect === value) ? '#000000' : 'transparent',
//                               fontFamily: "'Metropolis', sans-serif",
//                               fontWeight: 500,
//                               minWidth: '80px'
//                             }}
//                             disabled={useOriginal}
//                           >
//                             {label}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   </>
//                 )}
                
//                 <div className="p-3 text-xs border rounded-lg" style={{ borderColor: '#e2e2e2', backgroundColor: '#ffffff' }}>
//                   {useOriginal ? (
//                     <p style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                       <strong>✓ Original Image:</strong> Maximum quality preserved ({originalDimensions.width}×{originalDimensions.height}px)
//                     </p>
//                   ) : (
//                     <>
//                       <p style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                         <strong>Recommended:</strong> 800×800px for best quality
//                       </p>
//                       <p className="mt-1" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                         <strong>Quality:</strong> {Math.round(imageQuality * 100)}% (Higher = better quality, larger file)
//                       </p>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Preview */}
//               <div className="p-4 border rounded-lg" style={{ borderColor: '#555555', backgroundColor: '#f9f9f9' }}>
//                 <div className="flex items-center justify-between mb-4">
//                   <h4 className="text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
//                     Final Preview
//                   </h4>
//                   <span className="px-2 py-1 text-xs rounded-full" style={{ 
//                     color: '#000000',
//                     backgroundColor: '#bebebeff',
//                     fontFamily: "'Metropolis', sans-serif",
//                     fontWeight: 500
//                   }}>
//                     {useOriginal ? `${originalDimensions.width}×${originalDimensions.height}px` : `${customWidth}×${customHeight}px`}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg" style={{ 
//                   borderColor: '#555555',
//                   backgroundColor: '#ffffff',
//                   minHeight: '250px'
//                 }}>
//                   {previewUrl ? (
//                     <div className="relative" style={{ 
//                       width: '200px', 
//                       height: '200px',
//                       maxWidth: '100%'
//                     }}>
//                       <img
//                         src={previewUrl}
//                         alt="Preview"
//                         className="object-contain w-full h-full"
//                         style={{
//                           border: '2px solid #000000',
//                           backgroundColor: '#f5f5f5',
//                           borderRadius: '4px'
//                         }}
//                       />
//                       <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-center bg-black bg-opacity-75">
//                         <span style={{ 
//                           color: '#ffffff', 
//                           fontFamily: "'Metropolis', sans-serif", 
//                           fontWeight: 500,
//                           fontSize: '10px'
//                         }}>
//                           {useOriginal ? 'ORIGINAL' : 'EDITED'} • {useOriginal ? `${originalDimensions.width}×${originalDimensions.height}` : `${customWidth}×${customHeight}`}px
//                           {!useOriginal && ` • ${Math.round(imageQuality * 100)}% quality`}
//                         </span>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="p-4 text-center">
//                       <div className="mx-auto mb-3 text-3xl" style={{ color: '#555555' }}>📷</div>
//                       <div className="mb-2 text-sm" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                         {useOriginal ? 'Original Image Ready' : 'Preview Loading...'}
//                       </div>
//                       <div className="text-xs" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                         {useOriginal ? 'Maximum quality preserved' : 'Adjust settings to see preview'}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <div className="mt-4 text-xs text-center" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
//                   {useOriginal ? (
//                     <p>✓ Original quality • ✓ No compression • ✓ Full resolution</p>
//                   ) : (
//                     <>
//                       <p>This is how your product image will appear on the store</p>
//                       <p className="mt-1">✓ High quality • ✓ Optimized size • ✓ Professional look</p>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: '#555555' }}>
//           <button
//             type="button"
//             onClick={handleReset}
//             className="flex items-center px-6 py-2 font-medium transition-colors border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//             style={{ 
//               color: '#000000',
//               borderColor: '#555555',
//               fontFamily: "'Metropolis', sans-serif",
//               fontWeight: 500
//             }}
//             disabled={loading}
//           >
//             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//             Reset All
//           </button>
          
//           <div className="flex gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 font-medium transition-colors border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//               style={{ 
//                 color: '#000000',
//                 borderColor: '#555555',
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 500
//               }}
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={loading}
//               className="flex items-center px-6 py-2 font-medium text-white transition-colors rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
//               style={{ 
//                 backgroundColor: '#000000',
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 500
//               }}
//             >
//               {loading ? (
//                 <>
//                   <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                   {useOriginal ? 'Upload Original' : 'Save Image'}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modal Styles */}
//       <style>{`
//         .modal-overlay {
//           position: fixed;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background-color: rgba(0, 0, 0, 0.75);
//           z-index: 9999;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 20px;
//           overflow: hidden;
//         }
        
//         .modal-content {
//           position: relative;
//           background: white;
//           border-radius: 12px;
//           max-width: 1200px;
//           width: 90%;
//           height: 90vh;
//           max-height: 90vh;
//           overflow: hidden;
//           outline: none;
//           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
//           display: flex;
//           flex-direction: column;
//         }
        
//         .ReactCrop__crop-selection {
//           border: 2px dashed #000000;
//         }
        
//         .ReactCrop__drag-handle {
//           background: #000000;
//           border: 2px solid #ffffff;
//           width: 10px;
//           height: 10px;
//         }
        
//         .ReactCrop__drag-handle::after {
//           background: #000000;
//         }
        
//         input[type="range"]::-webkit-slider-thumb {
//           background: #000000;
//           border: 2px solid #ffffff;
//           border-radius: 50%;
//           width: 18px;
//           height: 18px;
//           cursor: pointer;
//           appearance: none;
//         }
        
//         input[type="range"]::-moz-range-thumb {
//           background: #000000;
//           border: 2px solid #ffffff;
//           border-radius: 50%;
//           width: 18px;
//           height: 18px;
//           cursor: pointer;
//         }
        
//         /* Custom scrollbar */
//         .modal-content > div:first-child > div:nth-child(2) {
//           scrollbar-width: thin;
//           scrollbar-color: #888 #f1f1f1;
//         }
        
//         .modal-content > div:first-child > div:nth-child(2)::-webkit-scrollbar {
//           width: 8px;
//         }
        
//         .modal-content > div:first-child > div:nth-child(2)::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 4px;
//         }
        
//         .modal-content > div:first-child > div:nth-child(2)::-webkit-scrollbar-thumb {
//           background: #888;
//           border-radius: 4px;
//         }
//       `}</style>
//     </Modal>
//   );
// };

// export default ImageEditorModal;