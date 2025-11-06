import React from 'react';

// PUBLIC_INTERFACE
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 6, alignItems: 'center' }}>
        {items.map((it, i) => (
          <li key={i} aria-current={i === items.length - 1 ? 'page' : undefined}>
            {i > 0 ? <span aria-hidden="true" style={{ margin: '0 6px', color: 'var(--muted)' }}>›</span> : null}
            {it.href ? <a href={it.href} style={{ color: 'inherit' }}>{it.label}</a> : <span>{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
