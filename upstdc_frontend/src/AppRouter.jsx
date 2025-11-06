import React from 'react';
import { AuthProvider } from './store/auth';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layout/MainLayout';

import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectView from './pages/projects/ProjectView';
import Uploads from './pages/Uploads';
import Reports from './pages/Reports';
import Help from './pages/Help';

// Attempt to import router types safely once at module scope.
// If it fails at runtime (e.g., before npm install), we fall back to a friendly message.
let BrowserRouter, Routes, Route, Navigate;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  BrowserRouter = RR.BrowserRouter;
  Routes = RR.Routes;
  Route = RR.Route;
  Navigate = RR.Navigate;
} catch (e) {
  BrowserRouter = null;
  Routes = null;
  Route = null;
  Navigate = null;
}

// PUBLIC_INTERFACE
export default function AppRouter() {
  /** Application router with open access (auth bypass enabled) */
  if (!BrowserRouter || !Routes || !Route || !Navigate) {
    return (
      <div style={{ padding: 20 }}>
        <h3>Starting...</h3>
        <p>Router libraries are being installed. Please run npm install and restart.</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Keep ProtectedRoute wrapper for structure, but it now always allows access */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/projects/new" element={<ProjectForm />} />
              <Route path="/projects/:id" element={<ProjectView />} />
              <Route path="/projects/:id/edit" element={<ProjectForm />} />
              <Route path="/uploads" element={<Uploads />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/help" element={<Help />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
