// components/order/OrderModal.jsx - COMPLETELY UPDATED WITH SELF PICKUP FEATURES
import React, { useState, useEffect } from "react";
import ordersAPI from "../../services/ordersAPI";

const OrderModal = ({ order, isOpen, onClose, loading, refreshOrders }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);

  // Function to mark order as ready with self_pickup confirmation
  const handleMarkAsReady = async () => {
    if (!order || !order._id) return;

    // If delivery method is self_pickup, show confirmation popup
    if (order.deliveryMethod === 'self_pickup') {
      setShowConfirmation(true);
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

      console.log('🔄 Marking order as ready:', {
        orderId: order.orderId,
        mongoId: order._id,
        currentStatus: order.status,
        deliveryMethod: order.deliveryMethod
      });

      const response = await ordersAPI.updateOrderStatus(
        order._id,
        "ready_for_pickup"
      );

      if (response && response.success) {
        console.log('✅ Order marked as ready:', response);
        
        // Update local order status
        order.status = "ready_for_pickup";
        
        if (response.order) {
          Object.assign(order, response.order);
        }

        if (refreshOrders) {
          console.log('🔄 Refreshing orders list...');
          await refreshOrders();
        }

        alert(`✅ Order ${order.orderId} marked as ready for pickup!`);
        
        // Close confirmation popup if open
        setShowConfirmation(false);
      } else {
        throw new Error(response?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error("❌ Error marking order as ready:", error);
      
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      "Failed to update order status. Please try again.";
      
      setStatusError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Function to handle user confirmation for self_pickup
  const handleUserConfirmation = async () => {
    try {
      setUpdatingStatus(true);
      
      // Call API to update status to user_conformation
      const response = await ordersAPI.updateOrderStatus(
        order._id,
        "user_conformation"
      );

      if (response && response.success) {
        // Update local order status
        order.status = "user_conformation";
        
        // Close confirmation popup
        setShowConfirmation(false);
        
        // Show success message
        alert(`✅ Order ${order.orderId} status updated to 'Waiting for User Confirmation'. User needs to confirm pickup.`);
        
        // Refresh orders list
        if (refreshOrders) {
          await refreshOrders();
        }
      } else {
        throw new Error(response?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error("❌ Error updating to user_conformation:", error);
      alert(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Function to mark self_pickup order as delivered
  const handleMarkAsDelivered = async () => {
    try {
      setUpdatingStatus(true);
      
      const response = await ordersAPI.updateOrderStatus(
        order._id,
        "delivered"
      );
      
      if (response.success) {
        order.status = "delivered";
        alert('✅ Order marked as delivered!');
        if (refreshOrders) await refreshOrders();
        setShowDeliveryConfirmation(false);
      }
    } catch (error) {
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

  // Get status badge styling
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
        style: { backgroundColor: "#555555", color: "#FFF" },
      },
      shop_accepted: {
        label: "Accepted",
        style: { backgroundColor: "#555555", color: "#FFF" },
      },
      shop_preparing: {
        label: "Preparing",
        style: { backgroundColor: "#555555", color: "#FFF" },
      },
      ready_for_pickup: {
        label: "Ready",
        style: { backgroundColor: "#555555", color: "#FFF" },
      },
      rider_assigned: {
        label: "Assigned",
        style: { backgroundColor: "#555555", color: "#FFF" },
      },
      delivered: {
        label: "Delivered",
        style: { backgroundColor: "#555555", color: "#FFF" },
      },
      cancelled: {
        label: "Cancelled",
        style: { backgroundColor: "#555555", color: "#FFF" },
      },
      awaiting_manual_assignment: {
        label: "Manual",
        style: { backgroundColor: "#555555", color: "#FFF" },
      },
      user_conformation: {
        label: "Awaiting Customer",
        style: { backgroundColor: "#555555", color: "#FFF" },
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
    if (method === 'self_pickup') {
      return (
        <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-[#555555]  border rounded-full">
          Self Pickup
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-[#555555]  rounded-full">
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
        description: "Order is ready for rider pickup",
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
      {/* Confirmation Popup for Self Pickup */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Self Pickup Confirmation</h3>
                  <p className="mt-1 text-sm text-gray-600">Order #{order.orderId}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.33 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h4 className="mb-2 font-semibold text-center text-gray-900">
                  Customer Self Pickup Required
                </h4>
                
                <p className="mb-4 text-center text-gray-700">
                  This is a <span className="font-bold text-purple-700">Self Pickup</span> order. 
                  The customer will come to collect the order.
                </p>
                
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-800">
                    When you click "Confirm & Notify Customer", the order status will change to 
                    <span className="font-bold text-gray-900"> "Waiting for User Confirmation"</span>. 
                    The customer needs to confirm pickup before marking as delivered.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={updatingStatus}
                className="flex-1 py-4 text-sm font-medium text-gray-700 transition-colors bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUserConfirmation}
                disabled={updatingStatus}
                className="flex-1 py-4 text-sm font-medium text-white transition-colors bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {updatingStatus ? (
                  <>
                    <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  'Confirm & Notify Customer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Confirmation Popup */}
      {showDeliveryConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirm Delivery</h3>
                  <p className="mt-1 text-sm text-gray-600">Order #{order.orderId}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                    This will mark the order as <span className="font-bold text-green-700">Delivered</span> 
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
                className="flex-1 py-4 text-sm font-medium text-white transition-colors bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {updatingStatus ? (
                  <>
                    <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  'Yes, Mark as Delivered'
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order Details
                    </h2>
                    <div className="flex items-center gap-4 mt-3">
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
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
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
                  {/* Details Tab */}
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
                          <div className="mb-2 text-sm text-gray-600">Items</div>
                          <div className="font-medium text-gray-900">
                            {order.items?.length || 0} items
                          </div>
                        </div>

                        <div className="p-5 border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                          <div className="mb-2 text-sm text-gray-600">
                            Delivery Method
                          </div>
                          <div className="font-medium text-gray-900 capitalize">
                            {order.deliveryMethod === 'self_pickup' ? 'Self Pickup' : 'Delivery'}
                          </div>
                        </div>
                      </div>

                      {/* Customer & Shop Info */}
                      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Customer Info */}
                        <div>
                          <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                            Customer Information
                          </h3>

                          <div className="space-y-4">
                            <div className="flex items-center px-5">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  <span className="font-semibold text-black">
                                    Customer:
                                  </span>{" "}
                                  {order.user?.name}
                                </h4>

                                <div className="mt-1 text-sm text-black">
                                  {/* Phone */}
                                  <div className="mb-1">
                                    <span className="font-semibold text-black">
                                      Phone No:
                                    </span>{" "}
                                    {order.user?.phone}
                                  </div>

                                  {/* Email */}
                                  {order.user?.userId?.email && (
                                    <div>
                                      <span className="font-semibold text-black">
                                        Email Id:
                                      </span>{" "}
                                      {order.user.userId.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Info (separate card) */}
                        {order.user?.deliveryAddress && (
                          <div>
                            <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                              Customer Delivery Address
                            </h3>

                            <div className="space-y-4">
                              <div className="pt-0">
                                <div className="p-3">
                                  <div className="space-y-2 text-gray-900">
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
                                          <div>
                                            <span className="font-semibold">
                                              Street:
                                            </span>{" "}
                                            {streetName?.trim() ||
                                              fullStreet ||
                                              "-"}
                                          </div>

                                          <div>
                                            <span className="font-semibold">
                                              City:
                                            </span>{" "}
                                            {[
                                              addr.city?.trim(),
                                              addr.state?.trim(),
                                              country || "",
                                            ]
                                              .filter(Boolean)
                                              .join(", ") || "-"}
                                          </div>

                                          <div>
                                            <span className="font-semibold">
                                              Pincode:
                                            </span>{" "}
                                            {addr.pincode || "-"}
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Special Instructions for Self Pickup */}
                      {order.deliveryMethod === 'self_pickup' && (
                        <div>
                          <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                            Self Pickup Information
                          </h3>
                          <div className="p-5 bg-white border border-gray-200 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-white rounded-full">
                                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="mb-2 font-semibold text-gray-900">Customer will pick up from shop</h4>
                                <p className="text-gray-800">
                                  Please prepare the order and keep it ready for customer pickup. 
                                  The customer will collect the order directly from your shop location.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delivery Info */}
                      {(order.distance?.value || order.estimatedDeliveryTime) && order.deliveryMethod === 'delivery' && (
                        <div>
                          <h3 className="pb-3 mb-4 text-lg font-semibold text-gray-900 border-b border-gray-200">
                            Delivery Information
                          </h3>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {order.distance?.value && (
                              <div className="p-5 bg-gray-200 border rounded-xl">
                                <div className="mb-1 text-sm font-medium text-black">
                                  Distance
                                </div>
                                <div className="text-2xl font-bold text-black">
                                  {order.distance.text}
                                </div>
                              </div>
                            )}
                            {order.estimatedDeliveryTime && (
                              <div className="p-5 bg-gray-200 border rounded-xl">
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
                                    <img
                                      src={item.productImage}
                                      alt={item.name}
                                      className="object-cover w-24 h-24 border border-gray-200 rounded-lg"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=150&h=150&fit=crop&crop=center";
                                      }}
                                    />
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
                              <div className="p-5 border border-blue-200 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
                                  <h4 className="font-semibold text-gray-900">
                                    Current Status:{" "}
                                    {order.status.replace("_", " ").toUpperCase()}
                                  </h4>
                                </div>
                                <p className="mt-2 text-gray-800">
                                  Order is currently{" "}
                                  {order.status.replace("_", " ").toLowerCase()}
                                  {order.deliveryMethod === 'self_pickup' && " (Self Pickup)"}
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
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-sm text-gray-600">
                  Last updated: {formatDate(order.updatedAt)}
                </div>

                {statusError && (
                  <div className="px-4 py-2 text-sm text-red-600 rounded-lg bg-red-50">
                    {statusError}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Print Order
                  </button>

                  {/* Show Mark as Ready button for accepted/preparing orders */}
                  {(order.status === "shop_accepted" ||
                    order.status === "shop_preparing") && (
                    <button
                      onClick={handleMarkAsReady}
                      disabled={updatingStatus}
                      className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                        updatingStatus
                          ? "bg-gray-400 cursor-not-allowed"
                          : order.deliveryMethod === 'self_pickup'
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                          Processing...
                        </>
                      ) : (
                        `Mark as ${order.deliveryMethod === 'self_pickup' ? 'Ready (Self Pickup)' : 'Ready'}`
                      )}
                    </button>
                  )}

                  {/* Already ready message */}
                  {order.status === "ready_for_pickup" && order.deliveryMethod === 'delivery' && (
                    <div className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg">
                      ✓ Ready for Pickup
                    </div>
                  )}

                  {/* For self_pickup orders that are ready */}
                  {order.status === "ready_for_pickup" && order.deliveryMethod === 'self_pickup' && (
                    <div className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg">
                      ✓ Ready for Customer Pickup
                    </div>
                  )}

                  {/* Show Mark as Delivered button for user_conformation status (self_pickup) */}
                  {order.status === "user_conformation" && order.deliveryMethod === "self_pickup" && (
                    <button
                      onClick={() => setShowDeliveryConfirmation(true)}
                      disabled={updatingStatus}
                      className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                        updatingStatus
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="inline-block w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                          Processing...
                        </>
                      ) : (
                        'Customer Picked Up?'
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