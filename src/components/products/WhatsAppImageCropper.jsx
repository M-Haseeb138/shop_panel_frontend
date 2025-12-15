// components/products/WhatsAppImageCropper.jsx
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Modal from "react-modal";

Modal.setAppElement("#root");

const WhatsAppImageCropper = ({
  isOpen,
  onClose,
  image,
  onSave,
  aspectRatio = 164 / 104,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Create cropped image
  const createCroppedImage = useCallback(async () => {
    if (!croppedAreaPixels || !image) return null;

    setIsProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const imageElement = new Image();
      imageElement.crossOrigin = "anonymous";

      const imageLoadPromise = new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = reject;
        imageElement.src = image;
      });

      await imageLoadPromise;

      // Fixed target size
      canvas.width = 164;
      canvas.height = 104;

      const scaleX = imageElement.naturalWidth / croppedAreaPixels.width;
      const scaleY = imageElement.naturalHeight / croppedAreaPixels.height;
      const scale = Math.min(scaleX, scaleY);

      const scaledWidth = croppedAreaPixels.width * scale;
      const scaledHeight = croppedAreaPixels.height * scale;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      // Background
      ctx.fillStyle = "#f9f9f9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw cropped image
      ctx.drawImage(
        imageElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        offsetX,
        offsetY,
        scaledWidth,
        scaledHeight
      );

      // Subtle border
      ctx.strokeStyle = "#e2e2e2";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            const file = new File([blob], `product-${Date.now()}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(file);
          },
          "image/jpeg",
          0.95
        );
      });
    } catch (error) {
      console.error("Error creating cropped image:", error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, image]);

  const handleSave = async () => {
    const croppedImage = await createCroppedImage();
    if (croppedImage) {
      onSave(croppedImage);
      onClose();
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      style={{
        content: {
          padding: 0,
          borderRadius: "12px",
          maxWidth: "600px",
          maxHeight: "90vh",
          width: "90%",
          margin: "auto",
          overflow: "hidden",
          border: "1px solid #e2e2e2",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <div
        className="flex flex-col h-full"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{
            borderColor: "#e2e2e2",
            backgroundColor: "#f8f9fa",
          }}
        >
          <div className="flex items-center gap-3">
            <h2
              className="text-lg font-medium"
              style={{
                color: "#000000",
                fontFamily: "Metropolis, sans-serif",
                fontWeight: 600,
              }}
            >
              Crop Product Image
            </h2>
            <span
              className="px-3 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: "#e2e2e2",
                color: "#555555",
                fontFamily: "Metropolis, sans-serif",
                fontWeight: 500,
              }}
            >
              164×104 px
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg hover:bg-gray-100"
            style={{ color: "#555555" }}
            disabled={isProcessing}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cropper area */}
        <div
          className="relative flex-1"
          style={{
            minHeight: "300px", // reduced so footer always fits
            backgroundColor: "#f5f5f5",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "500px",
                maxHeight: "320px",
                position: "relative",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
                cropShape="rect"
                style={{
                  containerStyle: {
                    backgroundColor: "#f5f5f5",
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  },
                  cropAreaStyle: {
                    border: "2px solid #ffffff",
                    boxShadow: "0 0 0 9999px rgba(94, 94, 94, 0.7)",
                    backgroundColor: "transparent",
                  },
                  mediaStyle: {
                    borderRadius: "4px",
                  },
                }}
                objectFit="contain"
                zoomSpeed={0.5}
                minZoom={1}
                maxZoom={5}
              />
            </div>
          </div>
        </div>

        {/* Bottom controls - single row: Reset | Cancel | Done */}
        <div
          className="p-4 border-t"
          style={{
            borderColor: "#e2e2e2",
            backgroundColor: "#ffffff",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center px-4 py-2 space-x-2 transition-colors border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              style={{
                color: "#000000",
                borderColor: "#bebebeff",
                backgroundColor: "#ffffff",
                fontFamily: "Metropolis, sans-serif",
                fontWeight: 500,
              }}
              disabled={isProcessing}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="text-sm">Reset</span>
            </button>

            {/* Cancel & Return (center) */}
            <div className="flex justify-center flex-1">
              <button
                onClick={onClose}
                className="flex items-center px-4 py-2.5 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100"
                style={{
                  color: "#555555",
                  fontFamily: "Metropolis, sans-serif",
                  fontWeight: 500,
                }}
                disabled={isProcessing}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Cancel &amp; Return
              </button>
            </div>

            {/* Done */}
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex items-center px-6 py-3 space-x-2 text-white transition-colors rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#000000",
                fontFamily: "Metropolis, sans-serif",
                fontWeight: 600,
              }}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Done</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for modal & cropper */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .modal-content {
          position: relative;
          background: white;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          outline: none;
          border-radius: 12px;
        }

        .reactEasyCrop_CropArea {
          border: 2px solid #ffffff !important;
          box-shadow: 0 0 0 9999px rgba(94, 94, 94, 0.7) !important;
        }

        .reactEasyCrop_CropAreaGrid {
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .reactEasyCrop_CropAreaGrid::before,
        .reactEasyCrop_CropAreaGrid::after {
          border: 1px solid rgba(255, 255, 255, 0.4);
        }

        .reactEasyCrop_Image {
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        button:hover {
          transform: translateY(-1px);
          transition: transform 0.15s ease;
        }

        button:active {
          transform: translateY(0);
        }
      `}</style>
    </Modal>
  );
};

export default WhatsAppImageCropper;
