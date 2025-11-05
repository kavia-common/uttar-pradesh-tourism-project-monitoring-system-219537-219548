import React from 'react';

// PUBLIC_INTERFACE
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-muted" style={{ fontSize: 12, marginBottom: 6 }}>
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 ? ' / ' : ''}
          {it.href ? <a href={it.href}>{it.label}</a> : it.label}
        </span>
      ))}
    </nav>
  );
}
