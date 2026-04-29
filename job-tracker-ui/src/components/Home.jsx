import React from "react";

export default function Home({ onLogin, onRegister }) {
  return (
    <div className="hero-container">
      <h1 className="hero-title">TrackHire</h1>
      
      <h2 className="hero-tagline">
        Track every opportunity. Own your career journey.
      </h2>
      
      <p className="hero-subtext">
        Manage applications, monitor progress, and stay organized — all in one place.
      </p>

      <div className="hero-ctas">
        <button
          id="hero-get-started"
          className="btn btn-hero-primary"
          onClick={onRegister}
        >
          Get Started
        </button>
        <button
          id="hero-login"
          className="btn btn-hero-secondary"
          onClick={onLogin}
        >
          Login
        </button>
      </div>

      <div className="hero-features">
        <div className="hero-feature-item">
          <span>✔</span> Secure JWT Authentication
        </div>
        <div className="hero-feature-item">
          <span>✔</span> Track Job Status Easily
        </div>
        <div className="hero-feature-item">
          <span>✔</span> Clean Dashboard UI
        </div>
      </div>
    </div>
  );
}
