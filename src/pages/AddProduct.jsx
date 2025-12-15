// pages/AddProduct.jsx - COMPLETE WITH WHATSAPP-STYLE IMAGE CROPPING
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import productsAPI from "../services/productsAPI";
import categoriesAPI from "../services/categoriesAPI";
import axios from "axios";
import WhatsAppImageCropper from "../components/products/WhatsAppImageCropper";

const AddProduct = ({ onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [categories, setCategories] = useState([]);

  // Image states for WhatsApp-style cropping
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [croppingImage, setCroppingImage] = useState(null);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    sku: "",
    stockQuantity: "",
    discount: "0",
    category: "",
    productType: "Other",
    targetAgeGroup: "All",
    gender: "Unisex",
    sizes: [],
    colors: [],
    tax: "0",
  });

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  // Product type options
  const productTypeOptions = [
    "Top",
    "Bottom",
    "Footwear",
    "Accessory",
    "Outerwear",
    "Other",
    "Not Applicable",
  ];

  // Age range options - FIXED to match backend
  const ageRangeOptions = [
    "0-2",
    "3-5",
    "6-8",
    "9-12",
    "13-17",
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55-64",
    "65+",
    "All",
  ];

  // Size templates based on product type
  const sizeTemplates = {
    Footwear: ["6", "7", "8", "9", "10", "11", "12", "13"],
    Top: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    Bottom: ["28", "30", "32", "34", "36", "38", "40", "42"],
    Outerwear: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
    Accessory: ["One Size", "Small", "Medium", "Large"],
    Other: ["One Size", "Small", "Medium", "Large", "XS", "S", "M", "L", "XL"],
    "Not Applicable": ["One Size"],
  };

  // 🔸 when Grocery + Other => hide age, gender, sizes, colors
  const isGroceryOther =
    formData.category === "Grocery" && formData.productType === "Other";

  // Check authentication and load data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const token = localStorage.getItem("shopOwnerToken");
      const storedUserData = localStorage.getItem("userData");

      if (!token || !storedUserData) {
        console.log("🔐 No token or user data, redirecting to login");
        navigate("/login");
        return;
      }

      try {
        const user = JSON.parse(storedUserData);

        console.log("🛍️ User data check:", {
          accountStatus: user.accountStatus,
          onboarding: user.onboarding,
          id: user._id,
          email: user.email,
        });

        // ✅ FIXED LOGIC: Check account status only
        const accountStatus = user.accountStatus || "Pending";
        const isAccountApproved =
          accountStatus === "Active" ||
          accountStatus === "Verified" ||
          accountStatus === "active" ||
          accountStatus === "verified";

        if (!isAccountApproved) {
          console.log("❌ Account not approved, status:", accountStatus);
          alert("Please wait for admin approval before adding products.");
          navigate("/pending-approval");
          return;
        }

        console.log("✅ Account is approved, loading categories...");
        setIsAuthenticated(true);
        setUserData(user);

        await loadCategories();
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkAuthAndLoadData();
  }, [navigate]);

  // ✅ FIXED: Load categories from database
  const loadCategories = async () => {
    try {
      console.log("📋 Fetching categories from API...");
      const response = await categoriesAPI.getCategories();
      console.log("📋 Categories API response structure:", response.data);

      const responseData = response.data;
      console.log("Full response data:", responseData);

      let categoriesArray = [];

      if (
        responseData &&
        responseData.categories &&
        Array.isArray(responseData.categories)
      ) {
        console.log("✅ Found categories array in response.data.categories");
        categoriesArray = responseData.categories;
      } else if (Array.isArray(responseData)) {
        console.log("⚠️ Response.data is directly an array");
        categoriesArray = responseData;
      } else {
        console.error(
          "❌ Unexpected categories response format:",
          responseData
        );
      }

      console.log("✅ Processed categories array:", categoriesArray);
      setCategories(categoriesArray);
    } catch (error) {
      console.error("❌ Failed to load categories:", error);

      if (error.response) {
        console.error("Error response:", {
          status: error.response.status,
          data: error.response.data,
        });

        if (error.response.status === 401) {
          alert("Session expired. Please login again.");
          localStorage.removeItem("shopOwnerToken");
          localStorage.removeItem("userData");
          navigate("/login");
        }
      }

      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log(`📝 Field ${name} changed to:`, value);

    const numericFields = ["price", "tax", "discount", "stockQuantity"];

    if (numericFields.includes(name)) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        if (name === "tax" || name === "discount") {
          setFormData((prev) => ({
            ...prev,
            [name]: value === "" ? "" : String(value),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === "productType") {
      setSelectedSizes([]);
      setFormData((prev) => ({
        ...prev,
        sizes: [],
      }));
    }
  };

  useEffect(() => {
    console.log("📊 Form data updated:", formData);
  }, [formData]);

  const handlePreview = async () => {
    if (!formData.title) {
      alert("Please enter a product title to preview");
      return;
    }

    if (!formData.category) {
      alert("Please select a category to preview");
      return;
    }

    try {
      console.log("📸 Creating preview with images:", images);

      const imagePreviews = [];
      for (const imageFile of images) {
        if (imageFile instanceof File) {
          try {
            const reader = new FileReader();

            const imageDataUrl = await new Promise((resolve, reject) => {
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(new Error("Failed to read image"));
              reader.readAsDataURL(imageFile);
            });

            imagePreviews.push({
              dataUrl: imageDataUrl,
              name: imageFile.name,
              type: imageFile.type,
              size: imageFile.size,
              file: imageFile,
            });
          } catch (error) {
            console.error("❌ Error reading image:", error);
          }
        }
      }

      console.log("✅ Created image previews:", imagePreviews.length);

      const previewData = {
        title: formData.title,
        description: formData.description || "",
        price: parseFloat(formData.price) || 0,
        discount: parseFloat(formData.discount) || 0,
        tax: parseFloat(formData.tax) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        category: formData.category,
        productType: formData.productType,
        targetAgeGroup: formData.targetAgeGroup,
        gender: formData.gender,
        sku: formData.sku || "",
        sizes: selectedSizes,
        colors: selectedColors,
        shop: userData?._id,
        shopName: userData?.shop?.name || userData?.name || "My Shop",
        createdAt: new Date().toISOString(),
      };

      console.log("📦 Preview data prepared:", previewData);

      const previewPayload = {
        productData: previewData,
        images: imagePreviews,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        "productPreviewData",
        JSON.stringify(previewPayload)
      );

      console.log("🚀 Navigating to preview...");
      navigate("/preview-product");
    } catch (error) {
      console.error("❌ Error in preview:", error);
      alert("Failed to generate preview. Please try again.");
    }
  };

  // WhatsApp-style: Handle Image Upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }

      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} is not an image.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      const file = validFiles[0];

      // Create preview URL for cropper
      const reader = new FileReader();
      reader.onload = (event) => {
        setCroppingImage(event.target.result);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  // WhatsApp-style: Handle cropped image save
  const handleSaveCroppedImage = (croppedFile) => {
    setImages([croppedFile]);
    alert("✅ Image cropped and saved successfully!");
  };

  const removeImage = () => {
    setImages([]);
  };

  // Handle size selection from template
  const handleSizeSelect = (size) => {
    if (!selectedSizes.includes(size)) {
      const newSizes = [...selectedSizes, size];
      setSelectedSizes(newSizes);
      setFormData((prev) => ({ ...prev, sizes: newSizes }));
    }
  };

  // Handle custom size addition
  const handleAddCustomSize = () => {
    if (sizeInput.trim() && !selectedSizes.includes(sizeInput.trim())) {
      const newSizes = [...selectedSizes, sizeInput.trim()];
      setSelectedSizes(newSizes);
      setFormData((prev) => ({ ...prev, sizes: newSizes }));
      setSizeInput("");
    }
  };

  const handleRemoveSize = (sizeToRemove) => {
    const newSizes = selectedSizes.filter((size) => size !== sizeToRemove);
    setSelectedSizes(newSizes);
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !selectedColors.includes(colorInput.trim())) {
      const newColors = [...selectedColors, colorInput.trim()];
      setSelectedColors(newColors);
      setFormData((prev) => ({ ...prev, colors: newColors }));
      setColorInput("");
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    const newColors = selectedColors.filter((color) => color !== colorToRemove);
    setSelectedColors(newColors);
    setFormData((prev) => ({ ...prev, colors: newColors }));
  };

  const getFreshToken = async () => {
    try {
      const storedEmail = localStorage.getItem("userEmail");
      const storedPassword = localStorage.getItem("userPassword");

      if (!storedEmail || !storedPassword) {
        throw new Error("No stored credentials. Please login again.");
      }

      console.log("🔄 Getting fresh token with stored credentials...");

      const loginResponse = await axios.post(
        "https://cultural-marketplace-backend-npv2.vercel.app/api/shop-owner/login",
        {
          email: storedEmail,
          password: storedPassword,
        }
      );

      const newToken = loginResponse.data.token;
      localStorage.setItem("shopOwnerToken", newToken);

      console.log("✅ Got fresh token:", newToken.substring(0, 30) + "...");

      return newToken;
    } catch (error) {
      console.error("❌ Failed to get fresh token:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("shopOwnerToken");

      console.log("🔐 Token check:", token ? "Token exists" : "No token");

      if (!token) {
        alert("Please login to create products.");
        navigate("/login");
        return;
      }

      const requiredFields = [
        "title",
        "price",
        "category",
        "productType",
        "targetAgeGroup",
        "sku",
        "stockQuantity",
        "tax",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        alert(`Please fill all required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      if (images.length === 0) {
        alert("Please upload at least one product image");
        setLoading(false);
        return;
      }

      // Create FormData
      const productFormData = new FormData();

      // Append required fields
      productFormData.append("title", formData.title.trim());
      productFormData.append("description", formData.description?.trim() || "");
      productFormData.append("price", parseFloat(formData.price));
      productFormData.append("category", formData.category);
      productFormData.append("productType", formData.productType);
      productFormData.append("targetAgeGroup", formData.targetAgeGroup);
      productFormData.append("sku", formData.sku.trim());
      productFormData.append("stockQuantity", parseInt(formData.stockQuantity));
      productFormData.append("tax", parseFloat(formData.tax));
      productFormData.append("discount", parseFloat(formData.discount) || 0);
      productFormData.append("gender", formData.gender);
      productFormData.append("status", "published");

      if (selectedSizes.length > 0) {
        productFormData.append("sizes", JSON.stringify(selectedSizes));
      }

      if (selectedColors.length > 0) {
        productFormData.append("colors", JSON.stringify(selectedColors));
      }

      // Append image with key 'image' (singular)
      if (images[0]) {
        productFormData.append("image", images[0]);
        console.log("📸 Appending image:", images[0].name);
      }

      console.log("📦 FormData contents:");
      for (let [key, value] of productFormData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`
          );
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      console.log("🚀 Creating product...");

      const response = await axios.post(
        "https://cultural-marketplace-backend-npv2.vercel.app/api/products",
        productFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 60000,
        }
      );

      console.log("✅ Product creation response:", response.data);

      if (response.data.success) {
        alert("✅ Product published successfully!");

        setFormData({
          title: "",
          description: "",
          price: "",
          sku: "",
          stockQuantity: "",
          discount: "0",
          category: "",
          productType: "Other",
          targetAgeGroup: "All",
          gender: "Unisex",
          sizes: [],
          colors: [],
          tax: "0",
        });
        setImages([]);
        setSelectedSizes([]);
        setSelectedColors([]);

        navigate("/products");
      } else {
        alert(response.data.message || "Failed to create product");
      }
    } catch (error) {
      console.error("❌ Product creation error:", error);

      let errorMessage = "Failed to create product. ";

      if (error.response) {
        console.error("Response data:", error.response.data);

        if (error.response.status === 401) {
          errorMessage = "Session expired. Please login again.";
          localStorage.removeItem("shopOwnerToken");
          localStorage.removeItem("userData");
          setTimeout(() => navigate("/login"), 1500);
        } else if (error.response.status === 400) {
          errorMessage =
            error.response.data.message ||
            "Invalid data. Please check all fields.";
          if (error.response.data.errors) {
            errorMessage +=
              "\n" +
              error.response.data.errors
                .map((err) => err.msg || err)
                .join("\n");
          }
        } else if (error.response.status === 413) {
          errorMessage = "Image file too large. Maximum size is 5MB.";
        } else if (error.response.status === 415) {
          errorMessage =
            "Unsupported image format. Please use JPG, PNG, or WEBP.";
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error.request) {
        console.error("Request error:", error.request);
        errorMessage = "Network error. Please check your connection.";
      } else {
        console.error("Error:", error.message);
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);

    try {
      const token = localStorage.getItem("shopOwnerToken");

      if (!token) {
        alert("Please login to save draft.");
        navigate("/login");
        return;
      }

      if (!formData.title || !formData.category) {
        alert(
          "Please at least provide product title and category to save as draft."
        );
        setSavingDraft(false);
        return;
      }

      const productFormData = new FormData();

      productFormData.append("title", formData.title.trim());
      productFormData.append("description", formData.description?.trim() || "");
      productFormData.append(
        "price",
        formData.price ? parseFloat(formData.price) : 0
      );
      productFormData.append("category", formData.category);
      productFormData.append("productType", formData.productType);
      productFormData.append("targetAgeGroup", formData.targetAgeGroup);
      productFormData.append("sku", formData.sku?.trim() || "");
      productFormData.append(
        "stockQuantity",
        formData.stockQuantity ? parseInt(formData.stockQuantity) : 0
      );
      productFormData.append(
        "tax",
        formData.tax ? parseFloat(formData.tax) : 0
      );
      productFormData.append(
        "discount",
        formData.discount ? parseFloat(formData.discount) : 0
      );
      productFormData.append("gender", formData.gender);
      productFormData.append("sizes", JSON.stringify(selectedSizes));
      productFormData.append("colors", JSON.stringify(selectedColors));
      productFormData.append("status", "draft");

      if (images[0]) {
        productFormData.append("image", images[0]);
      }

      console.log("📦 Saving draft with data:", {
        title: formData.title,
        category: formData.category,
        status: "draft",
      });

      const response = await axios.post(
        "https://cultural-marketplace-backend-npv2.vercel.app/api/products",
        productFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("✅ Product saved as draft successfully!");

        if (typeof onBack === "function") {
          onBack();
        } else {
          navigate("/products");
        }
      } else {
        alert(response.data.message || "Failed to save draft");
      }
    } catch (error) {
      console.error("❌ Draft save error:", error);

      let errorMessage = "Failed to save draft. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors
          .map((err) => err.msg || err)
          .join(", ");
      }

      alert(errorMessage);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleDiscard = () => {
    if (
      window.confirm(
        "Are you sure you want to discard this product? All unsaved changes will be lost."
      )
    ) {
      if (typeof onBack === "function") {
        onBack();
      } else {
        navigate("/products");
      }
    }
  };

  const getAvailableSizes = () => {
    return sizeTemplates[formData.productType] || sizeTemplates.Other;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-t-transparent animate-spin"
            style={{ borderColor: "#000000" }}
          ></div>
          <p
            className="text-gray-600"
            style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}
          >
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 bg-gray-50"
      style={{ fontFamily: "'Metropolis', sans-serif" }}
    >
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (typeof onBack === "function") {
                onBack();
              } else {
                navigate("/products");
              }
            }}
            className="flex items-center mb-4 space-x-2 transition-colors hover:opacity-80"
            style={{
              color: "#000000",
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 500,
            }}
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Products</span>
          </button>
          <h1
            className="text-3xl font-bold"
            style={{
              color: "#000000",
              fontFamily: "'Metropolis', sans-serif",
              fontWeight: 700,
            }}
          >
            Add New Product
          </h1>
          <p
            className="mt-2 text-gray-600"
            style={{ fontFamily: "'Metropolis', sans-serif", fontWeight: 400 }}
          >
            Fill in the details below to list your product
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Information Card */}
          <div
            className="p-6 border rounded-lg shadow-sm"
            style={{
              borderColor: "#555555",
              backgroundColor: "rgba(85, 85, 85, 0.05)",
            }}
          >
            <h2
              className="mb-4 text-xl font-semibold"
              style={{
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 600,
              }}
            >
              Shop Information
            </h2>
            <div className="space-y-3">
              <div
                className="flex items-center justify-between p-3 bg-white rounded-lg"
                style={{ border: "1px solid #555555" }}
              >
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: "#555555",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Shop Name
                  </p>
                  <p
                    className="font-semibold"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {userData?.shop?.name || userData?.name || "My Shop"}
                  </p>
                </div>
                <div
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{
                    color: "#555555",
                    backgroundColor: "#bebebeff",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Active
                </div>
              </div>

              {userData?.email && (
                <div
                  className="p-3 bg-white rounded-lg"
                  style={{ border: "1px solid #555555" }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: "#555555",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Contact Email
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {userData.email}
                  </p>
                </div>
              )}

              {userData?.businessDetails?.address && (
                <div
                  className="p-3 bg-white rounded-lg"
                  style={{ border: "1px solid #555555" }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{
                      color: "#555555",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Business Location
                  </p>
                  <p
                    className="font-medium"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {userData.businessDetails.address.street},{" "}
                    {userData.businessDetails.address.city}
                  </p>
                </div>
              )}
            </div>
            <p
              className="mt-4 text-sm"
              style={{
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 400,
              }}
            >
              Products will be listed under your shop. You can manage all your
              products from the Products page.
            </p>
          </div>

          {/* Essential Information Card */}
          <div
            className="p-6 bg-white border rounded-lg shadow-sm"
            style={{ borderColor: "#555555" }}
          >
            <h2
              className="mb-4 text-xl font-semibold"
              style={{
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 600,
              }}
            >
              Essential Information
            </h2>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label
                  className="block mb-2 text-sm font-medium"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "#555555",
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                  placeholder="Enter product title"
                  required
                />
              </div>

              {/* Product Description */}
              <div>
                <label
                  className="block mb-2 text-sm font-medium"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Product Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "#555555",
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                  placeholder="Enter detailed description including features, benefits, and usage instructions"
                />
              </div>

              {/* Price and Tax */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Price ($) *
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-2"
                      style={{ color: "#555555" }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full py-2 pl-8 pr-3 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#555555",
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Tax (%) *
                  </label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-2"
                      style={{ color: "#555555" }}
                    >
                      %
                    </span>
                    <input
                      type="number"
                      name="tax"
                      value={formData.tax}
                      onChange={handleInputChange}
                      className="w-full py-2 pl-8 pr-3 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#555555",
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Discount */}
              <div>
                <label
                  className="block mb-2 text-sm font-medium"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Discount (%)
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-2"
                    style={{ color: "#555555" }}
                  >
                    %
                  </span>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full py-2 pl-8 pr-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#555555",
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 400,
                    }}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label
                  className="block mb-2 text-sm font-medium"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "#555555",
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* SKU */}
              <div>
                <label
                  className="block mb-2 text-sm font-medium"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  SKU (Stock Keeping Unit) *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "#555555",
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 400,
                  }}
                  placeholder="e.g. PROD-001"
                  required
                />
              </div>

            
              {/* Image Upload - WHATSAPP STYLE */}
              <div>
                <label
                  className="block mb-2 text-sm font-medium"
                  style={{
                    color: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Product Image *
                </label>

                {/* Upload Button */}
                <div
                  className="p-8 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer hover:border-black"
                  style={{ borderColor: "#555555" }}
                  onClick={() => document.getElementById("imageUpload").click()}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="flex items-center justify-center w-16 h-16 mb-4 rounded-full"
                      style={{ backgroundColor: "#f0f2f5" }}
                    >
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: "#555555" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h5
                      className="mb-2 text-lg font-medium"
                      style={{
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {images.length > 0
                        ? "Change Product Image"
                        : "Add Product Image"}
                    </h5>
                    <p
                      className="mb-3 text-sm"
                      style={{
                        color: "#555555",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      {images.length > 0
                        ? "Tap to upload a different image"
                        : "Tap to upload from your device"}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: "#555555",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      JPG, PNG • Max 5MB • 
                      {/* WhatsApp-style cropping */}
                    </p>
                  </div>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {/* Image Preview - Only Image */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4
                        className="text-sm font-medium"
                        style={{
                          color: "#000000",
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        Selected Image (164×104)
                      </h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("imageUpload").click()
                          }
                          className="px-3 py-1 text-sm font-medium transition-colors border rounded-lg hover:bg-gray-50"
                          style={{
                            color: "#000000",
                            borderColor: "#555555",
                            fontFamily: "'Metropolis', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="px-3 py-1 text-sm font-medium text-white transition-colors rounded-lg hover:opacity-90"
                          style={{
                            backgroundColor: "#dc2626",
                            fontFamily: "'Metropolis', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Simple Image Preview Only */}
                    <div
                      className="flex flex-col items-center justify-center p-6 border rounded-lg"
                      style={{
                        borderColor: "#555555",
                        backgroundColor: "#f9f9f9",
                        minHeight: "200px",
                      }}
                    >
                      {/* Centered Image Container */}
                      <div
                        className="relative w-48 h-32 mb-4 overflow-hidden border rounded-lg"
                        style={{
                          borderColor: "#e2e2e2",
                          backgroundColor: "#ffffff",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        <img
                          src={URL.createObjectURL(images[0])}
                          alt="Product Preview"
                          className="object-contain w-full h-full"
                        />
                      </div>

                      {/* Frame Size Badge */}
                      <div className="mb-4">
                        <span
                          className="px-3 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: "#e2e2e2",
                            color: "#555555",
                            fontFamily: "'Metropolis', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          164×104 px Frame
                        </span>
                      </div>

                      {/* Recrop Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setCroppingImage(event.target.result);
                            setIsCropperOpen(true);
                          };
                          reader.readAsDataURL(images[0]);
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg hover:opacity-90"
                        style={{
                          backgroundColor: "#000000",
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Recrop Image
                      </button>

                    
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Details Card */}
          <div
            className="p-6 bg-white border rounded-lg shadow-sm"
            style={{ borderColor: "#555555" }}
          >
            <h2
              className="mb-4 text-xl font-semibold"
              style={{
                color: "#000000",
                fontFamily: "'Metropolis', sans-serif",
                fontWeight: 600,
              }}
            >
              Product Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#555555",
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 400,
                    }}
                    required
                  >
                    <option value="">Select category</option>
                    {Array.isArray(categories) && categories.length > 0 ? (
                      categories.map((category) => (
                        <option
                          key={category._id || category.category_id}
                          value={category.category_name}
                        >
                          {category.category_name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        {categories.length === 0
                          ? "No categories available"
                          : "Loading categories..."}
                      </option>
                    )}
                  </select>
                  {categories.length === 0 && (
                    <p
                      className="mt-1 text-xs text-gray-500"
                      style={{
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      No categories available. Please contact admin to add
                      categories.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Product Type *
                  </label>
                  <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#555555",
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 400,
                    }}
                    required
                  >
                    {productTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 🔸 Hide Age/Gender when Grocery + Other */}
              {!isGroceryOther && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      className="block mb-2 text-sm font-medium"
                      style={{
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Target Age Group *
                    </label>
                    <select
                      name="targetAgeGroup"
                      value={formData.targetAgeGroup}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#555555",
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                      required
                    >
                      {ageRangeOptions.map((age) => (
                        <option key={age} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block mb-2 text-sm font-medium"
                      style={{
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#555555",
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Dynamic Sizes Section – hidden when Grocery + Other */}
              {!isGroceryOther && (
                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Sizes for {formData.productType}
                  </label>

                  {/* Quick Size Selection */}
                  <div className="mb-3">
                    <p
                      className="mb-2 text-sm"
                      style={{
                        color: "#555555",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                    >
                      Quick select sizes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableSizes().map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeSelect(size)}
                          disabled={selectedSizes.includes(size)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                            selectedSizes.includes(size)
                              ? "text-white"
                              : "text-gray-700 hover:opacity-90"
                          }`}
                          style={{
                            backgroundColor: selectedSizes.includes(size)
                              ? "#000000"
                              : "rgba(85, 85, 85, 0.1)",
                            fontFamily: "'Metropolis', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Size Input */}
                  <div className="flex mb-2 space-x-2">
                    <input
                      type="text"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#555555",
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                      placeholder="Add custom size"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddCustomSize())
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      className="px-4 py-2 text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none"
                      style={{
                        backgroundColor: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Add Custom
                    </button>
                  </div>

                  {/* Selected Sizes */}
                  <div className="flex flex-wrap gap-2">
                    {selectedSizes.map((size, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                        style={{
                          backgroundColor: "rgba(39, 200, 64, 0.1)",
                          color: "#27C840",
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(size)}
                          className="ml-2 transition-colors hover:opacity-70"
                          style={{ color: "#27C840" }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors – hidden when Grocery + Other */}
              {!isGroceryOther && (
                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{
                      color: "#000000",
                      fontFamily: "'Metropolis', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Colors
                  </label>
                  <div className="flex mb-2 space-x-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: "#555555",
                        color: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 400,
                      }}
                      placeholder="Add color (e.g., Red, Blue, Green)"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddColor())
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-4 py-2 text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none"
                      style={{
                        backgroundColor: "#000000",
                        fontFamily: "'Metropolis', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedColors.map((color, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                        style={{
                          backgroundColor: "rgba(39, 200, 64, 0.1)",
                          color: "#27C840",
                          fontFamily: "'Metropolis', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(color)}
                          className="ml-2 transition-colors hover:opacity-70"
                          style={{ color: "#27C840" }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="sticky bottom-0 p-6 bg-white border rounded-lg shadow-sm"
            style={{ borderColor: "#555555" }}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleDiscard}
                className="flex items-center px-6 py-2 space-x-2 transition-colors hover:opacity-80"
                style={{
                  color: "#000",
                  fontFamily: "'Metropolis', sans-serif",
                  fontWeight: 500,
                }}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Discard</span>
              </button>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="flex items-center px-6 py-2 space-x-2 transition-colors border rounded-lg hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: "#000000",
                    borderColor: "#555555",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {savingDraft ? (
                    <>
                      <div
                        className="w-5 h-5 border-2 rounded-full border-t-transparent animate-spin"
                        style={{ borderColor: "#000000" }}
                      ></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Save Draft</span>
                    </>
                  )}
                </button>

                {/* Preview Button */}
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!formData.title || !formData.category}
                  className="flex items-center px-6 py-2 space-x-2 transition-colors border rounded-lg hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    color: "#000",
                    borderColor: "#bebebeff",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>Preview</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 space-x-2 text-white transition-colors rounded-lg hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "#000000",
                    fontFamily: "'Metropolis', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
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
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span>Publish Product</span>
                    </>
                  )} 
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* WhatsApp Image Cropper Modal */}
      {isCropperOpen && croppingImage && (
        <WhatsAppImageCropper
          isOpen={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setCroppingImage(null);
          }}
          image={croppingImage}
          onSave={handleSaveCroppedImage}
          aspectRatio={164 / 104} // Specific 164x104 aspect ratio
        />
      )}

      {/* Add Metropolis font styles */}
      <style jsx global>{`
        @import url("https://fonts.cdnfonts.com/css/metropolis");

        body {
          font-family: "Metropolis", sans-serif;
        }

        input:focus,
        select:focus,
        textarea:focus,
        button:focus {
          border-color: #000000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

AddProduct.defaultProps = {
  onBack: null,
};

export default AddProduct;
