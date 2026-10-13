import React from 'react';
import { Check, AlertCircle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toastContainer" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-pill ${toast.type || 'success'}`}
          onClick={() => removeToast(toast.id)}
          role="status"
        >
          <div className="toast-icon-badge">
            {toast.type === 'error' ? (
              <AlertCircle size={15} strokeWidth={2.5} />
            ) : (
              <Check size={15} strokeWidth={2.5} />
            )}
          </div>
          <div
            className="toast-text"
            dangerouslySetInnerHTML={{
              __html: toast.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }}
          />
          <button
            className="toast-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            aria-label="Fermer la notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
