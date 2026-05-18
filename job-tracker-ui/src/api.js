/**
 * api.js — Centralised API client for JobTracker.
 *
 * All backend responses now follow the standard envelope:
 *   { success: bool, data: T, error: string, timestamp: string }
 *
 * This module unpacks that envelope so callers receive the inner `data`
 * directly, and throws a human-readable error on failure.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

/**
 * Parse the ApiResponse envelope.
 * Returns response.data on success, throws response.error on failure.
 */
async function parseResponse(res) {
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return body.data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function registerUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res); // returns UserResponse { id, email }
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const token = await parseResponse(res); // returns JWT string from data field
  localStorage.setItem("token", token);
  localStorage.setItem("userEmail", email);
  return token;
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
}

// ── Jobs ─────────────────────────────────────────────────────────────────────

export async function fetchJobs() {
  const res = await fetch(`${BASE_URL}/jobs`, { headers: authHeaders() });
  return parseResponse(res); // returns Job[]
}

export async function createJob(company, title, location) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ company, title, location }),
  });
  return parseResponse(res); // returns Job
}

export async function updateJobStatus(id, status) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return parseResponse(res); // returns updated Job
}

export async function deleteJob(id) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseResponse(res); // returns "Job deleted successfully"
}
