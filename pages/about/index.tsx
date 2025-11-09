// pages/about.js
import React from "react";
import "@/src/styles/about/pages/index.css";

const About = () => {
  return (
    <div className="about-container">
      {/* Header */}
      <div className="about-header">
        <div className="about-header-content">
          <img
            src="/assets/images/logo.png"
            width={150}
            height={150}
            alt="CivicFix Logo"
            className="about-logo"
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="about-content">
        <div className="about-hero">
          <h1 className="about-title">About CivicFix</h1>
          <p className="about-subtitle">
            Empowering communities to report, track, and resolve infrastructure
            issues through intelligent geospatial technology
          </p>
        </div>

        {/* Mission Statement */}
        <div className="about-section mission-section">
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            CivicFix bridges the gap between citizens and civic infrastructure
            management. We provide a geospatial reporting platform where
            communities can upload geotagged photos of infrastructure and
            disaster issues. Our AI-powered system classifies, deduplicates, and
            scores severity, displaying everything on a live map for contractors
            and agencies to take action—creating a transparent, efficient loop
            from report to resolution.
          </p>
        </div>

        {/* How It Works */}
        <div className="how-it-works-section">
          <h2 className="section-title center">How CivicFix Works</h2>
          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number step-1">1</div>
              <h3 className="step-title">Citizens Report</h3>
              <p className="step-text">
                Upload geotagged photos of infrastructure issues like potholes,
                broken streetlights, flooding, or fallen trees. Stay anonymous
                or track your reports.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number step-2">2</div>
              <h3 className="step-title">AI Processing</h3>
              <p className="step-text">
                Our intelligent system automatically classifies issues, removes
                duplicates, and scores severity to prioritize urgent problems.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number step-3">3</div>
              <h3 className="step-title">Action & Resolution</h3>
              <p className="step-text">
                Contractors and agencies view reports on a live map, submit
                bids, and close the loop with verified fixes.
              </p>
            </div>
          </div>
        </div>

        {/* Who Benefits */}
        <div className="benefits-section">
          <h2 className="section-title center">Who Benefits from CivicFix</h2>
          <div className="benefits-container">
            {/* Citizens */}
            <div className="benefit-card benefit-citizens">
              <h3 className="benefit-title">👥 Citizens</h3>
              <p className="benefit-text">
                A simple way to report infrastructure issues and track outcomes.
                Choose to report anonymously or follow your submissions through
                to resolution. Your voice matters in building better
                communities.
              </p>
            </div>

            {/* Contractors */}
            <div className="benefit-card benefit-contractors">
              <h3 className="benefit-title">🔧 Contractors & Utilities</h3>
              <p className="benefit-text">
                Discover qualified opportunities in your service area. Subscribe
                to specific regions and issue categories, submit interest for
                projects, and manage your work efficiently through our platform.
              </p>
            </div>

            {/* Government */}
            <div className="benefit-card benefit-government">
              <h3 className="benefit-title">🏛️ Government & Agencies</h3>
              <p className="benefit-text">
                A unified dashboard to triage reports, verify issues, set
                priorities, and dispatch resources. Seamlessly export data to
                internal work-order systems and maintain accountability.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="about-section features-section">
          <h2 className="section-title center">Key Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-check">✓</div>
              <div className="feature-content">
                <h4 className="feature-title">Geospatial Mapping</h4>
                <p className="feature-text">
                  Live map visualization of all reported issues with precise
                  locations
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-check">✓</div>
              <div className="feature-content">
                <h4 className="feature-title">AI Classification</h4>
                <p className="feature-text">
                  Intelligent categorization and severity scoring of reports
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-check">✓</div>
              <div className="feature-content">
                <h4 className="feature-title">Smart Deduplication</h4>
                <p className="feature-text">
                  Automatic detection and merging of duplicate reports
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-check">✓</div>
              <div className="feature-content">
                <h4 className="feature-title">Bidding System</h4>
                <p className="feature-text">
                  Contractors can submit proposals and manage projects
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-check">✓</div>
              <div className="feature-content">
                <h4 className="feature-title">Verification Workflow</h4>
                <p className="feature-text">
                  Track issues from report to verified resolution
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-check">✓</div>
              <div className="feature-content">
                <h4 className="feature-title">Privacy Options</h4>
                <p className="feature-text">
                  Report anonymously or with attribution—your choice
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <h2 className="cta-title">Join Us in Building Better Communities</h2>
          <p className="cta-text">
            Whether you're a citizen looking to report an issue, a contractor
            seeking opportunities, or an agency managing infrastructure,
            CivicFix is here to help.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="cta-button"
          >
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="about-footer">
        <div className="about-footer-content">
          <p>© 2025 CivicFix. Building better infrastructure together.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
