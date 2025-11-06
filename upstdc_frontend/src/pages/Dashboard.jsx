import React, { useEffect, useMemo, useState } from 'react';
import MapView from '../components/MapView';
import KPIStat from '../components/ui/KPIStat';
import { useMapFocus, extractProjectLatLng } from '../components/MapFocusContext';
import { apiRequest } from '../api/client';

/**
 * Dashboard uses design tokens, subtle motion (if available), and enhanced map styling.
 * Charts now have defensive, data-driven rendering with graceful fallback to demo data.
 */

let motion = null;
try {
  // eslint-disable-next-line global-require
  motion = require('framer-motion');
} catch {
  motion = null;
}

const defaultLat = parseFloat(process.env.REACT_APP_DEFAULT_LAT || '26.8467');
const defaultLng = parseFloat(process.env.REACT_APP_DEFAULT_LNG || '80.9462');
const defaultZoom = parseInt(process.env.REACT_APP_DEFAULT_ZOOM || '6', 10);

const MotionDiv = motion?.motion?.div || 'div';

// Demo fallback sets for charts to ensure UI renders without backend
const DEMO_PROGRESS = [62, 48, 80, 35, 90, 55, 70, 65, 50, 78, 40, 85]; // monthly completion %
const DEMO_UTILIZATION = [12, 18, 10, 22, 28, 35, 30, 40, 38, 44, 48, 52]; // monthly ₹ cr utilized

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Main dashboard page rendering KPIs, map, and charts with guarded data loads. */
  const mapFocus = useMapFocus();

  // KPI demo values; could be wired to API similarly
  const kpis = [
    { title: 'Active Projects', value: 24, color: 'var(--color-primary)' },
    { title: 'Funds Utilized', value: '₹ 12.4 Cr', color: 'var(--color-accent)' },
    { title: 'Inspections Pending', value: 7, color: 'var(--color-warning)' },
    { title: 'Milestones Achieved', value: 132, color: 'var(--color-success)' },
  ];

  const demoProjects = [
    {
      id: 'PJT-001',
      code: 'PJT-001',
      name: 'Riverfront Beautification',
      status: 'In Progress',
      budget: 45000000,
      district: 'Lucknow',
      description: 'Upgrading ghats, promenade, lighting and visitor amenities along the riverfront.',
      lat: 26.8467,
      lng: 80.9462
    },
    {
      id: 'PJT-002',
      code: 'PJT-002',
      name: 'Fort Restoration',
      status: 'Planned',
      budget: 18000000,
      district: 'Agra',
      description: 'Structural restoration and conservation of historic fort walls and gates.',
      lat: 27.1767,
      lng: 78.0081
    },
    // Example with missing coordinates to validate graceful skipping
    {
      id: 'PJT-003',
      code: 'PJT-003',
      name: 'Eco-Trail Development',
      status: 'On Hold',
      budget: 7500000,
      district: 'Varanasi',
      description: 'Creating eco-friendly walking trails with interpretative signage.',
      // no lat/lng provided intentionally
    }
  ];

  // Data state for charts with guards
  const [progressData, setProgressData] = useState([]);
  const [utilizationData, setUtilizationData] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [loadingUtil, setLoadingUtil] = useState(true);

  // Attempt to load progress overview (prefer versioned endpoints if present; use legacy shims if not)
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadingProgress(true);
      try {
        // Try new versioned reports first; if not available, attempt legacy; if both fail -> demo
        // We expect backend to provide some numeric time-series; if schema differs, we adapt or fallback.
        let data = null;
        try {
          data = await apiRequest('/api/v1/reports/milestones-progress', { method: 'GET' });
        } catch {
          data = await apiRequest('/reports/milestones-progress', { method: 'GET' });
        }
        const arr = Array.isArray(data?.series) ? data.series
          : Array.isArray(data) ? data
          : Array.isArray(data?.items) ? data.items
          : null;
        if (alive && Array.isArray(arr) && arr.length) {
          setProgressData(arr.map((n) => Number(n)).filter((n) => Number.isFinite(n)));
        } else if (alive) {
          console.warn('[Dashboard] Progress Overview: API returned unexpected shape, using demo data.');
          setProgressData([...DEMO_PROGRESS]);
        }
      } catch (e) {
        if (alive) {
          console.warn('[Dashboard] Progress Overview: API failed, using demo data. Error:', e?.message || e);
          setProgressData([...DEMO_PROGRESS]);
        }
      } finally {
        if (alive) setLoadingProgress(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  // Attempt to load utilization trend
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadingUtil(true);
      try {
        let data = null;
        try {
          data = await apiRequest('/api/v1/reports/funds-summary', { method: 'GET' });
        } catch {
          data = await apiRequest('/reports/funds-summary', { method: 'GET' });
        }
        // Normalize shape to array of numbers representing monthly utilization in ₹ cr
        const arr = Array.isArray(data?.series) ? data.series
          : Array.isArray(data?.months) ? data.months
          : Array.isArray(data) ? data
          : null;
        if (alive && Array.isArray(arr) && arr.length) {
          setUtilizationData(arr.map((n) => Number(n)).filter((n) => Number.isFinite(n)));
        } else if (alive) {
          console.warn('[Dashboard] Utilization Trend: API returned unexpected shape, using demo data.');
          setUtilizationData([...DEMO_UTILIZATION]);
        }
      } catch (e) {
        if (alive) {
          console.warn('[Dashboard] Utilization Trend: API failed, using demo data. Error:', e?.message || e);
          setUtilizationData([...DEMO_UTILIZATION]);
        }
      } finally {
        if (alive) setLoadingUtil(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  // Renderers for minimal charts without external libraries

  function ProgressBars({ data, loading }) {
    // Renders a bar sequence; uses skeleton while loading; empty state if no data
    const bars = Array.isArray(data) && data.length ? data : [];
    if (loading) {
      return (
        <div className="chart-block" role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '12px 12px 8px' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ width: 18, height: `${(i % 5 + 2) * 10}%`, minHeight: 10, borderRadius: 8, flexShrink: 0 }} />
          ))}
        </div>
      );
    }
    if (!bars.length) {
      return <div className="chart-block" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 12 }}>No data</div>;
    }
    const max = Math.max(...bars, 1);
    return (
      <div className="chart-block" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '12px 12px 8px' }}>
        {bars.map((v, i) => {
          const h = Math.max(8, Math.round((v / max) * 100));
          return (
            <div
              key={i}
              className="skeleton"
              style={{ width: 18, height: `${h}%`, minHeight: 10, borderRadius: 8, flexShrink: 0 }}
              title={`${v}`}
              aria-label={`Bar ${i + 1}: ${v}`}
            />
          );
        })}
      </div>
    );
  }

  function UtilizationSparkline({ data, loading }) {
    // Draw a simple sparkline using SVG path; skeleton while loading; empty otherwise
    const points = Array.isArray(data) && data.length ? data : [];
    if (loading) {
      return <div className="chart-block skeleton" role="status" aria-live="polite" />;
    }
    if (!points.length) {
      return <div className="chart-block" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 12 }}>No data</div>;
    }
    const w = 520;
    const h = 220;
    const pad = 16;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = Math.max(1, max - min);
    const stepX = (w - pad * 2) / Math.max(1, points.length - 1);
    const toX = (i) => pad + i * stepX;
    const toY = (v) => {
      const norm = (v - min) / range;
      return h - pad - norm * (h - pad * 2);
    };
    const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');

    return (
      <div className="chart-block" style={{ padding: 8 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Utilization trend sparkline">
          {/* background grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
            <line key={i} x1={pad} x2={w - pad} y1={pad + g * (h - pad * 2)} y2={pad + g * (h - pad * 2)} stroke="var(--border)" strokeWidth="1" />
          ))}
          {/* area fill */}
          <path d={`${d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`} fill="rgba(59,130,246,0.10)" />
          {/* trend line */}
          <path d={d} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          {/* end dot */}
          <circle cx={toX(points.length - 1)} cy={toY(points[points.length - 1])} r="3.5" fill="var(--color-accent)" />
        </svg>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid kpi">
        {kpis.map((k, idx) => (
          <MotionDiv
            key={k.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx || 0) * 0.05, duration: 0.2 }}
            className="hover-rise"
          >
            <KPIStat label={k.title} value={k.value} color={k.color} />
          </MotionDiv>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
        <div className="card hover-rise">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3>Project Locations</h3>
            <div className="actions">
              {demoProjects.map((p) => {
                const has = !!extractProjectLatLng(p);
                return (
                  <button
                    key={p.id}
                    className="btn btn--sm btn--ghost"
                    onClick={() => has && mapFocus.focusProject(p, { zoom: Math.max(defaultZoom, 12), openPopup: true })}
                    disabled={!has}
                    aria-label={has ? `Locate ${p.name} on map` : `Location not available for ${p.name}`}
                    title={has ? 'Locate on map' : 'Location not available'}
                  >
                    📍 {p.code}
                  </button>
                );
              })}
            </div>
          </div>
          <MapView
            center={[defaultLat, defaultLng]}
            zoom={defaultZoom}
            markers={demoProjects}
            style={{ height: 420, width: '100%' }}
          />
        </div>

        <div className="grid" style={{ gap: 16 }}>
          <div className="card">
            <h3 style={{ marginBottom: 8 }}>Progress Overview</h3>
            <ProgressBars data={progressData} loading={loadingProgress} />
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 8 }}>Utilization Trend</h3>
            <UtilizationSparkline data={utilizationData} loading={loadingUtil} />
          </div>
        </div>
      </div>
    </div>
  );
}
