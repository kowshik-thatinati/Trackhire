const BASE_URL = import.meta.env.VITE_API_URL || "https://trackhire-production.up.railway.app";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function registerUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Registration failed");
  }
  return res.json();
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const token = await res.text();
  localStorage.setItem("token", token);
  localStorage.setItem("userEmail", email);
  return token;
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
}

export async function fetchJobs() {
  const res = await fetch(`${BASE_URL}/jobs`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function createJob(company, role) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ company, role }),
  });
  if (!res.ok) throw new Error("Failed to create job");
  return res.json();
}

export async function updateJobStatus(id, status) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update job");
  return res.json();
}

export async function deleteJob(id) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete job");
  return res.text();
}
