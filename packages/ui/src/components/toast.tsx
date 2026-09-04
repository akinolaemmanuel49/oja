import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X, HelpCircle } from "lucide-react";
import { cn } from "../cn";

// ---------------------------------------------------------------------------
// Toaster + toast — simple custom toasts (replaces sonner Toaster)
// ---------------------------------------------------------------------------

type ToastType = "success" | "error" | "info" | "warning" | "default";

interface Toast {
  id: number;
  title: ReactNode;
  description?: ReactNode;
  type: ToastType;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toasts: Toast[];
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;
let dispatchToast: ((t: Omit<Toast, "id"> & { id?: number }) => number) | null = null;

// Imperative API compatible with sonner
export const toast = {
  success: (message: ReactNode, opts?: { description?: ReactNode; action?: Toast["action"] }) =>
    show({ type: "success", title: message, ...opts }),
  error: (message: ReactNode, opts?: { description?: ReactNode; action?: Toast["action"] }) =>
    show({ type: "error", title: message, ...opts }),
  info: (message: ReactNode, opts?: { description?: ReactNode; action?: Toast["action"] }) =>
    show({ type: "info", title: message, ...opts }),
  warning: (message: ReactNode, opts?: { description?: ReactNode; action?: Toast["action"] }) =>
    show({ type: "warning", title: message, ...opts }),
  message: (message: ReactNode, opts?: { description?: ReactNode; action?: Toast["action"] }) =>
    show({ type: "default", title: message, ...opts }),
  dismiss: (_id?: number) => {
    // no-op if not mounted yet
  },
};

function show(t: Omit<Toast, "id">): number {
  if (dispatchToast) return dispatchToast(t);
  return 0;
}

const typeIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <HelpCircle className="h-4 w-4 text-amber-500" />,
  default: <Info className="h-4 w-4 text-gray-500" />,
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    dispatchToast = (t) => {
      const id = t.id ?? ++toastId;
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 5000);
      return id;
    };
    return () => {
      dispatchToast = null;
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  useEffect(() => {
    toast.dismiss = (id?: number) => {
      if (id) dismissRef.current(id);
      else setToasts([]);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <ToastContext.Provider value={{ toasts, dismiss }}>
      <div className="pointer-events-none fixed right-4 top-4 z-[1400] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-lg"
            >
              <span className="mt-0.5 shrink-0">{typeIcons[t.type]}</span>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-tight">{t.title}</p>
                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    onClick={t.action.onClick}
                    className="mt-1 text-sm font-medium text-primary hover:underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className={cn("shrink-0 text-muted-foreground transition-colors hover:text-foreground")}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>,
    document.body,
  );
}
