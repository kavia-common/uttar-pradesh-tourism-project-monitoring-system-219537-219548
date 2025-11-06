import React from 'react';

// Guard router components at module scope
let Outlet;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  Outlet = RR.Outlet;
} catch {
  Outlet = null;
}

// PUBLIC_INTERFACE
export default function ProtectedRoute() {
  /** Bypassed auth guard: always allows access to nested routes. */
  if (!Outlet) return null;
  return <Outlet />;
}
