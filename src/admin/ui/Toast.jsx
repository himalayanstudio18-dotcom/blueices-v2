import React, { useEffect, useRef, useState } from 'react';

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <polyline points="7.5 12.5 10.5 15.5 16.5 9" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 L21.5 20 H2.5 Z" />
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const LABELS = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

/* Each toast owns its own dismiss timer (rather than the provider
   centrally scheduling everything) so pause-on-hover/focus is just
   local component state — no cross-toast timer bookkeeping needed. */
export default function Toast({ id, type = 'info', title, message, duration, persist, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (persist || paused || remainingRef.current <= 0) return undefined;
    startedAtRef.current = Date.now();
    timeoutRef.current = setTimeout(() => onDismiss(id), remainingRef.current);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, persist]);

  function pause() {
    if (persist) return;
    clearTimeout(timeoutRef.current);
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    setPaused(true);
  }

  function resume() {
    setPaused(false);
  }

  return (
    <div
      className={`admin-toast admin-toast--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      tabIndex={0}
    >
      <span className="admin-toast-icon" aria-hidden="true">{ICONS[type]}</span>
      <span className="admin-toast-label-sr">{LABELS[type]}:</span>
      <div className="admin-toast-body">
        {title && <p className="admin-toast-title">{title}</p>}
        {message && <p className="admin-toast-message">{message}</p>}
      </div>
      <button
        type="button"
        className="admin-toast-close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(id)}
      >
        ×
      </button>
    </div>
  );
}
