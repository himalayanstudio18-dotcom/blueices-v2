import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast from './Toast';

const ToastContext = createContext(null);

const DEFAULT_DURATIONS = { success: 3000, info: 4000, warning: 5000, error: 6000 };
const MAX_VISIBLE = 3;

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'info', title, message, duration, persist = false }) => {
    const id = nextId++;
    setToasts((list) => [
      ...list,
      { id, type, title, message, persist, duration: duration ?? DEFAULT_DURATIONS[type] ?? DEFAULT_DURATIONS.info },
    ]);
    return id;
  }, []);

  const visible = toasts.slice(0, MAX_VISIBLE);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="admin-toast-container" aria-label="Notifications">
        {visible.map((t) => (
          <Toast key={t.id} {...t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
