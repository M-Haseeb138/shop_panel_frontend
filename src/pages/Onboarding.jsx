// pages/Onboarding.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from "react";
import StepIndicator from "../components/onboarding/StepIndicator";
import RegistrationStep from "../components/onboarding/RegistrationStep";
import EmailVerification from "../components/onboarding/EmailVerification";
import PhoneVerification from "../components/onboarding/PhoneVerification";
import BusinessDetails from "../components/onboarding/BusinessDetails";
import DocumentUpload from "../components/onboarding/DocumentUpload";
import ApplicationReview from "../components/onboarding/ApplicationReview";
import OnboardingComplete from "../components/onboarding/OnboardingComplete";
import ProfileSetup from "../components/onboarding/ProfileSetup";
import authAPI from "../services/authAPI";
import onboardingAPI from "../services/onboardingAPI";
import "typeface-metropolis";

// pages/Onboarding.jsx - Line 17-40 ko yeh se replace karein:

const Onboarding = ({ onComplete, onBackToLogin, userData,updateAuthState  }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ FIXED: Initialize with EMPTY form data for new registration
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    storeName: "",
    businessType: "",
    contactName: "",
    phoneNumber: "",
    altPhoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    openTime: "09:00",
    closeTime: "18:00",
    latitude: "",
    longitude: "",
    categories: [],
    storeDescription: "",
    storeWebsite: "",
    storeOpeningYear: "",
  });

  const [applicationStatus, setApplicationStatus] = useState("pending");

  // ✅ FIXED: Reset form when component mounts for new registration
  useEffect(() => {
    console.log("🔄 Onboarding component mounted - Resetting form data");

    // Clear any stored form data
    localStorage.removeItem("onboardingFormData");

    // Reset form to empty state
    const emptyFormData = {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      storeName: "",
      businessType: "",
      contactName: "",
      phoneNumber: "",
      altPhoneNumber: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      openTime: "09:00",
      closeTime: "18:00",
      latitude: "",
      longitude: "",
      categories: [],
      storeDescription: "",
      storeWebsite: "",
      storeOpeningYear: "",
    };

    setFormData(emptyFormData);
    console.log("✅ Form data reset to empty state");
  }, []);

  // ✅ FIXED: Move useEffect inside the component
  useEffect(() => {
    console.log("🔄 Onboarding component mounted");
    console.log("📊 Current formData:", formData);
    console.log("📍 Current step:", currentStep);
  }, [formData, currentStep]);

  // Save to localStorage whenever formData changes
  const saveToLocalStorage = (data) => {
    localStorage.setItem("onboardingFormData", JSON.stringify(data));
  };

  const updateFormData = (updates) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    saveToLocalStorage(newData);
  };

  const handleRegistration = async () => {
    console.log("📝 Attempting registration...");
    console.log("📝 Form data for registration:", formData);

    if (!formData) {
      console.error("❌ formData is undefined");
      alert("Registration data is missing");
      setLoading(false);
      return;
    }

    // ✅ Validate email and password using formData
    if (!formData.email || !formData.password) {
      alert("Email and password are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("📧 Registering email:", formData.email);

      // ✅ Call the API with only email and password
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
      });

      console.log("✅ Registration response:", response.data);

      if (response.data.success) {
        // Save token from registration response
        if (response.data.token) {
          localStorage.setItem("shopOwnerToken", response.data.token);
          console.log("🔐 Token saved after registration");
        }

        // Update form data with the response
        const updatedFormData = {
          ...formData,
          email: formData.email.toLowerCase().trim(),
        };

        setFormData(updatedFormData);
        saveToLocalStorage(updatedFormData);

        // Move to email verification step
        setCurrentStep(2); // Email verification step
        alert("Registration successful! Please verify your email.");
      } else {
        alert(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("❌ Registration error:", error);

      // More specific error handling
      if (error.response) {
        const { status, data } = error.response;
        console.error("📊 Error details:", { status, data });

        if (status === 400) {
          if (data.message && data.message.includes("already registered")) {
            alert(
              "This email is already registered. Please try logging in or use a different email."
            );
          } else {
            alert(
              data.message ||
                "Invalid registration data. Please check your information."
            );
          }
        } else if (status === 500) {
          alert("Server error. Please try again later.");
        } else {
          alert(`Registration failed: ${data.message || "Unknown error"}`);
        }
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // pages/Onboarding.jsx - Updated handleEmailVerification function
  const handleEmailVerification = async (otp) => {
    try {
      setLoading(true);
      console.log("📧 Verifying email OTP...");
      console.log("📧 Email from formData:", formData.email);
      console.log("📧 OTP entered:", otp);

      // ✅ FIXED: Send both email and OTP
      const response = await authAPI.verifyEmailOTP({
        email: formData.email,
        otp: otp,
      });

      console.log("✅ Email verification response:", response.data);

      if (response.data.success || response.data.message) {
        console.log("✅ Email verification successful");
        alert(response.data.message || "Email verified successfully!");

        // Save token if returned
        if (response.data.token) {
          localStorage.setItem("shopOwnerToken", response.data.token);
          console.log("🔐 Token saved after email verification");
        }

        setCurrentStep(3); // Move to phone verification
      } else {
        alert(response.data.message || "Email verification failed");
      }
    } catch (error) {
      console.error("❌ Email verification error:", error);

      // Better error handling
      if (error.response) {
        const { status, data } = error.response;
        console.error("📊 Error details:", { status, data });

        if (status === 400) {
          alert(
            data.message || "Invalid or expired OTP. Please request a new one."
          );
        } else if (status === 404) {
          alert("Account not found. Please register again.");
        } else {
          alert(data.message || "Failed to verify email. Please try again.");
        }
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Email verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleResendEmailOTP = async () => {
    try {
      setLoading(true);
      console.log("📧 Resending email OTP...");

      const response = await authAPI.resendEmailOTP({
        email: formData.email,
      });

      if (response.data.success) {
        alert("OTP has been resent to your email!");
      } else {
        alert(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("❌ Resend OTP error:", error);
      alert("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // pages/Onboarding.jsx - UPDATED PHONE VERIFICATION FUNCTIONS
  const handlePhoneVerification = async (phone) => {
    try {
      setLoading(true);
      console.log("📱 Starting phone verification for:", phone);

      // Clean phone number - remove all non-digits
      const cleanedPhone = phone.replace(/\D/g, "");
      console.log("📱 Cleaned phone:", cleanedPhone);

      // Format for backend - just numbers
      const formattedPhone = cleanedPhone;
      console.log("📱 Formatted for backend:", formattedPhone);

      console.log("📤 Calling registerPhone API...");
      const response = await authAPI.registerPhone({ phone: formattedPhone });

      console.log("📱 Phone registration response:", response.data);

      if (response.data.success) {
        console.log("✅ Phone verification request sent successfully");
        console.log("📱 Response message:", response.data.message);

        // Update form data with the formatted phone
        updateFormData({ phoneNumber: `+${formattedPhone}` });

        // Show success message
        alert(response.data.message || "Verification code sent to your phone!");
        return true;
      } else {
        console.log("❌ Phone registration failed:", response.data.message);
        alert(response.data.message || "Failed to send verification code");
        return false;
      }
    } catch (error) {
      console.error("❌ Phone verification error:", error);

      // Detailed error handling
      if (error.response) {
        const { status, data } = error.response;
        console.error("📊 Error details:", { status, data });

        if (status === 400) {
          if (data.message && data.message.includes("already verified")) {
            alert("Phone already verified. Moving to next step.");
            setCurrentStep(4); // Skip to business details
            return true;
          } else {
            alert(data.message || "Invalid phone number format.");
          }
        } else if (status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("shopOwnerToken");
          localStorage.removeItem("userData");
          onBackToLogin?.();
        } else {
          alert(data.message || "Failed to send verification code.");
        }
      } else if (error.request) {
        console.error("🌐 Network error:", error.request);
        alert("Network error. Please check your connection.");
      } else {
        console.error("🚨 Other error:", error.message);
        alert("Failed to send verification code. Please try again.");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // Add this function to Onboarding.jsx
  const handleResendPhoneOTP = async () => {
    try {
      setLoading(true);
      console.log("🔄 Resending phone OTP...");

      const response = await authAPI.resendPhoneOTP();

      console.log("📱 Resend OTP response:", response.data);

      if (response.data.success) {
        alert(response.data.message || "New OTP sent to your phone!");
      } else {
        alert(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("❌ Resend OTP error:", error);

      if (error.response) {
        const { status, data } = error.response;
        console.error("📊 Error details:", { status, data });

        if (status === 400) {
          alert(data.message || "Cannot resend OTP at this time.");
        } else {
          alert(data.message || "Failed to resend OTP. Please try again.");
        }
      } else if (error.request) {
        alert("Network error. Please check your connection.");
      } else {
        alert("Failed to resend OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOTPVerification = async (otp) => {
    try {
      setLoading(true);
      console.log("📱 Verifying phone OTP:", otp);

      // Ensure OTP is a clean string
      const otpString = String(otp).replace(/\D/g, "").trim();
      console.log("📱 Clean OTP:", otpString);

      if (otpString.length !== 4) {
        alert("OTP must be exactly 4 digits");
        setLoading(false);
        return;
      }

      console.log("📤 Calling verifyPhoneOTP API...");
      const response = await authAPI.verifyPhoneOTP({ otp: otpString });

      console.log("📱 Phone OTP verification response:", response.data);

      if (response.data.success) {
        console.log("✅ Phone verification successful!");
        alert(response.data.message || "Phone verified successfully!");
        setCurrentStep(4); // Move to business details
      } else {
        console.log("❌ Phone verification failed:", response.data.message);
        alert(
          response.data.message ||
            "Phone verification failed. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Phone OTP verification error:", error);

      // Detailed error handling
      if (error.response) {
        const { status, data } = error.response;
        console.error("📊 Error details:", {
          status,
          message: data.message,
          success: data.success,
        });

        if (status === 400) {
          if (data.message === "Invalid OTP") {
            alert(
              "The OTP you entered is incorrect. Please check and try again."
            );
          } else if (data.message.includes("expired")) {
            alert("OTP has expired. Please request a new one.");
          } else if (data.message.includes("No OTP found")) {
            alert("No OTP found. Please request a new OTP first.");
          } else {
            alert(data.message || "Invalid OTP.");
          }
        } else if (status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("shopOwnerToken");
          localStorage.removeItem("userData");
          onBackToLogin?.();
        } else if (status === 404) {
          alert("Account not found. Please restart the onboarding process.");
        } else {
          alert(data.message || "Failed to verify phone.");
        }
      } else if (error.request) {
        console.error("🌐 Network error:", error.request);
        alert("Network error. Please check your connection.");
      } else {
        console.error("🚨 Other error:", error.message);
        alert("Failed to verify phone. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessDetails = async (businessData) => {
    try {
      setLoading(true);
      console.log("🏢 Saving business details...");

      // Merge business data with existing form data
      const mergedData = { ...formData, ...businessData };
      updateFormData(mergedData);

      // Send to backend
      const response = await authAPI.updateBusinessDetails(businessData);

      if (response.data.success) {
        console.log("✅ Business details saved successfully");
        setCurrentStep(5); // Move to document upload
      } else {
        alert(response.data.message || "Failed to save business details");
      }
    } catch (error) {
      console.error("❌ Business details error:", error);
      alert(error.response?.data?.message || "Failed to save business details");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documents) => {
    try {
      setLoading(true);
      console.log("📄 Uploading documents...");

      const response = await onboardingAPI.uploadDocuments(documents);

      if (response.data.success) {
        console.log("✅ Documents uploaded successfully");
        setCurrentStep(6); // Move to application review
        setApplicationStatus("pending");
      } else {
        alert(response.data.message || "Failed to upload documents");
      }
    } catch (error) {
      console.error("❌ Document upload error:", error);
      alert(error.response?.data?.message || "Failed to upload documents");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSetup = async () => {
    try {
      setLoading(true);
      console.log("👤 Setting up profile...");

      // For now, just move to next step
      setCurrentStep(8); // Move to onboarding complete
    } catch (error) {
      console.error("❌ Profile setup error:", error);
      alert("Failed to setup profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      console.log("✅ Completing onboarding...");

      const response = await onboardingAPI.completeOnboarding();

      if (response.data.success) {
        console.log("✅ Onboarding completed successfully");
        localStorage.removeItem("onboardingFormData");

        if (onComplete) onComplete();
      } else {
        alert(response.data.message || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("❌ Complete onboarding error:", error);
      alert(error.response?.data?.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RegistrationStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleRegistration}
            onBack={onBackToLogin}
            loading={loading}
          />
        );
      case 2:
        return (
          <EmailVerification
            email={formData.email}
            onVerify={handleEmailVerification}
            loading={loading}
            onBackToLogin={onBackToLogin}
            onResendOTP={handleResendEmailOTP}
          />
        );
      case 3:
        return (
          <PhoneVerification
            onVerify={handlePhoneVerification}
            onVerifyOTP={handlePhoneOTPVerification}
            onBack={handleBack}
            loading={loading}
            onResendOTP={handleResendPhoneOTP} // ✅ Add this
          />
        );
      case 4:
        return (
          <BusinessDetails
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleBusinessDetails}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 5:
        return (
          <DocumentUpload
            onUpload={handleDocumentUpload}
            onBack={handleBack}
            loading={loading}
          />
        );

      case 6:
        return (
          <ApplicationReview
            formData={formData}
            onContinue={() => setCurrentStep(7)}
            applicationStatus={applicationStatus}
            loading={loading}
            updateAuthState={updateAuthState} 
          />
        );
      case 7:
        return (
          <ProfileSetup
            formData={formData}
            updateFormData={updateFormData}
            onSave={handleProfileSetup}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 8:
        return (
          <OnboardingComplete
            onComplete={handleCompleteOnboarding}
            onBack={handleBack}
            loading={loading}
          />
        );
      default:
        return (
          <RegistrationStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleRegistration}
            onBack={onBackToLogin}
            loading={loading}
          />
        );
    }
  };

  // Don't show step indicator for application review (step 6) and profile setup (step 7)
  const showStepIndicator =
    currentStep !== 6 && currentStep !== 7 && currentStep !== 8;

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'Metropolis', sans-serif" }}
    >
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Header */}
        {/* Header */}
<div className="py-6">
  <div className="flex items-center justify-between w-full">

    {/* Center Title */}
    <div className="flex justify-center flex-1">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#000000" }}>
          Shop Owner Onboarding
        </h1>
        <p className="mt-1" style={{ color: "#555555" }}>
          Complete your store setup in a few simple steps
        </p>
      </div>
    </div>

    {/* Step Indicator on Right */}
    <div className="text-sm" style={{ color: "#555555" }}>
      Step {currentStep} of 8
    </div>

  </div>
</div>


        {/* Step Indicator - Conditionally rendered */}
        {showStepIndicator && (
          <StepIndicator currentStep={currentStep} totalSteps={8} />
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
            {renderStep()}
          </div>
        </div>

        {/* Footer */}
        <div className="py-8 mt-8 text-center border-t border-gray-200">
          <p className="text-sm" style={{ color: "#555555" }}>
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@zedcommerce.com"
              className="font-medium"
              style={{ color: "#000000" }}
            >
              support@zedcommerce.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
