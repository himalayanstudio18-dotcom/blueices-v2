import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

/* Promise-based confirmation dialog: `await confirm({...})` resolves
   true/false instead of needing a callback threaded through every
   call site. Only one dialog can be open at a time, which matches
   how it's actually used (a user confirms one destructive action
   before starting another). */
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        title: options.title ?? 'Are you sure?',
        message: options.message ?? '',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        danger: options.danger ?? true,
      });
    });
  }, []);

  function settle(result) {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setDialog(null);
  }

  useEffect(() => {
    if (!dialog) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') settle(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && (
        <div className="admin-confirm-overlay" onClick={() => settle(false)}>
          <div
            className="admin-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-message"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-confirm-title">{dialog.title}</h2>
            <p id="admin-confirm-message">{dialog.message}</p>
            <div className="admin-confirm-actions">
              <button type="button" className="admin-btn-ghost admin-btn-ghost--dark" onClick={() => settle(false)} autoFocus>
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                className={dialog.danger ? 'admin-btn-danger' : 'admin-btn-primary'}
                onClick={() => settle(true)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}
