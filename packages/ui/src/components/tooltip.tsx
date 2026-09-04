import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../cn";

// ---------------------------------------------------------------------------
// Tooltip — custom hover popover (replaces @radix-ui/react-tooltip)
// ---------------------------------------------------------------------------

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

interface TooltipProps {
  children: ReactNode;
  delay?: number;
}

export function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>;
}

interface TooltipTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  const { setOpen } = useTooltip();
  return (
    <span
      className="inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
    </span>
  );
}

interface TooltipContentProps {
  children: ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

export function TooltipContent({ children, className, side = "top" }: TooltipContentProps) {
  const { open } = useTooltip();
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const p = parent.getBoundingClientRect();
    const el = ref.current!;
    const e = el.getBoundingClientRect();
    const offset = 8;
    let top = 0;
    let left = 0;
    if (side === "top") {
      top = p.top - e.height - offset;
      left = p.left + p.width / 2 - e.width / 2;
    } else if (side === "bottom") {
      top = p.bottom + offset;
      left = p.left + p.width / 2 - e.width / 2;
    } else if (side === "left") {
      top = p.top + p.height / 2 - e.height / 2;
      left = p.left - e.width - offset;
    } else {
      top = p.top + p.height / 2 - e.height / 2;
      left = p.right + offset;
    }
    setPos({ top, left });
  }, [open, side]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="tooltip"
          initial={{ opacity: 0, y: side === "top" ? 4 : side === "bottom" ? -4 : 0, x: side === "left" ? 4 : side === "right" ? -4 : 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          style={{ position: "fixed", top: pos?.top ?? 0, left: pos?.left ?? 0 }}
          className={cn(
            "z-[1300] max-w-xs rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-md",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
