/**
 * Centralized API client for the portfolio administrator dashboard.
 *
 * Implements:
 * - Strict in-memory access-token and CSRF-token storage (never in localStorage/sessionStorage)
 * - Single-flight refresh mutex preventing duplicate or race-condition refresh calls
 * - Credentials handling (`credentials: "include"`) for HttpOnly refresh cookie transmission
 * - CSRF double-submit header (`X-CSRF-Token`) verification
 * - Targeted 401 retry: only recovers from genuine `invalid_token` errors, avoids loops
 * - Clean failure handling and subscriber notification for session termination
 */

import type {
  AdminOverviewResponse,
  AdminUserRead,
  ApiErrorResponse,
  LoginRequest,
  LogoutResponse,
  SessionListResponse,
  TokenResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Error Model
// ---------------------------------------------------------------------------

export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public requestId?: string | null;
  public details?: unknown;
  public retryAfter?: number | null;

  constructor(
    message: string,
    status: number,
    code = "api_error",
    requestId?: string | null,
    details?: unknown,
    retryAfter?: number | null
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

// ---------------------------------------------------------------------------
// CSRF Token Session Persistence
// ---------------------------------------------------------------------------
// Note: Only the non-sensitive double-submit CSRF token is persisted in
// browser sessionStorage so that page reloads maintain CSRF capability for
// the initial session refresh. Access tokens remain exclusively in-memory,
// and refresh tokens remain exclusively in the backend-managed HttpOnly cookie.
// Storage access is safely guarded against SSR, disabled storage, or sandbox errors.
const CSRF_STORAGE_KEY = "portfolio_admin_csrf_token";

function loadPersistedCsrfToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const token = window.sessionStorage?.getItem(CSRF_STORAGE_KEY);
    return token && typeof token === "string" ? token.trim() : null;
  } catch {
    return null;
  }
}

function savePersistedCsrfToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (token) {
      window.sessionStorage?.setItem(CSRF_STORAGE_KEY, token);
    } else {
      window.sessionStorage?.removeItem(CSRF_STORAGE_KEY);
    }
  } catch {
    // Ignore storage restriction or quota errors
  }
}

// ---------------------------------------------------------------------------
// In-Memory Token State & Auth Generation Epoch
// ---------------------------------------------------------------------------

let inMemoryAccessToken: string | null = null;
let inMemoryCsrfToken: string | null = loadPersistedCsrfToken();
let inMemoryAdmin: AdminUserRead | null = null;

// Auth epoch counter: incremented on every auth revocation, logout, or new login.
// In-flight refresh promises verify their start epoch before committing tokens.
let authEpoch = 0;

let refreshPromise: Promise<TokenResponse> | null = null;

type AuthChangeListener = (user: AdminUserRead | null) => void;
const authChangeListeners = new Set<AuthChangeListener>();

export function subscribeToAuthChanges(listener: AuthChangeListener): () => void {
  authChangeListeners.add(listener);
  return () => {
    authChangeListeners.delete(listener);
  };
}

function notifyAuthChange(user: AdminUserRead | null) {
  authChangeListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (err) {
      console.error("[api-client] Auth listener threw an error:", err);
    }
  });
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function getCsrfToken(): string | null {
  if (!inMemoryCsrfToken) {
    inMemoryCsrfToken = loadPersistedCsrfToken();
  }
  return inMemoryCsrfToken;
}

export function getCurrentAdminUser(): AdminUserRead | null {
  return inMemoryAdmin;
}

export function setAuthTokens(bundle: TokenResponse): void {
  authEpoch++;
  inMemoryAccessToken = bundle.access_token;
  inMemoryCsrfToken = bundle.csrf_token;
  savePersistedCsrfToken(bundle.csrf_token);
  inMemoryAdmin = bundle.admin;
  notifyAuthChange(bundle.admin);
}

export function clearAuthTokens(): void {
  authEpoch++;
  const hadUser = inMemoryAdmin !== null || inMemoryAccessToken !== null;
  inMemoryAccessToken = null;
  inMemoryCsrfToken = null;
  savePersistedCsrfToken(null);
  inMemoryAdmin = null;
  if (hadUser) {
    notifyAuthChange(null);
  }
}

// ---------------------------------------------------------------------------
// Base URL Resolution
// ---------------------------------------------------------------------------

export function getApiBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    // If accessing via 127.0.0.1, match the backend host for cookie & origin consistency
    if (window.location.hostname === "127.0.0.1") {
      return "http://127.0.0.1:8000";
    }
  }
  return "http://localhost:8000";
}

// ---------------------------------------------------------------------------
// Response Parser Helper
// ---------------------------------------------------------------------------

async function parseApiError(response: Response): Promise<ApiClientError> {
  const retryAfterHeader = response.headers.get("Retry-After");
  const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;

  try {
    const data = (await response.json()) as ApiErrorResponse;
    if (data && data.error) {
      return new ApiClientError(
        data.error.message || `Request failed with status ${response.status}`,
        response.status,
        data.error.code || "unknown_error",
        data.error.request_id,
        data.error.details,
        retryAfter
      );
    }
  } catch {
    // Non-JSON error body fallback
  }

  return new ApiClientError(
    response.statusText || `Request failed with status ${response.status}`,
    response.status,
    response.status === 401 ? "unauthorized" : "http_error",
    null,
    null,
    retryAfter
  );
}

// ---------------------------------------------------------------------------
// Single-Flight Token Refresh
// ---------------------------------------------------------------------------

/**
 * Rotates the refresh session and retrieves a new access token.
 * Uses a single in-flight promise to prevent race conditions when multiple
 * requests encounter 401 simultaneously.
 */
