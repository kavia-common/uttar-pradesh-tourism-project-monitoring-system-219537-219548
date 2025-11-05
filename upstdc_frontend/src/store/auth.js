import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'upstdc_jwt';
const USER_KEY = 'upstdc_user';

// Token helpers kept side-effect free for API layer imports
// PUBLIC_INTERFACE
export const getToken = () => localStorage.getItem(TOKEN_KEY);
// PUBLIC_INTERFACE
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t || '');
// PUBLIC_INTERFACE
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
// PUBLIC_INTERFACE
export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};
// PUBLIC_INTERFACE
export const setStoredUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u || null));
// PUBLIC_INTERFACE
export const clearStoredUser = () => localStorage.removeItem(USER_KEY);

// PUBLIC_INTERFACE
export const logout = () => {
  clearToken();
  clearStoredUser();
};

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Auth provider storing user and token with RBAC utilities */
  const [token, setTok] = useState(getToken());
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTok(getToken());
    setUser(getStoredUser());
  }, []);

  const login = async ({ access_token, user: profile }) => {
    setLoading(true);
    try {
      setToken(access_token);
      setStoredUser(profile);
      setTok(access_token);
      setUser(profile);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const doLogout = () => {
    logout();
    setTok(null);
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  const value = useMemo(() => ({
    token,
    user,
    loading,
    login,
    logout: doLogout,
    isAuthenticated: !!token,
    hasRole
  }), [token, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth context */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
