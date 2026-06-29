let rawUrl = import.meta.env.VITE_API_URL;
// If the environment variable is missing, relative ("/api"), or a placeholder, force the Railway URL.
if (!rawUrl || !rawUrl.startsWith("http")) {
  rawUrl = "https://aegissec-production.up.railway.app/api";
}
export const API_URL = rawUrl;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("aegis_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function authFetch(url: string, options: RequestInit = {}) {
  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders(),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("aegis_access_token");
    // We let the App component handle the redirect since the context state will update on removal
    // Or we could force a reload
    window.location.href = "/";
  }

  return res;
}

export async function fetchDashboardStats() {
  const res = await authFetch(`$ https://aegissec-production.up.railway.app/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function createScan(target: string) {
  const res = await authFetch(`$ https://aegissec-production.up.railway.app/scans`, {
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
