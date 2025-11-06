import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../store/auth';
import '../components/ui/button.css';
import Modal from '../components/ui/Modal';
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
let Link, NavLink, Outlet, useLocationSafe, useNavigateSafe;
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const RR = require('react-router-dom');
  Link = RR.Link;
  NavLink = RR.NavLink;
  Outlet = RR.Outlet;
  useLocationSafe = RR.useLocation;
  useNavigateSafe = RR.useNavigate;
} catch (e) {
  Link = null;
  NavLink = null;
  Outlet = null;
  // Stable fallback hook with same call signature
  useLocationSafe = () => ({ pathname: '/' });
  useNavigateSafe = () => (/* path, opts */) => {};
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  // Always call the hook (real or fallback) unconditionally to satisfy Rules of Hooks
  const location = useLocationSafe();
  const navigate = useNavigateSafe();

  // Local UI state for notifications popover and help modal
  const [showNotif, setShowNotif] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Refs for click-outside handling on notifications popover
  const notifBtnRef = useRef(null);
  const notifPopoverRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    if (!showNotif) return;
    const onDocClick = (e) => {
      const t = e.target;
      if (notifBtnRef.current?.contains(t) || notifPopoverRef.current?.contains(t)) return;
      setShowNotif(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showNotif]);

  // Keyboard handlers for icon buttons (Enter/Space)
  const keyActivate = (cb) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cb?.(e);
    }
  };

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
        <header className="topbar" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
          <button
            className="icon-btn"
            onClick={() => setCollapsed(!collapsed)}
            onKeyDown={keyActivate(() => setCollapsed(c => !c))}
            aria-label="Toggle Sidebar"
          >
            ☰
          </button>
          <div style={{ marginLeft: 12, flex: 1, maxWidth: 520 }}>
            <input
              className="input"
              placeholder="Search projects, reports..."
              aria-label="Quick search"
              style={{ width: '100%' }}
            />
          </div>
          <div className="actions" style={{ position: 'relative' }}>
            {/* Notifications button + popover */}
            <button
              ref={notifBtnRef}
              className="btn btn--sm btn--ghost"
              aria-haspopup="menu"
              aria-expanded={showNotif}
              aria-controls="notifications-popover"
              aria-label="Notifications"
              onClick={() => setShowNotif((v) => !v)}
              onKeyDown={keyActivate(() => setShowNotif((v) => !v))}
            >
              🔔
            </button>
            {showNotif && (
              <div
                id="notifications-popover"
                ref={notifPopoverRef}
                role="menu"
                aria-label="Notifications list"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 300,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow)',
                  zIndex: 30,
                  padding: 8
                }}
              >
                <div className="card" style={{ padding: 8, boxShadow: 'none', border: 'none', background: 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <strong>Notifications</strong>
                    <button
                      className="icon-btn"
                      aria-label="Close notifications"
                      onClick={() => setShowNotif(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                    <li className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text)' }}>
                      No new notifications
                    </li>
                    <li>
                      <button
                        className="btn btn--sm btn--ghost"
                        style={{ width: '100%' }}
                        onClick={() => {
                          setShowNotif(false);
                          navigate('/reports');
                        }}
                      >
                        View reports →
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Help button opens modal with quick help; deep link to /help also provided */}
            <button
              className="btn btn--sm btn--ghost"
              aria-label="Help"
              onClick={() => setShowHelp(true)}
              onKeyDown={keyActivate(() => setShowHelp(true))}
              style={{ marginLeft: 6 }}
            >
              ❔
            </button>
          </div>
          <div className="user" style={{ marginLeft: 10 }}>
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

      {/* Help modal using shared Modal component (z-index 50 via CSS) */}
      <Modal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Quick Help"
        // Modal already sets role="dialog" aria-modal="true"
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <p className="text-muted" style={{ marginTop: 0 }}>
            Need assistance? Browse the Help page or reach out to support.
          </p>
          <div className="actions" style={{ justifyContent: 'flex-end' }}>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setShowHelp(false)}
              aria-label="Close help"
            >
              Close
            </button>
            <button
              className="btn btn--sm"
              onClick={() => {
                setShowHelp(false);
                navigate('/help');
              }}
              aria-label="Open Help page"
            >
              Open Help Page →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
