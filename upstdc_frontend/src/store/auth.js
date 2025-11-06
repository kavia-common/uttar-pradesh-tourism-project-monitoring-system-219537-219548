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
  // keep storage clear for consistency
  clearToken();
  clearStoredUser();
};

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Auth provider now defaults to a guest authenticated state for open access */
  // Create a default guest identity
  const defaultGuest = { name: 'Guest User', role: 'guest' };
  const [token, setTok] = useState(getToken() || 'guest-token');
  const [user, setUser] = useState(getStoredUser() || defaultGuest);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure we persist the guest session so refreshes keep access
    if (!getToken()) setToken('guest-token');
    if (!getStoredUser()) setStoredUser(defaultGuest);
    setTok(getToken() || 'guest-token');
    setUser(getStoredUser() || defaultGuest);
  }, []);

  const login = async ({ access_token, user: profile }) => {
    setLoading(true);
    try {
      // Still support explicit login if ever used, but not required
      setToken(access_token || 'guest-token');
      setStoredUser(profile || defaultGuest);
      setTok(access_token || 'guest-token');
      setUser(profile || defaultGuest);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const doLogout = () => {
    // On logout, revert to guest instead of unauthenticated
    logout();
    setTok('guest-token');
    setUser(defaultGuest);
    setToken('guest-token');
    setStoredUser(defaultGuest);
  };

  const hasRole = (roles) => {
    // Bypass role checks: allow access to all roles for guest mode
    return true;
  };

  const value = useMemo(() => ({
    token,
    user,
    loading,
    login,
    logout: doLogout,
    isAuthenticated: true, // always authenticated in guest mode
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
