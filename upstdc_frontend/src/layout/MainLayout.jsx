import React, { useState } from 'react';
let RR = null;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  RR = require('react-router-dom');
} catch (e) {
  RR = null;
}
import { useAuth } from '../store/auth';
import './layout.css';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  if (!RR) {
    return (
      <div className="content" style={{padding:20}}>
        <div className="card">
          <h3>Loading UI...</h3>
          <p>Please run npm install to install routing dependencies.</p>
        </div>
      </div>
    );
  }

  const { Link, NavLink, Outlet } = RR;

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="brand">
          <Link to="/">UPSTDC</Link>
        </div>
        <nav className="menu">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/uploads">Uploads</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/help">Help</NavLink>
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">☰</button>
          <div className="spacer" />
          <div className="user">
            <span className="user-name">{user?.name || user?.email || 'User'}</span>
            <button className="btn" onClick={logout}>Logout</button>
          </div>
        </header>
        <main className="content">
          <RR.Outlet />
        </main>
        <footer className="footer">© {new Date().getFullYear()} UPSTDC</footer>
      </div>
    </div>
  );
}
