let online = true;

export const URLBTS = online ? "https://backend-1-veq9.onrender.com/api" : "http://localhost:8080/api";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${URLBTS}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erreur serveur : ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
