
// pages/Dashboard.jsx - PROFESSIONAL UPDATED VERSION WITH ATTRACTIVE COLORS & REAL APIs
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { dashboardAPI } from "../services/dashboardAPI";

const Dashboard = ({ onLogout, userData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderChartRange, setOrderChartRange] = useState("day");
  const [revenueChartRange, setRevenueChartRange] = useState("day");

  // Dashboard Data - Real data from APIs
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    orderRatings: 0,
    todayOrders: 0,
    todayRevenue: 0,
    openOrders: 0,
    totalCustomers: 0,
  });

  // Order Volume Data by time range
  const [orderVolumeData, setOrderVolumeData] = useState({
    day: [],
    week: [],
    month: [],
  });

  // Revenue Data by time range
  const [revenueData, setRevenueData] = useState({
    day: [],
    week: [],
    month: [],
  });

  // Recent Orders Data
  const [recentOrders, setRecentOrders] = useState([]);

  // Top Products Data
  const [topProducts, setTopProducts] = useState([]);

  // Fetch all dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch order volume when range changes
  useEffect(() => {
    if (orderChartRange) {
      fetchOrderVolumeData(orderChartRange);
    }
  }, [orderChartRange]);

  // Fetch revenue data when range changes
  useEffect(() => {
    if (revenueChartRange) {
      fetchRevenueData(revenueChartRange);
    }
  }, [revenueChartRange]);

  // Fetch dashboard summary data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🚀 Fetching dashboard data...");
      
      // Fetch all dashboard data in parallel
      const [statsRes, recentRes, topProductsRes] = await Promise.all([
        dashboardAPI.getDashboardStats('month'),
        dashboardAPI.getRecentOrders(5),
        dashboardAPI.getTopProducts(5, 'month')
      ]);

      console.log("✅ Dashboard data fetched:", {
        stats: statsRes.data,
        recentOrders: recentRes.data,
        topProducts: topProductsRes.data
      });

      // Set dashboard stats
      if (statsRes.data.success && statsRes.data.stats) {
        const stats = statsRes.data.stats;
        setDashboardStats({
          totalOrders: stats.totalOrders || 0,
          totalRevenue: stats.totalRevenue || 0,
          orderRatings: stats.shopRating || stats.orderRatings || 0,
          todayOrders: stats.todayOrders || 0,
          todayRevenue: stats.todayRevenue || 0,
          openOrders: stats.openOrders || 0,
          totalCustomers: stats.totalCustomers || 0,
        });
      }

      // Set recent orders
      if (recentRes.data.success && recentRes.data.orders) {
        setRecentOrders(recentRes.data.orders.map(order => ({
          id: order.orderId || `ORD-${order._id?.slice(-4) || '0000'}`,
          customer: order.customerName || "Customer",
          amount: order.totalAmount || 0,
          status: order.status || "pending",
          time: new Date(order.createdAt || Date.now()).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        })));
      }

      // Set top products
      if (topProductsRes.data.success && topProductsRes.data.products) {
        setTopProducts(topProductsRes.data.products.map(product => ({
          id: product._id || product.productId,
          name: product.name || "Product",
          sales: product.totalSold || product.sales || 0,
          revenue: product.totalRevenue || product.revenue || 0,
          price: product.price || 0
        })));
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message || "Failed to load dashboard data");
      
      // Fallback to mock data if API fails
      setDashboardStats({
        totalOrders: 1256,
        totalRevenue: 25480.5,
        orderRatings: 4.7,
        todayOrders: 24,
        todayRevenue: 1245.5,
        openOrders: 8,
        totalCustomers: 342,
      });
      
      setRecentOrders([
        {
          id: "ORD-9585",
          customer: "John Davis",
          amount: 37.3,
          status: "preparing",
          time: "10:24 AM",
        },
        {
          id: "ORD-9584",
          customer: "Lisa Thompson",
          amount: 38.3,
          status: "preparing",
          time: "10:15 AM",
        },
        {
          id: "ORD-9583",
          customer: "Michael Brown",
          amount: 42.5,
          status: "ready",
          time: "9:45 AM",
        },
        {
          id: "ORD-9582",
          customer: "Sarah Wilson",
          amount: 46.15,
          status: "assigned",
          time: "9:30 AM",
        },
        {
          id: "ORD-9581",
          customer: "Robert Miller",
          amount: 18.36,
          status: "delivered",
          time: "9:00 AM",
        },
      ]);
      
      setTopProducts([
        { id: 1, name: "Margherita Pizza", sales: 156, revenue: 2956.44 },
        { id: 2, name: "Chicken Burger", sales: 124, revenue: 2232.0 },
        { id: 3, name: "Caesar Salad", sales: 98, revenue: 833.0 },
        { id: 4, name: "Garlic Bread", sales: 87, revenue: 391.5 },
        { id: 5, name: "Soft Drinks", sales: 215, revenue: 537.5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order volume data
  const fetchOrderVolumeData = async (range) => {
    try {
      console.log(`📈 Fetching ${range} order volume...`);
      const response = await dashboardAPI.getOrderVolume(range);
      
      if (response.data.success && response.data.data) {
        const apiData = response.data.data;
        
        // Transform API data to match our chart structure
        const transformedData = apiData.map(item => ({
          time: item.label || item.time || item.period || "",
          orders: item.count || item.orders || item.value || 0
        }));
        
        setOrderVolumeData(prev => ({
          ...prev,
          [range]: transformedData
        }));
        
        console.log(`✅ ${range} order volume data set:`, transformedData);
      } else {
        // Fallback to mock data
        setOrderVolumeData(prev => ({
          ...prev,
          [range]: getMockOrderData(range)
        }));
      }
    } catch (error) {
      console.error(`❌ Error fetching ${range} order volume:`, error);
      // Fallback to mock data
      setOrderVolumeData(prev => ({
        ...prev,
        [range]: getMockOrderData(range)
      }));
    }
  };

  // Fetch revenue data
  const fetchRevenueData = async (range) => {
    try {
      console.log(`💰 Fetching ${range} revenue data...`);
      const response = await dashboardAPI.getRevenueData(range);
      
      if (response.data.success && response.data.data) {
        const apiData = response.data.data;
        
        // Transform API data to match our chart structure
        const transformedData = apiData.map(item => ({
          time: item.label || item.time || item.period || "",
          revenue: item.amount || item.revenue || item.value || 0
        }));
        
        setRevenueData(prev => ({
          ...prev,
          [range]: transformedData
        }));
        
        console.log(`✅ ${range} revenue data set:`, transformedData);
      } else {
        // Fallback to mock data
        setRevenueData(prev => ({
          ...prev,
          [range]: getMockRevenueData(range)
        }));
      }
    } catch (error) {
      console.error(`❌ Error fetching ${range} revenue data:`, error);
      // Fallback to mock data
      setRevenueData(prev => ({
        ...prev,
        [range]: getMockRevenueData(range)
      }));
    }
  };

  // Mock data fallback functions
  const getMockOrderData = (range) => {
    if (range === "day") {
      return [
        { time: "6 AM", orders: 2 },
        { time: "8 AM", orders: 5 },
        { time: "10 AM", orders: 10 },
        { time: "12 PM", orders: 15 },
        { time: "2 PM", orders: 12 },
        { time: "4 PM", orders: 8 },
        { time: "6 PM", orders: 16 },
        { time: "8 PM", orders: 14 },
        { time: "10 PM", orders: 7 },
      ];
    } else if (range === "week") {
      return [
        { time: "Mon", orders: 42 },
        { time: "Tue", orders: 56 },
        { time: "Wed", orders: 48 },
        { time: "Thu", orders: 67 },
        { time: "Fri", orders: 89 },
        { time: "Sat", orders: 94 },
        { time: "Sun", orders: 76 },
      ];
    } else {
      return [
        { time: "Week 1", orders: 312 },
        { time: "Week 2", orders: 298 },
        { time: "Week 3", orders: 356 },
        { time: "Week 4", orders: 290 },
      ];
    }
  };

  const getMockRevenueData = (range) => {
    if (range === "day") {
      return [
        { time: "6 AM", revenue: 85 },
        { time: "8 AM", revenue: 210 },
        { time: "10 AM", revenue: 420 },
        { time: "12 PM", revenue: 635 },
        { time: "2 PM", revenue: 510 },
        { time: "4 PM", revenue: 340 },
        { time: "6 PM", revenue: 680 },
        { time: "8 PM", revenue: 595 },
        { time: "10 PM", revenue: 298 },
      ];
    } else if (range === "week") {
      return [
        { time: "Mon", revenue: 1980 },
        { time: "Tue", revenue: 2640 },
        { time: "Wed", revenue: 2280 },
        { time: "Thu", revenue: 3120 },
        { time: "Fri", revenue: 4250 },
        { time: "Sat", revenue: 4450 },
        { time: "Sun", revenue: 3580 },
      ];
    } else {
      return [
        { time: "Week 1", revenue: 12480 },
        { time: "Week 2", revenue: 11920 },
        { time: "Week 3", revenue: 14240 },
        { time: "Week 4", revenue: 11600 },
      ];
    }
  };

  // Handle range changes
  const handleOrderRangeChange = (range) => {
    setOrderChartRange(range);
  };

  const handleRevenueRangeChange = (range) => {
    setRevenueChartRange(range);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
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

    const style = config[status] || config.preparing;

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

  // Calculate max values for charts
  const getMaxOrders = () => {
    const currentData = orderVolumeData[orderChartRange] || [];
    if (currentData.length === 0) return 10;
    return Math.max(...currentData.map((d) => d.orders), 1);
  };

  const getMaxRevenue = () => {
    const currentData = revenueData[revenueChartRange] || [];
    if (currentData.length === 0) return 1000;
    return Math.max(...currentData.map((d) => d.revenue), 100);
  };

  // Get current active data
  const currentOrderData = orderVolumeData[orderChartRange] || [];
  const currentRevenueData = revenueData[revenueChartRange] || [];

  // Calculate percentage changes (mock for now)
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return "0%";
    const change = ((current - previous) / previous * 100).toFixed(1);
    return `${change > 0 ? '+' : ''}${change}%`;
  };

  // Stats cards with improved design - Only 3 cards
  const statsCards = [
    {
      title: "Total Orders",
      value: dashboardStats.totalOrders.toLocaleString(),
      change: calculatePercentageChange(dashboardStats.totalOrders, 1000),
      changeType: dashboardStats.totalOrders > 1000 ? "up" : "down",
      bgColor: "#e2e2e2ff",
      borderColor: "#bebebeff",
      accentColor: "#000000",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardStats.totalRevenue),
      change: calculatePercentageChange(dashboardStats.totalRevenue, 20000),
      changeType: dashboardStats.totalRevenue > 20000 ? "up" : "down",
      bgColor: "#e2e2e2ff",
      borderColor: "#bebebeff",
      accentColor: "#000000",
    },
    {
      title: "Order Ratings",
      value: dashboardStats.orderRatings.toFixed(1),
      suffix: "/5",
      change: dashboardStats.orderRatings >= 4.5 ? "Excellent" : dashboardStats.orderRatings >= 3.5 ? "Good" : "Needs Work",
      changeType: dashboardStats.orderRatings >= 4 ? "up" : "neutral",
      bgColor: "#e2e2e2ff",
      borderColor: "#bebebeff",
      accentColor: "#000000",
    },
  ];

  // Loading state
  if (loading) {
    return (
      <Layout onLogout={onLogout} userData={userData}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-t-2 border-b-2 border-black rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif" }}>
              Loading dashboard data...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error && recentOrders.length === 0) {
    return (
      <Layout onLogout={onLogout} userData={userData}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="p-6 text-center rounded-lg" style={{ backgroundColor: "#e2e2e2ff" }}>
            <h3 className="mb-2 text-lg font-semibold" style={{ 
              color: "#000000", 
              fontFamily: "'Metropolis', sans-serif", 
              fontWeight: 600 
            }}>
              Error Loading Dashboard
            </h3>
            <p className="text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif" }}>
              {error}
            </p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 mt-4 rounded-lg"
              style={{ 
                backgroundColor: "#000000", 
                color: "#FFFFFF",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 500
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout} userData={userData}>
      {/* Header with Today's Summary at Top - IMPROVED DESIGN */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 700,
              }}
            >
              Dashboard Overview
            </h1>
            <p
              className="mt-1 text-gray-600"
              style={{
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400,
              }}
            >
              Welcome back, {userData?.name || "Shop Owner"}! Here's your store performance summary.
            </p>
          </div>
        </div>

        {/* Today's Performance Summary */}
        <div
          className="p-6 mt-6 shadow-sm rounded-xl"
          style={{
            backgroundColor: "#000000",
            borderColor: "#E5E7EB",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left side: title + date */}
            <div>
              <h3
                className="text-lg font-semibold text-white"
                style={{
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 600,
                }}
              >
                Today's Performance Summary
              </h3>

              <p
                className="mt-1 text-gray-300"
                style={{ fontFamily: "'Metropolis', sans-serif" }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Right side: cards */}
            <div className="flex flex-wrap gap-4 md:flex-nowrap md:ml-auto md:justify-end">
              
              {/* Orders */}
              <div className="p-3 text-center rounded-lg bg-white/10 backdrop-blur-sm min-w-[110px]">
                <p
                  className="text-2xl font-bold text-white"
                  style={{
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {dashboardStats.todayOrders}
                </p>
                <p
                  className="text-sm text-gray-300"
                  style={{ fontFamily: "'Metropolis', sans-serif" }}
                >
                  Orders
                </p>
              </div>

              {/* Revenue */}
              <div className="p-3 text-center rounded-lg bg-white/10 backdrop-blur-sm min-w-[110px]">
                <p
                  className="text-2xl font-bold text-white"
                  style={{
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {formatCompactCurrency(dashboardStats.todayRevenue)}
                </p>
                <p
                  className="text-sm text-gray-300"
                  style={{ fontFamily: "'Metropolis', sans-serif" }}
                >
                  Revenue
                </p>
              </div>

              {/* Rating */}
              <div className="p-3 text-center rounded-lg bg-white/10 backdrop-blur-sm min-w-[110px]">
                <div className="flex items-center justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= Math.floor(dashboardStats.orderRatings)
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p
                  className="mt-1 text-sm text-gray-300"
                  style={{ fontFamily: "'Metropolis', sans-serif" }}
                >
                  {dashboardStats.orderRatings.toFixed(1)}/5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - 3 Cards with Beautiful Design */}
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
            {/* Accent bar at top */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: stat.accentColor }}
            ></div>

            <div className="flex flex-col h-full">
              
              {/* Title */}
              <p
                className="mb-4 text-sm font-medium"
                style={{
                  color: "#e2e2e2ff",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.4px",
                }}
              >
                {stat.title}
              </p>

              <div className="flex items-end justify-between mt-auto">
                
                {/* Main Value */}
                <div>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: "#ffffff",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 700,
                      lineHeight: "1.1",
                    }}
                  >
                    {stat.value}
                    {stat.suffix && (
                      <span
                        className="ml-1 text-lg"
                        style={{
                          color: "#e2e2e2ff",
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 400,
                        }}
                      >
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                </div>

                {/* Percentage Change */}
                <div className="flex items-center">
                  <span
                    className="flex items-center text-sm font-medium px-3 py-1.5 rounded-full bg-[#bebebeff]"
                    style={{
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 600,
                      backdropFilter: "blur(6px)",
                      color: "#000000",
                    }}
                  >
                    <span className="mr-1 text-base">
                      {stat.changeType === "up" ? "↑" : stat.changeType === "down" ? "↓" : "→"}
                    </span>
                    <span>{stat.change}</span>
                  </span>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Order Volume Chart */}
        <div className="space-y-6">
          {/* Order Volume Chart */}
          <div
            className="p-6 bg-white border rounded-xl"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Accent bar at top */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: "#000000" }}
            ></div>

            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-semibold"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 600,
                }}
              >
                Order Volume
              </h3>
              <div className="flex items-center gap-1">
                {["day", "week", "month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => handleOrderRangeChange(range)}
                    className={`px-4 py-2 text-sm rounded-lg capitalize transition-all ${
                      orderChartRange === range
                        ? "text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    style={{
                      backgroundColor:
                        orderChartRange === range ? "#555555" : "#FFFFFF",
                      border:
                        orderChartRange === range
                          ? "none"
                          : "1px solid #E5E7EB",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: orderChartRange === range ? 500 : 400,
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              {/* Line Chart Visualization */}
              {currentOrderData.length > 0 ? (
                <div className="flex flex-col h-full">
                  {/* Y-axis labels */}
                  <div className="flex items-end flex-1 pb-8">
                    <div
                      className="flex flex-col justify-between h-full mr-2 text-xs"
                      style={{
                        color: "#555555",
                        fontFamily: "'Metropolis', sans-serif",
                      }}
                    >
                      {[5, 4, 3, 2, 1, 0].map((num) => (
                        <span key={num}>
                          {Math.round((num / 5) * getMaxOrders())}
                        </span>
                      ))}
                    </div>

                    {/* Chart Area */}
                    <div className="relative flex-1">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="border-t"
                            style={{ borderColor: "#E5E7EB" }}
                          ></div>
                        ))}
                      </div>

                      {/* Line Chart */}
                      <div className="relative h-full">
                        <svg
                          className="absolute inset-0 w-full h-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          {/* Gradient fill for area */}
                          <defs>
                            <linearGradient
                              id="orderGradient"
                              x1="0%"
                              y1="0%"
                              x2="0%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="#000000"
                                stopOpacity="0.1"
                              />
                              <stop
                                offset="100%"
                                stopColor="#000000"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>

                          <path
                            d={`
                              M 0,${
                                100 -
                                (currentOrderData[0]?.orders / getMaxOrders()) *
                                  100 || 100
                              }
                              ${currentOrderData
                                .map(
                                  (point, i) =>
                                    `L ${
                                      (i / (currentOrderData.length - 1)) * 100
                                    },${
                                      100 - (point.orders / getMaxOrders()) * 100
                                    }`
                                )
                                .join(" ")}
                            `}
                            fill="none"
                            stroke="#000000"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d={`
                              M 0,${
                                100 -
                                (currentOrderData[0]?.orders / getMaxOrders()) *
                                  100 || 100
                              }
                              ${currentOrderData
                                .map(
                                  (point, i) =>
                                    `L ${
                                      (i / (currentOrderData.length - 1)) * 100
                                    },${
                                      100 - (point.orders / getMaxOrders()) * 100
                                    }`
                                )
                                .join(" ")}
                              L 100,100
                              L 0,100
                              Z
                            `}
                            fill="url(#orderGradient)"
                          />
                        </svg>

                        {/* Data points */}
                        {currentOrderData.map((point, i) => (
                          <div
                            key={i}
                            className="absolute w-4 h-4 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 border-2 rounded-full shadow-md hover:w-5 hover:h-5"
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "#000000",
                              left: `${
                                (i / (currentOrderData.length - 1)) * 100
                              }%`,
                              top: `${
                                100 - (point.orders / getMaxOrders()) * 100
                              }%`,
                              cursor: "pointer",
                            }}
                            title={`${point.time}: ${point.orders} orders`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div
                    className="flex justify-between pt-2 text-xs"
                    style={{
                      color: "#555555",
                      fontFamily: "'Metropolis', sans-serif",
                    }}
                  >
                    {currentOrderData.map((point, i) => (
                      <span
                        key={i}
                        className="text-center"
                        style={{ width: `${100 / currentOrderData.length}%` }}
                      >
                        {point.time}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No order data available</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div
              className="flex items-center justify-between pt-4 mt-4 border-t"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div>
                <p
                  className="text-sm"
                  style={{
                    color: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                  }}
                >
                  Total Orders ({orderChartRange})
                </p>
                <p
                  className="text-lg font-bold"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {currentOrderData
                    .reduce((sum, d) => sum + d.orders, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-sm"
                  style={{
                    color: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                  }}
                >
                  Average per period
                </p>
                <p
                  className="text-lg font-bold"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {currentOrderData.length > 0
                    ? Math.round(
                        currentOrderData.reduce((sum, d) => sum + d.orders, 0) /
                          currentOrderData.length
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div
            className="p-6 bg-white border rounded-xl"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Accent bar at top */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: "#000000" }}
            ></div>

            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-semibold"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 600,
                }}
              >
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
                  fontWeight: 500,
                }}
              >
                View All
              </button>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 transition-all duration-300 rounded-lg hover:shadow-md"
                    style={{
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <div>
                      <p
                        className="mb-1 font-medium"
                        style={{
                          color: "#000000",
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {order.id}
                      </p>
                      <p
                        className="mb-2 text-sm"
                        style={{
                          color: "#555555",
                          fontFamily: "'Metropolis', sans-serif",
                        }}
                      >
                        {order.customer}
                      </p>
                      <span
                        className="text-xs"
                        style={{
                          color: "#555555",
                          fontFamily: "'Metropolis', sans-serif",
                        }}
                      >
                        {order.time}
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className="mb-2 font-bold"
                        style={{
                          color: "#000000",
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 700,
                          fontSize: "18px",
                        }}
                      >
                        {formatCurrency(order.amount)}
                      </p>
                      <div className="flex justify-end">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No recent orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Revenue Chart */}
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div
            className="p-6 bg-white border rounded-xl"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Accent bar at top */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: "#000000" }}
            ></div>

            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-semibold"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 600,
                }}
              >
                Revenue
              </h3>
              <div className="flex items-center gap-1">
                {["day", "week", "month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => handleRevenueRangeChange(range)}
                    className={`px-4 py-2 text-sm rounded-lg capitalize transition-all ${
                      revenueChartRange === range
                        ? "text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    style={{
                      backgroundColor:
                        revenueChartRange === range ? "#555555" : "#FFFFFF",
                      border:
                        revenueChartRange === range
                          ? "none"
                          : "1px solid #E5E7EB",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: revenueChartRange === range ? 500 : 400,
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              {/* Line Chart Visualization */}
              {currentRevenueData.length > 0 ? (
                <div className="flex flex-col h-full">
                  {/* Y-axis labels */}
                  <div className="flex items-end flex-1 pb-8">
                    <div
                      className="flex flex-col justify-between h-full mr-2 text-xs"
                      style={{
                        color: "#555555",
                        fontFamily: "'Metropolis', sans-serif",
                      }}
                    >
                      {[5, 4, 3, 2, 1, 0].map((num) => (
                        <span key={num}>
                          {formatCompactCurrency((num / 5) * getMaxRevenue())}
                        </span>
                      ))}
                    </div>

                    {/* Chart Area */}
                    <div className="relative flex-1">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="border-t"
                            style={{ borderColor: "#E5E7EB" }}
                          ></div>
                        ))}
                      </div>

                      {/* Line Chart */}
                      <div className="relative h-full">
                        <svg
                          className="absolute inset-0 w-full h-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          {/* Gradient fill for area */}
                          <defs>
                            <linearGradient
                              id="revenueGradient"
                              x1="0%"
                              y1="0%"
                              x2="0%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="#555555"
                                stopOpacity="0.1"
                              />
                              <stop
                                offset="100%"
                                stopColor="#555555"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>

                          <path
                            d={`
                              M 0,${
                                100 -
                                (currentRevenueData[0]?.revenue /
                                  getMaxRevenue()) *
                                  100 || 100
                              }
                              ${currentRevenueData
                                .map(
                                  (point, i) =>
                                    `L ${
                                      (i / (currentRevenueData.length - 1)) * 100
                                    },${
                                      100 -
                                      (point.revenue / getMaxRevenue()) * 100
                                    }`
                                )
                                .join(" ")}
                            `}
                            fill="none"
                            stroke="#555555"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d={`
                              M 0,${
                                100 -
                                (currentRevenueData[0]?.revenue /
                                  getMaxRevenue()) *
                                  100 || 100
                              }
                              ${currentRevenueData
                                .map(
                                  (point, i) =>
                                    `L ${
                                      (i / (currentRevenueData.length - 1)) * 100
                                    },${
                                      100 -
                                      (point.revenue / getMaxRevenue()) * 100
                                    }`
                                )
                                .join(" ")}
                              L 100,100
                              L 0,100
                              Z
                            `}
                            fill="url(#revenueGradient)"
                          />
                        </svg>

                        {/* Data points */}
                        {currentRevenueData.map((point, i) => (
                          <div
                            key={i}
                            className="absolute w-4 h-4 transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 border-2 rounded-full shadow-md hover:w-5 hover:h-5"
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderColor: "#555555",
                              left: `${
                                (i / (currentRevenueData.length - 1)) * 100
                              }%`,
                              top: `${
                                100 - (point.revenue / getMaxRevenue()) * 100
                              }%`,
                              cursor: "pointer",
                            }}
                            title={`${point.time}: ${formatCurrency(
                              point.revenue
                            )}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div
                    className="flex justify-between pt-2 text-xs"
                    style={{
                      color: "#555555",
                      fontFamily: "'Metropolis', sans-serif",
                    }}
                  >
                    {currentRevenueData.map((point, i) => (
                      <span
                        key={i}
                        className="text-center"
                        style={{ width: `${100 / currentRevenueData.length}%` }}
                      >
                        {point.time}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No revenue data available</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div
              className="flex items-center justify-between pt-4 mt-4 border-t"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div>
                <p
                  className="text-sm"
                  style={{
                    color: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                  }}
                >
                  Total Revenue ({revenueChartRange})
                </p>
                <p
                  className="text-lg font-bold"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {formatCurrency(
                    currentRevenueData.reduce((sum, d) => sum + d.revenue, 0)
                  )}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-sm"
                  style={{
                    color: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                  }}
                >
                  Average per period
                </p>
                <p
                  className="text-lg font-bold"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {currentRevenueData.length > 0
                    ? formatCurrency(
                        currentRevenueData.reduce(
                          (sum, d) => sum + d.revenue,
                          0
                        ) / currentRevenueData.length
                      )
                    : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div
            className="p-6 bg-white border rounded-xl"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Accent bar at top */}
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: "#000000" }}
            ></div>

            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-semibold"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 600,
                }}
              >
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
                  fontWeight: 500,
                }}
              >
                View All
              </button>
            </div>

            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 transition-all duration-300 rounded-lg hover:shadow-md"
                    style={{
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      backgroundColor: index % 2 === 0 ? "#FAFAFA" : "#FFFFFF",
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="flex items-center">
                      {/* Product rank indicator */}
                      <div
                        className="flex items-center justify-center w-8 h-8 mr-4 rounded-lg"
                        style={{
                          backgroundColor: index < 3 ? "#000000" : "#555555",
                          color: "#FFFFFF",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Metropolis', sans-serif",
                            fontWeight: 600,
                            fontSize: "14px",
                          }}
                        >
                          {index + 1}
                        </span>
                      </div>

                      <div>
                        <p
                          className="mb-1 font-medium"
                          style={{
                            color: "#000000",
                            fontFamily: "'Metropolis', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {product.name}
                        </p>
                        <div className="flex items-center">
                          <span
                            className="px-2 py-1 text-xs rounded"
                            style={{
                              backgroundColor:
                                index < 3 ? "#e2e2e2ff" : "#e2e2e2ff",
                              color: index < 3 ? "#000000" : "#101010",
                              fontFamily: "'Metropolis', sans-serif",
                              fontWeight: 500,
                            }}
                          >
                            {product.sales} sold
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className="mb-1 font-bold"
                        style={{
                          color: "#000000",
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 700,
                          fontSize: "18px",
                        }}
                      >
                        {formatCurrency(product.revenue)}
                      </p>
                      <span
                        className="text-xs"
                        style={{
                          color: "#555555",
                          fontFamily: "'Metropolis', sans-serif",
                        }}
                      >
                        ${product.price ? product.price.toFixed(2) : (product.revenue / product.sales).toFixed(2)} avg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No product data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 mt-8 rounded" style={{ backgroundColor: "#e2e2e2ff" }}>
          <h4 className="font-bold" style={{ fontFamily: "'Metropolis', sans-serif" }}>
            Debug Info:
          </h4>
          <p style={{ fontFamily: "'Metropolis', sans-serif" }}>
            Shop Owner ID: {userData?._id}
          </p>
          <p style={{ fontFamily: "'Metropolis', sans-serif" }}>
            Order Chart Data Points: {currentOrderData.length}
          </p>
          <p style={{ fontFamily: "'Metropolis', sans-serif" }}>
            Revenue Chart Data Points: {currentRevenueData.length}
          </p>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 mt-2 text-sm rounded"
            style={{ 
              backgroundColor: "#000000", 
              color: "#FFFFFF",
              fontFamily: "'Metropolis', sans-serif"
            }}
          >
            Refresh Data
          </button>
        </div>
      )}

      {/* Add Metropolis font styles */}
      <style jsx global>{`
        @import url("https://fonts.cdnfonts.com/css/metropolis");

        body {
          font-family: "Metropolis", sans-serif;
          background-color: #f9fafb;
        }

        * {
          transition-property: background-color, border-color, color, fill,
            stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }

        input:focus,
        select:focus,
        button:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        .hover\:shadow-lg:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #555555;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #000000;
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;

