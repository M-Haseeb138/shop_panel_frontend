// pages/Dashboard.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { dashboardAPI } from "../services/dashboardAPI"; // ✅ Object import karein

// Formatting functions
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactCurrency = (amount) => {
  if (!amount && amount !== 0) return "$0";
  if (amount >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(amount);
  }
  return formatCurrency(amount);
};

const getStatusBadge = (status) => {
  const config = {
    preparing: { bg: "#e2e2e2ff", text: "#000", label: "Preparing" },
    ready: { bg: "#e2e2e2ff", text: "#000", label: "Ready" },
    assigned: { bg: "#e2e2e2ff", text: "#000", label: "Assigned" },
    delivered: { bg: "#e2e2e2ff", text: "#000", label: "Delivered" },
    pending: { bg: "#e2e2e2ff", text: "#000", label: "Pending" },
    shop_accepted: { bg: "#e2e2e2ff", text: "#000", label: "Accepted" },
    shop_preparing: { bg: "#e2e2e2ff", text: "#000", label: "Preparing" },
    ready_for_pickup: { bg: "#e2e2e2ff", text: "#000", label: "Ready" },
    picked_up: { bg: "#e2e2e2ff", text: "#000", label: "Picked Up" },
    cancelled: { bg: "#e2e2e2ff", text: "#000", label: "Cancelled" },
  };

  const style = config[status] || config.pending;

  return (
    <span
      className="px-3 py-1.5 text-xs font-medium rounded-full"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        fontFamily: "'Metropolis', sans-serif",
        fontWeight: 500,
      }}
    >
      {style.label}
    </span>
  );
};

