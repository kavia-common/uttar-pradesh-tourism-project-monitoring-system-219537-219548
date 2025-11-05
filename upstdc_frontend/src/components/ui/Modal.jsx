import React, { useEffect } from 'react';

/**
 * Basic modal with backdrop, ESC and close on backdrop click.
 */
// PUBLIC_INTERFACE
export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal card">
        {title && <div className="modal-header"><h3>{title}</h3></div>}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer actions">{footer}</div>}
      </div>
    </div>
  );
}
