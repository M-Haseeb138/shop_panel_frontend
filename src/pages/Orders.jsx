// pages/Orders.jsx - COMPLETELY UPDATED WITH DELIVERY METHOD
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import OrderModal from '../components/order/OrderModal';
import api from '../services/api';

const ShopOrders = ({ onLogout, userData }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shop_accepted: 0,
    ready_for_pickup: 0,
    delivered: 0,
    cancelled: 0,
    user_conformation: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: activeTab !== 'all' ? activeTab : undefined
      };

      const response = await api.get('/shop-owner/orders', { params });
      const data = response.data;
      
      if (data.success) {
        setOrders(data.orders || []);
        setFilteredOrders(data.orders || []);
        
        // Update stats
        const statusCounts = {
          total: data.total || 0,
          pending: 0,
          shop_accepted: 0,
          ready_for_pickup: 0,
          delivered: 0,
          cancelled: 0,
          user_conformation: 0
        };
        
        (data.orders || []).forEach(order => {
          if (order.status && statusCounts[order.status] !== undefined) {
            statusCounts[order.status]++;
          }
        });
        
        setStats(statusCounts);
        setPagination({
          page: data.currentPage || 1,
          limit: data.limit || pagination.limit,
          total: data.total || 0,
          totalPages: data.totalPages || 1
        });
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit]);

  // Fetch detailed order information
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingOrderDetails(true);
      setSelectedOrderId(orderId);
      
      const response = await api.get(`/shop-owner/orders/${orderId}`);
      const data = response.data;
      
      if (data.success) {
        setSelectedOrderDetails(data.order);
        setIsModalOpen(true);
      } else {
        throw new Error(data.message || 'Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details');
      setSelectedOrderDetails(null);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (order) => {
    await fetchOrderDetails(order.orderId || order._id);
  };

  // Apply filters when tab or search changes
  useEffect(() => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = orders.filter(order => {
        if (!order) return false;
        
        const orderId = (order.orderId || '').toLowerCase();
        const customerName = (order.customerName || order.user?.name || '').toLowerCase();
        const customerPhone = (order.customerPhone || order.user?.phone || '').toLowerCase();
        
        return orderId.includes(searchLower) || 
               customerName.includes(searchLower) || 
               customerPhone.includes(searchLower);
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  // Fetch orders when tab changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Format currency to USD
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date/time
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
  // Fixed width for all status badges
  const baseStyle = {
    fontFamily: "'Metropolis', sans-serif",
    fontWeight: 600,
    fontSize: "11px",
    padding: "6px 0px", // No horizontal padding
    borderRadius: "9999px",
    display: "inline-block", // Changed to block for fixed width
    textAlign: "center",
    width: "90px", // FIXED WIDTH - sab badges ka same width hoga
    boxSizing: "border-box",
    border: "1px solid #444444",
    color: "#FFFFFF",
    backgroundColor: "#555555",
    lineHeight: "1.2",
    height: "28px",
    letterSpacing: "0.3px"
  };


    const statusConfig = {
      pending: {
        label: "Pending",
        style: { backgroundColor: "#555555", color: "#FFF" }
      },
      shop_accepted: {
        label: "Accepted",
        style: { backgroundColor: "#555555", color: "#FFF" }
      },
      ready_for_pickup: {
        label: "Ready",
        style: { backgroundColor: "#555555", color: "#FFF" }
      },
      rider_assigned: {
        label: "Assigned",
        style: { backgroundColor: "#555555", color: "#FFF" }
      },
      delivered: {
        label: "Delivered",
        style: { backgroundColor: "#555555", color: "#FFF" }
      },
      cancelled: {
        label: "Cancelled",
        style: { backgroundColor: "#555555", color: "#FFF" }
      },
      awaiting_manual_assignment: {
        label: "Manual",
        style: { backgroundColor: "#555555", color: "#FFF" }
      }
      // user_conformation: {
      //   label: "Awaiting Customer",
      //   style: { backgroundColor: "#555555", color: "#FFF" }
      // }
    };

    const config = statusConfig[status] || {
      label: status,
      style: { backgroundColor: "#555555", color: "#FFF" }
    };

    return (
      <span style={{ ...baseStyle, ...config.style }}>
        {config.label}
      </span>
    );
  };

  // Get delivery method badge
  const getDeliveryMethodBadge = (method) => {
    if (method === 'self_pickup') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full text-white bg-[#555555]">
          Self Pickup
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full text-white bg-[#555555]">
        Delivery
      </span>
    );
  };

  // Stats cards data
  const statsData = [
    { 
      label: "Total Orders", 
      value: stats.total,
      color: 'from-gray-50 to-gray-100',
      textColor: 'text-black',
      borderColor: 'border-gray-200',
      prefix: ''
    },
    { 
      label: "Pending", 
      value: stats.pending,
      color: 'from-gray-50 to-gray-100',
      textColor: 'text-black',
      borderColor: 'border-gray-200',
      prefix: ''
    },
    { 
      label: "Accepted", 
      value: stats.shop_accepted,
      color: 'from-gray-50 to-gray-100',
      textColor: 'text-black',
      borderColor: 'border-gray-200',
      prefix: ''
    },
    { 
      label: "Ready", 
      value: stats.ready_for_pickup,
      color: 'from-gray-50 to-gray-100',
      textColor: 'text-black',
      borderColor: 'border-gray-200',
      prefix: ''
    },
    { 
      label: "Revenue", 
      value: formatCurrency(orders.reduce((sum, order) => sum + (order.pricing?.itemsTotal - order.pricing?.discount || 0), 0)),
      color: 'from-gray-50 to-gray-100',
      textColor: 'text-black',
      borderColor: 'border-gray-200',
      prefix: ''
    }
  ];

  // Tabs configuration
  const tabs = [
    { id: 'all', label: 'All Orders', count: stats.total },
    { id: 'pending', label: 'Pending', count: stats.pending },
    { id: 'shop_accepted', label: 'Accepted', count: stats.shop_accepted },
    { id: 'ready_for_pickup', label: 'Ready', count: stats.ready_for_pickup },
    // { id: 'user_conformation', label: 'Awaiting Customer', count: stats.user_conformation },
    { id: 'delivered', label: 'Delivered', count: stats.delivered }
  ];

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrderDetails(null);
    setSelectedOrderId(null);
  };

  return (
    <Layout onLogout={onLogout} userData={userData}>
      {/* Order Details Modal */}
      {isModalOpen && (
        <OrderModal
          order={selectedOrderDetails}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          loading={loadingOrderDetails}
          refreshOrders={fetchOrders}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="mt-2 text-gray-600">Track and manage all customer orders</p>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
<div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-5">
  {statsData.map((stat, index) => (
    <div 
      key={index} 
      className={`bg-gradient-to-br ${stat.color} border ${stat.borderColor} rounded-xl p-5 shadow-sm`}
    >
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="mb-2 text-sm font-medium text-gray-600">{stat.label}</div>
        <div className={`text-2xl font-bold ${stat.textColor} truncate w-full`}>
          {stat.prefix}{stat.value}
        </div>
      </div>
    </div>
  ))}
</div>

      {/* Filters and Search */}
      <div className="p-5 mb-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
        {/* Table Header - Desktop */}
        <div className="hidden grid-cols-12 gap-4 p-5 border-b border-gray-200 md:grid bg-gray-50">
          <div className="col-span-2 font-medium text-gray-700">ORDER ID</div>
          <div className="col-span-2 font-medium text-gray-700">CUSTOMER</div>
          <div className="col-span-2 font-medium text-gray-700">AMOUNT</div>
          <div className="col-span-2 font-medium text-gray-700">DELIVERY METHOD</div>
          <div className="col-span-2 font-medium text-gray-700">STATUS</div>
          <div className="col-span-1 font-medium text-gray-700">DATE</div>
          <div className="col-span-1 font-medium text-gray-700">ACTIONS</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-300 rounded-full border-t-gray-900 animate-spin"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-16 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-red-600 bg-red-100 rounded-full">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">Error Loading Orders</h3>
            <p className="max-w-md mx-auto mb-4 text-gray-700">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-5 py-2.5 text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="py-16 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="max-w-md mx-auto text-gray-600">
              {activeTab === 'all' 
                ? "You don't have any orders yet. Orders will appear here when customers place them."
                : `No ${activeTab.replace('_', ' ')} orders found.`
              }
            </p>
          </div>
        )}

        {/* Orders List - Mobile View */}
        {!loading && !error && filteredOrders.length > 0 && (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {filteredOrders.map((order, index) => (
                <div key={order.orderId || order._id || index} className="p-5 transition-colors hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{order.orderId}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {getDeliveryMethodBadge(order.deliveryMethod)}
                        <div className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
                      title="View Details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 text-sm text-gray-600">Customer</div>
                      <div className="font-medium text-gray-900">
                        {order.customerName || order.user?.name || 'Customer'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.customerPhone || order.user?.phone || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <div className="text-sm text-gray-600">Amount</div>
                        <div className="font-bold text-gray-900">
                          {formatCurrency(order.pricing?.itemsTotal - order.pricing?.discount || 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Items</div>
                        <div className="text-gray-900">{order.items?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Orders List - Desktop View */}
            <div className="hidden md:block">
              {filteredOrders.map((order, index) => (
                <div 
                  key={order.orderId || order._id || index} 
                  className="grid grid-cols-12 gap-4 p-5 transition-colors border-b border-gray-100 hover:bg-gray-50"
                >
                  {/* Order ID */}
                  <div className="col-span-2">
                    <div className="font-medium text-gray-900">{order.orderId}</div>
                  </div>

                  {/* Customer Info */}
                  <div className="col-span-2">
                    <div className="font-medium text-gray-900">
                      {order.customerName || order.user?.name || 'Customer'}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {order.customerPhone || order.user?.phone || 'N/A'}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.pricing?.itemsTotal - order.pricing?.discount || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.items?.length || 0} items
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div className="col-span-2">
                    {getDeliveryMethodBadge(order.deliveryMethod)}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Date */}
                  <div className="col-span-1">
                    <div className="text-gray-900">{formatDate(order.createdAt)}</div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex items-center justify-center w-10 h-10 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:text-gray-900 hover:bg-gray-100 hover:border-gray-400"
                      title="View Details"
                      disabled={loadingOrderDetails && selectedOrderId === (order.orderId || order._id)}
                    >
                      {loadingOrderDetails && selectedOrderId === (order.orderId || order._id) ? (
                        <div className="w-4 h-4 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && filteredOrders.length > 0 && pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between p-5 border-t border-gray-200 sm:flex-row">
            <div className="mb-4 text-sm text-gray-600 sm:mb-0">
              Showing {filteredOrders.length} of {pagination.total} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <div className="flex items-center">
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShopOrders;