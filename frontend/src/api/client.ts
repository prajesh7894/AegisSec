export const API_URL = "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("aegis_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginOrRegisterAuto() {
  const email = "demo@aegissec.com";
  const password = "password123";
  let token = localStorage.getItem("aegis_access_token");
  if (token) return token;

  // try login
  let res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // if login fails, register and login
  if (!res.ok) {
    await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, full_name: "Demo User", password }),
    });
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }

  const data = await res.json();
  localStorage.setItem("aegis_access_token", data.access_token);
  return data.access_token;
}

async function authFetch(url: string, options: RequestInit = {}) {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders(),
    },
  });

  if (res.status === 401) {
    // Token might be expired or invalid (e.g. backend restarted/db cleared)
    localStorage.removeItem("aegis_access_token");
    await loginOrRegisterAuto();
    // Retry once
    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...getAuthHeaders(),
      },
    });
  }

  return res;
}

export async function fetchDashboardStats() {
  const res = await authFetch(`${API_URL}/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function createScan(target: string) {
  const res = await authFetch(`${API_URL}/scans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target,
      name: `Scan ${target}`,
      authorization_confirmed: true,
    }),
  });
  if (!res.ok) throw new Error("Failed to start scan");
  return res.json();
}
