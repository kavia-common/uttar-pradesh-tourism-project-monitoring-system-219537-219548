import React from 'react';
import { useAuth } from '../store/auth';

// Guard router components at module scope
let Navigate, Outlet;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  Navigate = RR.Navigate;
  Outlet = RR.Outlet;
} catch {
  Navigate = null;
  Outlet = null;
}

// PUBLIC_INTERFACE
export default function ProtectedRoute({ roles }) {
  /** Wraps routes that require authentication and optional RBAC role checks. */
  const { isAuthenticated, hasRole } = useAuth();

  if (!Navigate || !Outlet) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
