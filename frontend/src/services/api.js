/**
 * ─────────────────────────────────────────────────────────────
 * Aai Prints — Centralized API Client & Network Service
 * ─────────────────────────────────────────────────────────────
 * Encapsulates fetch requests with:
 *  - Automated credentials: 'include' for httpOnly cookie management
 *  - Unified error handling & JSON parsing
 *  - Automatic Silent Token Refresh (intercepts 401 TOKEN_EXPIRED and rotates token)
 * ─────────────────────────────────────────────────────────────
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (success) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

export class ApiNetworkError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiNetworkError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Base HTTP request execution with automatic token refresh
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultHeaders = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Transmit and store httpOnly cookies
  };

  try {
    const response = await fetch(url, config);

    // If 401 Unauthorized occurs on protected routes (except during login/refresh)
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
      const errorJson = await response.json().catch(() => null);
      const isTokenExpired =
        errorJson?.message?.toLowerCase().includes('expired') ||
        errorJson?.errors?.some((e) => e.code === 'TOKEN_EXPIRED');

      if (isTokenExpired) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });

            if (refreshRes.ok) {
              isRefreshing = false;
              onRefreshed(true);
              // Replay original request
              return await apiClient(endpoint, options);
            } else {
              isRefreshing = false;
              onRefreshed(false);
              window.dispatchEvent(new CustomEvent('auth:session-expired'));
              throw new ApiNetworkError('Session expired. Please log in again.', 401, errorJson);
            }
          } catch (refreshErr) {
            isRefreshing = false;
            onRefreshed(false);
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
            throw new ApiNetworkError('Session expired. Please log in again.', 401, errorJson);
          }
        }

        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (success) => {
            if (success) {
              try {
                const retryResponse = await apiClient(endpoint, options);
                resolve(retryResponse);
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new ApiNetworkError('Session expired. Please log in again.', 401, errorJson));
            }
          });
        });
      }

      throw new ApiNetworkError(
        errorJson?.message || 'Unauthorized access',
        401,
        errorJson
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.message || `Request failed with status ${response.status}`;
      throw new ApiNetworkError(errorMsg, response.status, errorData);
    }

    // Parse JSON response
    return await response.json();
  } catch (error) {
    if (error instanceof ApiNetworkError) {
      throw error;
    }
    throw new ApiNetworkError(error.message || 'Network error occurred', 0, null);
  }
}

export const api = {
  get: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body, options = {}) =>
    apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
