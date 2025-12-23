// pages/Dashboard.jsx - UPDATED WITH CURVED LINE GRAPHS
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import Layout from "../components/layout/Layout";
import { dashboardAPI } from "../services/dashboardAPI";

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

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return new Intl.NumberFormat("en-US").format(num);
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

// Custom Tooltip Component
// Updated CustomTooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(0,0,0,0.95)',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        fontFamily: "'Metropolis', sans-serif",
        backdropFilter: 'blur(4px)',
      }}>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          margin: '0 0 8px 0', 
          fontSize: '12px', 
          fontWeight: '600',
          textTransform: 'capitalize'
        }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '6px 0',
            gap: '8px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: entry.color,
            }} />
            <p style={{ 
              color: '#FFFFFF', 
              margin: '0', 
              fontSize: '14px', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ 
                color: 'rgba(255,255,255,0.7)',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {entry.name}:
              </span>
              <span>
                {entry.name === 'revenue' || entry.name === 'total' ? 
                  `${formatCurrency(entry.value)}` : 
                  `${entry.value} orders`}
              </span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
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

  // ✅ Format data for recharts
  const formatOrderChartData = useMemo(() => {
    if (!orderVolumeData.length) return [];
    
    return orderVolumeData.map(item => ({
      name: item.label || item.time,
      orders: item.orders,
      time: item.time,
      hour: item.hour,
      date: item.date
    }));
  }, [orderVolumeData]);

  const formatRevenueChartData = useMemo(() => {
    if (!revenueData.length) return [];
    
    return revenueData.map(item => ({
      name: item.label || item.time,
      revenue: item.revenue || 0,
      time: item.time,
      hour: item.hour,
      date: item.date
    }));
  }, [revenueData]);

  // ✅ Calculate chart max values
  const maxOrders = useMemo(() => {
    if (formatOrderChartData.length === 0) return 10;
    const max = Math.max(...formatOrderChartData.map(d => d.orders), 1);
    return Math.ceil(max / 5) * 5;
  }, [formatOrderChartData]);

  const maxRevenue = useMemo(() => {
    if (formatRevenueChartData.length === 0) return 1000;
    const max = Math.max(...formatRevenueChartData.map(d => d.revenue), 100);
    return Math.ceil(max / 500) * 500;
  }, [formatRevenueChartData]);

  // ✅ Single fetch function
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
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
      value: formatNumber(dashboardStats.totalOrders),
      change: "",
      changeType: "up",
      bgColor: "#e2e2e2ff",
      borderColor: "#bebebeff",
      accentColor: "#000000",
      icon: "📦",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardStats.totalRevenue),
      change: "",
      changeType: "up",
      bgColor: "#e2e2e2ff",
      borderColor: "#bebebeff",
      accentColor: "#000000",
      icon: "💰",
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
      icon: "⭐",
    }
  ], [dashboardStats]);

  // ✅ Memoized event handlers
  const handleOrderRangeChange = useCallback((range) => {
    setOrderChartRange(range);
  }, []);

  const handleRevenueRangeChange = useCallback((range) => {
    setRevenueChartRange(range);
  }, []);

  // ✅ Calculate totals for charts
  const orderChartTotal = formatOrderChartData.reduce((sum, d) => sum + d.orders, 0);
  const revenueChartTotal = formatRevenueChartData.reduce((sum, d) => sum + d.revenue, 0);
  const orderChartAvg = formatOrderChartData.length > 0 ? 
    (orderChartTotal / formatOrderChartData.length).toFixed(1) : 0;
  const revenueChartAvg = formatRevenueChartData.length > 0 ? 
    (revenueChartTotal / formatRevenueChartData.length).toFixed(2) : 0;

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
        <div className="p-6 mt-6 shadow-sm rounded-xl" style={{ 
          backgroundColor: "#000000", 
          borderColor: "#E5E7EB",
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)"
        }}>
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

      {/* Stats Grid - 6 Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="p-6 transition-all duration-300 rounded-xl hover:shadow-xl hover:-translate-y-1"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: stat.accentColor }}></div>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
                  {stat.title}
                </p>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <p className="text-3xl font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700, lineHeight: "1.1" }}>
                    {stat.value}
                    {stat.suffix && <span className="ml-1 text-lg" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}>{stat.suffix}</span>}
                  </p>
                </div>
                {stat.change && (
                  <div className="flex items-center">
                    <span className="flex items-center text-sm font-medium px-3 py-1.5 rounded-full bg-[#e2e2e2ff]" style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600, color: "#000000" }}>
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
        {/* Left Column - Order Volume Chart */}
        <div className="space-y-6">
          <div className="p-6 bg-white border rounded-xl" style={{ borderColor: "#E5E7EB" }}>
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
                      backgroundColor: orderChartRange === r ? "#000000" : "#FFFFFF",
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
              {formatOrderChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formatOrderChartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#555555"
                      style={{ fontFamily: "'Metropolis', sans-serif", fontSize: '12px' }}
                      tick={{ fill: '#555555' }}
                    />
                    <YAxis 
                      stroke="#555555"
                      style={{ fontFamily: "'Metropolis', sans-serif", fontSize: '12px' }}
                      tick={{ fill: '#555555' }}
                      domain={[0, maxOrders]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#000000"
                      strokeWidth={3}
                      dot={{ 
                        fill: "#000000", 
                        r: 4, 
                        strokeWidth: 2, 
                        stroke: "#FFFFFF" 
                      }}
                      activeDot={{ 
                        r: 6, 
                        fill: "#000000", 
                        stroke: "#FFFFFF", 
                        strokeWidth: 2 
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
                <p className="text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                  Total Orders ({orderChartRange})
                </p>
                <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {formatNumber(orderChartTotal)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                  Average per period
                </p>
                <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {orderChartAvg}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="p-6 bg-white border rounded-xl" style={{ borderColor: "#E5E7EB" }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "#000000" }}></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                Recent Orders
              </h3>
              <button 
                onClick={() => navigate("/orders")} 
                className="px-4 py-2 text-sm font-medium transition-all rounded-lg hover:bg-gray-100" 
                style={{ 
                  color: "#555555", 
                  backgroundColor: "#FFFFFF", 
                  border: "1px solid #E5E7EB", 
                  fontFamily: "'Metropolis', sans-serif", 
                  fontWeight: 500 
                }}
              >
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-4 transition-all duration-300 rounded-lg hover:shadow-md" 
                    style={{ 
                      border: "1px solid #E5E7EB", 
                      cursor: "pointer",
                      backgroundColor: "#FAFAFA"
                    }} 
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
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

        {/* Right Column - Revenue Chart */}
        <div className="space-y-6">
          <div className="p-6 bg-white border rounded-xl" style={{ borderColor: "#E5E7EB" }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "#000000" }}></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                Revenue Analytics
              </h3>
              <div className="flex items-center gap-1">
                {["day", "week", "month"].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRevenueRangeChange(r)}
                    className={`px-4 py-2 text-sm rounded-lg capitalize transition-all ${revenueChartRange === r ? "text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}`}
                    style={{
                      backgroundColor: revenueChartRange === r ? "#000000" : "#FFFFFF",
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
              {formatRevenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={formatRevenueChartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000000" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#555555"
                      style={{ fontFamily: "'Metropolis', sans-serif", fontSize: '12px' }}
                      tick={{ fill: '#555555' }}
                    />
                    <YAxis 
                      stroke="#555555"
                      style={{ fontFamily: "'Metropolis', sans-serif", fontSize: '12px' }}
                      tick={{ fill: '#555555' }}
                      domain={[0, maxRevenue]}
                      tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#000000"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      dot={{ 
                        fill: "#000000", 
                        r: 4, 
                        strokeWidth: 2, 
                        stroke: "#FFFFFF" 
                      }}
                      activeDot={{ 
                        r: 6, 
                        fill: "#000000", 
                        stroke: "#FFFFFF", 
                        strokeWidth: 2 
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
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
                <p className="text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                  Total Revenue ({revenueChartRange})
                </p>
                <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {formatCurrency(revenueChartTotal)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: "#555555", fontFamily: "'Metropolis', sans-serif" }}>
                  Average per period
                </p>
                <p className="text-lg font-bold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 700 }}>
                  {formatCurrency(revenueChartAvg)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="p-6 bg-white border rounded-xl" style={{ borderColor: "#E5E7EB" }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "#000000" }}></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 600 }}>
                Top Selling Products
              </h3>
              <button 
                onClick={() => navigate("/products")} 
                className="px-4 py-2 text-sm font-medium transition-all rounded-lg hover:bg-gray-100" 
                style={{ 
                  color: "#555555", 
                  backgroundColor: "#FFFFFF", 
                  border: "1px solid #E5E7EB", 
                  fontFamily: "'Metropolis', sans-serif", 
                  fontWeight: 500 
                }}
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between p-4 transition-all duration-300 rounded-lg hover:shadow-md" 
                    style={{ 
                      border: "1px solid #E5E7EB", 
                      cursor: "pointer", 
                      backgroundColor: index % 2 === 0 ? "#FAFAFA" : "#FFFFFF" 
                    }} 
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 mr-4 rounded-lg" style={{ 
                        backgroundColor: index < 3 ? "#000000" : "#555555", 
                        color: "#FFFFFF" 
                      }}>
                        <span style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 600, fontSize: "14px" }}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="mb-1 font-medium" style={{ color: "#000000", fontFamily: "'Metropolis', sans-serif", fontWeight: 500 }}>
                          {product.name}
                        </p>
                        <div className="flex items-center">
                          <span className="px-2 py-1 text-xs rounded" style={{ 
                            backgroundColor: index < 3 ? "#e2e2e2ff" : "#e2e2e2ff", 
                            color: index < 3 ? "#000000" : "#101010", 
                            fontFamily: "'Metropolis', sans-serif", 
                            fontWeight: 500 
                          }}>
                            {product.sales} sold
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 font-bold" style={{ 
                        color: "#000000", 
                        fontFamily: "'Metropolis', sans-serif", 
                        fontWeight: 700, 
                        fontSize: "18px" 
                      }}>
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

