import React from 'react';
import MapView from '../components/MapView';
import KPIStat from '../components/ui/KPIStat';

/**
 * Dashboard uses design tokens, subtle motion (if available), and enhanced map styling.
 * Charts are represented with lightweight animated placeholders to avoid extra deps.
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

export default function Dashboard() {
  const kpis = [
    { title: 'Active Projects', value: 24, color: 'var(--color-primary)' },
    { title: 'Funds Utilized', value: '₹ 12.4 Cr', color: 'var(--color-accent)' },
    { title: 'Inspections Pending', value: 7, color: 'var(--color-warning)' },
    { title: 'Milestones Achieved', value: 132, color: 'var(--color-success)' },
  ];

  const demoProjects = [
    { id: 1, name: 'Riverfront Beautification', lat: 26.8467, lng: 80.9462 },
    { id: 2, name: 'Fort Restoration', lat: 27.1767, lng: 78.0081 },
  ];

  // Simple bar-chart-like skeleton
  const ChartBars = () => {
    const bars = [60, 40, 80, 30, 90, 55, 70];
    return (
      <div className="chart-block" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '12px 12px 8px' }}>
        {bars.map((h, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: 18, height: `${h}%`, minHeight: 10, borderRadius: 8, flexShrink: 0 }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid kpi">
        {kpis.map((k, idx) => (
          <MotionDiv
            key={k.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx || 0) * 0.05, duration: 0.2 }}
          >
            <KPIStat label={k.title} value={k.value} color={k.color} />
          </MotionDiv>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.2fr .8fr' }}>
        <div className="card">
          <h3 style={{ marginBottom: 8 }}>Project Locations</h3>
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
            <ChartBars />
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 8 }}>Utilization Trend</h3>
            <div className="chart-block skeleton" />
          </div>
        </div>
      </div>
    </div>
  );
}
