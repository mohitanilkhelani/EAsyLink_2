// src/api.js
// Utility for making authenticated API calls using Azure AD access token
import { useAuth } from "./contexts/AuthContext";

export function useApi() {
  const { getToken } = useAuth();

  // Usage: await apiFetch('/api/endpoint', { method: 'GET' })
  const apiFetch = async (url, options = {}) => {
    const token = await getToken();
    if (!token) throw new Error("No access token available");
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  return { apiFetch };
}
