// App.jsx - FIXED VERSION
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
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

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const initialCheckRef = useRef(false);

  // Simple token validation function
  const validateToken = async (token) => {
    try {
      const response = await api.get("/shop-owner/profile");
      const data = response.data;

      console.log("✅ Token validation successful");

      // Extract user data from different possible response structures
      let userData = data.data || data.owner || data.user || data;

      // Check for account status in multiple possible fields
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
      console.error("❌ Token validation error:", error);
      return {
        valid: false,
        error: error,
      };
    }
  };

  // Function to update authentication state
  const updateAuthState = (newUserData) => {
    if (newUserData) {
      setUserData(newUserData);
      setIsAuthenticated(true);
      localStorage.setItem("userData", JSON.stringify(newUserData));
      console.log("✅ Auth state updated from external source");
    }
  };

  // Check authentication status - ONLY ON INITIAL LOAD
  useEffect(() => {
    if (initialCheckRef.current) return;
    initialCheckRef.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("shopOwnerToken");

      console.log("🔐 Initial Auth Check:", {
        hasToken: !!token,
        currentPath: location.pathname,
      });

      // Public routes - allow access without validation
      const publicRoutes = ["/login", "/register", "/onboarding"];

      if (publicRoutes.includes(location.pathname)) {
        console.log("📱 Public route, allowing access");
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      // No token - redirect to login
      if (!token) {
        console.log("🔐 No token found, redirecting to login");
        navigate("/login");
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      try {
        // Validate token
        const validation = await validateToken(token);

        if (!validation.valid) {
          console.log("❌ Invalid token, clearing storage");
          localStorage.removeItem("shopOwnerToken");
          localStorage.removeItem("userData");
          localStorage.removeItem("onboardingFormData");
          setIsAuthenticated(false);
          setUserData(null);
          navigate("/login");
          return;
        }

        // Token is valid
        console.log("✅ Token is valid");

        const userData = validation.userData;
        setUserData(userData);
        setIsAuthenticated(true);
        localStorage.setItem("userData", JSON.stringify(userData));

        // Define auth pages
        const authPages = [
          "/dashboard",
          "/orders",
          "/products",
          "/add-product",
          "/preview-product",
          "/pending-approval",
          "/update-product",
          "/settings", // ADD SETTINGS HERE
        ];

        // Check if we're already on a valid auth page
        const isOnValidPage = authPages.some((page) =>
          location.pathname.startsWith(page)
        );

        if (isOnValidPage) {
          console.log("📍 Already on valid page");
          setLoading(false);
          setAuthChecked(true);
          return;
        }

        // Redirect based on account status only if NOT on correct page
        const accountStatus = userData.accountStatus || "Pending";
        console.log("🔄 Account status:", accountStatus);

        const activeStatuses = ["Active", "Verified", "active", "verified"];

        if (activeStatuses.includes(accountStatus)) {
          if (location.pathname !== "/dashboard") {
            console.log("🔄 Redirecting to dashboard (account active)");
            navigate("/dashboard");
          }
        } else if (accountStatus === "Pending" || accountStatus === "pending") {
          if (location.pathname !== "/pending-approval") {
            console.log("🔄 Redirecting to pending approval");
            navigate("/pending-approval");
          }
        } else {
          if (location.pathname !== "/onboarding") {
            console.log("🔄 Redirecting to onboarding");
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
  }, []); // Empty dependency array - run only once on mount

  // Handle navigation after auth is checked
  useEffect(() => {
    if (!authChecked || loading) return;

    // Public routes - no action needed
    const publicRoutes = ["/login", "/register", "/onboarding"];
    if (publicRoutes.includes(location.pathname)) return;

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !publicRoutes.includes(location.pathname)) {
      console.log("🔐 Not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [location.pathname, authChecked, isAuthenticated, navigate, loading]);

  const handleLogin = async (token, user) => {
    console.log("✅ Login successful, storing token...");

    // Store token
    localStorage.setItem("shopOwnerToken", token);

    try {
      // Validate token immediately
      const validation = await validateToken(token);

      if (!validation.valid) {
        alert("Login failed. Please try again.");
        localStorage.removeItem("shopOwnerToken");
        return;
      }

      // Use validated user data
      const userData = validation.userData;
      setUserData(userData);
      setIsAuthenticated(true);
      localStorage.setItem("userData", JSON.stringify(userData));

      // Redirect based on status
      const accountStatus = userData.accountStatus || "Pending";
      const activeStatuses = ["Active", "Verified", "active", "verified"];

      if (activeStatuses.includes(accountStatus)) {
        navigate("/dashboard");
      } else if (accountStatus === "Pending" || accountStatus === "pending") {
        navigate("/pending-approval");
      } else {
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleSignup = () => {
    console.log("🔄 Starting store registration - Clearing all data...");

    // Clear all stored data
    localStorage.removeItem("shopOwnerToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("onboardingFormData");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");

    setIsAuthenticated(false);
    setUserData(null);

    console.log("✅ All data cleared, redirecting to /onboarding");
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
            navigate("/dashboard");
          } else {
            navigate("/pending-approval");
          }
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear ALL data on logout
      localStorage.removeItem("shopOwnerToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("onboardingFormData");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPassword");

      setIsAuthenticated(false);
      setUserData(null);
      navigate("/login");
    }
  };

  const handleBackToLogin = () => {
    // Clear all data when going back to login
    localStorage.removeItem("shopOwnerToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("onboardingFormData");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPassword");

    setIsAuthenticated(false);
    setUserData(null);
    navigate("/login");
  };

  // Protected Route wrapper
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
      console.log("🔐 ProtectedRoute: Not authenticated, redirecting to login");
      return <Navigate to="/login" />;
    }

    if (requireActive && userData) {
      const accountStatus = userData.accountStatus || "Pending";
      const activeStatuses = ["Active", "Verified", "active", "verified"];

      if (!activeStatuses.includes(accountStatus)) {
        console.log(
          "🔐 ProtectedRoute: Account not active, redirecting to pending approval"
        );
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
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
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