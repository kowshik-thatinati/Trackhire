import { useState, useEffect, useCallback } from "react";
import { fetchJobs, createJob, updateJobStatus, deleteJob, logoutUser } from "../api";

const STATUSES = ["APPLIED", "INTERVIEW", "OFFERED", "REJECTED"];

const STATUS_COLORS = {
  APPLIED:   "#3b82f6",
  INTERVIEW: "#f59e0b",
  OFFERED:   "#10b981",
  REJECTED:  "#ef4444",
};

const STATUS_EMOJI = {
  APPLIED:   "📤",
  INTERVIEW: "🗓️",
  OFFERED:   "🎉",
  REJECTED:  "❌",
};

function Toast({ message, type }) {
  return <div className={`toast ${type}`}>{message}</div>;
}

export default function Dashboard({ onLogout }) {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [company, setCompany]     = useState("");
  const [role, setRole]           = useState("");
  const [adding, setAdding]       = useState(false);
  const [filter, setFilter]       = useState("ALL");
  const [toast, setToast]         = useState(null);
  const userEmail                  = localStorage.getItem("userEmail") || "User";

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const loadJobs = useCallback(async () => {
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch {
      showToast("Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  async function handleAddJob(e) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    setAdding(true);
    try {
      const newJob = await createJob(company.trim(), role.trim());
      setJobs((prev) => [newJob, ...prev]);
      setCompany("");
      setRole("");
      showToast("Job added successfully! 🎉");
    } catch {
      showToast("Failed to add job", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      const updated = await updateJobStatus(id, newStatus);
      setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
      showToast(`Status updated to ${newStatus}`);
    } catch {
      showToast("Failed to update status", "error");
    }
  }

  async function handleDelete(id) {
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      showToast("Job removed");
    } catch {
      showToast("Failed to delete job", "error");
    }
  }

  function handleLogout() {
    logoutUser();
    onLogout();
  }

  const filtered = filter === "ALL" ? jobs : jobs.filter((j) => j.status === filter);

  const counts = {
    ALL:       jobs.length,
    APPLIED:   jobs.filter((j) => j.status === "APPLIED").length,
    INTERVIEW: jobs.filter((j) => j.status === "INTERVIEW").length,
    OFFERED:   jobs.filter((j) => j.status === "OFFERED").length,
    REJECTED:  jobs.filter((j) => j.status === "REJECTED").length,
  };

  const initials = userEmail.charAt(0).toUpperCase();

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo-icon">💼</div>
          <span>JobTracker</span>
        </div>
        <div className="navbar-right">
          <div className="user-badge">
            <div className="user-avatar">{initials}</div>
            {userEmail}
          </div>
          <button id="logout-btn" className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="main-content">

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon all">📋</div>
            <div className="stat-info">
              <p>Total</p>
              <h3>{counts.ALL}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon applied">📤</div>
            <div className="stat-info">
              <p>Applied</p>
              <h3>{counts.APPLIED}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon interview">🗓️</div>
            <div className="stat-info">
              <p>Interview</p>
              <h3>{counts.INTERVIEW}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon offered">🎉</div>
            <div className="stat-info">
              <p>Offered</p>
              <h3>{counts.OFFERED}</h3>
            </div>
          </div>
        </div>

        {/* Add Job Form */}
        <div className="add-job-card">
          <h2>➕ Add New Application</h2>
          <form className="add-job-form" onSubmit={handleAddJob}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Company</label>
              <input
                id="add-company"
                type="text"
                placeholder="e.g. Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Role</label>
              <input
                id="add-role"
                type="text"
                placeholder="e.g. Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
            <button
              id="add-job-btn"
              className="btn btn-primary"
              type="submit"
              disabled={adding}
              style={{ width: "auto", whiteSpace: "nowrap", alignSelf: "flex-end" }}
            >
              {adding ? "Adding…" : "Add Job"}
            </button>
          </form>
        </div>

        {/* Filter + Job List */}
        <div className="jobs-header">
          <h2>My Applications</h2>
          <div className="filter-tabs">
            {["ALL", ...STATUSES].map((s) => (
              <button
                key={s}
                id={`filter-${s.toLowerCase()}`}
                className={`filter-tab ${filter === s ? "active" : ""}`}
                onClick={() => setFilter(s)}
              >
                {STATUS_EMOJI[s] || "📋"} {s} ({counts[s] ?? 0})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="jobs-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗂️</div>
                <h3>No applications yet</h3>
                <p>Add your first job application above to get started.</p>
              </div>
            ) : (
              filtered.map((job) => (
                <div
                  key={job.id}
                  className="job-card"
                  style={{ "--status-color": STATUS_COLORS[job.status] }}
                >
                  <div className="job-card-header">
                    <div>
                      <div className="job-company">{job.company}</div>
                      <div className="job-role">🔖 {job.role}</div>
                    </div>
                    <span className={`status-badge ${job.status}`}>
                      {STATUS_EMOJI[job.status]} {job.status}
                    </span>
                  </div>

                  <div className="job-date">
                    📅 Applied: {job.appliedDate}
                  </div>

                  <div className="job-card-footer">
                    <div className="status-select-wrapper">
                      <select
                        id={`status-select-${job.id}`}
                        className="status-select"
                        defaultValue={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_EMOJI[s]} {s}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      id={`delete-job-${job.id}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(job.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
