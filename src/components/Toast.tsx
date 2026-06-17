"use client";
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: "border-accent/30 bg-accent/5 text-accent",
  error: "border-danger/30 bg-danger/5 text-danger",
  warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
  info: "border-blue-500/30 bg-blue-500/5 text-blue-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-lg mx-auto">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-[16px] border-[0.5px] backdrop-blur-xl animate-slide-up ${COLORS[t.type]}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-sm flex-1">{t.message}</p>
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
                <X className="w-4 h-4 opacity-50 hover:opacity-100" strokeWidth={1.5} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
