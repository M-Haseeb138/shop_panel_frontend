import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onboardingAPI } from "@/services/api";

export const useOnboarding = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    storeName: "",
    businessType: "",
    contactName: "",
    contactEmail: "",
    phoneNumber: "",
    altPhoneNumber: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    categories: [],
    storeDescription: "",
    storeWebsite: "",
    storeOpeningYear: "",
  });

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem("shopOwnerToken");
      const response = await onboardingAPI.getStatus(token);
      if (response.success) {
        setCurrentStep(response.data.currentStep);
      }
    } catch (err) {
      console.error("Failed to fetch onboarding status:", err);
    }
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setError("");
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    setError("");
    setSuccess("");
  };

  const handleBusinessDetails = async () => {
    if (!validateBusinessDetails()) return;
    goToStep(2);
  };

  const handleEmailVerification = async (code) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("shopOwnerToken");
      const response = await onboardingAPI.verifyEmail(token, {
        email: formData.contactEmail,
        otp: code
      });

      if (response.success) {
        setSuccess("Email verified successfully!");
        setTimeout(() => goToStep(3), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documents) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("shopOwnerToken");
      const response = await onboardingAPI.uploadDocuments(token, documents);

      if (response.success) {
        setSuccess("Documents uploaded successfully!");
        setTimeout(() => goToStep(4), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSetup = async () => {
    if (!formData.storeDescription) {
      setError("Please provide a store description");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("shopOwnerToken");
      const response = await onboardingAPI.updateProfile(token, {
        shopName: formData.storeName,
        description: formData.storeDescription,
        categories: formData.categories,
      });

      if (response.success) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => goToStep(6), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("shopOwnerToken");
      const response = await onboardingAPI.completeOnboarding(token);

      if (response.success) {
        setSuccess("Onboarding completed! Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const validateBusinessDetails = () => {
    const required = ['storeName', 'businessType', 'contactName', 'contactEmail', 'phoneNumber'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      setError("Please fill all required fields");
      return false;
    }
    return true;
  };

  return {
    currentStep,
    formData,
    loading,
    error,
    success,
    updateFormData,
    goToStep,
    handleBusinessDetails,
    handleEmailVerification,
    handleDocumentUpload,
    handleProfileSetup,
    handleCompleteOnboarding
  };
};