// pages/contractor-register.js
import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/src/styles/contractors/index.css";

const ContractorRegister = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    business_number: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    company_website: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.business_number.trim()) {
      toast.error("Business number is required");
      return false;
    }
    if (!formData.name.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!formData.phone_number.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Company description is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log("🔵 Submit button clicked!");
    console.log("📊 Form state:", formData);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        business_number: formData.business_number,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        company_website: formData.company_website || "",
        description: formData.description,
      };

      console.log("🚀 Sending request to backend...");

      const response = await fetch("http://127.0.0.1:5000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(
        "📡 Response received:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Contractor registered successfully:", result);

      toast.success(result.message || "Contractor registered successfully!");

      // Reset form
      setFormData({
        business_number: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone_number: "",
        company_website: "",
        description: "",
      });

      // Optional: Redirect after successful registration
      // setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      console.error("❌ Registration error:", error);
      toast.error(`Failed to register: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHome = () => router.push("/home");
  const handleAbout = () => router.push("/about");
  const handleLogin = () => router.push("/login");

  return (
    <div className="contractor-register-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Navigation Bar */}
      <nav className="register-navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <a href="/">
              <img
                src="/assets/images/logo.png"
                alt="CivicFix Logo"
                width={90}
                height={90}
              />
            </a>
          </div>
          <div className="navbar-actions">
            <button className="navbar-link-btn" onClick={handleAbout}>
              About
            </button>
            <button className="navbar-link-btn" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Main Form Content */}
      <div className="register-content">
        <div className="register-form-container">
          <h1 className="register-title">Contractor Registration</h1>
          <p className="register-subtitle">
            Join our network of trusted contractors
          </p>

          <div className="v-space-30" />

          {/* Business Number */}
          <div className="form-section">
            <label className="form-label">Business Number *</label>
            <div className="v-space-10" />
            <input
              type="text"
              name="business_number"
              value={formData.business_number}
              onChange={handleChange}
              placeholder="123456789"
              className="form-input"
            />
          </div>

          <div className="v-space-25" />

          {/* Company Name */}
          <div className="form-section">
            <label className="form-label">Company Name *</label>
            <div className="v-space-10" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Acme Construction Ltd."
              className="form-input"
            />
          </div>

          <div className="v-space-25" />

          {/* Email */}
          <div className="form-section">
            <label className="form-label">Email *</label>
            <div className="v-space-10" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@company.com"
              className="form-input"
            />
          </div>

          <div className="v-space-25" />

          {/* Password */}
          <div className="form-section">
            <label className="form-label">Password *</label>
            <div className="v-space-10" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              className="form-input"
            />
          </div>

          <div className="v-space-25" />

          {/* Confirm Password */}
          <div className="form-section">
            <label className="form-label">Confirm Password *</label>
            <div className="v-space-10" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="form-input"
            />
          </div>

          <div className="v-space-25" />

          {/* Phone Number */}
          <div className="form-section">
            <label className="form-label">Phone Number *</label>
            <div className="v-space-10" />
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+1-555-0123"
              className="form-input"
            />
          </div>

          <div className="v-space-25" />

          {/* Company Website */}
          <div className="form-section">
            <label className="form-label">Company Website (Optional)</label>
            <div className="v-space-10" />
            <input
              type="url"
              name="company_website"
              value={formData.company_website}
              onChange={handleChange}
              placeholder="https://www.yourcompany.com"
              className="form-input"
            />
          </div>

          <div className="v-space-25" />

          {/* Description */}
          <div className="form-section">
            <label className="form-label">Company Description *</label>
            <div className="v-space-10" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your company, services, and experience..."
              className="description-textarea"
              rows={5}
            />
          </div>

          <div className="v-space-40" />

          {/* Submit Button */}
          <div className="submit-button-container">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`submit-button ${loading ? "loading" : ""}`}
            >
              {loading ? "Registering..." : "Register as Contractor"}
            </button>
          </div>

          <div className="v-space-20" />

          <p className="login-text">
            Already have an account?{" "}
            <a href="/login" className="login-link">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractorRegister;
