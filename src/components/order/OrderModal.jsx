import React, { useState, useEffect } from "react";
import ordersAPI from "../../services/ordersAPI";

const OrderModal = ({ order, isOpen, onClose, loading, refreshOrders }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] =
    useState(false);

  // State for self pickup OTP
  const [otp, setOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState(null);

  // Initialize from order data
  useEffect(() => {
    // ✅ Check if OTP is already verified (from trackingFlags.isOutForDelivery)
    if (order && order.trackingFlags) {
      setOtpVerified(order.trackingFlags.isOutForDelivery || false);
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

    // For delivery orders, proceed normally
    await updateOrderStatusToReady();
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
                onClick={handleMarkAsDeliveredForSelfPickup}
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

                    {/* Success message when media is uploaded */}
                    {(order.status === "shop_accepted" ||
                      order.status === "shop_preparing") && (
                      <div className="p-3 mt-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              You can now mark the order as ready For pickup.
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-700">
                              <span>
                                Delivery orders: Directly mark as ready For pickup.
                              </span>
                              <span>
                                Self-pickup: Verify OTP then mark as delivered
                              </span>
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
                                    <li>Prepare the order</li>
                                    <li>
                                      Verify customer OTP when they arrive
                                    </li>
                                    <li>
                                      Mark as delivered after OTP verification
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
                </>
              )}
            </div>
            {/* Footer */}
            <div className="sticky bottom-0 px-8 py-6 bg-white border-t border-gray-200">
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                {/* DEBUG INFO - Remove after testing */}
                <div className="hidden text-xs text-gray-500">
                  Debug: OTP Verified: {otpVerified ? "Yes" : "No"}
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
                          disabled={updatingStatus || !otpVerified}
                          className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                            updatingStatus || !otpVerified
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gray-900 hover:bg-gray-800"
                          }`}
                          title={!otpVerified ? "Verify OTP first" : ""}
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