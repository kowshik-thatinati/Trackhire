import { useState } from "react";
import { registerUser } from "../api";

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(email, password);
      setSuccess(true);
      setTimeout(onSwitch, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💼</div>
          <h1>JobTracker</h1>
        </div>
        <h2>Create account</h2>
        <p className="subtitle">Start tracking your job applications today</p>

        {error && <div className="error-msg">⚠️ {error}</div>}
        {success && (
          <div className="error-msg" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}>
            ✅ Account created! Redirecting to login…
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          <button id="register-submit" className="btn btn-primary" disabled={loading || success}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{" "}
          <button id="goto-login" onClick={onSwitch}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
