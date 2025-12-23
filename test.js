// components/order/OrderModal.jsx - UPDATED LAYOUT
import React, { useState, useEffect } from "react";
import ordersAPI from "../../services/ordersAPI";

const OrderModal = ({ order, isOpen, onClose, loading, refreshOrders }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] =
    useState(false);

  // State for photos/videos
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [hasUploadedMedia, setHasUploadedMedia] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // State for self pickup OTP
  const [otp, setOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState(null);

  // Initialize from order data
  // Initialize from order data
  useEffect(() => {
    if (order && order.orderMedia) {
      setPhotos(order.orderMedia.photos || []);
      setVideos(order.orderMedia.videos || []);
      setHasUploadedMedia(order.orderMedia.hasMediaUploaded || false);
    }

    // ✅ Check if OTP is already verified (from trackingFlags.isOutForDelivery)
    if (order && order.trackingFlags) {
      setOtpVerified(order.trackingFlags.isOutForDelivery || false);
    }

    // Simple validation check
    if (
      order &&
      (order.status === "shop_accepted" || order.status === "shop_preparing")
    ) {
      const hasMedia = order.orderMedia?.hasMediaUploaded || false;
      const photoCount = order.orderMedia?.photos?.length || 0;
      const canProceed = hasMedia && photoCount > 0;

      setValidationResult({
        canProceed,
        hasMediaUploaded: hasMedia,
        photoCount,
        message: canProceed
          ? "Order can be marked as ready"
          : `Please upload at least one photo before marking order as ready. ${photoCount}/1 photos uploaded.`,
      });
    }
  }, [order]);
  // Function to verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter OTP");
      return;
    }

    if (otp.length !== 4) {
      setOtpError("OTP must be 4 digits");
      return;
    }

    try {
      setOtpVerifying(true);
      setOtpError(null);

      // Call API to verify OTP
      const response = await ordersAPI.verifySelfPickupOtp(order.orderId, otp);

      if (response.success) {
        setOtpVerified(true);
        setOtpError(null);

        // Update local order tracking flags
        if (response.order && response.order.trackingFlags) {
          order.trackingFlags = response.order.trackingFlags;
        }

        alert("✅ OTP verified successfully!");

        // Refresh orders if needed
        if (refreshOrders) {
          refreshOrders();
        }
      } else {
        throw new Error(response.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invalid OTP. Please check and try again.";

      setOtpError(errorMessage);
      alert(`❌ ${errorMessage}`);
    } finally {
      setOtpVerifying(false);
    }
  };

  // Function to mark order as ready with validation

  const handleMarkAsReady = async () => {
    if (!order || !order._id) return;

    // For delivery orders only
    if (order.deliveryMethod !== "delivery") {
      alert(
        "❌ This button is only for delivery orders. For self-pickup orders, please verify OTP first."
      );
      return;
    }

    // Check if media is uploaded
    const hasMedia = order.orderMedia?.hasMediaUploaded || false;
    const photoCount = order.orderMedia?.photos?.length || 0;

    if (!hasMedia || photoCount === 0) {
      alert(
        `❌ Please upload at least one photo before marking order as ready.\n\nCurrent: ${photoCount}/1 photos uploaded.`
      );
      setActiveTab("photos");
      return;
    }

    // For delivery orders, proceed normally
    await updateOrderStatusToReady();
  };

  // Function to upload files
  const handleFileUpload = async (event, type) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();

      // Add all selected files with correct field names
      files.forEach((file) => {
        const fieldName = type === "photo" ? "photos" : "videos";
        formData.append(fieldName, file);
      });

      const response = await ordersAPI.uploadOrderMedia(order._id, formData);

      if (response.success) {
        // ✅ IMPORTANT: Update BOTH state AND order object
        if (response.data.media) {
          if (type === "photo") {
            const newPhotos = response.data.media.photos || [];
            setPhotos((prev) => [...prev, ...newPhotos]);

            // Update order object directly
            if (!order.orderMedia) order.orderMedia = {};
            if (!order.orderMedia.photos) order.orderMedia.photos = [];
            order.orderMedia.photos = [
              ...order.orderMedia.photos,
              ...newPhotos,
            ];
          } else {
            const newVideos = response.data.media.videos || [];
            setVideos((prev) => [...prev, ...newVideos]);

            if (!order.orderMedia) order.orderMedia = {};
            if (!order.orderMedia.videos) order.orderMedia.videos = [];
            order.orderMedia.videos = [
              ...order.orderMedia.videos,
              ...newVideos,
            ];
          }

          // Update hasMediaUploaded flag in both state and order object
          setHasUploadedMedia(true);
          if (order.orderMedia) {
            order.orderMedia.hasMediaUploaded = true;
          }
        }

        alert(`✅ ${files.length} ${type}(s) uploaded successfully!`);
        event.target.value = "";
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };
  // Function to remove media from local state
  const handleRemoveMedia = (mediaItem, type, index) => {
    if (!window.confirm(`Are you sure you want to remove this ${type}?`)) {
      return;
    }

    try {
      if (type === "photo") {
        const updatedPhotos = [...photos];
        updatedPhotos.splice(index, 1);
        setPhotos(updatedPhotos);

        const hasMedia = updatedPhotos.length > 0 || videos.length > 0;
        setHasUploadedMedia(hasMedia);

        setValidationResult((prev) => ({
          ...prev,
          canProceed: updatedPhotos.length > 0,
          photoCount: updatedPhotos.length,
          message:
            updatedPhotos.length > 0
              ? `Photos updated. ${updatedPhotos.length}/1 photos uploaded.`
              : "Please upload at least one photo before marking order as ready.",
        }));
      } else if (type === "video") {
        const updatedVideos = [...videos];
        updatedVideos.splice(index, 1);
        setVideos(updatedVideos);

        const hasMedia = photos.length > 0 || updatedVideos.length > 0;
        setHasUploadedMedia(hasMedia);
      }

      alert(`✅ ${type} removed successfully!`);
    } catch (error) {
      console.error("Error removing media:", error);
      alert(`❌ Error removing ${type}. Please try again.`);
    }
  };

  // Function to actually update status to ready_for_pickup
  const updateOrderStatusToReady = async () => {
    try {
      setUpdatingStatus(true);
      setStatusError(null);

      const response = await ordersAPI.updateOrderStatus(
        order._id,
        "ready_for_pickup"
      );

      if (response && response.success) {
        order.status = "ready_for_pickup";

        if (response.order) {
          Object.assign(order, response.order);
        }

        if (refreshOrders) {
          await refreshOrders();
        }

        alert(`✅ Order ${order.orderId} marked as ready for pickup!`);
      } else {
        throw new Error(response?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("❌ Error marking order as ready:", error);

      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update order status. Please try again.";

      setStatusError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Function to mark self_pickup order as delivered
  const handleMarkAsDeliveredForSelfPickup = async () => {
    if (!order || !order._id) return;

    // ✅ FIX: Check BOTH hasUploadedMedia state AND order.orderMedia object
    const hasMediaFromState = hasUploadedMedia;
    const hasMediaFromOrder = order.orderMedia?.hasMediaUploaded || false;
    const photoCountFromOrder = order.orderMedia?.photos?.length || 0;

    console.log("📸 Media Check:", {
      hasMediaFromState,
      hasMediaFromOrder,
      photoCountFromOrder,
      orderMedia: order.orderMedia,
    });

    // Use order.orderMedia for the actual check
    if (!hasMediaFromOrder || photoCountFromOrder === 0) {
      alert(
        `❌ Please upload at least one photo before marking order as delivered.\n\nCurrent: ${photoCountFromOrder}/1 photos uploaded.`
      );
      setActiveTab("photos");
      return;
    }

    // Check if OTP is verified
    if (!otpVerified) {
      alert("⚠️ Please verify customer OTP first before marking as delivered.");
      return;
    }

    try {
      setUpdatingStatus(true);

      console.log("📦 Marking self-pickup order as delivered:", {
        orderId: order.orderId,
        otpVerified,
        hasMedia: hasMediaFromOrder,
        photoCount: photoCountFromOrder,
      });

      const response = await ordersAPI.updateOrderStatus(
        order._id,
        "delivered"
      );

      if (response.success) {
        order.status = "delivered";
        alert("✅ Order marked as delivered!");
        if (refreshOrders) await refreshOrders();
        onClose(); // Close modal after successful delivery
      } else {
        throw new Error(response.message || "Failed to mark as delivered");
      }
    } catch (error) {
      console.error("Error marking as delivered:", error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  // Format currency to USD
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  // Get status badge styling - ONLY GRAY, BLACK, WHITE
  const getStatusBadge = (status) => {
    const baseStyle = {
      fontFamily: "'Metropolis', sans-serif",
      fontWeight: 500,
      fontSize: "12px",
      padding: "6px 10px",
      borderRadius: "9999px",
      display: "inline-flex",
      alignItems: "center",
      border: "1px solid #55555520",
    };

    const statusConfig = {
      pending: {
        label: "Pending",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
      shop_accepted: {
        label: "Accepted",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
      shop_preparing: {
        label: "Preparing",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
      ready_for_pickup: {
        label: "Ready",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
      rider_assigned: {
        label: "Assigned",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
      delivered: {
        label: "Delivered",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
      cancelled: {
        label: "Cancelled",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
      awaiting_manual_assignment: {
        label: "Manual",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
      user_conformation: {
        label: "Awaiting Customer",
        style: { backgroundColor: "#555555", color: "#FFFFFF" },
      },
    };

    const config = statusConfig[status] || {
      label: status,
      style: { backgroundColor: "#EDEDED", color: "#000000" },
    };

    return (
      <span style={{ ...baseStyle, ...config.style }}>{config.label}</span>
    );
  };

  // Get delivery method badge
  const getDeliveryMethodBadge = (method) => {
    if (method === "self_pickup") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-[#555555] border rounded-full">
          Self Pickup
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-[#555555] rounded-full">
        Delivery
      </span>
    );
  };

  // Tabs configuration
  const tabs = [
    { id: "details", label: "Order Details" },
    { id: "items", label: "Order Items" },
    { id: "payment", label: "Payment" },
    { id: "timeline", label: "Timeline" },
    { id: "photos", label: "Photos & Videos" },
  ];

  // Get timeline steps
  const getTimelineSteps = () => {
    const steps = [];

    if (order.timestamps?.orderPlaced) {
      steps.push({
        title: "Order Placed",
        time: order.timestamps.orderPlaced,
        status: "completed",
        description: "Customer placed the order",
      });
    }

    if (order.status === "shop_accepted" || order.status === "shop_preparing") {
      steps.push({
        title: "Order Accepted",
        time: order.timestamps?.shopAccepted || order.createdAt,
        status: "completed",
        description: "You accepted the order",
      });
    }

    if (order.status === "ready_for_pickup") {
      steps.push({
        title: "Ready for Pickup",
        time: order.timestamps?.readyForPickup,
        status: "completed",
        description: "Order is ready for pickup",
      });
    }

    if (order.status === "rider_assigned") {
      steps.push({
        title: "Rider Assigned",
        time: order.timestamps?.assignedToRider,
        status: "completed",
        description: "Rider has been assigned",
      });
    }

    if (order.status === "delivered") {
      steps.push({
        title: "Delivered",
        time: order.timestamps?.delivered,
        status: "completed",
        description: "Order delivered to customer",
      });
    }

    if (order.status === "user_conformation") {
      steps.push({
        title: "Waiting for Customer",
        time: order.updatedAt,
        status: "completed",
        description: "Order ready, waiting for customer pickup confirmation",
      });
    }

    return steps;
  };

  const timelineSteps = getTimelineSteps();

  return (
    <>
      {/* Delivery Confirmation Popup */}
      {showDeliveryConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                  <svg
                    className="w-5 h-5 text-gray-900"
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
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Confirm Delivery
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Order #{order.orderId}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
                  <svg
                    className="w-8 h-8 text-gray-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <h4 className="mb-2 font-semibold text-center text-gray-900">
                  Has the customer picked up the order?
                </h4>

                <p className="mb-4 text-center text-gray-700">
                  Please confirm that the customer has collected the order.
                </p>

                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-800">
                    This will mark the order as{" "}
                    <span className="font-bold text-gray-900">Delivered</span>
                    and complete the transaction.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowDeliveryConfirmation(false)}
                disabled={updatingStatus}
                className="flex-1 py-4 text-sm font-medium text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsDelivered}
                disabled={updatingStatus}
                className="flex-1 py-4 text-sm font-medium text-white transition-colors bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
              >
                {updatingStatus ? (
                  <>
                    <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  "Yes, Mark as Delivered"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div className="relative flex items-center justify-center min-h-screen p-4">
          {/* Modal Content */}
          <div className="relative w-full max-w-5xl overflow-hidden bg-white shadow-2xl rounded-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
              <div className="px-8 py-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order Details
                    </h2>
                    <div className="flex flex-col gap-3 mt-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            Order ID:
                          </span>
                          <span className="font-mono text-lg font-bold text-gray-900">
                            {order.orderId}
                          </span>
                        </div>
                        {getStatusBadge(order.status)}
                        {getDeliveryMethodBadge(order.deliveryMethod)}
                      </div>

                      {/* Preparation Time moved to right side */}
                      {order.preparationTime && (
                        <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-gradient-to-br from-gray-50 to-gray-100">
                          <div className="flex items-center justify-center w-6 h-6 bg-gray-900 rounded-full">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              Prep Time:
                            </span>
                            <span className="ml-1 font-semibold text-gray-700">
                              {order.preparationTime} min
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Important Note for uploading photos/videos */}
                    {(order.status === "shop_accepted" ||
                      order.status === "shop_preparing") &&
                      !hasUploadedMedia && (
                        <div className="p-3 mt-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.33 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                <span className="font-semibold">
                                  Important:
                                </span>{" "}
                                Please upload order photos before marking as
                                ready.
                              </p>
                              <p className="mt-1 text-sm text-gray-900">
                                At least one photo is required. Videos are
                                optional but recommended for quality assurance.
                              </p>
                              {validationResult && (
                                <button
                                  onClick={() => setActiveTab("photos")}
                                  className="mt-2 text-sm font-medium text-gray-900 underline hover:text-gray-700"
                                >
                                  Go to Photos & Videos tab →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Success message when media is uploaded */}
                    {(order.status === "shop_accepted" ||
                      order.status === "shop_preparing") &&
                      hasUploadedMedia && (
                        <div className="p-3 mt-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Media uploaded successfully! You can now mark
                                the order as ready.
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-700">
                                <span>Photos: {photos.length}</span>
                                <span>Videos: {videos.length}</span>
                                <button
                                  onClick={() => setActiveTab("photos")}
                                  className="font-medium hover:text-gray-900"
                                >
                                  View media →
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 ml-4 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
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
              </div>

              {/* Tabs */}
              <div className="px-8">
                <div className="flex space-x-1 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-3 font-medium text-sm transition-all duration-200 whitespace-nowrap border-b-2 ${
                        activeTab === tab.id
                          ? "text-gray-900 border-gray-900"
                          : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                      {tab.id === "photos" &&
                        !hasUploadedMedia &&
                        (order.status === "shop_accepted" ||
                          order.status === "shop_preparing") && (
                          <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-bold text-white bg-gray-900 rounded-full">
                            !
                          </span>
                        )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 mb-4 border-4 border-gray-300 rounded-full border-t-gray-900 animate-spin" />
                  <p className="text-gray-600">Loading order details...</p>
                </div>
              ) : (
                <>
                  {/* Details Tab - UPDATED LAYOUT */}
                  {activeTab === "details" && (
                    <div className="space-y-8">
                      {/* Order Summary Cards */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="p-5 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                          <div className="mb-2 text-sm text-gray-600">
                            Total Amount
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(
                              order.pricing?.itemsTotal -
                                order.pricing?.discount || 0
                            )}
                          </div>
                        </div>

                        <div className="p-5 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                          <div className="mb-2 text-sm text-gray-600">
                            Order Date
                          </div>
                          <div className="font-medium text-gray-900">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>

                        <div className="p-5 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                          <div className="mb-2 text-sm text-gray-600">
                            Items
                          </div>
                          <div className="font-medium text-gray-900">
                            {order.items?.length || 0} items
                          </div>
                        </div>

                        <div className="p-5 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                          <div className="mb-2 text-sm text-gray-600">
                            Delivery Method
                          </div>
                          <div className="font-medium text-gray-900 capitalize">
                            {order.deliveryMethod === "self_pickup"
                              ? "Self Pickup"
                              : "Delivery"}
                          </div>
                        </div>
                      </div>

                      {/* Customer & OTP Section - UPDATED LAYOUT */}
                      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Customer Information - Left Side */}
                        <div>
                          <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                            Customer Information
                          </h3>

                          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  <span className="font-semibold text-black">
                                    Customer:
                                  </span>{" "}
                                  {order.user?.name}
                                </h4>

                                <div className="mt-2 space-y-2">
                                  {/* Phone */}
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 mr-2 text-gray-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                      />
                                    </svg>
                                    <div>
                                      <span className="text-sm font-medium text-gray-700">
                                        Phone:
                                      </span>
                                      <div className="font-medium text-gray-900">
                                        {order.user?.phone}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Email */}
                                  {order.user?.userId?.email && (
                                    <div className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-2 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <div>
                                        <span className="text-sm font-medium text-gray-700">
                                          Email:
                                        </span>
                                        <div className="font-medium text-gray-900">
                                          {order.user.userId.email}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Self Pickup OTP Verification - Right Side */}
                        {/* Self Pickup OTP Verification - Right Side */}
                        {order.deliveryMethod === "self_pickup" &&
                          (order.status === "shop_accepted" ||
                            order.status === "shop_preparing") && (
                            <div>
                              <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                                Self Pickup OTP Verification
                              </h3>

                              <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                                <div className="space-y-4">
                                  {/* Status Badge */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          otpVerified
                                            ? "bg-green-500"
                                            : "bg-gray-400"
                                        }`}
                                      ></div>
                                      <span
                                        className={`text-sm font-medium ${
                                          otpVerified
                                            ? "text-green-700"
                                            : "text-gray-600"
                                        }`}
                                      >
                                        {otpVerified
                                          ? "OTP Verified"
                                          : "OTP Required"}
                                      </span>
                                    </div>
                                    {otpVerified && (
                                      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                        Verified ✓
                                      </span>
                                    )}
                                  </div>

                                  {/* OTP Input Section */}
                                  <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                      Enter Customer OTP
                                    </label>
                                    <div className="space-y-3">
                                      <div className="relative">
                                        <input
                                          type="text"
                                          value={otp}
                                          onChange={(e) =>
                                            setOtp(
                                              e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 4)
                                            )
                                          }
                                          placeholder="Enter 4 digit OTP"
                                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all ${
                                            otpVerified
                                              ? "border-green-500 bg-green-50"
                                              : otpError
                                              ? "border-red-300"
                                              : "border-gray-300"
                                          }`}
                                          maxLength={4}
                                          disabled={otpVerified || otpVerifying}
                                        />
                                        {otpVerified && (
                                          <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                                            <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                                              <svg
                                                className="w-4 h-4 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={3}
                                                  d="M5 13l4 4L19 7"
                                                />
                                              </svg>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Verify Button */}
                                      <button
                                        onClick={handleVerifyOtp}
                                        disabled={
                                          !otp.trim() ||
                                          otpVerifying ||
                                          otpVerified
                                        }
                                        className={`w-full py-3 font-medium rounded-lg transition-all ${
                                          !otp.trim() ||
                                          otpVerifying ||
                                          otpVerified
                                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md"
                                        }`}
                                      >
                                        {otpVerifying ? (
                                          <>
                                            <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                                            Verifying OTP...
                                          </>
                                        ) : otpVerified ? (
                                          <>
                                            <svg
                                              className="inline-block w-4 h-4 mr-2"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                            OTP Verified ✓
                                          </>
                                        ) : (
                                          "Verify Customer OTP"
                                        )}
                                      </button>
                                    </div>

                                    {/* Error Message */}
                                    {otpError && (
                                      <div className="p-2 mt-2 border border-red-200 rounded-lg bg-red-50">
                                        <p className="flex items-center gap-1 text-sm text-red-600">
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
                                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          {otpError}
                                        </p>
                                      </div>
                                    )}

                                    {/* Instructions */}
                                    {!otpVerified && (
                                      <div className="p-2 mt-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <p className="text-xs text-gray-700">
                                          <span className="font-semibold">
                                            Note:
                                          </span>{" "}
                                          Ask the customer for their OTP when
                                          they arrive for pickup. After OTP
                                          verification, you can mark the order
                                          as delivered.
                                        </p>
                                      </div>
                                    )}

                                    {/* Success Message after OTP verification */}
                                    {otpVerified && (
                                      <div className="p-3 mt-4 border border-green-200 rounded-lg bg-green-50">
                                        <div className="flex items-center gap-2">
                                          <svg
                                            className="w-5 h-5 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          <div>
                                            <p className="text-sm font-medium text-green-800">
                                              OTP verified successfully!
                                            </p>
                                            <p className="mt-1 text-xs text-green-700">
                                              You can now mark the order as
                                              delivered.
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Delivery Address (if available) */}
                        {order.user?.deliveryAddress && (
                          <div className="lg:col-span-2">
                            <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                              Customer Delivery Address
                            </h3>

                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {(() => {
                                  const addr =
                                    order.user?.deliveryAddress || {};
                                  const fullStreet = addr.street || "";
                                  const [streetName, ...restParts] =
                                    fullStreet.split(",");
                                  const country =
                                    addr.country ||
                                    (restParts.length > 0
                                      ? restParts[restParts.length - 1].trim()
                                      : "");

                                  return (
                                    <>
                                      <div className="space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
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
                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                          </svg>
                                          <span className="font-medium">
                                            Street
                                          </span>
                                        </div>
                                        <div className="pl-6 font-medium text-gray-900">
                                          {streetName?.trim() ||
                                            fullStreet ||
                                            "-"}
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
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
                                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                          </svg>
                                          <span className="font-medium">
                                            City/State
                                          </span>
                                        </div>
                                        <div className="pl-6 font-medium text-gray-900">
                                          {[
                                            addr.city?.trim(),
                                            addr.state?.trim(),
                                            country || "",
                                          ]
                                            .filter(Boolean)
                                            .join(", ") || "-"}
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
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
                                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                          </svg>
                                          <span className="font-medium">
                                            Pincode
                                          </span>
                                        </div>
                                        <div className="pl-6 font-medium text-gray-900">
                                          {addr.pincode || "-"}
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Special Instructions for Self Pickup */}
                      {order.deliveryMethod === "self_pickup" && (
                        <div>
                          <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                            Self Pickup Information
                          </h3>
                          <div className="p-5 bg-white border border-gray-200 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-gray-50">
                                <svg
                                  className="w-5 h-5 text-gray-900"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <h4 className="mb-2 font-semibold text-gray-900">
                                  Customer will pick up from shop
                                </h4>
                                <p className="text-gray-800">
                                  Please prepare the order and keep it ready for
                                  customer pickup. The customer will collect the
                                  order directly from your shop location.
                                </p>
                                <div className="p-3 mt-3 rounded-lg bg-gray-50">
                                  <p className="mb-2 text-sm font-medium text-gray-900">
                                    Requirements:
                                  </p>
                                  <ul className="mt-1 ml-4 space-y-1 text-sm text-gray-700 list-disc">
                                    <li>Upload order photos/videos</li>
                                    <li>
                                      Verify customer OTP when they arrive
                                    </li>
                                    <li>
                                      Mark as ready after OTP verification
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delivery Info */}
                      {(order.distance?.value || order.estimatedDeliveryTime) &&
                        order.deliveryMethod === "delivery" && (
                          <div>
                            <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                              Delivery Information
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              {order.distance?.value && (
                                <div className="p-5 border border-gray-200 bg-gray-50 rounded-xl">
                                  <div className="mb-1 text-sm font-medium text-black">
                                    Distance
                                  </div>
                                  <div className="text-2xl font-bold text-black">
                                    {order.distance.text}
                                  </div>
                                </div>
                              )}
                              {order.estimatedDeliveryTime && (
                                <div className="p-5 border border-gray-200 bg-gray-50 rounded-xl">
                                  <div className="mb-1 text-sm font-medium text-black">
                                    Estimated Delivery
                                  </div>
                                  <div className="text-2xl font-bold text-black">
                                    {formatDate(order.estimatedDeliveryTime)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Items Tab */}
                  {activeTab === "items" && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order Items
                        </h3>
                        <span className="text-sm text-gray-600">
                          {order.items?.length || 0} items
                        </span>
                      </div>

                      <div className="space-y-4">
                        {order.items?.map((item, index) => {
                          let sizes = [];
                          try {
                            if (item.productSize) {
                              const parsed = JSON.parse(item.productSize);
                              sizes = Array.isArray(parsed) ? parsed : [parsed];
                            }
                          } catch (e) {
                            sizes = [item.productSize];
                          }

                          return (
                            <div
                              key={index}
                              className="p-5 transition-colors bg-white border border-gray-200 rounded-xl hover:border-gray-300"
                            >
                              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                                {/* Product Image */}
                                {item.productImage && (
                                  <div className="flex-shrink-0">
                                    <div className="w-24 h-24 overflow-hidden border border-gray-200 rounded-lg">
                                      <img
                                        src={item.productImage}
                                        alt={item.name}
                                        className="object-cover w-full h-full"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src =
                                            "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&h=150&fit=crop&crop=center";
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="flex-1">
                                      <h4 className="mb-2 text-lg font-semibold text-gray-900">
                                        {item.name}
                                      </h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-4 text-sm">
                                          <div className="flex items-center">
                                            <span className="mr-2 text-gray-600">
                                              Quantity:
                                            </span>
                                            <span className="px-2 py-1 font-medium bg-gray-100 rounded-md">
                                              {item.quantity}
                                            </span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="mr-2 text-gray-600">
                                              Price:
                                            </span>
                                            <span className="font-medium">
                                              {formatCurrency(item.price)} each
                                            </span>
                                          </div>
                                        </div>

                                        {sizes.length > 0 && (
                                          <div className="flex items-center">
                                            <span className="mr-2 text-sm text-gray-600">
                                              Size:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                              {sizes.map((size, i) => (
                                                <span
                                                  key={i}
                                                  className="px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
                                                >
                                                  {size}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {item.productColor && (
                                          <div className="flex items-center">
                                            <span className="mr-2 text-sm text-gray-600">
                                              Color:
                                            </span>
                                            <span className="text-sm font-medium">
                                              {item.productColor}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="md:text-right">
                                      <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(
                                          item.price * item.quantity
                                        )}
                                      </div>
                                      <div className="mt-1 text-sm text-gray-600">
                                        {item.quantity} ×{" "}
                                        {formatCurrency(item.price)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Payment Tab */}
                  {activeTab === "payment" && (
                    <div className="space-y-8">
                      {/* Payment Summary */}
                      <div>
                        <h3 className="mb-6 text-lg font-semibold text-gray-900">
                          Payment Summary
                        </h3>
                        <div className="max-w-lg p-6 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-700">Items Total</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(order.pricing?.itemsTotal || 0)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                              <span className="text-gray-700"> Tax</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(
                                  order.pricing?.taxPercentage || 0
                                )}
                              </span>
                            </div>

                            {order.pricing?.discount > 0 && (
                              <div className="flex items-center justify-between py-2">
                                <span className="text-gray-700">Discount</span>
                                <span className="font-medium text-gray-900">
                                  - {formatCurrency(order.pricing.discount)}
                                </span>
                              </div>
                            )}

                            <div className="pt-4 border-t border-gray-300">
                              <div className="flex items-center justify-between py-2">
                                <span className="text-lg font-semibold text-gray-900">
                                  Total Amount
                                </span>
                                <span className="text-3xl font-bold text-gray-900">
                                  {formatCurrency(
                                    order.pricing?.itemsTotal -
                                      order.pricing?.discount || 0
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      {order.payment && (
                        <div>
                          <h3 className="mb-6 text-lg font-semibold text-gray-900">
                            Payment Details
                          </h3>
                          <div className="p-6 bg-white border border-gray-200 rounded-2xl">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <div>
                                <div className="mb-1 text-sm text-gray-600">
                                  Payment ID
                                </div>
                                <div className="font-mono font-medium text-gray-900">
                                  {order.payment.paymentId}
                                </div>
                              </div>

                              <div>
                                <div className="mb-1 text-sm text-gray-600">
                                  Payment Method
                                </div>
                                <div className="font-medium text-gray-900">
                                  {order.payment.method}
                                </div>
                              </div>

                              <div>
                                <div className="mb-1 text-sm text-gray-600">
                                  Payment Status
                                </div>
                                <div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      order.payment.status === "SUCCESS"
                                        ? "bg-gray-500 text-white"
                                        : order.payment.status === "PENDING"
                                        ? "bg-gray-500 text-white"
                                        : "bg-gray-500 text-white"
                                    }`}
                                  >
                                    {order.payment.status}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <div className="mb-1 text-sm text-gray-600">
                                  Paid At
                                </div>
                                <div className="font-medium text-gray-900">
                                  {formatDate(order.payment.paidAt)}
                                </div>
                              </div>

                              {order.payment.stripePaymentIntentId && (
                                <div className="md:col-span-2">
                                  <div className="mb-1 text-sm text-gray-600">
                                    Stripe Payment ID
                                  </div>
                                  <div className="font-mono text-sm text-gray-900">
                                    {order.payment.stripePaymentIntentId}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline Tab */}
                  {activeTab === "timeline" && (
                    <div>
                      <h3 className="mb-8 text-lg font-semibold text-gray-900">
                        Order Timeline
                      </h3>

                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-300 to-gray-300" />

                        {/* Timeline steps */}
                        <div className="space-y-8">
                          {timelineSteps.map((step, index) => (
                            <div
                              key={index}
                              className="relative flex items-start"
                            >
                              {/* Step circle */}
                              <div className="z-10 flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-900 to-gray-800">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>

                              {/* Step content */}
                              <div className="flex-1 ml-8">
                                <div className="p-5 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <h4 className="font-semibold text-gray-900">
                                      {step.title}
                                    </h4>
                                    {step.time && (
                                      <div className="text-sm text-gray-600">
                                        {formatDate(step.time)}
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          ({formatTimeAgo(step.time)})
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {step.description && (
                                    <p className="mt-2 text-gray-700">
                                      {step.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Current status */}
                          <div className="relative flex items-start">
                            <div className="z-10 flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600">
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            </div>

                            <div className="flex-1 ml-8">
                              <div className="p-5 border border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
                                  <h4 className="font-semibold text-gray-900">
                                    Current Status:{" "}
                                    {order.status
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </h4>
                                </div>
                                <p className="mt-2 text-gray-800">
                                  Order is currently{" "}
                                  {order.status.replace("_", " ").toLowerCase()}
                                  {order.deliveryMethod === "self_pickup" &&
                                    " (Self Pickup)"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Photos & Videos Tab */}
                  {activeTab === "photos" && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order Photos & Videos
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            Upload photos (required) and videos (optional)
                            before marking order as ready
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                            Photos: {photos.length}/5
                          </div>
                          <div className="px-3 py-1 text-sm bg-gray-100 rounded-full">
                            Videos: {videos.length}/2
                          </div>
                        </div>
                      </div>

                      {/* Simple Status Message */}
                      {validationResult &&
                        !validationResult.canProceed &&
                        (order.status === "shop_accepted" ||
                          order.status === "shop_preparing") && (
                          <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex items-start gap-3">
                              <svg
                                className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.33 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Please upload at least one photo before
                                  marking order as ready.
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                                  <span>
                                    📸 Photos:{" "}
                                    {validationResult.photoCount ||
                                      photos.length}
                                    /1 required
                                  </span>
                                  <span>
                                    🎥 Videos: {videos.length}/2 optional
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Upload Section */}
                      <div className="mb-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Photo Upload (Required) */}
                          <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full">
                                <svg
                                  className="w-5 h-5 text-gray-900"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">
                                    Upload Photos ({photos.length}/5)
                                  </h4>
                                  <span className="px-2 py-0.5 text-xs font-medium text-white bg-gray-900 rounded-full">
                                    Required
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {photos.length === 0
                                    ? "Upload order preparation photos"
                                    : `${photos.length} photos uploaded`}
                                </p>
                              </div>
                            </div>

                            <input
                              type="file"
                              id="photo-upload"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleFileUpload(e, "photo")}
                              className="hidden"
                              disabled={uploading || photos.length >= 5}
                            />
                            <label
                              htmlFor="photo-upload"
                              className={`block w-full p-4 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                uploading
                                  ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                  : photos.length >= 5
                                  ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                              }`}
                            >
                              {uploading ? (
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-6 h-6 mb-2 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
                                  <span className="text-sm text-gray-600">
                                    Uploading...
                                  </span>
                                </div>
                              ) : photos.length >= 5 ? (
                                <div className="flex flex-col items-center justify-center">
                                  <svg
                                    className="w-8 h-8 mb-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">
                                    Maximum photos reached
                                  </span>
                                  <span className="mt-1 text-xs text-gray-500">
                                    You can upload up to 5 photos
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  <svg
                                    className="w-8 h-8 mb-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">
                                    {photos.length === 0
                                      ? "Click to upload photos"
                                      : "Add more photos"}
                                  </span>
                                  <span className="mt-1 text-xs text-gray-500">
                                    {photos.length}/5 uploaded • PNG, JPG, WebP
                                    up to 5MB
                                  </span>
                                </div>
                              )}
                            </label>
                          </div>

                          {/* Video Upload (Optional) */}
                          <div className="p-6 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full">
                                <svg
                                  className="w-5 h-5 text-gray-900"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">
                                    Upload Videos ({videos.length}/2)
                                  </h4>
                                  <span className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-full">
                                    Optional
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {videos.length === 0
                                    ? "Upload order preparation videos"
                                    : `${videos.length} videos uploaded`}
                                </p>
                              </div>
                            </div>

                            <input
                              type="file"
                              id="video-upload"
                              accept="video/*"
                              multiple
                              onChange={(e) => handleFileUpload(e, "video")}
                              className="hidden"
                              disabled={uploading || videos.length >= 2}
                            />
                            <label
                              htmlFor="video-upload"
                              className={`block w-full p-4 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                uploading
                                  ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                  : videos.length >= 2
                                  ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                              }`}
                            >
                              {uploading ? (
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-6 h-6 mb-2 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
                                  <span className="text-sm text-gray-600">
                                    Uploading...
                                  </span>
                                </div>
                              ) : videos.length >= 2 ? (
                                <div className="flex flex-col items-center justify-center">
                                  <svg
                                    className="w-8 h-8 mb-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">
                                    Maximum videos reached
                                  </span>
                                  <span className="mt-1 text-xs text-gray-500">
                                    You can upload up to 2 videos
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center">
                                  <svg
                                    className="w-8 h-8 mb-2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">
                                    {videos.length === 0
                                      ? "Click to upload videos"
                                      : "Add more videos"}
                                  </span>
                                  <span className="mt-1 text-xs text-gray-500">
                                    {videos.length}/2 uploaded • MP4, MOV up to
                                    50MB
                                  </span>
                                </div>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Photos Gallery */}
                      {photos.length > 0 && (
                        <div className="mb-8">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {photos.map((photo, index) => (
                              <div
                                key={photo._id || photo.id || index}
                                className="relative overflow-hidden border border-gray-200 rounded-lg group"
                              >
                                {/* Remove Icon Button */}
                                <button
                                  onClick={() =>
                                    handleRemoveMedia(photo, "photo", index)
                                  }
                                  className="absolute top-2 right-2 z-10 p-1.5 bg-white border border-gray-300 text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 shadow-sm"
                                  title="Remove this photo"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>

                                {/* Image Container */}
                                <div className="relative overflow-hidden bg-gray-100">
                                  <img
                                    src={photo.url}
                                    alt={photo.description || "Order photo"}
                                    className="object-cover w-full h-48 transition-all duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop";
                                    }}
                                  />
                                </div>
                                <div className="p-3 bg-white">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {photo.description || "Order photo"}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-600">
                                      {photo.uploadedAt
                                        ? formatTimeAgo(photo.uploadedAt)
                                        : "Recently uploaded"}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      Uploaded by Shop
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Videos Gallery */}
                      {videos.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900">
                              Videos ({videos.length})
                            </h4>
                            <span className="text-sm text-gray-600">
                              Click to play videos
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {videos.map((video, index) => (
                              <div
                                key={video._id || video.id || index}
                                className="relative overflow-hidden border border-gray-200 rounded-lg group"
                              >
                                {/* Remove Icon Button for Video */}
                                <button
                                  onClick={() =>
                                    handleRemoveMedia(video, "video", index)
                                  }
                                  className="absolute top-2 right-2 z-10 p-1.5 bg-white border border-gray-300 text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100 shadow-sm"
                                  title="Remove this video"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>

                                <div className="relative overflow-hidden bg-gray-100">
                                  <video
                                    src={video.url}
                                    className="object-cover w-full h-48"
                                    controls
                                    preload="metadata"
                                  />
                                </div>
                                <div className="p-3 bg-white">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {video.description || "Order video"}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-600">
                                      {video.uploadedAt
                                        ? formatTimeAgo(video.uploadedAt)
                                        : "Recently uploaded"}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      Uploaded by Shop
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {photos.length === 0 && videos.length === 0 && (
                        <div className="py-12 text-center">
                          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
                            <svg
                              className="w-10 h-10 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <h4 className="mb-2 text-lg font-semibold text-gray-900">
                            No Photos or Videos Uploaded
                          </h4>
                          <p className="max-w-md mx-auto mb-4 text-gray-600">
                            Upload photos (required) and videos (optional) of
                            the order preparation process. These will help
                            ensure order quality and provide proof of
                            preparation.
                          </p>
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
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
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>
                              Photos are required before marking order as ready
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            {/* Footer */}
            <div className="sticky bottom-0 px-8 py-6 bg-white border-t border-gray-200">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-gray-600">
                  {hasUploadedMedia ? (
                    <div className="flex items-center gap-2 text-gray-900">
                      <span>Media uploaded </span>
                    </div>
                  ) : order.status === "shop_accepted" ||
                    order.status === "shop_preparing" ? (
                    <div className="flex items-center gap-2 text-gray-900">
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.33 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span>Upload photos required</span>
                    </div>
                  ) : null}
                </div>

                {/* DEBUG INFO - Remove after testing */}
                <div className="hidden text-xs text-gray-500">
                  Debug: OTP Verified: {otpVerified ? "Yes" : "No"}, Media:{" "}
                  {order.orderMedia?.hasMediaUploaded
                    ? "Uploaded"
                    : "Not Uploaded"}
                  , Photos: {order.orderMedia?.photos?.length || 0}
                </div>

                {statusError && (
                  <div className="px-4 py-2 text-sm text-gray-900 bg-gray-100 rounded-lg">
                    {statusError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {/* Print Order Button */}
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Print Order
                  </button>

                  {/* ✅ SELF-PICKUP ORDERS: Verify OTP & Mark as Delivered */}
                  {order.deliveryMethod === "self_pickup" &&
                    (order.status === "shop_accepted" ||
                      order.status === "shop_preparing") && (
                      <>
                        {/* "Mark as Delivered" Button (Only enabled after OTP verification) */}
                        <button
                          onClick={handleMarkAsDeliveredForSelfPickup}
                          disabled={
                            updatingStatus || !hasUploadedMedia || !otpVerified
                          }
                          className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                            updatingStatus || !hasUploadedMedia || !otpVerified
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gray-900 hover:bg-gray-800"
                          }`}
                          title={
                            !hasUploadedMedia
                              ? "Upload at least one photo first"
                              : !otpVerified
                              ? "Verify OTP first"
                              : ""
                          }
                        >
                          {updatingStatus ? (
                            <>
                              <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                              Processing...
                            </>
                          ) : (
                            "Mark as Delivered"
                          )}
                        </button>
                      </>
                    )}

                  {/* ✅ DELIVERY ORDERS: Mark as Ready for Pickup */}
                  {order.deliveryMethod === "delivery" &&
                    (order.status === "shop_accepted" ||
                      order.status === "shop_preparing") && (
                      <button
                        onClick={handleMarkAsReady}
                        disabled={updatingStatus || !hasUploadedMedia}
                        className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                          updatingStatus || !hasUploadedMedia
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                        title={
                          !hasUploadedMedia
                            ? "Upload at least one photo first"
                            : ""
                        }
                      >
                        {updatingStatus ? (
                          <>
                            <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                            Processing...
                          </>
                        ) : (
                          "Mark as Ready for Pickup"
                        )}
                      </button>
                    )}

                  {/* Already ready message for delivery orders */}
                  {order.status === "ready_for_pickup" &&
                    order.deliveryMethod === "delivery" && (
                      <div className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg">
                        ✓ Ready for Pickup
                      </div>
                    )}

                  {/* Already delivered message for self-pickup orders */}
                  {order.status === "delivered" &&
                    order.deliveryMethod === "self_pickup" && (
                      <div className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg">
                        ✓ Delivered
                      </div>
                    )}

                  {/* Show Customer Picked Up? button for ready_for_pickup self-pickup orders */}
                  {order.status === "ready_for_pickup" &&
                    order.deliveryMethod === "self_pickup" && (
                      <button
                        onClick={() => setShowDeliveryConfirmation(true)}
                        disabled={updatingStatus}
                        className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                          updatingStatus
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                      >
                        {updatingStatus ? (
                          <>
                            <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                            Processing...
                          </>
                        ) : (
                          "Customer Picked Up?"
                        )}
                      </button>
                    )}

                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderModal;


//////////////////////////////////////
// app.jsx
// import React, { useState, useEffect, useRef } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   useNavigate,
//   Navigate,
//   useLocation,
// } from "react-router-dom";
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Login from "./pages/Login";
// import Onboarding from "./pages/Onboarding";
// import Dashboard from "./pages/Dashboard";
// import Orders from "./pages/Orders";
// import Products from "./pages/Products";
// import AddProduct from "./pages/AddProduct";
// import UpdateProduct from "./pages/UpdateProduct";
// import PendingApproval from "./pages/PendingApproval";
// import api from "./services/api";
// import ProductPreview from "./pages/ProductPreview";
// import Settings from "./pages/Settings";

// function MainApp() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [authChecked, setAuthChecked] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const initialCheckRef = useRef(false);

//   const validateToken = async (token) => {
//     try {
//       const response = await api.get("/shop-owner/profile");
//       const data = response.data;

//       let userData = data.data || data.owner || data.user || data;

//       const accountStatus =
//         userData.accountStatus ||
//         userData.status ||
//         userData.onboarding?.accountStatus ||
//         "Pending";

//       return {
//         valid: true,
//         userData: {
//           ...userData,
//           accountStatus: accountStatus,
//           onboarding: userData.onboarding || {},
//         },
//       };
//     } catch (error) {
//       console.error("Token validation error:", error);
//       return {
//         valid: false,
//         error: error,
//       };
//     }
//   };

//   const updateAuthState = (newUserData) => {
//     if (newUserData) {
//       setUserData(newUserData);
//       setIsAuthenticated(true);
//       localStorage.setItem("userData", JSON.stringify(newUserData));
//     }
//   };

//   const initializeFirebase = async () => {
//     try {
//       if (!isAuthenticated) return;
      
//       let permission = Notification.permission;
//       if (permission === 'default') {
//         permission = await Notification.requestPermission();
//       }
      
//       if (permission !== 'granted') return;

//       try {
//         const { getFCMToken } = await import("./firebase/firebase");
//         const token = await getFCMToken();
        
//         if (token) {
//           try {
//             await api.post('/notifications/save-token', {
//               token: token,
//               userType: 'shop_owner'
//             });
//           } catch (err) {
//             console.log('Could not save token to server');
//           }
//         }
//       } catch (firebaseError) {
//         console.log('Firebase init skipped:', firebaseError.message);
//       }
//     } catch (error) {
//       console.log('Firebase initialization error:', error.message);
//     }
//   };

//   useEffect(() => {
//     if (initialCheckRef.current) return;
//     initialCheckRef.current = true;

//     const checkAuth = async () => {
//       const token = localStorage.getItem("shopOwnerToken");
//       const publicRoutes = ["/login", "/register", "/onboarding"];
      
//       if (publicRoutes.includes(location.pathname)) {
//         setLoading(false);
//         setAuthChecked(true);
//         return;
//       }

//       if (!token) {
//         navigate("/login");
//         setLoading(false);
//         setAuthChecked(true);
//         return;
//       }

//       try {
//         const validation = await validateToken(token);

//         if (!validation.valid) {
//           localStorage.removeItem("shopOwnerToken");
//           localStorage.removeItem("userData");
//           setIsAuthenticated(false);
//           setUserData(null);
//           navigate("/login");
//           return;
//         }

//         const userData = validation.userData;
//         setUserData(userData);
//         setIsAuthenticated(true);
//         localStorage.setItem("userData", JSON.stringify(userData));

//         const authPages = [
//           "/dashboard",
//           "/orders",
//           "/products",
//           "/add-product",
//           "/preview-product",
//           "/pending-approval",
//           "/update-product",
//           "/settings",
//         ];

//         const isOnValidPage = authPages.some((page) =>
//           location.pathname.startsWith(page)
//         );

//         if (isOnValidPage) {
//           setLoading(false);
//           setAuthChecked(true);
//           return;
//         }

//         const accountStatus = userData.accountStatus || "Pending";
//         const activeStatuses = ["Active", "Verified", "active", "verified"];

//         if (activeStatuses.includes(accountStatus)) {
//           if (location.pathname !== "/orders") {
//             navigate("/orders");
//           }
//         } else if (accountStatus === "Pending" || accountStatus === "pending") {
//           if (location.pathname !== "/pending-approval") {
//             navigate("/pending-approval");
//           }
//         } else {
//           if (location.pathname !== "/onboarding") {
//             navigate("/onboarding");
//           }
//         }
//       } catch (error) {
//         console.error("Auth check error:", error);
//         navigate("/login");
//       } finally {
//         setLoading(false);
//         setAuthChecked(true);
//       }
//     };

//     checkAuth();
//   }, []);

//   useEffect(() => {
//     if (isAuthenticated) {
//       initializeFirebase();
//     }
//   }, [isAuthenticated]);

//   useEffect(() => {
//     if (!authChecked || loading) return;

//     const publicRoutes = ["/login", "/register", "/onboarding"];
//     if (publicRoutes.includes(location.pathname)) return;

//     if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
//       navigate("/login");
//     }
//   }, [location.pathname, authChecked, isAuthenticated, navigate, loading]);

//   const handleLogin = async (token, user) => {
//     localStorage.setItem("shopOwnerToken", token);

//     try {
//       const validation = await validateToken(token);

//       if (!validation.valid) {
//         localStorage.removeItem("shopOwnerToken");
//         return;
//       }

//       const userData = validation.userData;
//       setUserData(userData);
//       setIsAuthenticated(true);
//       localStorage.setItem("userData", JSON.stringify(userData));
//       initializeFirebase();

//       const accountStatus = userData.accountStatus || "Pending";
//       const activeStatuses = ["Active", "Verified", "active", "verified"];

//       if (activeStatuses.includes(accountStatus)) {
//         navigate("/orders");
//       } else if (accountStatus === "Pending" || accountStatus === "pending") {
//         navigate("/pending-approval");
//       } else {
//         navigate("/onboarding");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };

//   const handleSignup = () => {
//     localStorage.removeItem("shopOwnerToken");
//     localStorage.removeItem("userData");
//     localStorage.removeItem("onboardingFormData");
//     localStorage.removeItem("userEmail");
//     localStorage.removeItem("userPassword");
//     localStorage.removeItem("fcmToken");

//     setIsAuthenticated(false);
//     setUserData(null);
//     navigate("/onboarding");
//   };

//   const handleOnboardingComplete = async () => {
//     const token = localStorage.getItem("shopOwnerToken");
//     if (token) {
//       try {
//         const validation = await validateToken(token);
//         if (validation.valid) {
//           const userData = validation.userData;
//           const accountStatus = userData.accountStatus || "Pending";
//           const activeStatuses = ["Active", "Verified", "active", "verified"];

//           if (activeStatuses.includes(accountStatus)) {
//             navigate("/orders");
//           } else {
//             navigate("/pending-approval");
//           }
//           initializeFirebase();
//         }
//       } catch (error) {
//         console.error("Onboarding completion error:", error);
//       }
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const token = localStorage.getItem("shopOwnerToken");
//       if (token) {
//         await api.post(
//           "/shop-owner/logout",
//           {},
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//       }
//     } catch (error) {
//       console.error("Logout API error:", error);
//     } finally {
//       localStorage.removeItem("shopOwnerToken");
//       localStorage.removeItem("userData");
//       localStorage.removeItem("onboardingFormData");
//       localStorage.removeItem("userEmail");
//       localStorage.removeItem("userPassword");
//       localStorage.removeItem("fcmToken");

//       setIsAuthenticated(false);
//       setUserData(null);
//       navigate("/login");
//     }
//   };

//   const handleBackToLogin = () => {
//     localStorage.removeItem("shopOwnerToken");
//     localStorage.removeItem("userData");
//     localStorage.removeItem("onboardingFormData");
//     localStorage.removeItem("userEmail");
//     localStorage.removeItem("userPassword");
//     localStorage.removeItem("fcmToken");

//     setIsAuthenticated(false);
//     setUserData(null);
//     navigate("/login");
//   };

//   const ProtectedRoute = ({ children, requireActive = false }) => {
//     if (!authChecked || loading) {
//       return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-50">
//           <div className="text-center">
//             <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
//             <p className="text-gray-600">Loading...</p>
//           </div>
//         </div>
//       );
//     }

//     if (!isAuthenticated) {
//       return <Navigate to="/login" />;
//     }

//     if (requireActive && userData) {
//       const accountStatus = userData.accountStatus || "Pending";
//       const activeStatuses = ["Active", "Verified", "active", "verified"];

//       if (!activeStatuses.includes(accountStatus)) {
//         return <Navigate to="/pending-approval" />;
//       }
//     }

//     return children;
//   };

//   if (loading && !authChecked) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <ToastContainer
//         position="top-right"
//         autoClose={4000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//         newestOnTop
//         theme="dark"
//         toastClassName="relative flex p-4 rounded-lg shadow-lg bg-[#111827] text-white"
//         bodyClassName="flex items-center gap-3 text-sm font-medium"
//         progressClassName="bg-green-500"
//       />
      
//       <Routes>
//         <Route
//           path="/login"
//           element={<Login onLogin={handleLogin} onSignup={handleSignup} />}
//         />

//         <Route
//           path="/onboarding"
//           element={
//             <Onboarding
//               onComplete={handleOnboardingComplete}
//               onBackToLogin={handleBackToLogin}
//               userData={userData}
//               updateAuthState={updateAuthState}
//             />
//           }
//         />

//         <Route
//           path="/pending-approval"
//           element={
//             <ProtectedRoute>
//               <PendingApproval onLogout={handleLogout} userData={userData} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute requireActive>
//               <Dashboard onLogout={handleLogout} userData={userData} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/orders"
//           element={
//             <ProtectedRoute requireActive>
//               <Orders onLogout={handleLogout} userData={userData} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/products"
//           element={
//             <ProtectedRoute requireActive>
//               <Products onLogout={handleLogout} userData={userData} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/add-product"
//           element={
//             <ProtectedRoute requireActive>
//               <AddProduct onBack={() => navigate("/products")} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/update-product/:id"
//           element={
//             <ProtectedRoute requireActive>
//               <UpdateProduct
//                 onBack={() => navigate("/products")}
//                 onLogout={handleLogout}
//                 userData={userData}
//               />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/preview-product"
//           element={
//             <ProtectedRoute requireActive>
//               <ProductPreview onBack={() => navigate("/add-product")} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/settings"
//           element={
//             <ProtectedRoute requireActive>
//               <Settings onLogout={handleLogout} userData={userData} />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="*"
//           element={<Navigate to={isAuthenticated ? "/orders" : "/login"} />}
//         />
//       </Routes>
//     </div>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <MainApp />
//     </Router>
//   );
// }

// export default App;


//////////////////////////
// pages/Login.jsx - COMPLETE FIXED
// import React, { useState } from "react";
// import authAPI from "../services/authAPI";
// import api from "../services/api"; // ✅ IMPORT API

// const Login = ({ onLogin, onSignup }) => {
//   const [credentials, setCredentials] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//    const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await authAPI.login(credentials);
//       const { token, shopOwner } = response.data;

//       console.log("✅ Login API Response:", response.data);

//       // Check if data is in different structure
//       let userData = shopOwner;

//       if (!userData && response.data.data) {
//         userData = response.data.data;
//       }

//       if (!userData && response.data.owner) {
//         userData = response.data.owner;
//       }

//       if (!userData) {
//         throw new Error("No user data received from server");
//       }

//       // **IMPORTANT: Token store karo**
//       localStorage.setItem("shopOwnerToken", token);

//       // **ALSO: Store email/password temporarily for token refresh**
//       localStorage.setItem("userEmail", credentials.email);
//       localStorage.setItem("userPassword", credentials.password);

//       // **NEW: Immediately test the token**
//       try {
//         const testResponse = await api.get("/shop-owner/profile");
//         console.log("✅ Token test successful:", testResponse.data);

//         // Get fresh user data with the token
//         const freshUserData =
//           testResponse.data.data ||
//           testResponse.data.owner ||
//           testResponse.data;

//         const normalizedUserData = {
//           ...freshUserData,
//           accountStatus: freshUserData.accountStatus || "Pending",
//           onboarding: freshUserData.onboarding || {},
//         };

//         localStorage.setItem("userData", JSON.stringify(normalizedUserData));

//         onLogin(token, normalizedUserData);
//       } catch (tokenError) {
//         console.error("❌ Token test failed:", tokenError);

//         // Fallback to original data
//         const normalizedUserData = {
//           ...userData,
//           accountStatus: userData.accountStatus || "Pending",
//           onboarding: userData.onboarding || {},
//         };

//         localStorage.setItem("userData", JSON.stringify(normalizedUserData));
//         onLogin(token, normalizedUserData);
//       }
//     } catch (err) {
//       console.error("❌ Login error:", err);

//       let errorMessage = "Login failed. Please check your credentials.";

//       if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen font-sans">
//       {/* Left Side - Branding */}
//       <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-br lg:from-black lg:to-gray-900 lg:text-white lg:p-8">
//        <div className="text-center">

//   {/* Logo + Label Container */}
//   <div className="flex flex-col items-center p-6 text-black">

//     {/* ZED Logo */}
//     {/* <img
//       src="public/images/zed.png"
//       alt="Shop owner"
//       style={{ width: "180px", height: "auto" }}
//     /> */}
//     <img
//   src="/images/zed.png"
//   alt="Shop owner"
//   style={{ width: "180px", height: "auto" }}
// />


//     {/* SHOP OWNER text matched to logo width */}
//     <h1
//       style={{
//         width: "180px",          // MATCHES logo width
//         marginTop: "6px",
//         fontFamily: "Metropolis, sans-serif",
//         fontWeight: 700,
//         fontSize: "18px",
//         lineHeight: "22px",
//         letterSpacing: "1px",
//         textAlign: "center",
//         color: "white",
//       }}
//     >
//       SHOP OWNER
//     </h1>

//   </div>

//   {/* Feature List */}
//   <div className="space-y-4 text-left">
//     {["Secure Dashboard", "Real-time Analytics", "Complete Control"].map(
//       (item, index) => (
//         <div key={index} className="flex items-center space-x-3">
//           <div
//             className="flex items-center justify-center w-8 h-8 rounded-full"
//             style={{ backgroundColor: "#27C840" }}
//           >
//             <span className="text-white">✓</span>
//           </div>

//           <span
//             style={{
//               fontFamily: "'Metropolis', sans-serif",
//               fontWeight: 400,
//             }}
//           >
//             {item}
//           </span>
//         </div>
//       )
//     )}
//   </div>

// </div>

//       </div>

//       {/* Right Side - Login Form */}
//       <div className="flex flex-col items-center justify-center flex-1 p-8 bg-white">
//         <div className="w-full max-w-md">
//           <div className="mb-8 text-center">
//             <h2
//               className="mb-2 text-3xl font-bold"
//               style={{
//                 color: "#000000",
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 700,
//               }}
//             >
//               Welcome 
//             </h2>
//             <p
//               className="text-gray-600"
//               style={{
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 400,
//               }}
//             >
//               Sign in to access your store dashboard
//             </p>
//           </div>

//           {error && (
//             <div className="flex items-start p-4 mb-6 space-x-3 border border-red-200 rounded-lg bg-red-50">
//               <svg
//                 className="w-5 h-5 text-red-400 mt-0.5"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               <div>
//                 <div
//                   className="font-medium text-red-800"
//                   style={{
//                     fontFamily: "'Metropolis', sans-serif",
//                     fontWeight: 600,
//                   }}
//                 >
//                   Error
//                 </div>
//                 <div
//                   className="text-sm text-red-700"
//                   style={{
//                     fontFamily: "'Metropolis', sans-serif",
//                     fontWeight: 400,
//                   }}
//                 >
//                   {error}
//                 </div>
//               </div>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block mb-2 text-sm font-medium"
//                 style={{
//                   color: "#000000",
//                   fontFamily: "'Metropolis', sans-serif",
//                   fontWeight: 500,
//                 }}
//               >
//                 Email Address *
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 className="block w-full px-3 py-3 transition-all duration-200 border rounded-lg focus:ring-2 focus:outline-none"
//                 style={{
//                   borderColor: "#555555",
//                   color: "#000000",
//                   fontFamily: "'Metropolis', sans-serif",
//                   fontWeight: 400,
//                   borderWidth: "1px",
//                 }}
//                 placeholder="your@email.com"
//                 value={credentials.email}
//                 onChange={(e) =>
//                   setCredentials({ ...credentials, email: e.target.value })
//                 }
//                 required
//               />
//             </div>

//           <div>
//               <label
//                 htmlFor="password"
//                 className="block mb-2 text-sm font-medium"
//                 style={{
//                   color: "#000000",
//                   fontFamily: "'Metropolis', sans-serif",
//                   fontWeight: 500,
//                 }}
//               >
//                 Password *
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="password"
//                   className="block w-full px-3 py-3 pr-10 transition-all duration-200 border rounded-lg focus:ring-2 focus:outline-none"
//                   style={{
//                     borderColor: "#555555",
//                     color: "#000000",
//                     fontFamily: "'Metropolis', sans-serif",
//                     fontWeight: 400,
//                     borderWidth: "1px",
//                   }}
//                   placeholder="Enter your password"
//                   value={credentials.password}
//                   onChange={(e) =>
//                     setCredentials({ ...credentials, password: e.target.value })
//                   }
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer focus:outline-none"
//                   style={{ color: "#555555" }}
//                 >
//                   {showPassword ? (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                       />
//                     </svg>
//                   ) : (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                       />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-medium text-white transition-all duration-200 rounded-lg cursor-pointer hover:opacity-90 focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
//               style={{
//                 backgroundColor: "#000000",
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 600,
//               }}
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
//                   <span>Signing in...</span>
//                 </>
//               ) : (
//                 <>
//                   <span>Sign In</span>
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
                     
//                     />
//                   </svg>
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p
//               className="text-gray-600"
//               style={{
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 400,
//               }}
//             >
//               Don't have an account?{" "}
//               <button
//                 type="button"
//                 onClick={onSignup}
//                 className="font-medium transition-all duration-200 cursor-pointer hover:opacity-80"
//                 style={{
//                   color: "#000000",
//                   fontFamily: "'Metropolis', sans-serif",
//                   fontWeight: 600,
//                 }}
//               >
//                 Start your store registration
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Add Metropolis font styles */}
//       <style>{`
//   @import url('https://fonts.cdnfonts.com/css/metropolis');
  
//   body {
//     font-family: 'Metropolis', sans-serif;
//   }
  
//   input:focus {
//     border-color: #000000 !important;
//     box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
//   }
// `}</style>
//     </div>
//   );
// };

// export default Login;

//////////////////////////////////////
// pages/Login.jsx - UPDATED WITH FCM INTEGRATION
// import React, { useState } from "react";
// import authAPI from "../services/authAPI";
// import api from "../services/api";
// import { initializeAndSaveFCM } from "../services/fcmAPI"; // Import FCM service

// const Login = ({ onLogin, onSignup }) => {
//   const [credentials, setCredentials] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // Function to initialize FCM after successful login
//  // In Login.jsx, update initializeFCMAfterLogin to ensure it's called
// const initializeFCMAfterLogin = async () => {
//   try {
//     console.log("🔄 [Login] Starting FCM initialization after login...");
    
//     // Wait a bit for app to settle
//     await new Promise(resolve => setTimeout(resolve, 1500));
    
//     console.log("🔄 [Login] Calling initializeAndSaveFCM...");
    
//     // IMPORTANT: Check if user is authenticated
//     const token = localStorage.getItem('shopOwnerToken');
//     if (!token) {
//       console.log("❌ [Login] No auth token found for FCM");
//       return { success: false, message: "Not authenticated" };
//     }
    
//     const result = await initializeAndSaveFCM();
    
//     console.log("📊 [Login] FCM initialization result:", result);
    
//     if (result.success) {
//       console.log("✅ [Login] FCM initialized successfully after login");
      
//       // Show success notification if permission was just granted
//       if (Notification.permission === 'granted') {
//         try {
//           new Notification('Notifications Enabled', {
//             body: 'You will receive push notifications for new orders',
//             icon: '/logo192.png'
//           });
//         } catch (notifError) {
//           console.log("Could not show notification:", notifError);
//         }
//       }
//     } else {
//       console.log("⚠️ [Login] FCM initialization warning:", result.message);
//     }
    
//     return result;
//   } catch (error) {
//     console.error("❌ [Login] Error initializing FCM after login:", error);
//     return { success: false, message: error.message };
//   }
// };


//  const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await authAPI.login(credentials);
//       const { token, shopOwner } = response.data;

//       console.log("✅ Login API Response:", response.data);

//       // Check if data is in different structure
//       let userData = shopOwner;

//       if (!userData && response.data.data) {
//         userData = response.data.data;
//       }

//       if (!userData && response.data.owner) {
//         userData = response.data.owner;
//       }

//       if (!userData) {
//         throw new Error("No user data received from server");
//       }

//       // **IMPORTANT: Token store karo**
//       localStorage.setItem("shopOwnerToken", token);

//       // **ALSO: Store email/password temporarily for token refresh**
//       localStorage.setItem("userEmail", credentials.email);
//       localStorage.setItem("userPassword", credentials.password);

//       // **NEW: Immediately test the token**
//       try {
//         const testResponse = await api.get("/shop-owner/profile");
//         console.log("✅ Token test successful:", testResponse.data);

//         // Get fresh user data with the token
//         const freshUserData =
//           testResponse.data.data ||
//           testResponse.data.owner ||
//           testResponse.data;

//         const normalizedUserData = {
//           ...freshUserData,
//           accountStatus: freshUserData.accountStatus || "Pending",
//           onboarding: freshUserData.onboarding || {},
//         };

//         localStorage.setItem("userData", JSON.stringify(normalizedUserData));

//         // ✅ IMPORTANT: Initialize FCM AFTER successful login and token verification
//         console.log("🔄 [Login] Calling FCM initialization...");
//         initializeFCMAfterLogin().catch(error => {
//           console.error("❌ [Login] FCM init error:", error);
//         });

//         // Call onLogin to navigate to appropriate page
//         onLogin(token, normalizedUserData);
//       } catch (tokenError) {
//         console.error("❌ Token test failed:", tokenError);

//         // Fallback to original data
//         const normalizedUserData = {
//           ...userData,
//           accountStatus: userData.accountStatus || "Pending",
//           onboarding: userData.onboarding || {},
//         };

//         localStorage.setItem("userData", JSON.stringify(normalizedUserData));
        
//         // ✅ Initialize FCM even with fallback data
//         console.log("🔄 [Login] Calling FCM initialization (fallback)...");
//         initializeFCMAfterLogin().catch(error => {
//           console.error("❌ [Login] FCM init error (fallback):", error);
//         });

//         onLogin(token, normalizedUserData);
//       }
//     } catch (err) {
//       console.error("❌ Login error:", err);

//       let errorMessage = "Login failed. Please check your credentials.";

//       if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ... REST OF THE LOGIN PAGE CODE REMAINS THE SAME ...
//   // Keep all the JSX and styling exactly as you have it
//   // Only the handleSubmit function is modified above

//   return (
//     <div className="flex min-h-screen font-sans">
//       {/* Left Side - Branding */}
//       <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-br lg:from-black lg:to-gray-900 lg:text-white lg:p-8">
//        <div className="text-center">

//   {/* Logo + Label Container */}
//   <div className="flex flex-col items-center p-6 text-black">

//     {/* ZED Logo */}
//     <img
//       src="/images/zed.png"
//       alt="Shop owner"
//       style={{ width: "180px", height: "auto" }}
//     />

//     {/* SHOP OWNER text matched to logo width */}
//     <h1
//       style={{
//         width: "180px",          // MATCHES logo width
//         marginTop: "6px",
//         fontFamily: "Metropolis, sans-serif",
//         fontWeight: 700,
//         fontSize: "18px",
//         lineHeight: "22px",
//         letterSpacing: "1px",
//         textAlign: "center",
//         color: "white",
//       }}
//     >
//       SHOP OWNER
//     </h1>

//   </div>

//   {/* Feature List */}
//   <div className="space-y-4 text-left">
//     {["Secure Dashboard", "Real-time Analytics", "Complete Control"].map(
//       (item, index) => (
//         <div key={index} className="flex items-center space-x-3">
//           <div
//             className="flex items-center justify-center w-8 h-8 rounded-full"
//             style={{ backgroundColor: "#27C840" }}
//           >
//             <span className="text-white">✓</span>
//           </div>

//           <span
//             style={{
//               fontFamily: "'Metropolis', sans-serif",
//               fontWeight: 400,
//             }}
//           >
//             {item}
//           </span>
//         </div>
//       )
//     )}
//   </div>

// </div>

//       </div>

//       {/* Right Side - Login Form */}
//       <div className="flex flex-col items-center justify-center flex-1 p-8 bg-white">
//         <div className="w-full max-w-md">
//           <div className="mb-8 text-center">
//             <h2
//               className="mb-2 text-3xl font-bold"
//               style={{
//                 color: "#000000",
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 700,
//               }}
//             >
//               Welcome 
//             </h2>
//             <p
//               className="text-gray-600"
//               style={{
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 400,
//               }}
//             >
//               Sign in to access your store dashboard
//             </p>
//           </div>

//           {error && (
//             <div className="flex items-start p-4 mb-6 space-x-3 border border-red-200 rounded-lg bg-red-50">
//               <svg
//                 className="w-5 h-5 text-red-400 mt-0.5"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               <div>
//                 <div
//                   className="font-medium text-red-800"
//                   style={{
//                     fontFamily: "'Metropolis', sans-serif",
//                     fontWeight: 600,
//                   }}
//                 >
//                   Error
//                 </div>
//                 <div
//                   className="text-sm text-red-700"
//                   style={{
//                     fontFamily: "'Metropolis', sans-serif",
//                     fontWeight: 400,
//                   }}
//                 >
//                   {error}
//                 </div>
//               </div>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block mb-2 text-sm font-medium"
//                 style={{
//                   color: "#000000",
//                   fontFamily: "'Metropolis', sans-serif",
//                   fontWeight: 500,
//                 }}
//               >
//                 Email Address *
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 className="block w-full px-3 py-3 transition-all duration-200 border rounded-lg focus:ring-2 focus:outline-none"
//                 style={{
//                   borderColor: "#555555",
//                   color: "#000000",
//                   fontFamily: "'Metropolis', sans-serif",
//                   fontWeight: 400,
//                   borderWidth: "1px",
//                 }}
//                 placeholder="your@email.com"
//                 value={credentials.email}
//                 onChange={(e) =>
//                   setCredentials({ ...credentials, email: e.target.value })
//                 }
//                 required
//               />
//             </div>

//           <div>
//               <label
//                 htmlFor="password"
//                 className="block mb-2 text-sm font-medium"
//                 style={{
//                   color: "#000000",
//                   fontFamily: "'Metropolis', sans-serif",
//                   fontWeight: 500,
//                 }}
//               >
//                 Password *
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="password"
//                   className="block w-full px-3 py-3 pr-10 transition-all duration-200 border rounded-lg focus:ring-2 focus:outline-none"
//                   style={{
//                     borderColor: "#555555",
//                     color: "#000000",
//                     fontFamily: "'Metropolis', sans-serif",
//                     fontWeight: 400,
//                     borderWidth: "1px",
//                   }}
//                   placeholder="Enter your password"
//                   value={credentials.password}
//                   onChange={(e) =>
//                     setCredentials({ ...credentials, password: e.target.value })
//                   }
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer focus:outline-none"
//                   style={{ color: "#555555" }}
//                 >
//                   {showPassword ? (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                       />
//                     </svg>
//                   ) : (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                       />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-medium text-white transition-all duration-200 rounded-lg cursor-pointer hover:opacity-90 focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
//               style={{
//                 backgroundColor: "#000000",
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 600,
//               }}
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
//                   <span>Signing in...</span>
//                 </>
//               ) : (
//                 <>
//                   <span>Sign In</span>
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                     />
//                   </svg>
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p
//               className="text-gray-600"
//               style={{
//                 fontFamily: "'Metropolis', sans-serif",
//                 fontWeight: 400,
//               }}
//             >
//               Don't have an account?{" "}
//               <button
//                 type="button"
//                 onClick={onSignup}
//                 className="font-medium transition-all duration-200 cursor-pointer hover:opacity-80"
//                 style={{
//                   color: "#000000",
//                   fontFamily: "'Metropolis', sans-serif",
//                   fontWeight: 600,
//                 }}
//               >
//                 Start your store registration
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Add Metropolis font styles */}
//       <style>{`
//   @import url('https://fonts.cdnfonts.com/css/metropolis');
  
//   body {
//     font-family: 'Metropolis', sans-serif;
//   }
  
//   input:focus {
//     border-color: #000000 !important;
//     box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
//   }
// `}</style>
//     </div>
//   );
// };

// export default Login;

///////////////////
// src/components/NotificationBell.jsx - UPDATED TO USE FCM API
// import React, { useState, useEffect } from 'react';
// import { initializeAndSaveFCM, isFCMInitialized } from '../services/fcmAPI';

// // Simple icons (same as before)
// const BellIcon = () => (
//   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//   </svg>
// );

// const BellAlertIcon = () => (
//   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//     <path d="M12 2c1.1 0 2 .9 2 2v.29c2.89.86 5 3.54 5 6.71v4.29l2 3v1H5v-1l2-3V11c0-3.17 2.11-5.85 5-6.71V4c0-1.1.9-2 2-2zm0 18c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3z" />
//   </svg>
// );

// const NotificationBell = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [fcmEnabled, setFcmEnabled] = useState(false);

//   // Check FCM status on mount
//   useEffect(() => {
//     checkFCMStatus();
//     setupFirebaseListener();
//     loadInitialNotifications();
//   }, []);

//   // Check FCM status
//   const checkFCMStatus = () => {
//     const hasFCM = isFCMInitialized();
//     const permission = Notification.permission;
    
//     setFcmEnabled(hasFCM && permission === 'granted');
//   };

//   // Setup Firebase message listener
//   const setupFirebaseListener = async () => {
//     try {
//       const firebaseModule = await import('../firebase/firebase');
      
//       // Listen for incoming messages
//       firebaseModule.onMessageListener((payload) => {
//         console.log('📬 Notification received in NotificationBell:', payload);
        
//         if (payload.notification) {
//           // Show browser notification
//           if ('Notification' in window && Notification.permission === 'granted') {
//             try {
//               const notification = new Notification(
//                 payload.notification.title || 'New Notification', 
//                 {
//                   body: payload.notification.body,
//                   icon: '/logo192.png',
//                   badge: '/logo192.png'
//                 }
//               );
              
//               // Handle notification click
//               notification.onclick = () => {
//                 window.focus();
//                 if (payload.data && payload.data.orderId) {
//                   window.location.href = `/orders/${payload.data.orderId}`;
//                 } else {
//                   window.location.href = '/orders';
//                 }
//               };
//             } catch (notifError) {
//               console.log('Could not show browser notification:', notifError);
//             }
//           }
          
//           // Add to local notifications list
//           addNotification({
//             _id: Date.now().toString(),
//             title: payload.notification.title || 'Notification',
//             body: payload.notification.body || '',
//             read: false,
//             createdAt: new Date().toISOString(),
//             data: payload.data || {},
//             isPushNotification: true
//           });
//         }
//       });
      
//       console.log('✅ Firebase listener setup in NotificationBell');
//     } catch (error) {
//       console.log('❌ Firebase listener setup failed:', error.message);
//     }
//   };

//   // Load initial notifications from localStorage or use demo
//   const loadInitialNotifications = () => {
//     setLoading(true);
    
//     const savedNotifications = localStorage.getItem('shopOwnerNotifications');
    
//     if (savedNotifications) {
//       try {
//         const parsed = JSON.parse(savedNotifications);
//         setNotifications(parsed);
//         const unread = parsed.filter(n => !n.read).length;
//         setUnreadCount(unread);
//       } catch (error) {
//         console.error('Error loading notifications:', error);
//         loadDemoNotifications();
//       }
//     } else {
//       loadDemoNotifications();
//     }
    
//     setLoading(false);
//   };

//   // Load demo notifications (fallback)
//   const loadDemoNotifications = () => {
//     const demoNotifications = [
//       {
//         _id: '1',
//         title: 'Welcome to ZED Marketplace!',
//         body: 'Your shop is now ready to receive orders',
//         read: false,
//         createdAt: new Date(Date.now() - 3600000).toISOString(),
//         data: { type: 'welcome' }
//       },
//       {
//         _id: '2',
//         title: 'Get Started Guide',
//         body: 'Learn how to add products and manage your store',
//         read: false,
//         createdAt: new Date(Date.now() - 86400000).toISOString(),
//         data: { type: 'guide' }
//       }
//     ];
    
//     setNotifications(demoNotifications);
//     setUnreadCount(2);
//     saveNotifications(demoNotifications);
//   };

//   // Save notifications to localStorage
//   const saveNotifications = (notifs) => {
//     try {
//       localStorage.setItem('shopOwnerNotifications', JSON.stringify(notifs));
//     } catch (error) {
//       console.error('Error saving notifications:', error);
//     }
//   };

//   // Add a new notification
//   const addNotification = (notification) => {
//     setNotifications(prev => {
//       const newNotifications = [notification, ...prev.slice(0, 49)];
//       saveNotifications(newNotifications);
//       return newNotifications;
//     });
    
//     setUnreadCount(prev => prev + 1);
//   };

//   // Request notification permission
//   const handleEnableNotifications = async () => {
//     try {
//       console.log('🔄 Enabling notifications...');
//       const result = await initializeAndSaveFCM();
      
//       if (result.success) {
//         setFcmEnabled(true);
//         console.log('✅ Notifications enabled successfully!');
        
//         // Add success notification
//         addNotification({
//           _id: Date.now().toString(),
//           title: 'Notifications Enabled',
//           body: 'You will now receive push notifications for new orders',
//           read: false,
//           createdAt: new Date().toISOString(),
//           data: { type: 'system' }
//         });
//       } else {
//         console.log('❌ Failed to enable notifications:', result.message);
//       }
//     } catch (error) {
//       console.error('Error enabling notifications:', error);
//     }
//   };

//   // ... REST OF THE NotificationBell CODE REMAINS THE SAME ...
//   // Keep all the existing functions (handleMarkAsRead, formatTime, etc.)

//   return (
//     <div className="relative">
//       {/* Notification Bell */}
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => setShowDropdown(!showDropdown)}
//           className="relative p-2 transition-colors rounded-lg hover:bg-gray-100"
//           aria-label="Notifications"
//         >
//           {unreadCount > 0 ? <BellAlertIcon /> : <BellIcon />}
          
//           {unreadCount > 0 && (
//             <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
//               {unreadCount > 9 ? '9+' : unreadCount}
//             </span>
//           )}
//         </button>
        
//         {/* Enable button if no permission or FCM not initialized */}
//         {!fcmEnabled && (
//           <button
//             onClick={handleEnableNotifications}
//             className="px-2 py-1 text-xs text-yellow-800 transition-colors bg-yellow-100 rounded hover:bg-yellow-200"
//             title="Click to enable push notifications"
//           >
//             Enable Push
//           </button>
//         )}
        
//         {fcmEnabled && (
//           <span 
//             className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded"
//             title="Push notifications enabled"
//           >
//             ✓ Push
//           </span>
//         )}
//       </div>

//       {/* Dropdown - Keep all existing dropdown code exactly as it is */}
//       {showDropdown && (
//         <div className="absolute right-0 z-50 mt-2 bg-white border rounded-lg shadow-lg w-80">
//           {/* ... Your existing dropdown JSX ... */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationBell;

