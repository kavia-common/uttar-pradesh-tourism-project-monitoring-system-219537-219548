import React from 'react';

// PUBLIC_INTERFACE
export default function SkeletonCard({ rows = 3, height = 16 }) {
  /** A simple skeleton card placeholder */
  return (
    <div className="card" aria-busy="true" aria-live="polite">
      <div className="skeleton" style={{ height: height, marginBottom: 10 }} />
      {[...Array(rows - 1)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: height, marginBottom: 10, width: `${80 - i*10}%` }} />
      ))}
    </div>
  );
}
