import React, { useState } from 'react';
import { useAuth } from '../store/auth';
import './layout.css';

/**
 * Optional: Use framer-motion if available for micro-interactions.
 * We guard the require so missing deps don't crash CI.
 */
let motion = null;
try {
  // eslint-disable-next-line global-require
  motion = require('framer-motion');
} catch {
  motion = null;
}

// Guard router imports at module scope and create stable, safe hooks
let Link, NavLink, Outlet, useLocationSafe;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  Link = RR.Link;
  NavLink = RR.NavLink;
  Outlet = RR.Outlet;
  useLocationSafe = RR.useLocation;
} catch (e) {
  Link = null;
  NavLink = null;
  Outlet = null;
  // Stable fallback hook with same call signature
  useLocationSafe = () => ({ pathname: '/' });
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  // Always call the hook (real or fallback) unconditionally to satisfy Rules of Hooks
  const location = useLocationSafe();

  if (!Link || !NavLink || !Outlet) {
    return (
      <div className="content" style={{padding:20}}>
        <div className="card">
          <h3>Loading UI...</h3>
          <p>Please run npm install to install routing dependencies.</p>
        </div>
      </div>
    );
  }

  const MotionDiv = motion?.motion?.div || 'div';

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
            <span className="user-name">{user?.name || user?.email || 'Guest'}</span>
          </div>
        </header>
        <main className="content">
          <MotionDiv
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </MotionDiv>
        </main>
        <footer className="footer">© {new Date().getFullYear()} UPSTDC</footer>
      </div>
    </div>
  );
}
