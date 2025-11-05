import React from 'react';
let RR = null;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  RR = require('react-router-dom');
} catch (e) {
  RR = null;
}
import { useAuth } from '../store/auth';

// PUBLIC_INTERFACE
export default function ProtectedRoute({ roles }) {
  /** Wraps routes that require authentication and optional RBAC role checks. */
  const { isAuthenticated, hasRole } = useAuth();

  if (!RR) {
    return null;
  }
  const { Navigate, Outlet } = RR;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
