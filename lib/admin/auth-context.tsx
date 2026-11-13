"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  adminApi,
  clearAuthTokens,
  getCurrentAdminUser,
  subscribeToAuthChanges,
} from "./api-client";
import type { AdminUserRead, LoginRequest } from "./types";

export interface AuthContextValue {
  user: AdminUserRead | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUserRead | null>(() => getCurrentAdminUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasBootstrappedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Synchronize state with api-client in-memory token/user updates
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      if (isMountedRef.current) {
        setUser(nextUser);
      }
    });
    return unsubscribe;
  }, []);

  // Bootstrap session on initial mount by attempting refresh with HttpOnly cookie.
  // Guarded by hasBootstrappedRef so React Strict Mode development double-mount
  // cannot trigger duplicate session rotations or race conditions.
  useEffect(() => {
    isMountedRef.current = true;

    if (!hasBootstrappedRef.current) {
      hasBootstrappedRef.current = true;

      adminApi
        .refresh()
        .then((bundle) => {
          if (isMountedRef.current) {
            setUser(bundle.admin);
          }
        })
        .catch(() => {
          if (isMountedRef.current) {
            setUser(null);
          }
        })
        .finally(() => {
          if (isMountedRef.current) {
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const bundle = await adminApi.login(credentials);
      if (isMountedRef.current) {
        setUser(bundle.admin);
      }
    } catch (err) {
      clearAuthTokens();
      if (isMountedRef.current) {
        setUser(null);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await adminApi.logout();
    } catch (err) {
      console.warn("[Auth] Logout request error, clearing local state:", err);
    } finally {
      clearAuthTokens();
      if (isMountedRef.current) {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, []);

  const logoutAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await adminApi.logoutAll();
    } catch (err) {
      console.warn("[Auth] LogoutAll request error, clearing local state:", err);
    } finally {
      clearAuthTokens();
      if (isMountedRef.current) {
        setUser(null);
        setIsLoading(false);
      }
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const bundle = await adminApi.refresh();
      if (isMountedRef.current) {
        setUser(bundle.admin);
      }
      return true;
    } catch {
      if (isMountedRef.current) {
        setUser(null);
      }
      return false;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      logoutAll,
      refreshSession,
    }),
    [user, isLoading, login, logout, logoutAll, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
