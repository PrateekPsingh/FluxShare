import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import type { Toast } from '../types';
import { generateId } from '../utils/fileUtils';

interface ToastContextValue {
  showToast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const Icon =
            toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? XCircle : Info;
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon className="toast-icon" size={20} aria-hidden="true" />
              <span className="toast-message">{toast.message}</span>
              <button
                className="toast-close"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
