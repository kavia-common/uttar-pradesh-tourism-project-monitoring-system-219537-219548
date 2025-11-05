import React from 'react';
import Breadcrumbs from './Breadcrumbs';

// PUBLIC_INTERFACE
export default function PageHeader({ title, subtitle, breadcrumbs, actions }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>{title}</h2>
          {subtitle && <div className="text-muted" style={{ fontSize: 13 }}>{subtitle}</div>}
        </div>
        <div className="spacer" />
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>
  );
}
