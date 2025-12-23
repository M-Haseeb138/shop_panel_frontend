// App.jsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import UpdateProduct from "./pages/UpdateProduct";
import PendingApproval from "./pages/PendingApproval";
import api from "./services/api";
import ProductPreview from "./pages/ProductPreview";
import Settings from "./pages/Settings";
import { initializeAndSaveFCM, checkAndUpdateFCMToken, setupFirebaseMessageListener } from "./services/fcmAPI";

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const initialCheckRef = useRef(false);

  const validateToken = async (token) => {
    try {
      const response = await api.get("/shop-owner/profile");
      const data = response.data;

      let userData = data.data || data.owner || data.user || data;

      const accountStatus =
        userData.accountStatus ||
        userData.status ||
        userData.onboarding?.accountStatus ||
        "Pending";

      return {
        valid: true,
        userData: {
          ...userData,
          accountStatus: accountStatus,
          onboarding: userData.onboarding || {},
        },
      };
    } catch (error) {
      console.error("Token validation error:", error);
      return {
        valid: false,
        error: error,
      };
    }
  };

  const updateAuthState = (newUserData) => {
    if (newUserData) {
      setUserData(newUserData);
      setIsAuthenticated(true);
      localStorage.setItem("userData", JSON.stringify(newUserData));
    }
  };

  // ✅ CORRECTED: Initialize Firebase FCM using fcmAPI service
  const initializeFirebaseFCM = async () => {
    try {
      if (!isAuthenticated) {
        console.log("❌ Not authenticated, skipping FCM initialization");
        return;
      }
      
      console.log("🔄 Starting FCM initialization...");
      
      // Check notification permission
      let permission = Notification.permission;
      if (permission === 'default') {
        console.log("ℹ️ Requesting notification permission...");
        permission = await Notification.requestPermission();
      }
      
      if (permission !== 'granted') {
        console.log("⚠️ Notification permission not granted:", permission);
        return;
      }
      
      console.log("✅ Notification permission granted");
      
      // Setup message listener for foreground notifications
      const cleanup = await setupFirebaseMessageListener((payload) => {
        console.log('📬 FCM Message received in App:', payload);
        
        // Show notification if app is in foreground
        if (payload.notification && 'Notification' in window) {
          try {
            new Notification(payload.notification.title || 'New Notification', {
              body: payload.notification.body,
              icon: '/logo192.png'
            });
          } catch (notifError) {
            console.log('Could not show foreground notification:', notifError);
          }
        }
      });
      
      if (cleanup) {
        console.log("✅ Firebase message listener setup");
      }
      
      // Check if FCM token already exists and is saved
      const existingToken = localStorage.getItem('fcmToken');
      const tokenSaved = localStorage.getItem('fcmTokenSaved');
      
      if (existingToken && tokenSaved === 'true') {
        console.log("✅ FCM token already exists and saved, checking for updates...");
        // Check if token needs updating
        checkAndUpdateFCMToken().catch(error => {
          console.error("Error checking FCM token:", error);
        });
      } else {
        console.log("ℹ️ No saved FCM token found");
        // Token will be initialized during login, so we don't need to do it here
      }
      
    } catch (error) {
      console.error("❌ Firebase FCM initialization error:", error);
    }
  };

  useEffect(() => {
    if (initialCheckRef.current) return;
    initialCheckRef.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("shopOwnerToken");
      const publicRoutes = ["/login", "/register", "/onboarding"];
      
      if (publicRoutes.includes(location.pathname)) {
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      if (!token) {
        navigate("/login");
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      try {
        const validation = await validateToken(token);

        if (!validation.valid) {
          localStorage.removeItem("shopOwnerToken");
          localStorage.removeItem("userData");
          localStorage.removeItem("fcmToken");
          localStorage.removeItem("fcmTokenSaved");
          setIsAuthenticated(false);
          setUserData(null);
          navigate("/login");
          return;
        }

        const userData = validation.userData;
        setUserData(userData);
        setIsAuthenticated(true);
        localStorage.setItem("userData", JSON.stringify(userData));

        // Initialize FCM after authentication is confirmed
        initializeFirebaseFCM();

        const authPages = [
          "/dashboard",
          "/orders",
          "/products",
          "/add-product",
          "/preview-product",
          "/pending-approval",
          "/update-product",
          "/settings",
        ];

        const isOnValidPage = authPages.some((page) =>
          location.pathname.startsWith(page)
        );

        if (isOnValidPage) {
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        const accountStatus = userData.accountStatus || "Pending";
        const activeStatuses = ["Active", "Verified", "active", "verified"];

        if (activeStatuses.includes(accountStatus)) {
          if (location.pathname !== "/orders") {
            navigate("/orders");
          }
        } else if (accountStatus === "Pending" || accountStatus === "pending") {
          if (location.pathname !== "/pending-approval") {
            navigate("/pending-approval");
          }
        } else {
          if (location.pathname !== "/onboarding") {
            navigate("/onboarding");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // Re-initialize FCM when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔄 User authenticated, setting up FCM...");
      initializeFirebaseFCM();
      
      // Set up periodic token check (every 5 minutes)
      const interval = setInterval(() => {
        checkAndUpdateFCMToken().catch(console.error);
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authChecked || loading) return;

    const publicRoutes = ["/login", "/register", "/onboarding"];
    if (publicRoutes.includes(location.pathname)) return;

    if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
      navigate("/login");
    }
  }, [location.pathname, authChecked, isAuthenticated, navigate, loading]);

  const handleLogin = async (token, user) => {
    localStorage.setItem("shopOwnerToken", token);

    try {
      const validation = await validateToken(token);

      if (!validation.valid) {
        localStorage.removeItem("shopOwnerToken");
        localStorage.removeItem("fcmToken");
        localStorage.removeItem("fcmTokenSaved");
        return;
      }

      const userData = validation.userData;
      setUserData(userData);
      setIsAuthenticated(true);
      localStorage.setItem("userData", JSON.stringify(userData));
      
      // FCM is already initialized in Login component, but setup listeners here
      initializeFirebaseFCM();

      const accountStatus = userData.accountStatus || "Pending";
      const activeStatuses = ["Active", "Verified", "active", "verified"];

      if (activeStatuses.includes(accountStatus)) {
        navigate("/orders");
      } else if (accountStatus === "Pending" || accountStatus === "pending") {
        navigate("/pending-approval");
      } else {
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignup = () => {
    localStorage.removeItem("shopOwnerToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("onboardingFormData");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");
    localStorage.removeItem("fcmToken");
    localStorage.removeItem("fcmTokenSaved");

    setIsAuthenticated(false);
    setUserData(null);
    navigate("/onboarding");
  };

  const handleOnboardingComplete = async () => {
    const token = localStorage.getItem("shopOwnerToken");
    if (token) {
      try {
        const validation = await validateToken(token);
        if (validation.valid) {
          const userData = validation.userData;
          const accountStatus = userData.accountStatus || "Pending";
          const activeStatuses = ["Active", "Verified", "active", "verified"];

          if (activeStatuses.includes(accountStatus)) {
            navigate("/orders");
          } else {
            navigate("/pending-approval");
          }
          initializeFirebaseFCM();
        }
      } catch (error) {
        console.error("Onboarding completion error:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("shopOwnerToken");
      if (token) {
        await api.post(
          "/shop-owner/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear all localStorage items
      localStorage.removeItem("shopOwnerToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("onboardingFormData");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPassword");
      localStorage.removeItem("fcmToken");
      localStorage.removeItem("fcmTokenSaved");
      localStorage.removeItem("fcmTokenSavedAt");
      localStorage.removeItem("fcmTokenUpdatedAt");

      setIsAuthenticated(false);
      setUserData(null);
      navigate("/login");
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("shopOwnerToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("onboardingFormData");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");
    localStorage.removeItem("fcmToken");
    localStorage.removeItem("fcmTokenSaved");

    setIsAuthenticated(false);
    setUserData(null);
    navigate("/login");
  };

  const ProtectedRoute = ({ children, requireActive = false }) => {
    if (!authChecked || loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (requireActive && userData) {
      const accountStatus = userData.accountStatus || "Pending";
      const activeStatuses = ["Active", "Verified", "active", "verified"];

      if (!activeStatuses.includes(accountStatus)) {
        return <Navigate to="/pending-approval" />;
      }
    }

    return children;
  };

  if (loading && !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        newestOnTop
        theme="dark"
        toastClassName="relative flex p-4 rounded-lg shadow-lg bg-[#111827] text-white"
        bodyClassName="flex items-center gap-3 text-sm font-medium"
        progressClassName="bg-green-500"
      />
      
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} onSignup={handleSignup} />}
        />

        <Route
          path="/onboarding"
          element={
            <Onboarding
              onComplete={handleOnboardingComplete}
              onBackToLogin={handleBackToLogin}
              userData={userData}
              updateAuthState={updateAuthState}
            />
          }
        />

        <Route
          path="/pending-approval"
          element={
            <ProtectedRoute>
              <PendingApproval onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireActive>
              <Dashboard onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute requireActive>
              <Orders onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute requireActive>
              <Products onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute requireActive>
              <AddProduct onBack={() => navigate("/products")} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/update-product/:id"
          element={
            <ProtectedRoute requireActive>
              <UpdateProduct
                onBack={() => navigate("/products")}
                onLogout={handleLogout}
                userData={userData}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preview-product"
          element={
            <ProtectedRoute requireActive>
              <ProductPreview onBack={() => navigate("/add-product")} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute requireActive>
              <Settings onLogout={handleLogout} userData={userData} />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/orders" : "/login"} />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;