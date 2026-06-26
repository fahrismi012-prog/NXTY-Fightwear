"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, X, ShoppingCart, Zap } from "lucide-react";

type ToastType = "success" | "info" | "cart" | "buy";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  showToast: (
    type: ToastType,
    message: string,
    description?: string
  ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, message: string, description?: string) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, type, message, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2800);
    },
    []
  );

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const iconMap = {
    success: <CheckCircle className="w-4 h-4 text-[#dc2626]" />,
    info: <CheckCircle className="w-4 h-4 text-white" />,
    cart: <ShoppingCart className="w-4 h-4 text-[#dc2626]" />,
    buy: <Zap className="w-4 h-4 text-[#dc2626]" />,
  };

  const labelMap = {
    success: "SELESAI",
    info: "INFO",
    cart: "KERANJANG",
    buy: "LANGSUNG",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast stack */}
      <div className="fixed top-20 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-[#0a0a0a] border-2 border-[#dc2626] p-3 flex items-start gap-3 shadow-[4px_4px_0_#dc2626] animate-[slideIn_0.25s_ease-out]"
          >
            <div className="w-8 h-8 border border-[#262626] flex items-center justify-center shrink-0 bg-[#161616]">
              {iconMap[t.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#dc2626] mb-0.5">
                {labelMap[t.type]}
              </p>
              <p className="text-xs font-black text-white uppercase tracking-wide">
                {t.message}
              </p>
              {t.description && (
                <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-neutral-500 hover:text-white p-1 -mr-1 -mt-1"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
