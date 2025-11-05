import React from 'react';

/**
 * Basic Skeleton block to show loading placeholders.
 */
// PUBLIC_INTERFACE
export default function Skeleton({ height = 16, width = '100%', rounded = true, className = '' }) {
  return (
    <div
      className={`skeleton ${rounded ? '' : 'no-radius'} ${className}`}
      style={{ height, width }}
    />
  );
}
