// components/onboarding/ApplicationReview.js - FINAL FIX
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import onboardingAPI from "../../services/onboardingAPI";
import "typeface-metropolis";

const ApplicationReview = ({
  formData,
  onContinue,
  applicationStatus,
  loading,
  updateAuthState, // Add this prop
}) => {
  const navigate = useNavigate();
  const applicationId = `ZED-APP-${Math.floor(Math.random() * 90000) + 10000}`;
  const submissionDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [localStatus, setLocalStatus] = useState(applicationStatus);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const checkApplicationStatus = async () => {
    try {
      setCheckingStatus(true);

      console.log("📡 Checking application status...");

      // Use the existing API service
      const response = await onboardingAPI.getApplicationStatus();

      console.log("📊 Status check response:", response.data);

      if (response.data.success) {
        let userData =
          response.data.data || response.data.owner || response.data;

        const accountStatus =
          userData.accountStatus ||
          userData.onboarding?.accountStatus ||
          "Pending";

        console.log("📊 Account status detected:", accountStatus);

        if (accountStatus === "Active" || accountStatus === "Verified") {
          setLocalStatus("approved");

          // Update localStorage
          const normalizedUserData = {
            ...userData,
            accountStatus,
            onboarding: userData.onboarding || {},
          };

          localStorage.setItem("userData", JSON.stringify(normalizedUserData));

          console.log("✅ Application approved, redirecting to dashboard");

          // CRITICAL: Update the auth state in parent component
          if (updateAuthState) {
            updateAuthState(normalizedUserData);
          }

          // Force a reload to ensure auth state is updated
          setTimeout(() => {
            // navigate("/dashboard");
             navigate("/orders");
          }, 100);
        } else {
          setLocalStatus("pending");
          console.log("⏳ Account still under review:", accountStatus);
        }
      } else {
        console.error("API returned unsuccessful response:", response.data);
      }
    } catch (error) {
      console.error("❌ Failed to check status:", error);

      // Check if error is HTML response
      if (
        error.message &&
        (error.message.includes("Unexpected token") ||
          error.message.includes("<!doctype"))
      ) {
        console.error(
          "⚠️ Server returned HTML instead of JSON. Possible server error or incorrect endpoint."
        );
        alert(
          "Unable to check status. Please try again later or contact support."
        );
      } else {
        alert("Unable to check status. Please try again later.");
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    // Check status on component mount
    checkApplicationStatus();
  }, []);

  const handleGoToDashboard = () => {
    console.log("🚀 Going to dashboard...");

    // First check current status
    checkApplicationStatus();
  };

  // Safely access form data with fallbacks
  const safeFormData = formData || {};

  const currentStatus = localStatus || applicationStatus;

  return (
    <div className="space-y-6" style={{ fontFamily: "Metropolis, sans-serif" }}>
      <div>
        <h2
          className="mb-2 text-2xl font-bold"
          style={{
            color: "#000000",
            fontFamily: "Metropolis, sans-serif",
            fontWeight: 700,
          }}
        >
          Application Review
        </h2>
        <p style={{ color: "#555555" }}>
          Your application is being reviewed by our team.
        </p>
      </div>

      {/* Status Box */}
      <div
        className={`border rounded-lg p-6 text-center ${
          currentStatus === "approved"
            ? "border-gray-200"
            : currentStatus === "rejected"
            ? "border-gray-200"
            : "border-gray-200"
        }`}
        style={{
          backgroundColor:
            currentStatus === "approved"
              ? "#bebebeff"
              : currentStatus === "rejected"
              ? "#e2e2e2ff"
              : "#bebebeff",
          fontFamily: "Metropolis, sans-serif",
        }}
       >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            currentStatus === "approved"
              ? "bg-gray-100"
              : currentStatus === "rejected"
              ? "bg-gray-100"
              : "bg-gray-100"
          }`}
        >
          {currentStatus === "approved" ? (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "#bebebeff" }} // gray
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : currentStatus === "rejected" ? (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "#bebebeff" }} // gray
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "#bebebeff" }} // changed from BLUE → GRAY
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        <h3
          className={`text-xl font-semibold mb-2 ${
            currentStatus === "approved"
              ? "text-green-800"
              : currentStatus === "rejected"
              ? "text-red-800"
              : "text-gray-800"
          }`}
          style={{ fontFamily: "Metropolis, sans-serif", fontWeight: 600 }}
        >
          {currentStatus === "approved"
            ? "Application Approved!"
            : currentStatus === "rejected"
            ? "Application Rejected"
            : checkingStatus
            ? "Checking Status..."
            : "Application Under Review"}
        </h3>

        <p
          className={
            currentStatus === "approved"
              ? "text-green-700"
              : currentStatus === "rejected"
              ? "text-red-700"
              : "text-gray-700"
          }
          style={{ fontFamily: "Metropolis, sans-serif" }}
        >
          {currentStatus === "approved"
            ? "Congratulations! Your application has been approved. You can now access your dashboard."
            : currentStatus === "rejected"
            ? "Your application has been rejected. Please contact support for more information."
            : checkingStatus
            ? "Please wait while we check your application status..."
            : "Your application has been submitted and is now under review. This typically takes 1-2 business days."}
        </p>

        {checkingStatus && (
          <div className="mt-4">
            <div className="w-8 h-8 mx-auto border-2 border-gray-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>

      {/* Application Details Card */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <h4
          className="mb-4 text-lg font-semibold"
          style={{
            color: "#000000",
            fontFamily: "Metropolis, sans-serif",
            fontWeight: 600,
          }}
        >
          Application Details
        </h4>

       <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  <div>
    <div className="mb-4">
      <p
        className="mb-1 text-sm font-medium"
        style={{
          color: "#555555",
          fontFamily: "Metropolis, sans-serif",
          fontWeight: 500,
        }}
      >
        Application ID
      </p>
      <p className="font-mono" style={{ color: "#000000" }}>
        {applicationId}
      </p>
    </div>

    <div>
      <p
        className="mb-1 text-sm font-medium"
        style={{
          color: "#555555",
          fontFamily: "Metropolis, sans-serif",
          fontWeight: 500,
        }}
      >
        Store Name
      </p>
      <p style={{ color: "#000000" }}>
        {safeFormData.storeName ||
          safeFormData.shopName ||
          "Not provided"}
      </p>
    </div>
  </div>

  <div>
    <div className="mb-4">
      <p
        className="mb-1 text-sm font-medium"
        style={{
          color: "#555555",
          fontFamily: "Metropolis, sans-serif",
          fontWeight: 500,
        }}
      >
        Submission Date
      </p>
      <p style={{ color: "#000000" }}>{submissionDate}</p>
    </div>

    <div>
      <p
        className="mb-1 text-sm font-medium"
        style={{
          color: "#555555",
          fontFamily: "Metropolis, sans-serif",
          fontWeight: 500,
        }}
      >
        Status
      </p>

      {/* Gray Status Badge */}
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
          ${
            currentStatus === "approved"
              ? "text-gray-800 bg-gray-200"
              : currentStatus === "rejected"
              ? "text-gray-800 bg-gray-300"
              : "text-gray-800 bg-gray-100"
          }
        `}
        style={{
          fontFamily: "Metropolis, sans-serif",
          fontWeight: 500,
        }}
      >
        {currentStatus === "approved"
          ? "Approved"
          : currentStatus === "rejected"
          ? "Rejected"
          : "Under Review"}
      </span>
    </div>
  </div>
</div>

{/* Contact Information */}
<div className="pt-6 mt-6 border-t border-gray-200">
  <h5
    className="mb-3 font-medium text-md"
    style={{
      color: "#000000",
      fontFamily: "Metropolis, sans-serif",
      fontWeight: 600,
    }}
  >
    Contact Information
  </h5>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <p className="text-sm" style={{ color: "#555555", fontFamily: "Metropolis, sans-serif" }}>
        Contact Person
      </p>
      <p style={{ color: "#000000" }}>
        {safeFormData.contactName || safeFormData.name || "Not provided"}
      </p>
    </div>

    <div>
      <p className="text-sm" style={{ color: "#555555", fontFamily: "Metropolis, sans-serif" }}>
        Email
      </p>
      <p style={{ color: "#000000" }}>
        {safeFormData.email || safeFormData.contactEmail || "Not provided"}
      </p>
    </div>

    <div>
      <p className="text-sm" style={{ color: "#555555", fontFamily: "Metropolis, sans-serif" }}>
        Phone
      </p>
      <p style={{ color: "#000000" }}>
        {safeFormData.phoneNumber || safeFormData.phone || "Not provided"}
      </p>
    </div>

    <div>
      <p className="text-sm" style={{ color: "#555555", fontFamily: "Metropolis, sans-serif" }}>
        Business Type
      </p>
      <p style={{ color: "#000000" }} className="capitalize">
        {(safeFormData.businessType || "").replace(/-/g, " ") || "Not provided"}
      </p>
    </div>
  </div>
</div>

{/* Business Location */}
<div className="pt-6 mt-6 border-t border-gray-200">
  <h5
    className="mb-3 font-medium text-md"
    style={{
      color: "#000000",
      fontFamily: "Metropolis, sans-serif",
      fontWeight: 600,
    }}
  >
    Business Location
  </h5>

  <div className="space-y-2">
    <p style={{ color: "#000000" }}>
      {[
        safeFormData.streetAddress,
        safeFormData.city,
        safeFormData.state,
        safeFormData.zipCode,
        safeFormData.country,
      ]
        .filter(Boolean)
        .join(", ") || "Not provided"}
    </p>
  </div>
</div>

{/* Selected Categories */}
{safeFormData.categories && safeFormData.categories.length > 0 && (
  <div className="pt-6 mt-6 border-t border-gray-200">
    <h5
      className="mb-3 font-medium text-md"
      style={{
        color: "#000000",
        fontFamily: "Metropolis, sans-serif",
        fontWeight: 600,
      }}
    >
      Product Categories
    </h5>

    <div className="flex flex-wrap gap-2">
      {safeFormData.categories.map((category, index) => (
        <span
          key={index}
          className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor: "#d1d5db",   // gray-300
            color: "#000000",
            fontFamily: "Metropolis, sans-serif",
            fontWeight: 500,
          }}
        >
          {category}
        </span>
      ))}
    </div>
  </div>
)}

