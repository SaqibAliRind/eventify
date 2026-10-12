import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', icon: '#10b981' },
  error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', icon: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', icon: '#f59e0b' },
  info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', icon: '#3b82f6' },
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast]);
  const error = useCallback((msg, dur) => toast(msg, 'error', dur), [toast]);
  const warning = useCallback((msg, dur) => toast(msg, 'warning', dur), [toast]);
  const info = useCallback((msg, dur) => toast(msg, 'info', dur), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast Portal */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '0.6rem',
          pointerEvents: 'none',
        }}
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const color = COLORS[t.type] || COLORS.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.22 }}
                role="alert"
                style={{
                  pointerEvents: 'all',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: '#0e1117',
                  border: `1px solid ${color.border}`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${color.border}`,
                  minWidth: '260px',
                  maxWidth: '360px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span style={{ color: color.icon, flexShrink: 0, marginTop: 1 }}>
                  {ICONS[t.type]}
                </span>
                <span style={{ flex: 1, fontSize: '0.875rem', color: '#f1f5f9', lineHeight: 1.4 }}>
                  {t.message}
                </span>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748b', padding: 0, flexShrink: 0,
                  }}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
