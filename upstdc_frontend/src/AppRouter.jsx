import React from 'react';
let RR;
try {
  // Attempt to load react-router-dom normally
  // eslint-disable-next-line import/no-extraneous-dependencies
  RR = require('react-router-dom');
} catch (e) {
  RR = null;
}
import { AuthProvider } from './store/auth';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layout/MainLayout';

import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectView from './pages/projects/ProjectView';
import Uploads from './pages/Uploads';
import Reports from './pages/Reports';
import Help from './pages/Help';

// PUBLIC_INTERFACE
export default function AppRouter() {
  /** Application router with RBAC protected sections and main layout */
  if (!RR) {
    return (
      <div style={{padding:20}}>
        <h3>Starting...</h3>
        <p>Router libraries are being installed. Please run npm install and restart.</p>
      </div>
    );
  }
  const { BrowserRouter, Routes, Route, Navigate } = RR;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute roles={['admin','pmu','engineer','auditor','contractor']} />}>
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
