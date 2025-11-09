// pages/home.js
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MapPicker from "@/src/components/ui/MapPicker";
import "@/src/styles/general/pages/index.css";

const Home = () => {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:9000/api/reports");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to match the component's expected format
        const transformedIncidents = data.reports.map((report) => ({
          id: report.report_id,
          image: report.image_url,
          type: report.category,
          city: "Calgary, AB", // You might want to reverse geocode this
          datetime: new Date(parseInt(report.report_time)).toLocaleString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }
          ),
          latitude: report.geo_data.latitude,
          longitude: report.geo_data.longitude,
          severity: report.serverity,
          status: report.report_status,
          description: report.description,
          email: report.email,
          phoneNumber: report.phone_number,
          contractorAssigned: report.contractor_assigned,
        }));

        setIncidents(transformedIncidents);
        setError(null);
      } catch (err) {
        console.error("Error fetching incidents:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const handleSubmitIncident = () => {
    router.push("/report-incident");
  };

  const handleAbout = () => {
    router.push("/about");
  };

  const handleContractors = () => {
    router.push("/contractors");
  };

  const handleMarkerClick = (point) => {
    console.log("Clicked incident:", point);
    const element = document.getElementById(`incident-${point.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
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
            <a href="/">
              <img
                src="/assets/images/logo.png"
                alt="CivicFix Logo"
                width={80}
                height={80}
              />
            </a>
          </div>
          <div className="navbar-actions">
            <button className="navbar-about-btn" onClick={handleAbout}>
              About
            </button>
            <button className="navbar-about-btn" onClick={handleContractors}>
              Contractors
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

          {loading && (
            <div className="loading-message">Loading incidents...</div>
          )}

          {error && (
            <div className="error-message">
              Error loading incidents: {error}
            </div>
          )}

          {!loading && !error && incidents.length === 0 && (
            <div className="no-incidents-message">
              No incidents reported yet.
            </div>
          )}

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
                  {incident.status && (
                    <p className="incident-status">Status: {incident.status}</p>
                  )}
                  {incident.description && (
                    <p className="incident-description">
                      {incident.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Map - Right Side */}
        <div className="map-section">
          <div className="map-container">
            {!loading && (
              <MapPicker
                points={incidents}
                height="100%"
                width="100%"
                onMarkerClick={handleMarkerClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
