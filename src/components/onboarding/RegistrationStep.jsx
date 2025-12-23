// components/onboarding/RegistrationStep.jsx - UPDATED WITH TOAST
import React, { useState } from "react";
import { showError, showSuccess } from "../../utils/toast";

const RegistrationStep = ({
  formData,
  updateFormData,
  onNext,
  onBack,
  loading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent default browser validation
    e.stopPropagation();

    console.log("Form submission attempt");

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      showError("Please fill in all required fields");
      return false; // Important: return false to prevent default
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      showError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match. Please check and try again.");
      return false;
    }

    showSuccess("Account created successfully! Proceeding to next step...");
    onNext();
    return false; // Prevent default form submission
  };

  const handlePasswordChange = (e) => {
    updateFormData({ password: e.target.value });
  };

  const handleConfirmPasswordChange = (e) => {
    updateFormData({ confirmPassword: e.target.value });
  };

  const handleEmailChange = (e) => {
    updateFormData({ email: e.target.value });
  };

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "'Metropolis', sans-serif" }}
    >
      <div>
        <h2
          className="mb-2 text-2xl font-bold"
          style={{
            color: "#000000",
            fontFamily: "'Metropolis', sans-serif",
            fontWeight: 700,
          }}
        >
          Create Your Account
        </h2>
        <p
          className="text-gray-600"
          style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}
        >
          Start your journey by creating your store owner account
        </p>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        noValidate // This prevents browser default validation
      >
        {/* Email Field */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{
              color: "#000000",
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500,
            }}
          >
            Email Address *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#555555" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="email"
              value={formData?.email || ""}
              onChange={handleEmailChange}
              className="block w-full py-3 pl-10 pr-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: "#555555",
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400,
              }}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
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
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#555555" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={formData?.password || ""}
              onChange={handlePasswordChange}
              className="block w-full py-3 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: "#555555",
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400,
              }}
              placeholder="Enter your password"
              required
              minLength="6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer focus:outline-none"
              style={{ color: "#555555" }}
            >
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
                  d={
                    showPassword
                      ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  }
                />
              </svg>
            </button>
          </div>
          <p
            className="mt-1 text-sm"
            style={{
              color: "#555555",
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 400,
            }}
          >
            Password must be at least 6 characters long
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            className="block mb-2 text-sm font-medium"
            style={{
              color: "#000000",
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500,
            }}
          >
            Confirm Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "#555555" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword || ""}
              onChange={handleConfirmPasswordChange}
              className="block w-full py-3 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: "#555555",
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400,
              }}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer focus:outline-none"
              style={{ color: "#555555" }}
            >
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
                  d={
                    showConfirmPassword
                      ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex items-center px-6 py-3 space-x-2 transition-all border rounded-lg cursor-pointer hover:opacity-80 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: "#000000",
              borderColor: "#555555",
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500,
            }}
          >
            <span>Back to Login</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg cursor-pointer hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#000000",
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500,
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                Continue 
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        input:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default RegistrationStep;