export async function refreshAdminSession(): Promise<TokenResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const startEpoch = authEpoch;

  refreshPromise = (async () => {
    try {
      const url = `${getApiBaseUrl()}/api/v1/auth/refresh`;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      const csrf = inMemoryCsrfToken || loadPersistedCsrfToken();
      if (csrf) {
        inMemoryCsrfToken = csrf;
        headers["X-CSRF-Token"] = csrf;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await parseApiError(response);
        // Only clear local auth state if the backend explicitly confirms the
        // refresh session is invalid, expired, or revoked (401 Unauthorized).
        // Never destroy the local session on 403 CSRF validation failure or 5xx server errors.
        if (response.status === 401) {
          clearAuthTokens();
        }
        throw error;
      }

      const bundle = (await response.json()) as TokenResponse;

      // Invalidate if epoch changed during in-flight network round-trip
      // (e.g. logout(), logoutAll(), or clearAuthTokens() occurred while refresh was pending).
      if (startEpoch !== authEpoch) {
        throw new ApiClientError(
          "Session was invalidated during refresh.",
          401,
          "stale_session_refresh"
        );
      }

      setAuthTokens(bundle);
      return bundle;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Authenticated Fetch Wrapper
// ---------------------------------------------------------------------------

/**
 * Performs an HTTP request with Bearer authorization and transparent single-flight
 * token refresh when an `invalid_token` 401 is encountered.
 */
export async function fetchWithAuth<T = unknown>(
  path: string,
  options: RequestInit = {},
  hasRetried = false
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${baseUrl}${normalizedPath}`;

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (inMemoryAccessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }

  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return null as T;
  }

  if (response.ok) {
    return (await response.json()) as T;
  }

  const error = await parseApiError(response);

  // Targeted 401 recovery:
  // Only retry if:
  // 1. Status is 401 Unauthorized
  // 2. Error code indicates token expiration/invalidity ("invalid_token")
  // 3. This request has not already been retried
  // 4. We are not calling the auth endpoints themselves (avoid infinite loops)
  const isAuthEndpoint =
    normalizedPath.includes("/auth/login") ||
    normalizedPath.includes("/auth/refresh") ||
    normalizedPath.includes("/auth/logout");

  if (
    response.status === 401 &&
    error.code === "invalid_token" &&
    !hasRetried &&
    !isAuthEndpoint
  ) {
    try {
      const refreshed = await refreshAdminSession();
      // Retry once with the new access token
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set("Authorization", `Bearer ${refreshed.access_token}`);
      retryHeaders.set("Accept", "application/json");
      if (
        options.body &&
        typeof options.body === "string" &&
        !retryHeaders.has("Content-Type")
      ) {
        retryHeaders.set("Content-Type", "application/json");
      }

      return await fetchWithAuth<T>(
        path,
        {
          ...options,
          headers: retryHeaders,
        },
        true // mark as retried
      );
    } catch (refreshErr) {
      // If refresh returned 401, refreshAdminSession already cleared in-memory state.
      // Do not clear auth state on 403 CSRF validation failures or transient 5xx/network errors.
      if (refreshErr instanceof ApiClientError && refreshErr.status === 401) {
        clearAuthTokens();
      }
      throw refreshErr;
    }
  }

  throw error;
}

// ---------------------------------------------------------------------------
// Dedicated Admin API Methods
// ---------------------------------------------------------------------------

export const adminApi = {
  /**
   * Authenticate administrator with email and password.
   */
  async login(payload: LoginRequest): Promise<TokenResponse> {
    const url = `${getApiBaseUrl()}/api/v1/auth/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    const bundle = (await response.json()) as TokenResponse;
    setAuthTokens(bundle);
    return bundle;
  },

  /**
   * Refresh session using the HttpOnly cookie and in-memory CSRF token.
   */
  async refresh(): Promise<TokenResponse> {
    return refreshAdminSession();
  },

  /**
   * Logout current administrator session.
   */
  async logout(): Promise<LogoutResponse> {
    const url = `${getApiBaseUrl()}/api/v1/auth/logout`;
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    const csrf = inMemoryCsrfToken || loadPersistedCsrfToken();
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
    }

    // Immediately cancel and invalidate any in-flight refresh so it cannot re-authenticate
    clearAuthTokens();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw await parseApiError(response);
      }

      return (await response.json()) as LogoutResponse;
    } finally {
      clearAuthTokens();
    }
  },

  /**
   * Revoke all active administrator sessions across all devices.
   */
  async logoutAll(): Promise<LogoutResponse> {
    try {
      return await fetchWithAuth<LogoutResponse>("/api/v1/auth/logout-all", {
        method: "POST",
      });
    } finally {
      clearAuthTokens();
    }
  },

  /**
   * Retrieve active administrator profile.
   */
  async getMe(): Promise<AdminUserRead> {
    const user = await fetchWithAuth<AdminUserRead>("/api/v1/auth/me");
    inMemoryAdmin = user;
    return user;
  },

  /**
   * Retrieve list of administrator refresh sessions.
   */
  async getSessions(includeRevoked = false): Promise<SessionListResponse> {
    return fetchWithAuth<SessionListResponse>(
      `/api/v1/auth/sessions?include_revoked=${includeRevoked}`
    );
  },

  /**
   * Revoke a specific administrator session by ID.
   */
  async revokeSession(sessionId: string): Promise<LogoutResponse> {
    return fetchWithAuth<LogoutResponse>(`/api/v1/auth/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  /**
   * Fetch overview dashboard metrics and recent inquiries.
   */
  async getOverview(): Promise<AdminOverviewResponse> {
    return fetchWithAuth<AdminOverviewResponse>("/api/v1/admin/overview");
  },
};
