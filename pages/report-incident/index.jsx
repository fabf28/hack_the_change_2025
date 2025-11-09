// pages/submit-incident.js
import React, { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Button from "@/src/components/ui/Button/Button";
import Text from "@/src/components/ui/Input/Text";
import VSpace from "@/src/components/ui/Space/VSpace";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "maplibre-gl/dist/maplibre-gl.css"; // MapLibre controls/attribution CSS
import "@/src/styles/report-incident/index.css";

const Map = dynamic(
  () => import("react-map-gl/maplibre").then((m) => m.default),
  { ssr: false }
);
const NavigationControl = dynamic(
  () => import("react-map-gl/maplibre").then((m) => m.NavigationControl),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-map-gl/maplibre").then((m) => m.Marker),
  { ssr: false }
);

// Use the actual MapLibre library (not a promise) for the mapLib prop
import maplibregl from "maplibre-gl";

const SubmitIncident = () => {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [severity, setSeverity] = useState(undefined);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [location, setLocation] = useState(null); // { latitude, longitude, accuracy }
  const [locationLoading, setLocationLoading] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [pinMode, setPinMode] = useState(false); // 🔒 disables drag to allow precise click

  // Calgary defaults
  const defaultLat = 51.0447;
  const defaultLng = -114.0719;

  const severityOptions = [
    { value: 1, label: "🟢 Low" },
    { value: 2, label: "🟡 Medium" },
    { value: 3, label: "🔴 High" },
  ];

  const initialViewState = useMemo(
    () => ({
      longitude: location?.longitude ?? defaultLng,
      latitude: location?.latitude ?? defaultLat,
      zoom: 12,
    }),
    [location]
  );

  // Reliable hosted style (MapTiler). Put your key in NEXT_PUBLIC_MAPTILER_KEY
  const mapStyleUrl = useMemo(() => {
    const key = "c4YOf9pXj6L7xe7XWpUS";
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`;
  }, []);

  const handleMapClick = useCallback((e) => {
    const { lng, lat } = e.lngLat; // ✅ LngLat object, not iterable
    setLocation({ latitude: lat, longitude: lng, accuracy: 0 });
    toast.success("Location selected on map!");
    setPinMode(false); // auto-exit pin mode after placing (optional)
  }, []);

  const handleMapLoad = useCallback((evt) => {
    const m = evt.target;
    m.on("error", (err) => {
      // Logs 401/403/CORS/style/glyph errors
      /* eslint-disable no-console */
      console.warn("MapLibre error:", err && err.error);
    });
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRequestLocation = () => {
    setLocationLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(coords);
          setLocationLoading(false);
          setShowMap(false); // hide map if GPS used
          setPinMode(false);
          toast.success("Location captured successfully!");
        },
        (error) => {
          setLocationLoading(false);
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      setLocationLoading(false);
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const toggleMap = () => {
    setShowMap((s) => {
      const next = !s;
      if (!next) setPinMode(false);
      return next;
    });
  };

  const togglePinMode = () => {
    if (!showMap) setShowMap(true);
    setPinMode((v) => !v);
  };

  const handleSubmit = async () => {
    console.log("🔵 Submit button clicked!"); // Debug log
    console.log("📊 Form state:", {
      hasImage: !!imageFile,
      description: description.substring(0, 50),
      contactInfo: contactInfo.substring(0, 20),
      severity: severity,
      location: location,
    });

    if (!imageFile) {
      console.log("❌ Validation failed: No image");
      return toast.error("Please upload an image");
    }
    if (!description.trim()) {
      console.log("❌ Validation failed: No description");
      return toast.error("Please provide a description");
    }

    if (!contactInfo.trim()) {
      console.log("❌ Validation failed: No contact info");
      return toast.error("Please provide contact information");
    }
    if (!severity) {
      console.log("❌ Validation failed: No severity");
      return toast.error("Please select a severity level");
    }
    if (!location) {
      console.log("❌ Validation failed: No location");
      return toast.error(
        "Please capture your location or select it on the map"
      );
    }

    console.log("✅ All validations passed!"); // Debug log

    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add the image file
      formData.append("image", imageFile);

      // Add text fields matching backend expectations
      formData.append("category", "Infrastructure Issue"); // You can make this dynamic if needed
      formData.append("description", description);
      formData.append(
        "geo_data",
        JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        })
      );
      formData.append("serverity", severity.value); // Note: backend uses "serverity" (typo)

      // Parse contact info (email or phone)
      const isEmail = contactInfo.includes("@");
      if (isEmail) {
        formData.append("email", contactInfo);
        formData.append("phone_number", "");
      } else {
        formData.append("email", "");
        formData.append("phone_number", "");
      }

      formData.append("contractor_assigned", "");

      console.log("🚀 Sending request to backend..."); // Debug log

      // Send to backend
      const response = await fetch("http://localhost:9000/api/report", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });

      console.log(
        "📡 Response received:",
        response.status,
        response.statusText
      ); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Report created successfully:", result);

      toast.success(
        `Incident report submitted! Report ID: ${result.report_id}`
      );

      // Optional: Reset form or redirect
      // router.push("/home");
    } catch (error) {
      console.error("❌ Submit error:", error);
      toast.error(`Failed to submit report: ${error.message}`);
    }
  };

  const handleHome = () => router.push("/home");
  const handleAbout = () => router.push("/about");

  return (
    <div className="submit-incident-container">
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
      <nav className="submit-navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <img
              src="/assets/images/logo.png"
              alt="CivicFix Logo"
              width={90}
              height={90}
            />
          </div>
          <div className="navbar-actions">
            <button className="navbar-link-btn" onClick={handleHome}>
              Home
            </button>
            <button className="navbar-link-btn" onClick={handleAbout}>
              About
            </button>
          </div>
        </div>
      </nav>

      {/* Main Form Content */}
      <div className="submit-content">
        <div className="submit-form-container">
          <h1 className="submit-title">Submit an Incident Report</h1>
          <p className="submit-subtitle">
            Help us improve our community by reporting infrastructure issues
          </p>

          <VSpace space={30} />

          {/* Image Upload */}
          <div className="form-section">
            <label className="form-label">Upload Image *</label>
            <VSpace space={10} />
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="image-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="image-upload-label">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="image-placeholder">
                    <span className="upload-icon">📷</span>
                    <span className="upload-text">Click to upload image</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <VSpace space={25} />

          {/* Description */}
          <div className="form-section">
            <label className="form-label">Description *</label>
            <VSpace space={10} />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident in detail..."
              className="description-textarea"
              rows={5}
            />
          </div>

          <VSpace space={25} />

          {/* Contact Info */}
          <div className="form-section">
            <Text
              label="Contact Email*"
              value={contactInfo}
              handleChange={(value) => setContactInfo(value)}
              type="text"
              placeholder="your.email@example.com or (123) 456-7890"
            />
          </div>

          <VSpace space={25} />

          {/* Severity */}
          <div className="form-section">
            <label className="form-label">Severity Level *</label>
            <VSpace space={10} />
            <Select
              name="severity"
              options={severityOptions}
              value={severity}
              onChange={setSeverity}
              placeholder="Select severity level..."
              className="severity-select"
            />
          </div>

          <VSpace space={25} />

          {/* Location */}
          <div className="form-section">
            <label className="form-label">Location *</label>
            <VSpace space={10} />
            <div className="location-section">
              <div className="location-buttons">
                <Button
                  label={
                    locationLoading
                      ? "Getting Location..."
                      : location && location.accuracy > 0
                      ? "📍 GPS Location Captured"
                      : "📍 Use My Location (GPS)"
                  }
                  onClick={handleRequestLocation}
                  className={
                    location && location.accuracy > 0
                      ? "location-btn-success"
                      : "location-btn"
                  }
                  disabled={locationLoading}
                />
                <span className="location-divider">or</span>
                <Button
                  label={showMap ? "🗺️ Hide Map" : "🗺️ Select on Map"}
                  onClick={toggleMap}
                  className={
                    location && location.accuracy === 0
                      ? "location-btn-success"
                      : "location-btn-map"
                  }
                />
                {showMap && (
                  <Button
                    label={pinMode ? "✅ Pick location" : "🧷 Drop a pin"}
                    onClick={togglePinMode}
                    className={
                      pinMode ? "location-btn-success" : "location-btn-map"
                    }
                  />
                )}
              </div>

              {showMap && (
                <div className="map-wrapper">
                  <p className="map-instructions">
                    {pinMode
                      ? "Click on the map to drop a pin (dragging disabled)"
                      : "Pan/zoom the map. Enable 'Drop a pin' to select a location"}
                  </p>
                  {/* Ensure visible height */}
                  <div className="map-container" style={{ height: 400 }}>
                    <Map
                      initialViewState={initialViewState}
                      mapStyle={mapStyleUrl}
                      mapLib={maplibregl}
                      onClick={pinMode ? handleMapClick : undefined}
                      onLoad={handleMapLoad}
                      // Lock interactions while in pin mode
                      dragPan={!pinMode}
                      dragRotate={false}
                      scrollZoom={!pinMode}
                      doubleClickZoom={!pinMode}
                      // Crosshair cursor during pin mode
                      cursor={pinMode ? "crosshair" : "grab"}
                      attributionControl={true}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <NavigationControl position="top-right" />
                      {location && location.accuracy === 0 && (
                        <Marker
                          longitude={location.longitude}
                          latitude={location.latitude}
                          anchor="bottom"
                        >
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              background: "#10b981",
                              border: "2px solid white",
                              boxShadow: "0 0 0 2px rgba(16,185,129,0.35)",
                            }}
                            title="Selected location"
                          />
                        </Marker>
                      )}
                    </Map>
                  </div>
                </div>
              )}

              {location && (
                <div className="location-info">
                  <p className="location-text">
                    Latitude: {location.latitude.toFixed(6)}
                  </p>
                  <p className="location-text">
                    Longitude: {location.longitude.toFixed(6)}
                  </p>
                  {location.accuracy > 0 && (
                    <p className="location-text">
                      Accuracy: ±{location.accuracy.toFixed(0)}m
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <VSpace space={40} />

          {/* Submit */}
          <div className="submit-button-container">
            <Button
              label="Submit Incident Report"
              onClick={() => handleSubmit()}
              className="submit-button"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitIncident;
