// pages/Login.jsx - COMPLETE FIXED
import React, { useState } from "react";
import authAPI from "../services/authAPI";
import api from "../services/api"; // ✅ IMPORT API

const Login = ({ onLogin, onSignup }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
   const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(credentials);
      const { token, shopOwner } = response.data;

      console.log("✅ Login API Response:", response.data);

      // Check if data is in different structure
      let userData = shopOwner;

      if (!userData && response.data.data) {
        userData = response.data.data;
      }

      if (!userData && response.data.owner) {
        userData = response.data.owner;
      }

      if (!userData) {
        throw new Error("No user data received from server");
      }

      // **IMPORTANT: Token store karo**
      localStorage.setItem("shopOwnerToken", token);

      // **ALSO: Store email/password temporarily for token refresh**
      localStorage.setItem("userEmail", credentials.email);
      localStorage.setItem("userPassword", credentials.password);

      // **NEW: Immediately test the token**
      try {
        const testResponse = await api.get("/shop-owner/profile");
        console.log("✅ Token test successful:", testResponse.data);

        // Get fresh user data with the token
        const freshUserData =
          testResponse.data.data ||
          testResponse.data.owner ||
          testResponse.data;

        const normalizedUserData = {
          ...freshUserData,
          accountStatus: freshUserData.accountStatus || "Pending",
          onboarding: freshUserData.onboarding || {},
        };

        localStorage.setItem("userData", JSON.stringify(normalizedUserData));

        onLogin(token, normalizedUserData);
      } catch (tokenError) {
        console.error("❌ Token test failed:", tokenError);

        // Fallback to original data
        const normalizedUserData = {
          ...userData,
          accountStatus: userData.accountStatus || "Pending",
          onboarding: userData.onboarding || {},
        };

        localStorage.setItem("userData", JSON.stringify(normalizedUserData));
        onLogin(token, normalizedUserData);
      }
    } catch (err) {
      console.error("❌ Login error:", err);

      let errorMessage = "Login failed. Please check your credentials.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center lg:bg-gradient-to-br lg:from-black lg:to-gray-900 lg:text-white lg:p-8">
       <div className="text-center">

  {/* Logo + Label Container */}
  <div className="flex flex-col items-center p-6 text-black">

    {/* ZED Logo */}
    {/* <img
      src="public/images/zed.png"
      alt="Shop owner"
      style={{ width: "180px", height: "auto" }}
    /> */}
    <img
  src="/images/zed.png"
  alt="Shop owner"
  style={{ width: "180px", height: "auto" }}
/>


    {/* SHOP OWNER text matched to logo width */}
    <h1
      style={{
        width: "180px",          // MATCHES logo width
        marginTop: "6px",
        fontFamily: "Metropolis, sans-serif",
        fontWeight: 700,
        fontSize: "18px",
        lineHeight: "22px",
        letterSpacing: "1px",
        textAlign: "center",
        color: "white",
      }}
    >
      SHOP OWNER
    </h1>

  </div>

  {/* Feature List */}
  <div className="space-y-4 text-left">
    {["Secure Dashboard", "Real-time Analytics", "Complete Control"].map(
      (item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full"
            style={{ backgroundColor: "#27C840" }}
          >
            <span className="text-white">✓</span>
          </div>

          <span
            style={{
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400,
            }}
          >
            {item}
          </span>
        </div>
      )
    )}
  </div>

</div>

      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col items-center justify-center flex-1 p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2
              className="mb-2 text-3xl font-bold"
              style={{
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 700,
              }}
            >
              Welcome 
            </h2>
            <p
              className="text-gray-600"
              style={{
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400,
              }}
            >
              Sign in to access your store dashboard
            </p>
          </div>

          {error && (
            <div className="flex items-start p-4 mb-6 space-x-3 border border-red-200 rounded-lg bg-red-50">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <div
                  className="font-medium text-red-800"
                  style={{
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Error
                </div>
                <div
                  className="text-sm text-red-700"
                  style={{
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {error}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500,
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                className="block w-full px-3 py-3 transition-all duration-200 border rounded-lg focus:ring-2 focus:outline-none"
                style={{
                  borderColor: "#555555",
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 400,
                  borderWidth: "1px",
                }}
                placeholder="your@email.com"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
              />
            </div>

          <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500,
                }}
              >
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="block w-full px-3 py-3 pr-10 transition-all duration-200 border rounded-lg focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: "#555555",
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                    borderWidth: "1px",
                  }}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none"
                  style={{ color: "#555555" }}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-medium text-white transition-all duration-200 rounded-lg hover:opacity-90 focus:ring-4 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 600,
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                     
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p
              className="text-gray-600"
              style={{
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400,
              }}
            >
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSignup}
                className="font-medium transition-all duration-200 hover:opacity-80"
                style={{
                  color: "#000000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 600,
                }}
              >
                Start your store registration
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Add Metropolis font styles */}
      <style>{`
  @import url('https://fonts.cdnfonts.com/css/metropolis');
  
  body {
    font-family: 'Metropolis', sans-serif;
  }
  
  input:focus {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
  }
`}</style>
    </div>
  );
};

export default Login;
