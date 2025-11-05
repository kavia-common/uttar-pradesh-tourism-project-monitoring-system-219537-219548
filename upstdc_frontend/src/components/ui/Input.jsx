import React from 'react';

/**
 * Reusable Input with optional label, hint and error text.
 */
// PUBLIC_INTERFACE
export default function Input({
  label,
  hint,
  error,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className={`ui-input ${className}`}>
      {label && <label className="ui-label">{label}</label>}
      <input
        type={type}
        className="input"
        aria-invalid={!!error}
        {...props}
      />
      {hint && !error && <div className="ui-hint">{hint}</div>}
      {error && <div className="ui-error">{error}</div>}
    </div>
  );
}
