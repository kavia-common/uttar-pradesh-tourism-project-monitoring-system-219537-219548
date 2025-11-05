import React from 'react';

/**
 * KPIStat card with label, value and optional icon/color.
 */
// PUBLIC_INTERFACE
export default function KPIStat({ label, value, color = 'var(--color-primary)', icon = null }) {
  return (
    <div className="kpi-card">
      <div>
        <div className="label">{label}</div>
        <div className="value">{value}</div>
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: color,
          opacity: 0.12,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.04)',
          display: 'grid',
          placeItems: 'center',
          color
        }}
      >
        {icon}
      </div>
    </div>
  );
}