{/* Navigation */}
<div className="flex justify-between pt-6">
  {/* Back Button */}
  <button
    onClick={() => (window.location.href = "/")}
    className="flex items-center px-6 py-3 space-x-2 transition-all border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200"
    style={{
      color: "#555555",
      fontFamily: "Metropolis, sans-serif",
      fontWeight: 500,
    }}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
    <span>Back to Home</span>
  </button>

  {/* Approved → Gray Button */}
  {currentStatus === "approved" ? (
    <button
      onClick={handleGoToDashboard}
      disabled={checkingStatus}
      className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
      style={{
        backgroundColor: "#6b7280", // gray-500
        fontFamily: "Metropolis, sans-serif",
        fontWeight: 500,
      }}
    >
      {checkingStatus ? (
        <>
          <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
          <span>Redirecting...</span>
        </>
      ) : (
        <>
          <span>Go to Dashboard</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </>
      )}
    </button>
  ) : currentStatus === "rejected" ? (
    /* Rejected → Dark Gray */
    <button
      onClick={() => (window.location.href = "/contact")}
      className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-300"
      style={{
        backgroundColor: "#4b5563", // gray-600
        fontFamily: "Metropolis, sans-serif",
        fontWeight: 500,
      }}
    >
      <span>Contact Support</span>
    </button>
  ) : (
    /* Under Review → Medium Gray */
    <button
      onClick={handleGoToDashboard}
      disabled={checkingStatus}
      className="flex items-center px-6 py-3 space-x-2 text-white transition-all rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 disabled:opacity-50"
      style={{
        backgroundColor: "#6b7280", // gray-500
        fontFamily: "Metropolis, sans-serif",
        fontWeight: 500,
      }}
    >
      {checkingStatus ? (
        <>
          <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
          <span>Checking...</span>
        </>
      ) : (
        <>
          <span>Check Status</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </>
      )}
    </button>
  )}
</div>
</div>
    </div>
  );
};

export default ApplicationReview;
