<<<<<<< Updated upstream
import React from "react";
import Button from "@/src/components/ui/Button/Button";
import Text from "@/src/components/ui/Input/Text";
import VSpace from "@/src/components/ui/Space/VSpace";
import Alert from "@/src/components/ui/Alerts/Alert";
import "@/src/styles/general/pages/signin.css";

const Home = () => {
  return (
    <div id="container">
      <div id="sign-in-container">
        <h1>Sign In Page</h1>
        <Alert type="error" message="Wrong email address" />
        <Text
          label="Email address"
          type="text"
          placeholder="example@domain.com"
          className="form-input"
        />
        <VSpace space={15} />
        <Text type="password" label="Password" className="form-input" />
        <VSpace space={40} />
        <Button
          label="Sign In"
          className="form-button"
          onClick={() => console.log("Signing in...")}
        />
=======
// pages/home.js
import React, { useState } from "react";
import { useRouter } from "next/router";
import MapPicker from "@/src/components/ui/MapPicker";
import "@/src/styles/general/pages/index.css";

const Home = () => {
  const router = useRouter();

  // Sample incident data with coordinates - replace with real data later
  const [incidents] = useState([
    {
      id: 1,
      image: "/assets/images/incidents/pothole1.jpg",
      type: "Pothole",
      city: "Calgary, AB",
      datetime: "Nov 7, 2025 2:30 PM",
      latitude: 51.09640448453306,
      longitude: -114.13143914032896,
    },
    {
      id: 2,
      image: "/assets/images/incidents/streetlight1.jpg",
      type: "Broken Streetlight",
      city: "Calgary, AB",
      datetime: "Nov 7, 2025 1:15 PM",
      latitude: 51.042,
      longitude: -114.074,
    },
    {
      id: 3,
      image: "/assets/images/incidents/flooding1.jpg",
      type: "Street Flooding",
      city: "Calgary, AB",
      datetime: "Nov 6, 2025 11:45 AM",
      latitude: 51.051,
      longitude: -114.069,
    },
    {
      id: 4,
      image: "/assets/images/incidents/tree1.jpg",
      type: "Fallen Tree",
      city: "Calgary, AB",
      datetime: "Nov 6, 2025 9:20 AM",
      latitude: 51.048,
      longitude: -114.063,
    },
    {
      id: 5,
      image: "/assets/images/incidents/graffiti1.jpg",
      type: "Graffiti",
      city: "Calgary, AB",
      datetime: "Nov 5, 2025 4:30 PM",
      latitude: 51.045,
      longitude: -114.058,
    },
    {
      id: 6,
      image: "/assets/images/incidents/pothole2.jpg",
      type: "Pothole",
      city: "Calgary, AB",
      datetime: "Nov 5, 2025 10:15 AM",
      latitude: 51.055,
      longitude: -114.075,
    },
    {
      id: 7,
      image: "/assets/images/incidents/sign1.jpg",
      type: "Damaged Road Sign",
      city: "Calgary, AB",
      datetime: "Nov 4, 2025 3:45 PM",
      latitude: 51.038,
      longitude: -114.08,
    },
    {
      id: 8,
      image: "/assets/images/incidents/sidewalk1.jpg",
      type: "Cracked Sidewalk",
      city: "Calgary, AB",
      datetime: "Nov 4, 2025 12:00 PM",
      latitude: 51.052,
      longitude: -114.067,
    },
  ]);

  const handleSubmitIncident = () => {
    router.push("/submit-incident");
  };

  const handleAbout = () => {
    router.push("/about");
  };

  const handleMarkerClick = (point) => {
    console.log("Clicked incident:", point);
    // Optional: scroll to the incident card or show details
    const element = document.getElementById(`incident-${point.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Optional: add a temporary highlight effect
      element.classList.add("highlight");
      setTimeout(() => element.classList.remove("highlight"), 2000);
    }
  };

  return (
    <div className="home-container">
      {/* Sticky Navigation Bar */}
      <nav className="home-navbar">
        <div className="navbar-content">
          <div className="navbar-logo">
            <img
              src="/assets/images/logo.png"
              alt="CivicFix Logo"
              width={80}
              height={80}
            />
          </div>
          <div className="navbar-actions">
            <button className="navbar-about-btn" onClick={handleAbout}>
              About
            </button>
            <button
              className="navbar-submit-btn"
              onClick={handleSubmitIncident}
            >
              Submit an Incident
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-content">
        {/* Incidents Grid - Scrollable Left Side */}
        <div className="incidents-section">
          <h2 className="incidents-title">Recent Incidents</h2>
          <div className="incidents-grid">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                id={`incident-${incident.id}`}
                className="incident-card"
              >
                <div className="incident-image-container">
                  <img
                    src={incident.image}
                    alt={incident.type}
                    className="incident-image"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Incident+Image";
                    }}
                  />
                </div>
                <div className="incident-details">
                  <h3 className="incident-type">{incident.type}</h3>
                  <p className="incident-city">{incident.city}</p>
                  <p className="incident-datetime">{incident.datetime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Map - Right Side */}
        <div className="map-section">
          <div className="map-container">
            <MapPicker
              points={incidents}
              emoji="🚧"
              height="100%"
              width="100%"
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

export default Home;
