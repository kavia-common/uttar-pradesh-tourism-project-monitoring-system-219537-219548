import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((message, variant = 'info', timeout = 3000) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, message, variant }]);
    if (timeout) {
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, timeout);
    }
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.variant}`}>
            <span>{t.message}</span>
            <button className="icon-btn" onClick={() => remove(t.id)} aria-label="Close">✕</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