const Dashboard = ({ onLogout, userData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [orderChartRange, setOrderChartRange] = useState("week");
  const [revenueChartRange, setRevenueChartRange] = useState("week");

  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    shopRating: 5.0,
    todayOrders: 0,
    todayRevenue: 0,
    openOrders: 0,
    totalCustomers: 0,
  });

  const [orderVolumeData, setOrderVolumeData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // ✅ OPTIMIZATION: Memoized calculations
  const maxOrders = useMemo(() => {
    if (orderVolumeData.length === 0) return 10;
    const max = Math.max(...orderVolumeData.map((d) => d.orders), 1);
    return Math.ceil(max / 5) * 5;
  }, [orderVolumeData]);

  const maxRevenue = useMemo(() => {
    if (revenueData.length === 0) return 1000;
    const max = Math.max(...revenueData.map((d) => d.revenue), 100);
    return Math.ceil(max / 500) * 500;
  }, [revenueData]);

  // ✅ Single fetch function
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Parallel API calls using dashboardAPI object
      const [statsRes, recentRes, productsRes, orderRes, revenueRes] = await Promise.all([
        dashboardAPI.getDashboardStats('month'),
        dashboardAPI.getRecentOrders(5),
        dashboardAPI.getTopProducts(5, 'month'),
        dashboardAPI.getOrderVolume(orderChartRange),
        dashboardAPI.getRevenueData(revenueChartRange)
      ]);

      // Process stats
      if (statsRes.data.success) {
        const stats = statsRes.data.stats || {};
        setDashboardStats({
          totalOrders: stats.totalOrders || 0,
          totalRevenue: stats.totalRevenue || 0,
          shopRating: stats.shopRating || 5.0,
          todayOrders: stats.todayOrders || 0,
          todayRevenue: stats.todayRevenue || 0,
          openOrders: stats.openOrders || 0,
          totalCustomers: stats.totalCustomers || 0,
        });
      }

      // Process recent orders
      if (recentRes.data.success) {
        const orders = recentRes.data.orders || [];
        setRecentOrders(orders.map(order => ({
          id: order.id || order.orderId || `ORD-${Math.random().toString(36).substr(2, 4)}`,
          customer: order.customer || order.customerName || "Customer",
          amount: order.amount || order.total || 0,
          status: order.status || "pending",
          time: order.time || new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        })));
      }

      // Process top products
      if (productsRes.data.success) {
        const products = productsRes.data.products || [];
        setTopProducts(products.map(product => ({
          id: product._id || product.productId,
          name: product.name || product.title || "Product",
          sales: product.sales || product.totalSold || 0,
          revenue: product.revenue || product.totalRevenue || 0,
          price: product.price || 0
        })));
      }

      // Process order volume
      if (orderRes.data.success) {
        setOrderVolumeData(orderRes.data.data || []);
      }

      // Process revenue data
      if (revenueRes.data.success) {
        setRevenueData(revenueRes.data.data || []);
      }

    } catch (error) {
      console.error('❌ Dashboard data error:', error);
      setError(error.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [orderChartRange, revenueChartRange]);

  // ✅ Separate effect for chart updates only
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [orderRes, revenueRes] = await Promise.all([
          dashboardAPI.getOrderVolume(orderChartRange),
          dashboardAPI.getRevenueData(revenueChartRange)
        ]);
        
        if (orderRes.data.success) setOrderVolumeData(orderRes.data.data || []);
        if (revenueRes.data.success) setRevenueData(revenueRes.data.data || []);
      } catch (error) {
        console.warn('Chart data error:', error);
      }
    };
    
    // Only fetch if we already have initial data
    if (orderVolumeData.length > 0 || revenueData.length > 0) {
      fetchChartData();
    }
  }, [orderChartRange, revenueChartRange]);

  // Initial load only
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ Memoized stats cards
  const statsCards = useMemo(() => [
    {
      title: "Total Orders",
      value: dashboardStats.totalOrders.toLocaleString(),
      change: "",
      changeType: "up",
      bgColor: "#e2e2e2ff",
      borderColor: "#bebebeff",
      accentColor: "#000000",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardStats.totalRevenue),
      change: "",
      changeType: "up",
      bgColor: "#e2e2e2ff",
      borderColor: "#bebebeff",
      accentColor: "#000000",
    },
    {
      title: "Shop Rating",
      value: dashboardStats.shopRating.toFixed(1),
      suffix: "/5",
      change: dashboardStats.shopRating >= 4.5 ? "Excellent" : 
              dashboardStats.shopRating >= 3.5 ? "Good" : 
              dashboardStats.shopRating > 0 ? "Needs Work" : "No Rating",
      changeType: dashboardStats.shopRating >= 4 ? "up" : 
                  dashboardStats.shopRating > 0 ? "neutral" : "down",
      bgColor: "#e2e2e2ff",
      borderColor: "#bebebeff",
      accentColor: "#000000",
    },
  ], [dashboardStats]);

  // ✅ Memoized event handlers
  const handleOrderRangeChange = useCallback((range) => {
    setOrderChartRange(range);
  }, []);

  const handleRevenueRangeChange = useCallback((range) => {
    setRevenueChartRange(range);
  }, []);

  // ✅ REMOVED: Skeleton loader - page shows immediately
  
  // ✅ Chart calculations
  const orderChartPoints = useMemo(() => {
    if (orderVolumeData.length < 2) return [];
    return orderVolumeData.map((point, index) => {
      const x = (index / (orderVolumeData.length - 1)) * 100;
      const y = 100 - (point.orders / maxOrders) * 100;
      return { x, y, data: point };
    });
  }, [orderVolumeData, maxOrders]);

  const revenueChartPoints = useMemo(() => {
    if (revenueData.length < 2) return [];
    return revenueData.map((point, index) => {
      const x = (index / (revenueData.length - 1)) * 100;
      const y = 100 - (point.revenue / maxRevenue) * 100;
      return { x, y, data: point };
    });
  }, [revenueData, maxRevenue]);

  return (
    <Layout onLogout={onLogout} userData={userData}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
              Dashboard Overview
            </h1>
            <p className="mt-1 text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
              Welcome back, {userData?.name || "Shop Owner"}!
            </p>
          </div>
          {error && (
            <div className="p-3 mt-4 rounded-lg md:mt-0" style={{ backgroundColor: "#e2e2e2ff", border: "1px solid #bebebeff" }}>
              <p className="text-sm" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif" }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Today's Performance Summary */}
        <div className="p-6 mt-6 shadow-sm rounded-xl" style={{ backgroundColor: "#000000", borderColor: "#E5E7EB" }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                Today's Performance
              </h3>
              <p className="mt-1 text-gray-300" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 md:flex-nowrap md:ml-auto md:justify-end">
              <div className="p-3 text-center rounded-lg bg-white/10 backdrop-blur-sm min-w-[110px]">
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {dashboardStats.todayOrders}
                </p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                  Today's Orders
                </p>
              </div>

              <div className="p-3 text-center rounded-lg bg-white/10 backdrop-blur-sm min-w-[110px]">
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {formatCompactCurrency(dashboardStats.todayRevenue)}
                </p>
                <p className="text-sm text-gray-300" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                  Today's Revenue
                </p>
              </div>

              <div className="p-3 text-center rounded-lg bg-white/10 backdrop-blur-sm min-w-[110px]">
                <div className="flex items-center justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-lg ${star <= Math.floor(dashboardStats.shopRating) ? "text-yellow-400" : "text-gray-600"}`}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-300" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                  {dashboardStats.shopRating.toFixed(1)}/5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="p-6 transition-all duration-300 rounded-xl hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(30, 30, 30, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: stat.accentColor }}></div>
            <div className="flex flex-col h-full">
              <p className="mb-4 text-sm font-medium" style={{ color: "#e2e2e2ff", fontFamily: "'Metropolis', sans-serif", fontWeight: 500, letterSpacing: "0.4px" }}>
                {stat.title}
              </p>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-3xl font-bold" style={{ color: "#ffffff", fontFamily: "'Metropolis', sans-serif", fontWeight: 700, lineHeight: "1.1" }}>
                    {stat.value}
                    {stat.suffix && <span className="ml-1 text-lg" style={{ color: "#e2e2e2ff", fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>{stat.suffix}</span>}
                  </p>
                </div>
                {stat.change && (
                  <div className="flex items-center">
                    <span className="flex items-center text-sm font-medium px-3 py-1.5 rounded-full bg-[#bebebeff]" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600, backdropFilter: "blur(6px)", color: "#000000" }}>
                      <span className="mr-1 text-base">
                        {stat.changeType === "up" ? "↑" : stat.changeType === "down" ? "↓" : "→"}
                      </span>
                      <span>{stat.change}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Order Volume Chart */}
          <div className="p-6 bg-white border rounded-xl">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "#000000" }}></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                Order Volume
              </h3>
              <div className="flex items-center gap-1">
                {["day", "week", "month"].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleOrderRangeChange(r)}
                    className={`px-4 py-2 text-sm rounded-lg capitalize transition-all ${orderChartRange === r ? "text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}`}
                    style={{
                      backgroundColor: orderChartRange === r ? "#555555" : "#FFFFFF",
                      border: orderChartRange === r ? "none" : "1px solid #E5E7EB",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: orderChartRange === r ? 500 : 400,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64">
              {orderVolumeData.length > 0 ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-end flex-1 pb-8">
                    <div className="flex flex-col justify-between h-full mr-2 text-xs" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                      {[5, 4, 3, 2, 1, 0].map((num) => (
                        <span key={num}>{Math.round((num / 5) * maxOrders)}</span>
                      ))}
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="border-t" style={{ borderColor: "#E5E7EB" }}></div>
                        ))}
                      </div>
                      <div className="relative h-full">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="orderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {orderChartPoints.length > 1 && (
                            <>
                              <path d={`M ${orderChartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`} fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              <path d={`M ${orderChartPoints.map(p => `${p.x},${p.y}`).join(' L ')} L 100,100 L 0,100 Z`} fill="url(#orderGradient)" />
                            </>
                          )}
                        </svg>
                        {orderVolumeData.map((point, i) => {
                          const percentage = (point.orders / maxOrders) * 100;
                          const x = (i / (orderVolumeData.length - 1)) * 100;
                          return (
                            <div
                              key={i}
                              className="absolute w-4 h-4 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 border-2 rounded-full shadow-md hover:w-5 hover:h-5"
                              style={{
                                backgroundColor: "#FFFFFF",
                                borderColor: "#000000",
                                left: `${x}%`,
                                top: `${100 - percentage}%`,
                                cursor: "pointer",
                              }}
                              title={`${point.label || point.time}: ${point.orders} orders`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 text-xs" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                    {orderVolumeData.map((point, i) => (
                      <span key={i} className="text-center" style={{ width: `${100 / orderVolumeData.length}%` }}>
                        {point.label || point.time}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                    Loading order data...
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t" style={{ borderColor: "#E5E7EB" }}>
              <div>
                <p className="text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>Total Orders ({orderChartRange})</p>
                <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {orderVolumeData.reduce((sum, d) => sum + d.orders, 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>Average per period</p>
                <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {orderVolumeData.length > 0 ? Math.round(orderVolumeData.reduce((sum, d) => sum + d.orders, 0) / orderVolumeData.length) : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="p-6 bg-white border rounded-xl">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "#000000" }}></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                Recent Orders
              </h3>
              <button onClick={() => navigate("/orders")} className="px-4 py-2 text-sm font-medium transition-all rounded-lg hover:bg-gray-100" style={{ color: "#555555", backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 transition-all duration-300 rounded-lg hover:shadow-md" style={{ border: "1px solid #E5E7EB", cursor: "pointer" }} onClick={() => navigate(`/orders/${order.id}`)}>
                    <div>
                      <p className="mb-1 font-medium" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                        {order.id}
                      </p>
                      <p className="mb-2 text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                        {order.customer}
                      </p>
                      <span className="text-xs" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                        {order.time}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="mb-2 font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700, fontSize: "18px" }}>
                        {formatCurrency(order.amount)}
                      </p>
                      <div className="flex justify-end">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                    Loading recent orders...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div className="p-6 bg-white border rounded-xl">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "#000000" }}></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                Revenue (All Orders)
              </h3>
              <div className="flex items-center gap-1">
                {["day", "week", "month"].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRevenueRangeChange(r)}
                    className={`px-4 py-2 text-sm rounded-lg capitalize transition-all ${revenueChartRange === r ? "text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}`}
                    style={{
                      backgroundColor: revenueChartRange === r ? "#555555" : "#FFFFFF",
                      border: revenueChartRange === r ? "none" : "1px solid #E5E7EB",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: revenueChartRange === r ? 500 : 400,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64">
              {revenueData.length > 0 ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-end flex-1 pb-8">
                    <div className="flex flex-col justify-between h-full mr-2 text-xs" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                      {[5, 4, 3, 2, 1, 0].map((num) => (
                        <span key={num}>{formatCompactCurrency((num / 5) * maxRevenue)}</span>
                      ))}
                    </div>
                    <div className="relative flex-1">
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="border-t" style={{ borderColor: "#E5E7EB" }}></div>
                        ))}
                      </div>
                      <div className="relative h-full">
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#555555" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#555555" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {revenueChartPoints.length > 1 && (
                            <>
                              <path d={`M ${revenueChartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`} fill="none" stroke="#555555" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              <path d={`M ${revenueChartPoints.map(p => `${p.x},${p.y}`).join(' L ')} L 100,100 L 0,100 Z`} fill="url(#revenueGradient)" />
                            </>
                          )}
                        </svg>
                        {revenueData.map((point, i) => {
                          const percentage = (point.revenue / maxRevenue) * 100;
                          const x = (i / (revenueData.length - 1)) * 100;
                          return (
                            <div
                              key={i}
                              className="absolute w-4 h-4 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 border-2 rounded-full shadow-md hover:w-5 hover:h-5"
                              style={{
                                backgroundColor: "#FFFFFF",
                                borderColor: "#555555",
                                left: `${x}%`,
                                top: `${100 - percentage}%`,
                                cursor: "pointer",
                              }}
                              title={`${point.label || point.time}: ${formatCurrency(point.revenue)}`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 text-xs" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                    {revenueData.map((point, i) => (
                      <span key={i} className="text-center" style={{ width: `${100 / revenueData.length}%` }}>
                        {point.label || point.time}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                    Loading revenue data...
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t" style={{ borderColor: "#E5E7EB" }}>
              <div>
                <p className="text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>Total Revenue ({revenueChartRange})</p>
                <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {formatCurrency(revenueData.reduce((sum, d) => sum + d.revenue, 0))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>Average per period</p>
                <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {revenueData.length > 0 ? formatCurrency(revenueData.reduce((sum, d) => sum + d.revenue, 0) / revenueData.length) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="p-6 bg-white border rounded-xl">
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "#000000" }}></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                Top Selling Products
              </h3>
              <button onClick={() => navigate("/products")} className="px-4 py-2 text-sm font-medium transition-all rounded-lg hover:bg-gray-100" style={{ color: "#555555", backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 transition-all duration-300 rounded-lg hover:shadow-md" style={{ border: "1px solid #E5E7EB", cursor: "pointer", backgroundColor: index % 2 === 0 ? "#FAFAFA" : "#FFFFFF" }} onClick={() => navigate(`/products/${product.id}`)}>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 mr-4 rounded-lg" style={{ backgroundColor: index < 3 ? "#000000" : "#555555", color: "#FFFFFF" }}>
                        <span style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600, fontSize: "14px" }}>{index + 1}</span>
                      </div>
                      <div>
                        <p className="mb-1 font-medium" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
                          {product.name}
                        </p>
                        <div className="flex items-center">
                          <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: index < 3 ? "#e2e2e2ff" : "#e2e2e2ff", color: index < 3 ? "#000000" : "#101010", fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
                            {product.sales} sold
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700, fontSize: "18px" }}>
                        {formatCurrency(product.revenue)}
                      </p>
                      <span className="text-xs" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                        ${product.price ? product.price.toFixed(2) : product.sales > 0 ? (product.revenue / product.sales).toFixed(2) : "0.00"} avg
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                    Loading top products...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

// product page 
// pages/Products.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import productsAPI from '../services/productsAPI';
import categoriesAPI from '../services/categoriesAPI';
import ProductModal from '../components/products/ProductModal';

const Products = ({ onLogout, userData }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedShop, setSelectedShop] = useState('all');
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadShops();
  }, [activeTab, searchTerm, selectedCategory, sortBy, selectedShop]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        status: activeTab !== 'all' ? activeTab : undefined,
        q: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy,
        shop: selectedShop !== 'all' ? selectedShop : undefined
      };

      // Clean up undefined params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await productsAPI.getShopProducts(params);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      // FIX: Ensure categories is always an array
      const categoriesData = response.data || response || [];
      console.log('Categories response:', response);
      console.log('Categories data:', categoriesData);
      console.log('Is array?', Array.isArray(categoriesData));
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else if (categoriesData && Array.isArray(categoriesData.categories)) {
        // If response has nested categories array
        setCategories(categoriesData.categories);
      } else if (categoriesData && categoriesData.success && Array.isArray(categoriesData.data)) {
        // If response has success field with data array
        setCategories(categoriesData.data);
      } else {
        // If response is object, convert values to array
        const categoriesArray = Object.values(categoriesData);
        setCategories(categoriesArray);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const loadShops = async () => {
    try {
      // For now, if you have shops API, use it. Otherwise, set empty
      setShops([]);
    } catch (error) {
      console.error('Error loading shops:', error);
      setShops([]);
    }
  };

  const handleAddProduct = () => {
    const token = localStorage.getItem('shopOwnerToken');
    if (!token) {
      alert('Please login to add products');
      navigate('/login');
      return;
    }
    
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const accountStatus = userData.accountStatus || 'Pending';
    const isAccountApproved = accountStatus === 'Active' || accountStatus === 'Verified' || accountStatus === 'active' || accountStatus === 'verified';
    
    console.log('📊 Add product check:', {
      accountStatus,
      isAccountApproved
    });
    
    if (!isAccountApproved) {
      alert('Please wait for admin approval before adding products.');
      navigate('/pending-approval');
      return;
    }
    
    console.log('✅ Account approved - navigating to add product');
    navigate('/add-product');
  };

  // Open modal with product details
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Publish Draft Product
  const handlePublishProduct = async (productId, productTitle) => {
    if (!window.confirm(`Publish "${productTitle}"?`)) return;
    
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await productsAPI.updateProductStatus(productId, { status: 'published' });
      
      if (response.data.success) {
        alert('✅ Product published successfully!');
        loadProducts();
        if (selectedProduct?._id === productId) {
          setSelectedProduct(prev => ({ ...prev, status: 'published' }));
        }
      } else {
        alert(response.data.message || 'Failed to publish product');
      }
    } catch (error) {
      console.error('❌ Error publishing product:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('shopOwnerToken');
        localStorage.removeItem('userData');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to update this product.');
      } else if (error.response?.status === 404) {
        alert('Product not found. It may have been deleted.');
        loadProducts();
      } else {
        alert(error.response?.data?.message || 'Failed to publish product');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Move to Draft
  const handleMoveToDraft = async (productId, productTitle) => {
    if (!window.confirm(`Move "${productTitle}" to draft?`)) return;
    
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await productsAPI.updateProductStatus(productId, { status: 'draft' });
      
      if (response.data.success) {
        alert(' Product moved to draft!');
        loadProducts();
        if (selectedProduct?._id === productId) {
          setSelectedProduct(prev => ({ ...prev, status: 'draft' }));
        }
      } else {
        alert(response.data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('❌ Error moving to draft:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('shopOwnerToken');
        localStorage.removeItem('userData');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to update this product.');
      } else if (error.response?.status === 404) {
        alert('Product not found. It may have been deleted.');
        loadProducts();
      } else {
        alert(error.response?.data?.message || 'Failed to update product');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, productTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${productTitle}"?\nThis action cannot be undone.`)) return;
    
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await productsAPI.deleteProduct(productId);
      
      if (response.data.success) {
        alert(' Product deleted successfully!');
        loadProducts();
        if (selectedProduct?._id === productId) {
          handleCloseModal();
        }
      } else {
        alert(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('shopOwnerToken');
        localStorage.removeItem('userData');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to delete this product.');
      } else if (error.response?.status === 404) {
        alert('Product not found. It may have been deleted.');
        loadProducts();
      } else {
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getStatusBadge = (status, stockQuantity) => {
    if (stockQuantity <= 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ 
          backgroundColor: '#FFFAEB', 
          color: '#856404',
          fontFamily: "'Metropolis', sans-serif",
          fontWeight: 500
        }}>
          Low Stock
        </span>
      );
    }

    const statusConfig = {
      published: { 
        bgColor: 'rgba(39, 200, 64, 0.1)', 
        textColor: '#27C840', 
        text: 'Published' 
      },
      draft: { 
        bgColor: 'rgba(85, 85, 85, 0.1)', 
        textColor: '#555555', 
        text: 'Draft' 
      },
      archived: { 
        bgColor: '#FFFAEB', 
        textColor: '#856404', 
        text: 'Archived' 
      }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ 
        backgroundColor: config.bgColor, 
        color: config.textColor,
        fontFamily: "'Metropolis', sans-serif",
        fontWeight: 500
      }}>
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

  // Filter products based on active tab
  const filteredProducts = products.filter(product => {
    if (activeTab === 'all') return product.status !== 'draft';
    if (activeTab === 'published') return product.status === 'published';
    if (activeTab === 'draft') return product.status === 'draft';
    if (activeTab === 'low-stock') return product.stockQuantity <= 10;
    return true;
  });

  // Updated stats calculation
  const publishedProducts = products.filter(p => p.status === 'published');
  const draftProducts = products.filter(p => p.status === 'draft');
  const lowStockProducts = products.filter(p => p.stockQuantity <= 10);
  const allPublishedProducts = products.filter(p => p.status !== 'draft');

  const stats = [
    { 
      label: "Published Products", 
      value: publishedProducts.length,
      change: "+5", 
      changeType: 'positive',
      color: 'bg-gradient-to-r from-gray to-black-800'
    },
    { 
      label: "Low Stock Items", 
      value: lowStockProducts.length, 
      change: "+2", 
      changeType: 'negative',
      color: 'bg-gradient-to-r from-gray to-black-800'
    },
    { 
      label: "Draft Products", 
      value: draftProducts.length, 
      change: "-3", 
      changeType: 'positive',
     color: 'bg-gradient-to-r from-gray to-black-800'
    },
    { 
      label: "Total Products", 
      value: allPublishedProducts.length,
      change: "+12%", 
      changeType: 'positive',
      color: 'bg-gradient-to-r from-gray to-black-800'
    }
  ];

  return (
    <Layout onLogout={onLogout} userData={userData}>
      {/* Header */}
      <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>Product Listings</h1>
          <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>Manage and track all your products</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="flex items-center px-4 py-2 mt-4 space-x-2 text-white transition-all duration-300 transform rounded-lg md:mt-0 hover:scale-[1.02] hover:shadow-lg focus:outline-none"
          style={{ 
            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 500
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Product</span>
        </button>
      </div>

     {/* Stats Cards - UPDATED WITHOUT CHANGE TEXT */}
<div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat, index) => (
    <div 
      key={index} 
      className={`p-6 border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] ${stat.color}`}
      style={{ borderColor: '#e5e7eb' }}
    >
      <p className="mb-2 text-sm font-medium" style={{ color: '#555555', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>{stat.label}</p>
      <p className="mb-2 text-2xl font-bold" style={{ 
        color: stat.label === 'Total Products' ? '#555555' : '#000000', 
        fontFamily: "'Metropolis', sans-serif", 
        fontWeight: 700 
      }}>
        {stat.value}
      </p>
    </div>
  ))}
</div>

      {/* Tabs - Enhanced with smooth animation */}
      <div className="mb-6">
        <div className="border-b" style={{ borderColor: '#bebebeff' }}>
          <nav className="flex -mb-px space-x-8">
            {[
              { id: 'all', name: 'All Products', count: allPublishedProducts.length },
              { id: 'published', name: 'Published', count: publishedProducts.length },
              { id: 'draft', name: 'Drafts', count: draftProducts.length },
              { id: 'low-stock', name: 'Low Stock', count: lowStockProducts.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 focus:outline-none ${
                  activeTab === tab.id
                    ? 'text-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ 
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  borderBottomColor: activeTab === tab.id ? '#bebebeff' : 'transparent'
                }}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 py-0.5 px-2 text-xs rounded-full transition-all duration-300" style={{ 
                    backgroundColor: activeTab === tab.id ? '#bebebeff' : '#555555',
                    color: activeTab === tab.id ? '#fff' : '#fff',
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500
                  }}>
                    {tab.count}
                  </span>
                )}
                {/* Animated underline */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-400 to-gray-500 animate-pulse"></span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Search and Filters - Enhanced */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products by name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 transition-all duration-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent hover:border-gray-400"
              style={{ 
                borderColor: '#d1d5db',
                color: '#000000',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400
              }}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#555555' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 transition-all duration-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent hover:border-gray-400"
          style={{ 
            borderColor: '#d1d5db',
            color: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 400
          }}
        >
          <option value="all">All Categories</option>
          {/* FIXED: Safely map over categories array */}
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map(category => (
              <option key={category._id || category.category_id} value={category.category_name || category.name}>
                {category.category_name || category.name}
              </option>
            ))
          ) : (
            <option value="" disabled>No categories available</option>
          )}
        </select>
        
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 transition-all duration-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent hover:border-gray-400"
          style={{ 
            borderColor: '#d1d5db',
            color: '#000000',
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 400
          }}
        >
          <option value="newest">Sort by: Newest</option>
          <option value="priceAsc">Sort by: Price (Low to High)</option>
          <option value="priceDesc">Sort by: Price (High to Low)</option>
          <option value="nameAsc">Sort by: Name (A-Z)</option>
          <option value="nameDesc">Sort by: Name (Z-A)</option>
        </select>
      </div>

      {/* Shop Filter */}
      {shops.length > 0 && (
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
            Filter by Shop
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedShop('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none ${
                selectedShop === 'all'
                  ? 'text-white'
                  : 'text-gray-700 hover:opacity-90'
              }`}
              style={{ 
                backgroundColor: selectedShop === 'all' ? '#27C840' : 'rgba(85, 85, 85, 0.1)',
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
              All Shops
            </button>
            {shops.map(shop => (
              <button
                key={shop._id}
                onClick={() => setSelectedShop(shop._id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 focus:outline-none ${
                  selectedShop === shop._id
                    ? 'text-white'
                    : 'text-gray-700 hover:opacity-90 hover:bg-gray-100'
                }`}
                style={{ 
                  backgroundColor: selectedShop === shop._id ? '#27C840' : 'rgba(85, 85, 85, 0.1)',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500
                }}
              >
                {shop.shopName}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-gray-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>Loading products...</p>
        </div>
      ) : (
        <>
          {/* Products Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
              Showing {filteredProducts.length} {activeTab === 'all' ? 'published' : activeTab} products
            </p>
          </div>

          {/* UPDATED: Product Grid with View Product Button */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                className="relative flex flex-col overflow-hidden transition-all duration-300 transform bg-white border rounded-lg cursor-pointer group hover:shadow-xl hover:-translate-y-1"
                style={{ 
                  borderColor: '#e5e7eb',
                  minHeight: '320px'
                }}
              >
                {/* Product Image Container - Fixed Size */}
                <div className="relative pt-[100%] bg-gradient-to-b from-gray-50 to-white">
                  <img
                    src={product.imagePath || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'}
                    alt={product.title}
                    className="absolute inset-0 object-contain w-full h-full p-3 transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Status Badge - Top Right with animation */}
                  <div className="absolute top-2 right-2">
                    {product.stockQuantity <= 10 && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white rounded-full animate-pulse" style={{ 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500,
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)'
                      }}>
                        Low Stock
                      </span>
                    )}
                  </div>
                  
                  {/* Draft Badge - Top Left */}
                  {product.status === 'draft' && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white rounded-full" style={{ 
                        background: 'linear-gradient(135deg, #555555 0%, #333333 100%)',
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500
                      }}>
                        Draft
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details - Fixed Height */}
                <div className="flex flex-col flex-1 p-3">
                  {/* Product Title - 2 lines max */}
                  <h3 
                    className="mb-1 text-sm font-medium transition-colors duration-300 line-clamp-2 group-hover:text-gray-600"
                    style={{ 
                      color: '#1f2937',
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                      minHeight: '2.5rem'
                    }}
                    title={product.title}
                  >
                    {product.title}
                  </h3>

                  {/* Category - Single line */}
                  <div className="mb-1">
                    <span className="text-xs transition-colors duration-300 group-hover:text-gray-700" style={{ color: '#6b7280', fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                      {displayCategory(product.category)}
                    </span>
                  </div>

                  {/* Price with glow effect */}
                  <div className="mt-auto">
                    <div className="flex items-center">
                      <span 
                        className="text-base font-bold transition-all duration-300 group-hover:text-gray-600 group-hover:scale-105"
                        style={{ 
                          color: '#000000',
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 700
                        }}
                      >
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </span>
                      {product.stockQuantity <= 10 && (
                        <span className="ml-2 text-xs font-medium text-red-600 animate-pulse">
                           Low
                        </span>
                      )}
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span style={{ color: '#6b7280' }}>
                        {product.sku ? `SKU: ${product.sku}` : ''}
                      </span>
                      <span className={`font-medium transition-colors duration-300 ${product.stockQuantity <= 10 ? 'text-red-600' : 'text-black'}`}>
                        {product.stockQuantity} left
                      </span>
                    </div>

                    {/* View Product Button - Always visible with gray animation */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="w-full px-3 py-2 mt-2 text-xs font-medium text-white transition-all duration-300 transform rounded-lg hover:scale-[1.02] hover:shadow-lg focus:outline-none active:scale-95"
                      style={{ 
                        background: 'black',
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500
              
                      }}
                    >
                      View Product
                    </button>
                  </div>
                </div>

                {/* gray glow effect on hover */}
                <div className="absolute inset-0 transition-opacity duration-300 rounded-lg opacity-0 pointer-events-none bg-gradient-to-r from-gray-500/5 to-emerald-500/5 group-hover:opacity-100"></div>
              </div>
            ))}
          </div>

          {/* Empty State - Enhanced */}
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center transition-all duration-300 animate-fade-in">
              <div className="relative inline-block mb-4">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-50 to-gray-100">
                  <svg className="w-10 h-10" fill="none" stroke="#555555" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-gray-200 rounded-full animate-ping opacity-20"></div>
              </div>
              <h3 className="mb-2 text-lg font-medium" style={{ color: '#000000', fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                {activeTab === 'draft' ? 'No draft products' : 
                 activeTab === 'low-stock' ? 'No low stock products' : 
                 activeTab === 'published' ? 'No published products' :
                 'No published products found'}
              </h3>
              <p className="max-w-md mx-auto mb-6 text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>
                {activeTab === 'draft' ? 'Get started by saving a product as draft.' : 
                 activeTab === 'low-stock' ? 'All products have sufficient stock.' : 
                 activeTab === 'published' ? 'No published products available.' :
                 'Get started by adding your first product.'}
              </p>
              <button 
                onClick={handleAddProduct}
                className="px-6 py-3 text-white transition-all duration-300 transform rounded-lg hover:scale-[1.02] hover:shadow-xl focus:outline-none"
                style={{ 
                  background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                Add New Product
              </button>
            </div>
          )}
        </>
      )}

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onEdit={() => navigate(`/update-product/${selectedProduct._id}`)}
          onDelete={() => handleDeleteProduct(selectedProduct._id, selectedProduct.title)}
          onPublish={() => handlePublishProduct(selectedProduct._id, selectedProduct.title)}
          onMoveToDraft={() => handleMoveToDraft(selectedProduct._id, selectedProduct.title)}
          loading={actionLoading[selectedProduct._id]}
        />
      )}

      {/* Add Metropolis font styles and custom animations */}
      <style jsx global>{`
        @import url('https://fonts.cdnfonts.com/css/metropolis');
        
        body {
          font-family: 'Metropolis', sans-serif;
        }
        
        /* Custom animations */
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(39, 200, 64, 0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(39, 200, 64, 0.4);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        /* Smooth transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        /* Line clamp utilities */
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        
        /* Custom focus styles */
        input:focus, select:focus, button:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </Layout>
  );
};

// export default Products;

// product model 
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

// export default ProductModal;