// pages/Dashboard.jsx - OPTIMIZED FAST LOADING VERSION
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { dashboardAPI } from "../services/dashboardAPI";

const Dashboard = ({ onLogout, userData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default to week for better data visualization
  const [orderChartRange, setOrderChartRange] = useState("week");
  const [revenueChartRange, setRevenueChartRange] = useState("week");

  // Dashboard Data with initial values
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    shopRating: 5.0,
    todayOrders: 0,
    todayRevenue: 0,
    openOrders: 0,
    totalCustomers: 0,
  });

  // Chart Data
  const [orderVolumeData, setOrderVolumeData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

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

  // Optimized data fetching with Promise.all for parallel loading
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.time("DashboardDataLoad");
      
      // Fetch ALL data in parallel for maximum speed
      const [statsRes, recentRes, orderVolumeRes, revenueRes, topProductsRes] = await Promise.all([
        dashboardAPI.getDashboardStats('month'),
        dashboardAPI.getRecentOrders(5),
        dashboardAPI.getOrderVolume(orderChartRange),
        dashboardAPI.getRevenueData(revenueChartRange),
        dashboardAPI.getTopProducts(5, 'month')
      ]);

      console.timeEnd("DashboardDataLoad");
      
      // Process stats data
      if (statsRes.data.success && statsRes.data.stats) {
        const stats = statsRes.data.stats;
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
      if (recentRes.data.success && recentRes.data.orders) {
        const orders = recentRes.data.orders;
        setRecentOrders(orders.map(order => ({
          id: order.id || order.orderId || `ORD-${Math.random().toString(36).substr(2, 4)}`,
          customer: order.customer || order.customerName || "Customer",
          amount: order.amount || order.total || 0,
          status: order.status || "pending",
          time: order.time || new Date(order.createdAt || Date.now()).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })
        })));
      }

      // Process order volume data
      if (orderVolumeRes.data.success && orderVolumeRes.data.data) {
        setOrderVolumeData(orderVolumeRes.data.data);
      }

      // Process revenue data
      if (revenueRes.data.success && revenueRes.data.data) {
        setRevenueData(revenueRes.data.data);
      }

      // Process top products
      if (topProductsRes.data.success && topProductsRes.data.products) {
        const products = topProductsRes.data.products;
        setTopProducts(products.map(product => ({
          id: product._id || product.productId,
          name: product.name || product.title || "Product",
          sales: product.sales || product.totalSold || 0,
          revenue: product.revenue || product.totalRevenue || 0,
          price: product.price || 0
        })));
      }

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [orderChartRange, revenueChartRange]);

  // Fetch chart data when range changes
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [orderRes, revenueRes] = await Promise.all([
          dashboardAPI.getOrderVolume(orderChartRange),
          dashboardAPI.getRevenueData(revenueChartRange)
        ]);
        
        if (orderRes.data.success && orderRes.data.data) {
          setOrderVolumeData(orderRes.data.data);
        }
        
        if (revenueRes.data.success && revenueRes.data.data) {
          setRevenueData(revenueRes.data.data);
        }
      } catch (error) {
        console.warn('Chart data fetch warning:', error);
      }
    };
    
    fetchChartData();
  }, [orderChartRange, revenueChartRange]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Chart calculation functions
  const getMaxOrders = () => {
    if (orderVolumeData.length === 0) return 10;
    const max = Math.max(...orderVolumeData.map((d) => d.orders), 1);
    return Math.ceil(max / 5) * 5;
  };

  const getMaxRevenue = () => {
    if (revenueData.length === 0) return 1000;
    const max = Math.max(...revenueData.map((d) => d.revenue), 100);
    return Math.ceil(max / 500) * 500;
  };

  // Calculate chart points
  const calculateOrderChartPoints = () => {
    if (orderVolumeData.length < 2) return [];
    const maxOrders = getMaxOrders();
    return orderVolumeData.map((point, index) => {
      const x = (index / (orderVolumeData.length - 1)) * 100;
      const y = 100 - (point.orders / maxOrders) * 100;
      return { x, y, data: point };
    });
  };

  const calculateRevenueChartPoints = () => {
    if (revenueData.length < 2) return [];
    const maxRevenue = getMaxRevenue();
    return revenueData.map((point, index) => {
      const x = (index / (revenueData.length - 1)) * 100;
      const y = 100 - (point.revenue / maxRevenue) * 100;
      return { x, y, data: point };
    });
  };

  const orderChartPoints = calculateOrderChartPoints();
  const revenueChartPoints = calculateRevenueChartPoints();

  // Handle range changes
  const handleOrderRangeChange = (range) => {
    setOrderChartRange(range);
  };

  const handleRevenueRangeChange = (range) => {
    setRevenueChartRange(range);
  };

  // Stats cards
  const statsCards = [
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
  ];

  // Loading state - Super fast minimal loader
  if (loading) {
    return (
      <Layout onLogout={onLogout} userData={userData}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            {/* Minimal spinner */}
            <div className="inline-block w-8 h-8 border-2 border-black rounded-full border-t-transparent animate-spin"></div>
            <p className="mt-4 text-sm text-gray-600" style={{ fontFamily: "'Metropolis', sans-serif" }}>
              Loading your dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={onLogout} userData={userData}>
      {/* Header */}
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
        <div
          className="p-6 mt-6 shadow-sm rounded-xl"
          style={{
            backgroundColor: "#000000",
            borderColor: "#E5E7EB",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3
                className="text-lg font-semibold text-white"
                style={{
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 600,
                }}
              >
                Today's Performance
              </h3>
              <p
                className="mt-1 text-gray-300"
                style={{ fontFamily: "'Metropolis', sans-serif" }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 md:flex-nowrap md:ml-auto md:justify-end">
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
                  Today's Orders
                </p>
              </div>

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
                  Today's Revenue
                </p>
              </div>

              <div className="p-3 text-center rounded-lg bg-white/10 backdrop-blur-sm min-w-[110px]">
                <div className="flex items-center justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= Math.floor(dashboardStats.shopRating)
                          ? "text-yellow-400"
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
            <div
              className="absolute top-0 left-0 w-full h-1"
              style={{ backgroundColor: stat.accentColor }}
            ></div>

            <div className="flex flex-col h-full">
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

                {stat.change && (
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
                        {stat.changeType === "up" ? "↑" : 
                         stat.changeType === "down" ? "↓" : "→"}
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
          <div
            className="p-6 bg-white border rounded-xl"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
              position: "relative",
              overflow: "hidden",
            }}
          >
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
              {orderVolumeData.length > 0 ? (
                <div className="flex flex-col h-full">
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

                    <div className="relative flex-1">
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="border-t"
                            style={{ borderColor: "#E5E7EB" }}
                          ></div>
                        ))}
                      </div>

                      <div className="relative h-full">
                        <svg
                          className="absolute inset-0 w-full h-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
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

                          {orderChartPoints.length > 1 && (
                            <>
                              <path
                                d={`M ${orderChartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                                fill="none"
                                stroke="#000000"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d={`M ${orderChartPoints.map(p => `${p.x},${p.y}`).join(' L ')} L 100,100 L 0,100 Z`}
                                fill="url(#orderGradient)"
                              />
                            </>
                          )}
                        </svg>

                        {orderVolumeData.map((point, i) => {
                          const percentage = (point.orders / getMaxOrders()) * 100;
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

                  <div
                    className="flex justify-between pt-2 text-xs"
                    style={{
                      color: "#555555",
                      fontFamily: "'Metropolis', sans-serif",
                    }}
                  >
                    {orderVolumeData.map((point, i) => (
                      <span
                        key={i}
                        className="text-center"
                        style={{ width: `${100 / orderVolumeData.length}%` }}
                      >
                        {point.label || point.time}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                    No order data available
                  </p>
                </div>
              )}
            </div>

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
                  {orderVolumeData.reduce((sum, d) => sum + d.orders, 0)}
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
                  {orderVolumeData.length > 0
                    ? Math.round(
                        orderVolumeData.reduce((sum, d) => sum + d.orders, 0) /
                          orderVolumeData.length
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
                {recentOrders.slice(0, 5).map((order) => (
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
                <p className="text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                  No recent orders found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
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
                Revenue (Delivered Orders Only)
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
              {revenueData.length > 0 ? (
                <div className="flex flex-col h-full">
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

                    <div className="relative flex-1">
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="border-t"
                            style={{ borderColor: "#E5E7EB" }}
                          ></div>
                        ))}
                      </div>

                      <div className="relative h-full">
                        <svg
                          className="absolute inset-0 w-full h-full"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
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

                          {revenueChartPoints.length > 1 && (
                            <>
                              <path
                                d={`M ${revenueChartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                                fill="none"
                                stroke="#555555"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d={`M ${revenueChartPoints.map(p => `${p.x},${p.y}`).join(' L ')} L 100,100 L 0,100 Z`}
                                fill="url(#revenueGradient)"
                              />
                            </>
                          )}
                        </svg>

                        {revenueData.map((point, i) => {
                          const percentage = (point.revenue / getMaxRevenue()) * 100;
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

                  <div
                    className="flex justify-between pt-2 text-xs"
                    style={{
                      color: "#555555",
                      fontFamily: "'Metropolis', sans-serif",
                    }}
                  >
                    {revenueData.map((point, i) => (
                      <span
                        key={i}
                        className="text-center"
                        style={{ width: `${100 / revenueData.length}%` }}
                      >
                        {point.label || point.time}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                    No revenue data available
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    (Revenue calculated from delivered orders only)
                  </p>
                </div>
              )}
            </div>

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
                  {formatCurrency(revenueData.reduce((sum, d) => sum + d.revenue, 0))}
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
                  {revenueData.length > 0
                    ? formatCurrency(
                        revenueData.reduce((sum, d) => sum + d.revenue, 0) /
                          revenueData.length
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
                        ${product.price ? product.price.toFixed(2) : 
                          product.sales > 0 ? (product.revenue / product.sales).toFixed(2) : "0.00"} avg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500" style={{ fontFamily: "'Metropolis', sans-serif" }}>
                  No product sales data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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